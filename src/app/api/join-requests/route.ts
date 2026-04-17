import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - List pending join requests for the organization (Team Lead/Admin/Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const organizationId = (session?.user as any)?.organizationId;

    if (!session?.user || !organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only Team Lead, Admin, or Admin can view join requests
    if (!["SUPERVISOR", "ADMIN"].includes(userRole)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";

    const joinRequests = await prisma.joinRequest.findMany({
      where: {
        organizationId,
        status: status as any,
      },
      orderBy: { createdAt: "desc" },
    });

    // Get user details for each request
    const userIds = joinRequests.map(r => r.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    const requestsWithUsers = joinRequests.map(req => ({
      ...req,
      user: users.find(u => u.id === req.userId),
    }));

    return NextResponse.json({ joinRequests: requestsWithUsers });
  } catch (error) {
    console.error("Error fetching join requests:", error);
    return NextResponse.json({ error: "Failed to fetch join requests" }, { status: 500 });
  }
}

// POST - Create a join request (when using REQUEST type invite)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId, inviteCodeId, message } = body;

    if (!organizationId) {
      return NextResponse.json({ error: "Organization ID required" }, { status: 400 });
    }

    // Check if user already has a pending request
    const existingRequest = await prisma.joinRequest.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId,
        },
      },
    });

    if (existingRequest) {
      if (existingRequest.status === "PENDING") {
        return NextResponse.json({ error: "You already have a pending request" }, { status: 400 });
      }
      if (existingRequest.status === "DECLINED") {
        return NextResponse.json({ error: "Your request was previously declined" }, { status: 400 });
      }
    }

    // Check if user is already in this organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true },
    });

    if (user?.organizationId === organizationId) {
      return NextResponse.json({ error: "You are already a member of this organization" }, { status: 400 });
    }

    const joinRequest = await prisma.joinRequest.create({
      data: {
        userId: session.user.id,
        organizationId,
        inviteCodeId,
        message,
      },
    });

    return NextResponse.json({ joinRequest });
  } catch (error) {
    console.error("Error creating join request:", error);
    return NextResponse.json({ error: "Failed to create join request" }, { status: 500 });
  }
}

// PATCH - Approve or decline a join request
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const organizationId = (session?.user as any)?.organizationId;

    if (!session?.user || !organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only Team Lead, Admin, or Admin can approve/decline
    if (!["SUPERVISOR", "ADMIN"].includes(userRole)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const { requestId, action } = body; // action: "approve" or "decline"

    if (!requestId || !["approve", "decline"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const joinRequest = await prisma.joinRequest.findUnique({
      where: { id: requestId },
    });

    if (!joinRequest || joinRequest.organizationId !== organizationId) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (joinRequest.status !== "PENDING") {
      return NextResponse.json({ error: "Request already processed" }, { status: 400 });
    }

    if (action === "approve") {
      // Update user's organization and the request status
      await prisma.$transaction([
        prisma.user.update({
          where: { id: joinRequest.userId },
          data: { organizationId },
        }),
        prisma.joinRequest.update({
          where: { id: requestId },
          data: {
            status: "APPROVED",
            reviewedBy: session.user.id,
            reviewedAt: new Date(),
          },
        }),
      ]);

      // Add user to default team
      const defaultTeam = await prisma.team.findFirst({
        where: { organizationId },
        orderBy: { createdAt: "asc" },
      });

      if (defaultTeam) {
        await prisma.teamMember.create({
          data: {
            userId: joinRequest.userId,
            teamId: defaultTeam.id,
            role: "member",
          },
        }).catch(() => {}); // Ignore if already exists
      }

      return NextResponse.json({ success: true, status: "APPROVED" });
    } else {
      // Decline the request
      await prisma.joinRequest.update({
        where: { id: requestId },
        data: {
          status: "DECLINED",
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, status: "DECLINED" });
    }
  } catch (error) {
    console.error("Error processing join request:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}


