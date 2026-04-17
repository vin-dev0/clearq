import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// Helper to generate URL-safe slug from company name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 50);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, inviteCode, companyName } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Validate invite code
    if (!inviteCode) {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 }
      );
    }

    // Verify invite code is valid
    const invite = await prisma.inviteCode.findUnique({
      where: { code: inviteCode.toUpperCase() },
      include: { organization: true },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 400 }
      );
    }

    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Invite code has expired" },
        { status: 400 }
      );
    }

    if (invite.currentUses >= invite.maxUses) {
      return NextResponse.json(
        { error: "Invite code has been fully used" },
        { status: 400 }
      );
    }

    // Check if email is restricted for this invite
    if (invite.email && invite.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: "This invite code is restricted to a different email" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Handle REQUEST type invites - user needs approval to join
    const isRequestInvite = invite.type === "REQUEST";
    
    // Determine organization
    let organizationId = invite.organizationId;
    let pendingApproval = false;
    
    // For REQUEST type invites, don't assign org yet - create join request after user creation
    if (isRequestInvite && organizationId) {
      pendingApproval = true;
    }
    
    // If invite doesn't have an organization and company name provided, create one for the user
    if (!organizationId && companyName) {
      // Generate a unique slug
      let baseSlug = generateSlug(companyName);
      let slug = baseSlug;
      let counter = 1;
      
      // Ensure slug is unique
      while (await prisma.organization.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      // Create new organization with plan and subscription (ORGANIZATION-LEVEL BILLING)
      const newOrg = await prisma.organization.create({
        data: {
          name: companyName,
          slug,
          domain: email.split("@")[1].toLowerCase(),
          plan: invite.plan || "STARTER",
          subscriptionStatus: "EXPIRED",
        },
      });
      organizationId = newOrg.id;
    }

    // MARK INVITE AS USED AND CREATE USER IN TRANSACTION
    // This ensures that the invite cannot be double-used in a race condition
    const { user: newUser } = await prisma.$transaction(async (tx) => {
      // 1. Double check usage count within transaction
      const currentInvite = await tx.inviteCode.findUnique({
        where: { id: invite.id },
      });

      if (!currentInvite || currentInvite.currentUses >= currentInvite.maxUses) {
        throw new Error("Invite code has been fully used");
      }

      // 2. Create the user
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          name,
          passwordHash,
          // Assign role from invite or default to CLIENT
          role: invite.type === "ORGANIZATION" || !invite.organizationId ? "ADMIN" : (invite.targetRole || "CLIENT"),
          organizationId: pendingApproval ? null : organizationId,
          lastLoginAt: new Date(),
        },
      });

      // CLIENT CAPACITY ENFORCEMENT
      if (user.role === "CLIENT" && organizationId) {
        const clientCount = await tx.user.count({
          where: { organizationId, role: "CLIENT" }
        });
        if (clientCount > 50) {
          throw new Error("Client capacity reached for this organization (Max: 50)");
        }
      }

      // 3. If REQUEST invite, create a join request
      if (pendingApproval && invite.organizationId) {
        await tx.joinRequest.create({
          data: {
            userId: user.id,
            organizationId: invite.organizationId,
            inviteCodeId: invite.id,
          },
        });
      }

      // 4. If we created a new organization, create a default team for it
      if (organizationId && !invite.organizationId && !pendingApproval) {
        await tx.team.create({
          data: {
            name: "General",
            description: "Default team for all members",
            organizationId,
            members: {
              create: {
                userId: user.id,
                role: "admin",
              },
            },
          },
        });
      } else if (organizationId && !pendingApproval && user.role !== "CLIENT") {
        // Add user to the default team of the existing organization (Staff only)
        const defaultTeam = await tx.team.findFirst({
          where: { organizationId },
          orderBy: { createdAt: "asc" },
        });
        
        if (defaultTeam) {
          await tx.teamMember.create({
            data: {
              userId: user.id,
              teamId: defaultTeam.id,
              role: "member",
            },
          });
        }
      }

      // 5. Mark invite as used
      await tx.inviteCode.update({
        where: { id: invite.id },
        data: {
          currentUses: { increment: 1 },
          usedBy: user.id,
          usedAt: new Date(),
        },
      });

      return { user };
    });

    const user = newUser;

    revalidatePath("/tickets");
    revalidatePath("/dashboard");
    revalidatePath("/admin/users");
    revalidatePath("/admin/invites");

    return NextResponse.json({
      success: true,
      userId: user.id,
      organizationId: pendingApproval ? null : organizationId,
      pendingApproval,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create account" },
      { status: 400 }
    );
  }
}

