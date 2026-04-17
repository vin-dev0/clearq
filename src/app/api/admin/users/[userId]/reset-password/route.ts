import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const session = await auth();
    const currentUserRole = (session?.user as any)?.role;
    const currentUserOrgId = (session?.user as any)?.organizationId;

    if (!session?.user || !["ADMIN"].includes(currentUserRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Find the user to make sure they exist
    const userToReset = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, organizationId: true }
    });

    if (!userToReset) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Multi-tenancy check: Must be same organization or Global Admin
    if (currentUserOrgId && userToReset.organizationId !== currentUserOrgId) {
      return NextResponse.json({ error: "Unauthorized access to this user" }, { status: 403 });
    }

    // Protect Admins
    if (userToReset.role === "ADMIN" && currentUserRole !== "ADMIN") {
      return NextResponse.json({ error: "Only an Admin can reset another Admin's password" }, { status: 403 });
    }

    // Auto-generate a new password
    const password = Math.random().toString(36).slice(-10) + "!";
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: { id: userToReset.id },
      data: { passwordHash }
    });

    return NextResponse.json({ password, name: userToReset.name || userToReset.email });
  } catch (error) {
    console.error("Error resetting user password:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
