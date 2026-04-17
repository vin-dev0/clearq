import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Debug endpoint to check subscription status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get current user from database
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        subscriptionEndsAt: true,
        gracePeriodEndsAt: true,
        lastPaymentAt: true,
      },
    });

    // Also get session data
    const sessionUser = session.user as any;

    return NextResponse.json({
      database: dbUser,
      session: {
        id: sessionUser.id,
        email: sessionUser.email,
        role: sessionUser.role,
        plan: sessionUser.plan,
        subscriptionStatus: sessionUser.subscriptionStatus,
        trialEndsAt: sessionUser.trialEndsAt,
        gracePeriodEndsAt: sessionUser.gracePeriodEndsAt,
      },
      now: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Debug subscription error:", error);
    return NextResponse.json({ error: "Failed to get subscription info" }, { status: 500 });
  }
}

