import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/users - List all users
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role and get their organizationId
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true, organizationId: true },
    });

    if (currentUser?.role !== "ADMIN" && currentUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const whereClause: any = {};

    // If not a global ADMIN, restrict to their organization
    if (currentUser.role !== "ADMIN" || currentUser.organizationId) {
      if (!currentUser.organizationId) {
        return NextResponse.json({ error: "User has no organization" }, { status: 400 });
      }
      whereClause.organizationId = currentUser.organizationId;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Also fetch pending count
    const pendingCount = await prisma.joinRequest.count({
      where: {
        organizationId: whereClause.organizationId,
        status: "PENDING",
      },
    });

    return NextResponse.json({ users, pendingCount });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

