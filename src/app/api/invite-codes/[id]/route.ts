import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const organizationId = (session?.user as any)?.organizationId;

    if (!session?.user || !["SUPERVISOR", "ADMIN"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    // Verify the invite exists
    const invite = await prisma.inviteCode.findUnique({
      where: { id },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    // Multi-tenancy check: User's org must match invite's org, 
    // UNLESS the user is a global ADMIN (no organizationId)
    if (organizationId && invite.organizationId !== organizationId) {
      return NextResponse.json({ error: "Unauthorized access to this invite" }, { status: 403 });
    }

    // Delete the invite
    await prisma.inviteCode.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Invite revoked successfully" });
  } catch (error) {
    console.error("Error deleting invite code:", error);
    return NextResponse.json({ error: "Failed to revoke invite" }, { status: 500 });
  }
}
