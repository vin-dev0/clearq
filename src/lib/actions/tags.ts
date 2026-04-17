"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTags() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const orgId = (session.user as any).organizationId;

  if (!orgId) {
    return [];
  }

  const tags = await prisma.tag.findMany({
    where: { organizationId: orgId },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { tickets: true }
      }
    }
  });

  return tags.map(tag => ({
    ...tag,
    ticketCount: tag._count.tickets,
  }));
}

export async function createTag(data: { name: string; color: string; description?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const orgId = (session.user as any).organizationId;
  
  if (!orgId) throw new Error("User does not belong to an organization");

  const tag = await prisma.tag.create({
    data: {
      name: data.name,
      color: data.color,
      description: data.description,
      organizationId: orgId
    }
  });

  revalidatePath("/tags");
  revalidatePath("/tickets");
  revalidatePath("/tickets/new");
  return tag;
}

export async function deleteTag(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const orgId = (session.user as any).organizationId;
  
  await prisma.tag.deleteMany({
    where: { id, organizationId: orgId }
  });

  revalidatePath("/tags");
  revalidatePath("/tickets");
  revalidatePath("/tickets/new");
}
