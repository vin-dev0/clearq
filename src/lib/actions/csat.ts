"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitCSAT(data: {
  ticketId: string;
  rating: number;
  comment?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const ticket = await prisma.ticket.findUnique({
    where: { id: data.ticketId },
    select: { organizationId: true, creatorId: true, status: true }
  });

  if (!ticket) throw new Error("Ticket not found");

  // Only the creator can rate, and only if solved/closed
  if (ticket.status !== "SOLVED" && ticket.status !== "CLOSED") {
    throw new Error("Can only rate solved or closed tickets");
  }

  const csat = await prisma.cSAT.create({
    data: {
      ticketId: data.ticketId,
      organizationId: ticket.organizationId,
      rating: data.rating,
      comment: data.comment,
    },
  });

  revalidatePath(`/tickets/${data.ticketId}`);
  return csat;
}

export async function getTicketCSAT(ticketId: string) {
  return prisma.cSAT.findUnique({
    where: { ticketId },
  });
}
