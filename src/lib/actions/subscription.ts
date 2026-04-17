"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function requestManualVerification() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { organization: true },
  });

  if (!user || !user.organizationId) {
    throw new Error("User or Organization not found");
  }

  // Update organization status to PENDING_APPROVAL
  await prisma.organization.update({
    where: { id: user.organizationId },
    data: {
      subscriptionStatus: "PENDING_APPROVAL",
    },
  });

  revalidatePath("/subscription-expired");
  return { success: true };
}

export async function approveSubscription(orgId: string, plan: string = "PRO") {
  const session = await auth();
  const user = session?.user as any;
  
  if (user?.role !== "ADMIN") {
    throw new Error("Only admins can approve subscriptions");
  }

  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

  await prisma.organization.update({
    where: { id: orgId },
    data: {
      subscriptionStatus: "ACTIVE",
      plan,
      subscriptionEndsAt: nextMonth,
    },
  });

  revalidatePath("/admin/users"); // Or wherever the subscriptions are managed
  return { success: true };
}
