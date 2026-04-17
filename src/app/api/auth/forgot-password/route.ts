import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ 
        success: true, 
        message: "If an account exists, a link has been sent." 
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60);

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      }
    });

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${origin}/reset-password?token=${token}`;
    
    // In a real application, you would send an email here using Resend or SendGrid.
    console.log(`PASSWORD RESET FOR ${email}: ${resetLink}`);

    return NextResponse.json({ 
      success: true, 
      message: "If an account exists, a link has been sent.",
      devLink: process.env.NODE_ENV !== "production" ? resetLink : undefined
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
