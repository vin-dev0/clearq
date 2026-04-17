import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const organizationId = (session?.user as any)?.organizationId;

    if (!session?.user || !organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only Admin or Admin can view these stats
    if (!["ADMIN"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. User count & change (simulated 30d change for now, or could compute)
    const totalUsers = await prisma.user.count({ where: { organizationId } });
    const users30DaysAgo = await prisma.user.count({ 
      where: { 
        organizationId, 
        createdAt: { lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } 
      } 
    });
    const userChange = totalUsers > 0 ? Math.round(((totalUsers - users30DaysAgo) / (users30DaysAgo || 1)) * 100) : 0;

    // 2. Active tickets
    const activeTickets = await prisma.ticket.count({
      where: {
        organizationId,
        status: { in: ["OPEN", "PENDING"] }
      }
    });

    // 3. Messages today
    const messagesToday = await prisma.chatMessage.count({
      where: {
        createdAt: { gte: startOfToday },
        chatRoom: { organizationId }
      }
    });

    // 4. Avg Response Time (in hours)
    const ticketsWithResponse = await prisma.ticket.findMany({
      where: {
        organizationId,
        firstResponseAt: { not: null },
      },
      select: { createdAt: true, firstResponseAt: true },
      take: 100, // sample last 100
    });

    let avgResponseTime = 0;
    if (ticketsWithResponse.length > 0) {
      const totalDiff = ticketsWithResponse.reduce((sum, t) => {
        return sum + (t.firstResponseAt!.getTime() - t.createdAt.getTime());
      }, 0);
      avgResponseTime = Math.round((totalDiff / ticketsWithResponse.length) / (1000 * 60 * 60) * 10) / 10;
    }

    // 5. Recent Activity
    const recentActivity = await prisma.activityLog.findMany({
      where: {
        OR: [
          { user: { organizationId } },
          { ticket: { organizationId } }
        ]
      },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    const formattedActivity = recentActivity.map(log => ({
      action: log.action,
      user: log.user?.name || log.user?.email || "System",
      time: log.createdAt.toISOString(),
      type: log.entityType.toLowerCase()
    }));

    return NextResponse.json({
      stats: [
        {
          label: "Total Users",
          value: totalUsers.toLocaleString(),
          change: `${userChange >= 0 ? '+' : ''}${userChange}%`,
          trend: userChange >= 0 ? "up" : "down",
          icon: "Users",
          color: "teal",
        },
        {
          label: "Active Tickets",
          value: activeTickets.toString(),
          change: "Live",
          trend: "neutral",
          icon: "Ticket",
          color: "cyan",
        },
        {
          label: "Messages Today",
          value: messagesToday.toLocaleString(),
          change: "Today",
          trend: "up",
          icon: "MessageSquare",
          color: "violet",
        },
        {
          label: "Avg Response Time",
          value: `${avgResponseTime}h`,
          change: "Recent",
          trend: "down",
          icon: "Clock",
          color: "amber",
        },
      ],
      recentActivity: formattedActivity
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
