import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE: Delete an invite code
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const { inviteId } = await params;
    
    const session = await auth();
    if (!session?.user || !["ADMIN"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.inviteCode.delete({
      where: { id: inviteId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting invite:", error);
    return NextResponse.json({ error: "Failed to delete invite" }, { status: 500 });
  }
}

