import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Validate and consume an invite code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, email } = body;

    if (!code) {
      return NextResponse.json({ valid: false, error: "Invite code required" }, { status: 400 });
    }

    const invite = await prisma.inviteCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!invite) {
      return NextResponse.json({ valid: false, error: "Invalid invite code" }, { status: 400 });
    }

    // Check if expired
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: "This invite code has expired" }, { status: 400 });
    }

    // Check if max uses reached
    if (invite.currentUses >= invite.maxUses) {
      return NextResponse.json({ valid: false, error: "This invite code has been fully used" }, { status: 400 });
    }

    // Check if email-restricted
    if (invite.email && email && invite.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ 
        valid: false, 
        error: "This invite code is restricted to a different email address" 
      }, { status: 400 });
    }

    // Valid! Return the plan associated with this invite
    return NextResponse.json({
      valid: true,
      plan: invite.plan,
      email: invite.email || null,
    });
  } catch (error) {
    console.error("Error validating invite:", error);
    return NextResponse.json({ valid: false, error: "Failed to validate invite" }, { status: 500 });
  }
}

