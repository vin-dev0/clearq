"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getRemoteSessions() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  
  const orgId = (session.user as any).organizationId;
  if (!orgId) return [];

  return await prisma.remoteSession.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" }
  });
}

export async function createRemoteSession(data: {
  name: string;
  type: string;
  host: string;
  port?: number;
  username: string;
  password?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  
  const orgId = (session.user as any).organizationId;
  if (!orgId) throw new Error("No organization found");

  const remoteSession = await prisma.remoteSession.create({
    data: {
      name: data.name,
      type: "SSH",
      host: data.host,
      port: data.port || 22,
      username: data.username,
      passwordHash: data.password || null,
      organizationId: orgId
    }
  });

  revalidatePath("/remote");
  return remoteSession;
}

export async function deleteRemoteSession(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  
  const orgId = (session.user as any).organizationId;

  await prisma.remoteSession.deleteMany({
    where: { id, organizationId: orgId }
  });

  revalidatePath("/remote");
}
