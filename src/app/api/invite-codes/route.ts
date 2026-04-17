import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

// Generate a unique invite code
function generateInviteCode(): string {
  return `ST-${randomBytes(4).toString("hex").toUpperCase()}`;
}

// GET: List all invite codes (Team Lead/Admin/Admin)
// Multi-tenancy: Only shows invites for the user's organization
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const organizationId = (session?.user as any)?.organizationId;

    if (!session?.user || !["SUPERVISOR", "ADMIN"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const unused = searchParams.get("unused") === "true";

    const whereClause: any = {};

    // If not a global ADMIN, restrict to their organization
    if (userRole !== "ADMIN" || organizationId) {
       if (!organizationId) {
         return NextResponse.json({ inviteCodes: [] });
       }
       whereClause.organizationId = organizationId;
    }

    const inviteCodes = await prisma.inviteCode.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ inviteCodes });
  } catch (error) {
    console.error("Error fetching invite codes:", error);
    return NextResponse.json({ error: "Failed to fetch invite codes" }, { status: 500 });
  }
}

// POST: Create new invite code (Team Lead/Admin/Admin)
// Multi-tenancy: Invite code inherits creator's organization
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const organizationId = (session?.user as any)?.organizationId;

    if (!session?.user || !["SUPERVISOR", "ADMIN"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!organizationId) {
      return NextResponse.json({ error: "You must be in an organization to create invites" }, { status: 400 });
    }

    const body = await request.json();
    const { email, expiresInDays, maxUses, notes, type, targetRole } = body;

    // CLIENT CAPACITY ENFORCEMENT
    if (!targetRole || targetRole === "CLIENT") {
      const clientCount = await prisma.user.count({
        where: { organizationId, role: "CLIENT" }
      });
      
      const pendingInvites = await prisma.inviteCode.aggregate({
        where: { 
          organizationId, 
          targetRole: "CLIENT",
          usedAt: null,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        _sum: { maxUses: true }
      });

      const totalProjectedClients = clientCount + (pendingInvites._sum.maxUses || 0);

      if (totalProjectedClients >= 50) {
        return NextResponse.json({ 
          error: `Client capacity reached. Your plan allows for works up to 50 clients. Current: ${clientCount}, Pending: ${pendingInvites._sum.maxUses || 0}.` 
        }, { status: 400 });
      }
    }

    const code = generateInviteCode();
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    // For team invites, plan is inherited from the organization
    // The plan field on invite is only used when creating NEW organizations
    const inviteCode = await prisma.inviteCode.create({
      data: {
        code,
        email: email || null,
        expiresAt,
        maxUses: maxUses || 1,
        createdById: session.user.id as string,
        notes: notes || null,
        organizationId, // Users will join this org and inherit its plan
        type: type || "DIRECT", // DIRECT or REQUEST
        targetRole: targetRole || "CLIENT",
      },
    });

    return NextResponse.json(inviteCode);
  } catch (error) {
    console.error("Error creating invite code:", error);
    return NextResponse.json({ error: "Failed to create invite code" }, { status: 500 });
  }
}

