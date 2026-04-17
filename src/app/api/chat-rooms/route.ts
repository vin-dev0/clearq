import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch chat rooms for the current user (scoped to organization)
export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const userRole = (session.user as any).role;
  const organizationId = (session.user as any).organizationId;

  if (userRole === "CLIENT") {
    return NextResponse.json({ error: "Access denied: Clients cannot access Team Chat" }, { status: 403 });
  }

  try {
    const userRole = (session.user as any).role;
    const isManagementRole = ["ADMIN", "SUPERVISOR"].includes(userRole);

    // Visibility logic:
    // 1. MANAGEMENT rooms (only for ADMIN/SUPERVISOR)
    // 2. PUBLIC rooms (visible to all staff)
    // 3. Rooms where user is a direct member
    const visibilityConditions: any[] = [
      { members: { some: { userId } } }
    ];

    if (isManagementRole) {
      visibilityConditions.push({ type: { in: ["PUBLIC", "MANAGEMENT"] } });
    } else {
      visibilityConditions.push({ type: "PUBLIC" });
    }

    const whereClause: any = {
      OR: visibilityConditions
    };

    if (organizationId) {
      whereClause.organizationId = organizationId;
    }

    const chatRooms = await prisma.chatRoom.findMany({
      where: whereClause,
      include: {
        members: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ chatRooms });
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    return NextResponse.json({ error: "Failed to fetch chat rooms" }, { status: 500 });
  }
}

// POST - Create a new chat room (scoped to organization)
export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const userRole = (session.user as any).role;
  const organizationId = (session.user as any).organizationId;

  if (userRole === "CLIENT") {
    return NextResponse.json({ error: "Access denied: Clients cannot access Team Chat" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, description, type, teamId, memberIds } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Room name is required" }, { status: 400 });
    }

    const chatRoom = await prisma.chatRoom.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        type: type || "PUBLIC",
        teamId: teamId || null,
        organizationId: organizationId || null, // Multi-tenancy
        createdById: userId,
        members: {
          create: [
            { userId: userId, role: "admin" },
            ...(memberIds || []).map((id: string) => ({ userId: id, role: "member" })),
          ],
        },
      },
      include: {
        members: true,
      },
    });

    return NextResponse.json({ chatRoom });
  } catch (error) {
    console.error("Error creating chat room:", error);
    return NextResponse.json({ error: "Failed to create chat room" }, { status: 500 });
  }
}

