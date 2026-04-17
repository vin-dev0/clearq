"use server";

import { prisma } from "@/lib/prisma";

export async function submitPublicTicket(data: {
  orgSlug: string;
  name: string;
  email: string;
  subject: string;
  description: string;
}) {
  const org = await prisma.organization.findUnique({
    where: { slug: data.orgSlug },
  });

  if (!org) {
    throw new Error("Organization not found");
  }

  // Find or create customer
  let user = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        role: "CLIENT",
        organizationId: org.id,
        plan: org.plan,
        subscriptionStatus: org.subscriptionStatus,
      },
    });
  }

  // Get next ticket number
  const lastTicket = await prisma.ticket.findFirst({
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const nextNumber = (lastTicket?.number || 1000) + 1;

  // Create ticket
  const ticket = await prisma.ticket.create({
    data: {
      number: nextNumber,
      subject: data.subject,
      description: data.description,
      type: "QUESTION",
      priority: "MEDIUM",
      status: "OPEN",
      channel: "WEB",
      creatorId: user.id,
      organizationId: org.id,
    },
  });

  return { success: true, ticketNumber: ticket.number };
}
