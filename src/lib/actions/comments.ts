"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createInAppNotification } from "./notifications";

export async function addComment({
  ticketId,
  content,
  isInternal,
}: {
  ticketId: string;
  content: string;
  isInternal: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const userRole = (session.user as any).role;
  const orgId = (session.user as any).organizationId;

  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId, organizationId: orgId },
    include: { 
      creator: { select: { id: true, email: true, name: true, avatar: true } },
      assignee: { select: { id: true, email: true, name: true, avatar: true } },
      watchers: {
        include: {
          user: true
        }
      },
      csat: true
    },
  });

  if (!ticket) throw new Error("Ticket not found");

  if (ticket.status === "SOLVED" || ticket.status === "CLOSED") {
    throw new Error("This ticket is permanently closed and no longer accepts replies.");
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      isInternal,
      ticketId,
      authorId: userId,
    },
  });

  // SLA Tracking: Mark first response if this is the first public reply from staff
  const isAgentReply = ["ADMIN", "SUPERVISOR", "AGENT"].includes(userRole);
  if (isAgentReply && !isInternal && !ticket.firstResponseAt) {
    await prisma.ticket.updateMany({
      where: { id: ticketId, organizationId: orgId },
      data: { 
        firstResponseAt: new Date()
      },
    });
  } else {
    // Update ticket's updatedAt anyway
    await prisma.ticket.updateMany({
      where: { id: ticketId, organizationId: orgId },
      data: { updatedAt: new Date() },
    });
  }

  // Notifications logic
  try {
    const notifications: Promise<any>[] = [];
    const recipients = new Set<string>();

    // 1. If author is a client, we MUST notify staff
    if (userRole === "CLIENT") {
      if (ticket.assigneeId) {
        recipients.add(ticket.assigneeId);
      } else {
        // Unassigned ticket: Notify all admins/supervisors in the organization
        const staff = await prisma.user.findMany({
          where: {
            organizationId: orgId,
            role: { in: ["ADMIN", "SUPERVISOR"] },
            isActive: true,
          },
          select: { id: true }
        });
        staff.forEach(s => recipients.add(s.id));
      }
    } else {
      // Author is staff
      if (!isInternal) {
        // Notify client (creator) if it's a public reply
        recipients.add(ticket.creatorId);
      }
    }

    // 2. Notify watchers (except the person who commented)
    ticket.watchers.forEach(w => {
      // Watchers only see internal notes if they are staff
      if (isInternal) {
        if (["ADMIN", "SUPERVISOR", "AGENT"].includes(w.user.role)) {
          recipients.add(w.userId);
        }
      } else {
        recipients.add(w.userId);
      }
    });

    // Remove author from recipients
    recipients.delete(userId);

    // Create notifications
    const authorName = session.user.name || session.user.email || "Someone";
    const notificationTitle = `[Ticket #${ticket.number}] New ${isInternal ? "Internal Note" : "Comment"}`;
    const notificationMessage = `${authorName}: ${content.substring(0, 100)}${content.length > 100 ? "..." : ""}`;

    for (const recipientId of recipients) {
      notifications.push(
        createInAppNotification({
          userId: recipientId,
          type: "SYSTEM", // Using SYSTEM for now as TICKET_COMMENT type might need registration
          title: notificationTitle,
          message: notificationMessage,
          link: `/tickets/${ticketId}`,
          metadata: { ticketId, commentId: comment.id, authorId: userId }
        })
      );
    }

    await Promise.all(notifications);
  } catch (e) {
    console.error("Failed to send comment notifications:", e);
  }

  // Mock Email Dispatcher
  if (!isInternal) {
    console.log("\n==========================================");
    console.log(`📧 [EMAIL DISPATCHER] -> Sending to: ${ticket.creator.email}`);
    console.log(`📁 [SUBJECT] Update on your ticket #${ticket.number}`);
    console.log(`📝 [BODY]\n${content}`);
    console.log("==========================================\n");
  }

  revalidatePath(`/tickets/${ticketId}`);
  return comment;
}
