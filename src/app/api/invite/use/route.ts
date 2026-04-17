import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Mark an invite code as used
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, userId } = body;

    if (!code || !userId) {
      return NextResponse.json({ error: "Code and userId required" }, { status: 400 });
    }

    const invite = await prisma.inviteCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 400 });
    }

    // Increment uses
    await prisma.inviteCode.update({
      where: { id: invite.id },
      data: {
        currentUses: { increment: 1 },
        usedBy: userId,
        usedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error using invite:", error);
    return NextResponse.json({ error: "Failed to use invite" }, { status: 500 });
  }
}

