import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as any).organizationId;

    // Find the client to make sure they exist and belong to the correct org
    const clientUser = await prisma.user.findFirst({
      where: {
        id,
        organizationId,
        role: "CLIENT",
      }
    });

    if (!clientUser) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Auto-generate a new password
    const password = Math.random().toString(36).slice(-10);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: { id: clientUser.id },
      data: { passwordHash }
    });

    return NextResponse.json({ password, name: clientUser.name || clientUser.email });
  } catch (error) {
    console.error("Error resetting client password:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
