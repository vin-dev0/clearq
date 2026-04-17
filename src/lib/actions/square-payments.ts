"use server";

import { SquareClient } from "square";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Initialize Square Client
const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN || "PLACEHOLDER",
  environment: "https://connect.squareup.com", 
});

export async function processSquarePayment(
  sourceId: string, 
  plan: string, 
  amount: number,
  guestData?: { email: string; name?: string; company?: string }
) {
  try {
    const session = await auth();
    let orgId: string | undefined;
    let userEmail: string | undefined;

    if (session?.user?.id) {
      // 1. Authenticated Purchase
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { organization: true },
      });
      if (!user || !user.organizationId) throw new Error("Organization not found");
      orgId = user.organizationId;
      userEmail = user.email!;
    } else if (guestData?.email) {
      // 2. Guest Purchase
      userEmail = guestData.email.toLowerCase();
      
      // Determine if they already have an org
      const existingUser = await prisma.user.findFirst({
        where: { email: userEmail },
        select: { organizationId: true }
      });

      if (existingUser?.organizationId) {
        orgId = existingUser.organizationId;
      } else {
        // Create new Organization for the guest
        const companyName = guestData.company || userEmail.split('@')[0];
        let baseSlug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        let slug = baseSlug;
        const count = await prisma.organization.count({ where: { slug: { startsWith: baseSlug } } });
        if (count > 0) slug = `${baseSlug}-${count + 1}`;

        const newOrg = await prisma.organization.create({
          data: {
            name: companyName,
            slug,
            plan: plan === "TESTING" ? "PRO" : plan as any,
            subscriptionStatus: "ACTIVE", // Start as active
            subscriptionEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            clientFeePaid: true,
          }
        });
        orgId = newOrg.id;
      }
    } else {
      throw new Error("No user session or guest information provided.");
    }

    // Process Square Payment
    const amountInCents = Math.round(amount * 100);
    const result = await client.payments.create({
      sourceId,
      idempotencyKey: Math.random().toString(36).substring(2, 11),
      amountMoney: {
        amount: BigInt(amountInCents),
        currency: "USD",
      },
      note: `ClearQ ${plan} Subscription - ${userEmail}`,
    });

    if (result.payment?.status === "COMPLETED" || result.payment?.status === "APPROVED") {
      // Activate existing org if not just created
      const currentOrg = await prisma.organization.findUnique({
        where: { id: orgId },
        select: { subscriptionEndsAt: true }
      });

      const currentExpiry = currentOrg?.subscriptionEndsAt && currentOrg.subscriptionEndsAt > new Date() 
        ? currentOrg.subscriptionEndsAt 
        : new Date();

      await prisma.organization.update({
        where: { id: orgId },
        data: {
          subscriptionStatus: "ACTIVE",
          plan: plan === "TESTING" ? "PRO" : plan as any,
          subscriptionEndsAt: new Date(currentExpiry.getTime() + 365 * 24 * 60 * 60 * 1000),
          clientFeePaid: true, // Mark that they've paid the setup fee
        },
      });

      // For guests, generate and return an invite code
      if (!session) {
        const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        await prisma.inviteCode.create({
          data: {
            code: inviteCode,
            email: userEmail,
            plan: plan === "TESTING" ? "PRO" : plan as any,
            organizationId: orgId,
            targetRole: "ADMIN",
            type: "ORGANIZATION",
            maxUses: 1,
            createdById: "SYSTEM",
          }
        });
        return { success: true, inviteCode };
      }

      revalidatePath("/dashboard");
      return { success: true };
    } else {
      return { success: false, error: `Payment failed: ${result.payment?.status}` };
    }
  } catch (error: any) {
    console.error("Square processing error:", error);
    return { 
      success: false, 
      error: error.errors?.[0]?.detail || error.message || "Payment gateway error" 
    };
  }
}
