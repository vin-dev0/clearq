"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { saveIntegrationsConfig } from "./integrations"

export async function getOrganizationSettings() {
  const session = await auth()
  const orgId = (session?.user as any)?.organizationId
  if (!orgId) return {}

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { settings: true }
  })

  try {
    return JSON.parse(org?.settings || "{}")
  } catch (e) {
    return {}
  }
}

export async function updateOrganizationSettings(settings: any) {
  const session = await auth()
  const role = (session?.user as any)?.role
  const orgId = (session?.user as any)?.organizationId

  if (role !== "ADMIN" && role !== "ADMIN") {
    throw new Error("Only admins can update security settings")
  }

  const currentOrg = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { settings: true }
  })

  let currentSettings = {}
  try {
    currentSettings = JSON.parse(currentOrg?.settings || "{}")
  } catch (e) {}

  const newSettings = { ...currentSettings, ...settings }

  await prisma.organization.update({
    where: { id: orgId },
    data: { settings: JSON.stringify(newSettings) }
  })

  revalidatePath("/admin/security")
  return newSettings
}

export async function updateOrganizationPlan(plan: string) {
  const session = await auth()
  const role = (session?.user as any)?.role
  const orgId = (session?.user as any)?.organizationId

  if (!orgId) throw new Error("No organization found")
  if (role !== "ADMIN" && role !== "ADMIN") {
    throw new Error("Only admins can update the plan")
  }

  await prisma.organization.update({
    where: { id: orgId },
    data: { 
      plan: plan.toUpperCase(),
      subscriptionStatus: "ACTIVE"
    }
  })

  revalidatePath("/settings")
  return { plan }
}

export async function deleteAllOrganizationTickets() {
  const session = await auth()
  const role = (session?.user as any)?.role
  const orgId = (session?.user as any)?.organizationId

  if (!orgId) throw new Error("No organization found")
  if (role !== "ADMIN") {
    throw new Error("Only admins can delete all tickets")
  }

  await prisma.ticket.deleteMany({
    where: { organizationId: orgId }
  })

  revalidatePath("/admin/security")
  revalidatePath("/tickets")
  return { success: true }
}

export async function deleteAllOrganizationData() {
  const session = await auth()
  const role = (session?.user as any)?.role
  const orgId = (session?.user as any)?.organizationId
  const userId = session?.user?.id

  if (!orgId || !userId) throw new Error("Unauthorized or organization not found")
  if (role !== "ADMIN") {
    throw new Error("Only admins or the admin can delete all organization data")
  }

  // 1. Identify all users to delete (all staff/clients associated with this org)
  // We fetch IDs first so we can delete users who might have null organizationId but are linked via JoinRequests/Invites
  const [memberIds, requesterIds, inviteeIds] = await Promise.all([
    // Current members
    prisma.user.findMany({
      where: { organizationId: orgId, id: { not: userId } },
      select: { id: true }
    }).then(users => users.map(u => u.id)),
    
    // People with join requests
    prisma.joinRequest.findMany({
      where: { organizationId: orgId, userId: { not: userId } },
      select: { userId: true }
    }).then(requests => requests.map(r => r.userId)),

    // People who used invites for this org
    prisma.inviteCode.findMany({
      where: { organizationId: orgId },
      select: { usedBy: true }
    }).then(invites => invites.map(i => i.usedBy).filter(Boolean) as string[])
  ]);

  // Combine unique IDs
  const usersToDelete = Array.from(new Set([...memberIds, ...requesterIds, ...inviteeIds]));

  // Perform a full reset of the organization data
  const results = await prisma.$transaction([
    prisma.ticket.deleteMany({ where: { organizationId: orgId } }),
    prisma.asset.deleteMany({ where: { organizationId: orgId } }),
    prisma.inventory.deleteMany({ where: { organizationId: orgId } }),
    prisma.chatRoom.deleteMany({ where: { organizationId: orgId } }),
    prisma.team.deleteMany({ where: { organizationId: orgId } }),
    prisma.inviteCode.deleteMany({ where: { organizationId: orgId } }),
    prisma.joinRequest.deleteMany({ where: { organizationId: orgId } }),
    prisma.savedView.deleteMany({ where: { organizationId: orgId } }),
    prisma.remoteSession.deleteMany({ where: { organizationId: orgId } }),
    // Delete identified users
    prisma.user.deleteMany({
      where: { id: { in: usersToDelete } }
    }),
    // Reset organization settings
    prisma.organization.update({
      where: { id: orgId },
      data: { settings: "{}" }
    })
  ]);

  // Reset global integrations for this org-wide reset
  await saveIntegrationsConfig({ apps: {}, webhooks: {} });


  const stats = {
    tickets: results[0].count,
    assets: results[1].count,
    inventory: results[2].count,
    chatRooms: results[3].count,
    teams: results[4].count,
    remoteSessions: results[8].count,
    users: results[9].count
  };

  console.log(`[RESET] Organization ${orgId} reset by user ${userId}. Stats:`, stats);

  // Create a fresh admin invite code for the admin to use
  const recoveryCode = `ADMIN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  await prisma.inviteCode.create({
    data: {
      code: recoveryCode,
      organizationId: orgId,
      createdById: userId,
      targetRole: "ADMIN",
      maxUses: 5,
      notes: "Auto-generated after organization reset"
    }
  });

  revalidatePath("/")
  return { 
    success: true, 
    recoveryCode,
    summary: stats
  }
}

export async function deleteAllRemoteSessions() {
  const session = await auth()
  const role = (session?.user as any)?.role
  const orgId = (session?.user as any)?.organizationId

  if (!orgId) throw new Error("No organization found")
  if (role !== "ADMIN") {
    throw new Error("Only admins can delete all remote connections")
  }

  await prisma.remoteSession.deleteMany({
    where: { organizationId: orgId }
  })

  revalidatePath("/admin/security")
  revalidatePath("/remote")
  return { success: true }
}




