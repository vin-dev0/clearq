import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Export user data (Pro feature)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = (session.user as any)?.role;
    const userPlan = (session.user as any)?.plan;

    // Only Pro/Enterprise users or Admins/Admins can export
    const hasAccess =
      ["ADMIN"].includes(userRole) ||
      ["PRO", "ENTERPRISE"].includes(userPlan);

    if (!hasAccess) {
      return NextResponse.json(
        {
          error: "Data export is a Pro feature",
          upgrade: true,
        },
        { status: 403 }
      );
    }

    // Fetch all user data
    const [user, tickets, comments, assets, teamMemberships, activityLogs] =
      await Promise.all([
        // User profile
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            name: true,
            department: true,
            phone: true,
            timezone: true,
            role: true,
            plan: true,
            subscriptionStatus: true,
            createdAt: true,
            lastLoginAt: true,
          },
        }),
        // Tickets created by user
        prisma.ticket.findMany({
          where: { creatorId: userId },
          include: {
            comments: {
              select: {
                id: true,
                content: true,
                createdAt: true,
                author: { select: { name: true, email: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        // Comments by user
        prisma.comment.findMany({
          where: { authorId: userId },
          include: {
            ticket: {
              select: { id: true, subject: true },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        // Assets created by user
        prisma.asset.findMany({
          where: { createdById: userId },
          orderBy: { createdAt: "desc" },
        }),
        // Team memberships
        prisma.teamMember.findMany({
          where: { userId },
          include: {
            team: {
              select: { id: true, name: true, description: true },
            },
          },
        }),
        // Activity logs
        prisma.activityLog.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 500, // Limit to last 500 activities
        }),
      ]);

    // Format export data
    const exportData = {
      exportedAt: new Date().toISOString(),
      exportedBy: session.user.email,
      account: {
        profile: user,
        totalTickets: tickets.length,
        totalComments: comments.length,
        totalAssets: assets.length,
      },
      tickets: tickets.map((t) => ({
        id: t.id,
        ticketNumber: t.number,
        subject: t.subject,
        description: t.description,
        status: t.status,
        priority: t.priority,
        type: t.type,
        channel: t.channel,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        resolvedAt: t.resolvedAt,
        comments: t.comments,
      })),
      comments: comments.map((c) => ({
        id: c.id,
        content: c.content,
        ticketId: c.ticket?.id,
        ticketSubject: c.ticket?.subject,
        createdAt: c.createdAt,
      })),
      assets: assets.map((a) => ({
        id: a.id,
        assetTag: a.assetTag,
        name: a.name,
        type: a.type,
        status: a.status,
        serialNumber: a.serialNumber,
        manufacturer: a.manufacturer,
        model: a.model,
        purchaseDate: a.purchaseDate,
        purchasePrice: a.purchasePrice,
        location: a.location,
        assignedToId: a.assignedToId,
        notes: a.notes,
        createdAt: a.createdAt,
      })),
      teams: teamMemberships.map((tm) => ({
        teamId: tm.team.id,
        teamName: tm.team.name,
        role: tm.role,
        joinedAt: tm.joinedAt,
      })),
      recentActivity: activityLogs.map((al) => ({
        action: al.action,
        metadata: al.metadata,
        entityType: al.entityType,
        entityId: al.entityId,
        createdAt: al.createdAt,
      })),
    };

    // Return as JSON file download
    const fileName = `ClearQ-export-${userId.slice(0, 8)}-${Date.now()}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}

