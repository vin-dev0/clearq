import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/users/[userId]/status - Toggle user active status
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

    if (currentUser?.role !== "ADMIN" && currentUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    if (!currentUser.organizationId) {
      return NextResponse.json({ error: "User has no organization" }, { status: 400 });
    }

    const { isActive } = await request.json();

    // Prevent users from disabling themselves
    if (currentUser?.id === userId) {
      return NextResponse.json({ error: "Cannot modify your own status" }, { status: 400 });
    }

    // Check if target user is an admin (only admins can disable admins)
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (targetUser?.role === "ADMIN" && currentUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can modify admin accounts" }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { 
        id: userId,
        organizationId: currentUser.organizationId, // Only update if in same org
      },
      data: { isActive },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

