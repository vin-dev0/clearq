import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

// Generate a readable invite code
function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Avoid ambiguous chars
  let code = "ST-"; // ClearQ prefix
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// GET: Fetch all invite codes
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const invites = await prisma.inviteCode.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ invites });
  } catch (error) {
    console.error("Error fetching invites:", error);
    return NextResponse.json({ error: "Failed to fetch invites" }, { status: 500 });
  }
}

// POST: Create a new invite code
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { email, plan, expiresInDays, maxUses, notes } = body;

    // Generate unique code
    let code = generateInviteCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.inviteCode.findUnique({ where: { code } });
      if (!existing) break;
      code = generateInviteCode();
      attempts++;
    }

    // Calculate expiration
    let expiresAt = null;
    if (expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    const orgId = (session.user as any).organizationId;

    // Get organization plan and current staff count
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { plan: true }
    });

    const staffCount = await prisma.user.count({
      where: { 
        organizationId: orgId,
        role: { in: ["ADMIN", "SUPERVISOR", "AGENT"] }
      }
    });

    // Staff limits: STARTER = 3, PRO = 7, ENTERPRISE = Unlimited (999)
    const limit = org?.plan === "PRO" ? 7 : org?.plan === "ENTERPRISE" ? 999 : 3;
    
    // Check if body.targetRole is a staff role
    const isStaffInvite = ["ADMIN", "SUPERVISOR", "AGENT"].includes(body.targetRole || "CLIENT");
    
    if (isStaffInvite && staffCount + (maxUses || 1) > limit) {
      return NextResponse.json({ 
        error: `Plan limit reached. Your ${org?.plan || "STARTER"} plan only allows up to ${limit} staff members.` 
      }, { status: 400 });
    }

    const invite = await prisma.inviteCode.create({
      data: {
        code,
        email: email || null,
        plan: plan || "STARTER",
        type: body.type || "DIRECT",
        targetRole: body.targetRole || "CLIENT",
        expiresAt,
        maxUses: maxUses || 1,
        notes: notes || null,
        createdById: session.user.id as string,
        organizationId: orgId,
      },
    });

    return NextResponse.json(invite);
  } catch (error) {
    console.error("Error creating invite:", error);
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }
}

