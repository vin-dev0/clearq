import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Mark invite code as used (called after successful registration)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, userId } = body;

    if (!code || !userId) {
      return NextResponse.json({ error: "Code and userId are required" }, { status: 400 });
    }

    const inviteCode = await prisma.inviteCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!inviteCode) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 400 });
    }

    // Update the invite code usage
    await prisma.inviteCode.update({
      where: { code: code.toUpperCase() },
      data: {
        currentUses: { increment: 1 },
        usedBy: inviteCode.maxUses === 1 ? userId : inviteCode.usedBy, // Only set usedBy for single-use codes
        usedAt: inviteCode.maxUses === 1 ? new Date() : inviteCode.usedAt,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error using invite code:", error);
    return NextResponse.json({ error: "Failed to use invite code" }, { status: 500 });
  }
}

