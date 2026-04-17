import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    const currentUserRole = (session?.user as any)?.role;
    const currentUserOrgId = (session?.user as any)?.organizationId;

    if (!session?.user || !["ADMIN"].includes(currentUserRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { userId } = await params;

    // Prevent deleting self
    if (userId === session.user.id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, role: true }
    });

    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Multi-tenancy check: Must be same organization or Global Admin
    if (currentUserOrgId && userToDelete.organizationId !== currentUserOrgId) {
      return NextResponse.json({ error: "Unauthorized access to this user" }, { status: 403 });
    }

    // Protection for Admins
    if (userToDelete.role === "ADMIN" && currentUserRole !== "ADMIN") {
      return NextResponse.json({ error: "Only an Admin can delete another Admin" }, { status: 403 });
    }

    // Delete user (cascade should handle related items)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
