import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TRIAL_DAYS = 14;
const GRACE_PERIOD_DAYS = 3;  // 3 days to pay after trial/payment failure
const PURGE_AFTER_DAYS = 30;  // Delete account data 30 days after expiry

// POST: Run subscription audit (admin/cron job)
// This checks all users and updates their subscription status based on dates
export async function POST(request: NextRequest) {
  try {
    // Verify admin access or cron secret
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const cronSecret = request.headers.get("x-cron-secret");

    const isAdmin = session?.user && ["ADMIN"].includes(userRole);
    const isValidCron = cronSecret === process.env.CRON_SECRET;

    if (!isAdmin && !isValidCron) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const now = new Date();
    const results = {
      trialExpired: 0,
      pastDueToExpired: 0,
      activeToExpired: 0,
    };

    // 1. Find users whose trial has ended and mark as EXPIRED + DISABLED
    const trialExpiredUsers = await prisma.user.updateMany({
      where: {
        subscriptionStatus: "TRIALING",
        trialEndsAt: { lt: now },
        role: { notIn: ["ADMIN"] }, // Never disable admins/admins
      },
      data: {
        subscriptionStatus: "EXPIRED",
        isActive: false, // Lock them out
      },
    });
    results.trialExpired = trialExpiredUsers.count;

    // 2. Find users whose grace period has ended (PAST_DUE -> EXPIRED)
    const graceExpiredUsers = await prisma.user.updateMany({
      where: {
        subscriptionStatus: "PAST_DUE",
        gracePeriodEndsAt: { lt: now },
        role: { notIn: ["ADMIN"] },
      },
      data: {
        subscriptionStatus: "EXPIRED",
        isActive: false,
      },
    });
    results.pastDueToExpired = graceExpiredUsers.count;

    // 3. Find users whose subscription has ended (ACTIVE/CANCELED -> EXPIRED)
    const subscriptionExpiredUsers = await prisma.user.updateMany({
      where: {
        subscriptionStatus: { in: ["ACTIVE", "CANCELED"] },
        subscriptionEndsAt: { lt: now },
        role: { notIn: ["ADMIN"] },
      },
      data: {
        subscriptionStatus: "EXPIRED",
        isActive: false,
      },
    });
    results.activeToExpired = subscriptionExpiredUsers.count;

    // 4. Purge accounts that have been expired for 30+ days
    // First, find users to purge (for logging)
    const purgeDate = new Date(now.getTime() - PURGE_AFTER_DAYS * 24 * 60 * 60 * 1000);
    const usersToPurge = await prisma.user.findMany({
      where: {
        subscriptionStatus: "EXPIRED",
        isActive: false,
        updatedAt: { lt: purgeDate },
        role: { notIn: ["ADMIN"] },
      },
      select: { id: true, email: true },
    });

    // Delete related data for purged users
    for (const user of usersToPurge) {
      // Delete user's data in transaction (order matters for foreign keys)
      await prisma.$transaction([
        // Delete messages and chat room memberships
        prisma.chatMessage.deleteMany({ where: { senderId: user.id } }),
        prisma.chatRoomMember.deleteMany({ where: { userId: user.id } }),
        // Delete assets created by user
        prisma.asset.deleteMany({ where: { createdById: user.id } }),
        // Delete access logs
        prisma.accessLog.deleteMany({ where: { userId: user.id } }),
        // Delete comments, notifications, team memberships
        prisma.comment.deleteMany({ where: { authorId: user.id } }),
        prisma.notification.deleteMany({ where: { userId: user.id } }),
        prisma.teamMember.deleteMany({ where: { userId: user.id } }),
        prisma.activityLog.deleteMany({ where: { userId: user.id } }),
        // Delete tickets (both created and assigned)
        prisma.ticket.deleteMany({ where: { creatorId: user.id } }),
        // Delete OAuth accounts and sessions
        prisma.account.deleteMany({ where: { userId: user.id } }),
        prisma.session.deleteMany({ where: { userId: user.id } }),
        // Finally delete the user
        prisma.user.delete({ where: { id: user.id } }),
      ]);
    }

    return NextResponse.json({
      success: true,
      auditedAt: now.toISOString(),
      results: {
        ...results,
        accountsPurged: usersToPurge.length,
        purgedEmails: usersToPurge.map((u) => u.email),
      },
      totalUpdated:
        results.trialExpired + results.pastDueToExpired + results.activeToExpired,
    });
  } catch (error) {
    console.error("Subscription audit error:", error);
    return NextResponse.json(
      { error: "Failed to run subscription audit" },
      { status: 500 }
    );
  }
}

// GET: Get subscription stats (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session?.user || !["ADMIN"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [
      totalUsers,
      trialingCount,
      activeCount,
      pastDueCount,
      expiredCount,
      canceledCount,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({ where: { subscriptionStatus: "TRIALING" } }),
      prisma.user.count({ where: { subscriptionStatus: "ACTIVE" } }),
      prisma.user.count({ where: { subscriptionStatus: "PAST_DUE" } }),
      prisma.user.count({ where: { subscriptionStatus: "EXPIRED" } }),
      prisma.user.count({ where: { subscriptionStatus: "CANCELED" } }),
    ]);

    // Users expiring soon (trial ending in next 3 days)
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const expiringSoon = await prisma.user.count({
      where: {
        subscriptionStatus: "TRIALING",
        trialEndsAt: { gt: now, lt: threeDaysFromNow },
      },
    });

    return NextResponse.json({
      totalUsers,
      byStatus: {
        trialing: trialingCount,
        active: activeCount,
        pastDue: pastDueCount,
        expired: expiredCount,
        canceled: canceledCount,
      },
      expiringSoon,
    });
  } catch (error) {
    console.error("Error fetching subscription stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription stats" },
      { status: 500 }
    );
  }
}

