"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sendInviteEmail } from "@/lib/mail";

const teamSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.string().default("AGENT"),
});

export async function createTeam(data: z.infer<typeof teamSchema>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const organizationId = (session.user as any).organizationId;
  const role = (session.user as any).role;

  if (role !== "ADMIN" && role !== "SUPERVISOR") {
    throw new Error("Only admins and supervisors can create teams");
  }

  await prisma.team.create({
    data: {
      ...data,
      organizationId,
    },
  });

  revalidatePath("/teams");
}

export async function inviteAgent(data: z.infer<typeof inviteSchema>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const organizationId = (session.user as any).organizationId;
  const role = (session.user as any).role;

  if (role !== "ADMIN" && role !== "SUPERVISOR") {
    throw new Error("Only admins and supervisors can invite agents");
  }

  // Create an invite code for this user/org
  const code = `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  await prisma.inviteCode.create({
    data: {
      code,
      email: data.email,
      organizationId,
      createdById: session.user.id,
      maxUses: 1,
      type: "DIRECT",
      targetRole: data.role,
    },
  });

  // Fetch organization name for the email
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { name: true }
  });

  // Send the invitation email (mocked in dev/test)
  await sendInviteEmail(data.email, code, organization?.name || "ClearQ");
  
  revalidatePath("/teams");
  return { code };
}

export async function getPendingInvites() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const organizationId = (session.user as any).organizationId;
  
  return await prisma.inviteCode.findMany({
    where: { 
      organizationId,
      currentUses: { lt: prisma.inviteCode.fields.maxUses },
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function revokeInvite(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const organizationId = (session.user as any).organizationId;
  const role = (session.user as any).role;

  if (role !== "ADMIN" && role !== "SUPERVISOR") {
    throw new Error("Unauthorized");
  }

  await prisma.inviteCode.delete({
    where: { id, organizationId }
  });

  revalidatePath("/teams");
}

export async function redeemInvite(code: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const invite = await prisma.inviteCode.findUnique({
    where: { code: code.toUpperCase() },
    include: { organization: true }
  });

  if (!invite) throw new Error("Invalid invite code");
  if (invite.currentUses >= invite.maxUses) throw new Error("Invite code already used");
  if (invite.expiresAt && new Date() > invite.expiresAt) throw new Error("Invite code expired");
  if (invite.email && invite.email.toLowerCase() !== session.user.email?.toLowerCase()) {
    throw new Error("This invite is for a different email address");
  }

  const organizationId = invite.organizationId;
  if (!organizationId) throw new Error("Invite has no organization associated");

  // Add user to organization
  await prisma.user.update({
    where: { id: session.user.id },
    data: { 
      organizationId,
      role: invite.targetRole || "AGENT"
    }
  });

  // Mark invite as used
  await prisma.inviteCode.update({
    where: { id: invite.id },
    data: {
      currentUses: { increment: 1 },
      usedBy: session.user.id,
      usedAt: new Date()
    }
  });

  // Add to default team
  const defaultTeam = await prisma.team.findFirst({
    where: { organizationId },
    orderBy: { createdAt: "asc" }
  });

  if (defaultTeam) {
    await prisma.teamMember.upsert({
      where: { userId_teamId: { userId: session.user.id, teamId: defaultTeam.id } },
      update: { role: "member" },
      create: {
        userId: session.user.id,
        teamId: defaultTeam.id,
        role: "member"
      }
    });
  }

  revalidatePath("/settings");
  revalidatePath("/teams");
  return { success: true, organizationName: invite.organization?.name };
}

export async function removeUserFromTeam(teamId: string, userId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "SUPERVISOR") {
    throw new Error("Only admins and supervisors can remove users from teams");
  }

  await prisma.teamMember.delete({
    where: { userId_teamId: { userId, teamId } }
  });

  revalidatePath("/teams");
  revalidatePath(`/teams/${teamId}`);
}
