import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/users/[userId]/role - Update user role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    const { userId } = await params;
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role and their organizationId
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, role: true, organizationId: true },
    });

    if (currentUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    if (!currentUser.organizationId) {
      return NextResponse.json({ error: "User has no organization" }, { status: 400 });
    }

    const { role } = await request.json();

    // Validate role
    const validRoles = ["CLIENT", "AGENT", "SUPERVISOR", "ADMIN"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Prevent users from modifying their own role
    if (currentUser?.id === userId) {
      return NextResponse.json({ error: "Cannot modify your own role" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { 
        id: userId,
        organizationId: currentUser.organizationId, // Only update if in same org
      },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}

