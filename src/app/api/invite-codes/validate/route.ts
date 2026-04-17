import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Validate an invite code (public - used during registration)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, email } = body;

    if (!code) {
      return NextResponse.json({ valid: false, error: "Invite code is required" }, { status: 400 });
    }

    const inviteCode = await prisma.inviteCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!inviteCode) {
      return NextResponse.json({ valid: false, error: "Invalid invite code" }, { status: 400 });
    }

    // Check if already fully used
    if (inviteCode.currentUses >= inviteCode.maxUses) {
      return NextResponse.json({ valid: false, error: "This invite code has already been used" }, { status: 400 });
    }

    // Check if expired
    if (inviteCode.expiresAt && new Date() > inviteCode.expiresAt) {
      return NextResponse.json({ valid: false, error: "This invite code has expired" }, { status: 400 });
    }

    // Check if email-restricted and doesn't match
    if (inviteCode.email && email && inviteCode.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ valid: false, error: "This invite code is for a different email address" }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      plan: inviteCode.plan,
      email: inviteCode.email,
      targetRole: inviteCode.targetRole,
    });
  } catch (error) {
    console.error("Error validating invite code:", error);
    return NextResponse.json({ valid: false, error: "Failed to validate invite code" }, { status: 500 });
  }
}

