import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT: Update user subscription status (Admin/Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session?.user || !["ADMIN"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      subscriptionStatus,
      plan,
      trialEndsAt,
      subscriptionEndsAt,
      gracePeriodEndsAt,
    } = body;

    // Build update data
    const updateData: any = {};

    if (subscriptionStatus) {
      updateData.subscriptionStatus = subscriptionStatus;
    }

    if (plan) {
      updateData.plan = plan;
    }

    if (trialEndsAt !== undefined) {
      updateData.trialEndsAt = trialEndsAt ? new Date(trialEndsAt) : null;
    }

    if (subscriptionEndsAt !== undefined) {
      updateData.subscriptionEndsAt = subscriptionEndsAt
        ? new Date(subscriptionEndsAt)
        : null;
    }

    if (gracePeriodEndsAt !== undefined) {
      updateData.gracePeriodEndsAt = gracePeriodEndsAt
        ? new Date(gracePeriodEndsAt)
        : null;
    }

    // If activating subscription, set appropriate dates and enable account
    if (subscriptionStatus === "ACTIVE") {
      updateData.lastPaymentAt = new Date();
      updateData.isActive = true; // Re-enable account
      // Set subscription end date to 30 days from now if not provided
      if (!updateData.subscriptionEndsAt) {
        updateData.subscriptionEndsAt = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        );
      }
    }

    // If expiring subscription, disable account
    if (subscriptionStatus === "EXPIRED") {
      updateData.isActive = false;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        subscriptionEndsAt: true,
        gracePeriodEndsAt: true,
        lastPaymentAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

