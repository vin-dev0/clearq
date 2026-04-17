"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendIntegrationNotifications } from "@/lib/notifications/integrations";
import { createInAppNotification } from "./notifications";

  

export async function createTicket(data: {
  subject: string;
  description: string;
  type: string;
  priority: string;
  assigneeId?: string;
  tags?: string[];
  attachments?: {
    filename: string;
    url: string;
    mimeType: string;
    size: number;
  }[];
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true, role: true }
  });

  const orgId = dbUser?.organizationId;
  const role = dbUser?.role;

  if (!orgId && role !== "OWNER") {
     throw new Error("You must be part of an organization to create tickets");
  }

  const lastTicket = await prisma.ticket.findFirst({
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const nextNumber = (lastTicket?.number || 1000) + 1;

  const ticketData: any = {
    number: nextNumber,
    subject: data.subject,
    description: data.description,
    type: data.type,
    priority: data.priority,
    creatorId: session.user.id,
    organizationId: orgId,
    status: "OPEN",
    channel: "WEB"
  };

  if (data.assigneeId) {
    ticketData.assigneeId = data.assigneeId;
  }

  if (data.tags && data.tags.length > 0) {
    ticketData.tags = {
      create: data.tags.map((tagId) => ({
        tagId: tagId
      }))
    };
  }

  if (data.attachments && data.attachments.length > 0) {
    ticketData.attachments = {
      create: data.attachments.map((att) => ({
        filename: att.filename,
        url: att.url,
        mimeType: att.mimeType,
        size: att.size,
      }))
    };
  }

  const ticket = await prisma.ticket.create({
    data: ticketData,
  });

  try {
    const creator = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, name: true, email: true }
    });

    if (creator?.role === "CLIENT") {
      const staffToNotify = await prisma.user.findMany({
        where: {
          organizationId: orgId,
          role: { in: ["ADMIN", "SUPERVISOR", "AGENT"] },
          id: { not: session.user.id }
        },
        select: { id: true }
      });

      for (const staff of staffToNotify) {
        await createInAppNotification({
          userId: staff.id,
          type: "TICKET_CREATED",
          title: "New Ticket Received",
          message: `${creator.name || creator.email} created a new ticket: "${data.subject}"`,
          link: `/tickets/${ticket.id}`,
          metadata: { ticketId: ticket.id }
        });
      }
    } else if (data.assigneeId && data.assigneeId !== session.user.id) {
      await createInAppNotification({
        userId: data.assigneeId,
        type: "TICKET_ASSIGNED",
        title: "Ticket Assigned to You",
        message: `${creator?.name || creator?.email} assigned ticket #${nextNumber} to you: "${data.subject}"`,
        link: `/tickets/${ticket.id}`,
        metadata: { ticketId: ticket.id }
      });
    }
  } catch (e) {
    console.error("Failed to create in-app notification:", e);
  }

  sendIntegrationNotifications(ticket).catch(console.error);

  revalidatePath("/tickets");
  revalidatePath("/dashboard");
  return ticket;
}

export async function getTickets() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, organizationId: true }
  });

  if (!dbUser) {
    throw new Error("User record not found. Please log out and back in.");
  }

  const role = dbUser.role;
  const orgId = dbUser.organizationId;
  const isGlobalRole = role === "OWNER";

  const where = role === "CLIENT"
    ? { creatorId: session.user.id, organizationId: orgId }
    : isGlobalRole
      ? {} 
      : { organizationId: orgId };

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      creator: { select: { id: true, name: true, email: true, avatar: true } },
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
      tags: { include: { tag: true } },
      _count: { select: { comments: true, attachments: true } }
    },
  });

  return tickets.map(ticket => ({
    ...ticket,
    creator: {
      ...ticket.creator,
      name: ticket.creator.name || ticket.creator.email
    },
    assignee: ticket.assignee ? {
      ...ticket.assignee,
      name: ticket.assignee.name || ticket.assignee.email
    } : null,
    tags: ticket.tags.map(t => t.tag.name),
    commentsCount: ticket._count.comments,
    attachmentsCount: ticket._count.attachments,
  }));
}

export async function getTicketCounts() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, organizationId: true }
  });

  const role = dbUser?.role;
  const orgId = dbUser?.organizationId;
  const isGlobalRole = role === "OWNER";

  const baseWhere: any = role === "CLIENT"
    ? { creatorId: session.user.id, organizationId: orgId }
    : isGlobalRole
      ? {}
      : { organizationId: orgId };

  const [total, open, pending, onHold, solved, assignedToMe] = await Promise.all([
    prisma.ticket.count({ where: baseWhere }),
    prisma.ticket.count({ where: { ...baseWhere, status: "OPEN" } }),
    prisma.ticket.count({ where: { ...baseWhere, status: "PENDING" } }),
    prisma.ticket.count({ where: { ...baseWhere, status: "ON_HOLD" } }),
    prisma.ticket.count({ where: { ...baseWhere, status: "SOLVED" } }),
    prisma.ticket.count({ where: { ...baseWhere, assigneeId: session.user.id } }),
  ]);

  return {
    total,
    open,
    pending,
    onHold,
    solved,
    assignedToMe,
  };
}

export async function updateTicketTags(ticketId: string, tagIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, organizationId: true } });
  
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { status: true, organizationId: true }
  });
  
  if (ticket?.organizationId !== dbUser?.organizationId && dbUser?.role !== "OWNER") {
    throw new Error("Unauthorized access to ticket");
  }

  if (ticket?.status === "SOLVED" || ticket?.status === "CLOSED") {
    throw new Error("Cannot update tags on a closed ticket");
  }

  await prisma.ticketTag.deleteMany({
    where: { ticketId }
  });

  if (tagIds.length > 0) {
    await prisma.ticketTag.createMany({
      data: tagIds.map((tagId) => ({
        ticketId,
        tagId
      }))
    });
  }

  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/tickets");
}

export async function updateTicketStatus(ticketId: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, organizationId: true } });
  
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { status: true, organizationId: true }
  });

  if (ticket?.organizationId !== dbUser?.organizationId && dbUser?.role !== "OWNER") {
    throw new Error("Unauthorized access to ticket");
  }

  if (ticket?.status === "SOLVED" || ticket?.status === "CLOSED") {
    throw new Error("This ticket is permanently closed and cannot be reopened.");
  }

  const isClosing = status === "SOLVED" || status === "CLOSED";

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { 
      status,
      ...( isClosing ? { 
        resolvedAt: new Date(),
        dueAt: null 
      } : {} )
    }
  });
  
  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/tickets");
}

export async function updateTicketPriority(ticketId: string, priority: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, organizationId: true } });
  
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { status: true, organizationId: true }
  });

  if (ticket?.organizationId !== dbUser?.organizationId && dbUser?.role !== "OWNER") {
    throw new Error("Unauthorized access to ticket");
  }

  if (ticket?.status === "SOLVED" || ticket?.status === "CLOSED") {
    throw new Error("Cannot update priority on a closed ticket");
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { priority }
  });
  
  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/tickets");
}

export async function claimTicket(ticketId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, organizationId: true } });
  
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { status: true, organizationId: true }
  });

  if (ticket?.organizationId !== dbUser?.organizationId && dbUser?.role !== "OWNER") {
    throw new Error("Unauthorized access to ticket");
  }

  if (ticket?.status === "SOLVED" || ticket?.status === "CLOSED") {
    throw new Error("Cannot claim a closed ticket");
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { assigneeId: session.user.id }
  });
  
  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/tickets");
}

export async function bulkUpdateTicketStatus(ticketIds: string[], status: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, organizationId: true } });
  
  const where = dbUser?.role === "OWNER" ? { id: { in: ticketIds } } : { id: { in: ticketIds }, organizationId: dbUser?.organizationId };

  const closedCount = await prisma.ticket.count({
    where: { ...where, status: { in: ["SOLVED", "CLOSED"] } }
  });

  if (closedCount > 0) {
    throw new Error("One or more selected tickets are permanently closed and cannot be modified.");
  }

  await prisma.ticket.updateMany({
    where,
    data: { 
      status,
      ...( (status === "SOLVED" || status === "CLOSED") ? { resolvedAt: new Date() } : {} )
    }
  });
  
  revalidatePath("/tickets");
}

export async function bulkDeleteTickets(ticketIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, organizationId: true } });

  const role = dbUser?.role;
  const isManagement = role === "ADMIN" || role === "SUPERVISOR" || role === "OWNER";

  if (!isManagement) {
    throw new Error("Only admins and supervisors can delete tickets");
  }
  
  const where = role === "OWNER" ? { id: { in: ticketIds } } : { id: { in: ticketIds }, organizationId: dbUser?.organizationId };

  await prisma.ticket.deleteMany({
    where
  });
  
  revalidatePath("/tickets");
}

export async function toggleTicketLock(ticketId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, organizationId: true } });

  const role = dbUser?.role;
  if (role !== "ADMIN" && role !== "SUPERVISOR" && role !== "OWNER") {
    throw new Error("Only admins and supervisors can lock/unlock tickets");
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { isLocked: true, organizationId: true }
  });

  if (!ticket) throw new Error("Ticket not found");
  if (ticket.organizationId !== dbUser?.organizationId && role !== "OWNER") {
    throw new Error("Unauthorized");
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { isLocked: !ticket.isLocked }
  });

  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/tickets");
}

export async function bulkDeleteTicketsFixed(ticketIds: string[]) {
    return bulkDeleteTickets(ticketIds);
}

export async function bulkAssignTickets(ticketIds: string[], assigneeId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, organizationId: true } });

  const where = dbUser?.role === "OWNER" ? { id: { in: ticketIds } } : { id: { in: ticketIds }, organizationId: dbUser?.organizationId };
  
  const closedCount = await prisma.ticket.count({
    where: { ...where, status: { in: ["SOLVED", "CLOSED"] } }
  });
  if (closedCount > 0) {
    throw new Error("Cannot assign permanently closed tickets");
  }

  await prisma.ticket.updateMany({
    where,
    data: { assigneeId }
  });

  revalidatePath("/tickets");
}

export async function bulkAssignTicketsByEmail(ticketIds: string[], email: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, organizationId: true } });

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() }
  });

  if (!user) throw new Error("User not found");
  if (user.organizationId !== dbUser?.organizationId && dbUser?.role !== "OWNER") throw new Error("Unauthorized");

  const where = dbUser?.role === "OWNER" ? { id: { in: ticketIds } } : { id: { in: ticketIds }, organizationId: dbUser?.organizationId };

  await prisma.ticket.updateMany({
    where,
    data: { assigneeId: user.id }
  });

  revalidatePath("/tickets");
}

export async function bulkAddTag(ticketIds: string[], tagName: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, organizationId: true } });
  
  const cleanTagName = tagName.trim().toLowerCase();
  
  let tag = await prisma.tag.findFirst({
    where: { name: cleanTagName, ...(dbUser?.role !== "OWNER" ? { organizationId: dbUser?.organizationId } : {}) }
  });
  if (!tag) {
    tag = await prisma.tag.create({
      data: { name: cleanTagName, color: "#6366f1", organizationId: dbUser?.role !== "OWNER" ? dbUser?.organizationId : undefined }
    });
  }

  for (const ticketId of ticketIds) {
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        select: { status: true, organizationId: true }
      });
      if (ticket?.organizationId !== dbUser?.organizationId && dbUser?.role !== "OWNER") continue;
      if (ticket?.status === "SOLVED" || ticket?.status === "CLOSED") continue;

      await prisma.ticketTag.upsert({
        where: { ticketId_tagId: { ticketId, tagId: tag.id } },
        update: {},
        create: { ticketId, tagId: tag.id }
      });
    } catch (e) {}
  }
  
  revalidatePath("/tickets");
}

export async function unassignTickets(ticketIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, organizationId: true } });

  const where = dbUser?.role === "OWNER" ? { id: { in: ticketIds } } : { id: { in: ticketIds }, organizationId: dbUser?.organizationId };
  
  const closedCount = await prisma.ticket.count({
    where: { ...where, status: { in: ["SOLVED", "CLOSED"] } }
  });
  if (closedCount > 0) {
    throw new Error("Cannot unassign permanently closed tickets");
  }

  await prisma.ticket.updateMany({
    where,
    data: { assigneeId: null }
  });

  revalidatePath("/tickets");
}
