"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTemplates() {
  const session = await auth();
  const orgId = (session?.user as any)?.organizationId;
  if (!orgId) return [];

  return prisma.template.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTemplate(data: {
  name: string;
  type: string;
  subject?: string;
  content: string;
  category?: string;
}) {
  const session = await auth();
  const orgId = (session?.user as any)?.organizationId;
  if (!orgId) throw new Error("Unauthorized");

  const template = await prisma.template.create({
    data: {
      ...data,
      organizationId: orgId,
    },
  });

  revalidatePath("/templates");
  return template;
}

export async function updateTemplate(id: string, data: any) {
  const session = await auth();
  const orgId = (session?.user as any)?.organizationId;
  if (!orgId) throw new Error("Unauthorized");

  const template = await prisma.template.update({
    where: { id, organizationId: orgId },
    data,
  });

  revalidatePath("/templates");
  return template;
}

export async function deleteTemplate(id: string) {
  const session = await auth();
  const orgId = (session?.user as any)?.organizationId;
  if (!orgId) throw new Error("Unauthorized");

  await prisma.template.delete({
    where: { id, organizationId: orgId },
  });

  revalidatePath("/templates");
  return { success: true };
}

export async function toggleTemplateFavorite(id: string) {
  const session = await auth();
  const orgId = (session?.user as any)?.organizationId;
  if (!orgId) throw new Error("Unauthorized");

  const template = await prisma.template.findUnique({
    where: { id, organizationId: orgId },
    select: { isFavorite: true },
  });

  if (!template) throw new Error("Template not found");

  await prisma.template.update({
    where: { id },
    data: { isFavorite: !template.isFavorite },
  });

  revalidatePath("/templates");
}

export async function incrementTemplateUsage(id: string) {
  await prisma.template.update({
    where: { id },
    data: { usageCount: { increment: 1 } },
  });
}
