import TicketDetailClient from "./TicketDetailClient";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getTags } from "@/lib/actions/tags";
import { getAgents } from "@/lib/actions/users";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userRole = (session?.user as any)?.role || "CLIENT";
  const isAdmin = userRole === "ADMIN" || userRole === "OWNER";
  const isSupervisor = userRole === "SUPERVISOR";
  const isManagement = isAdmin || isSupervisor;
  
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, email: true, avatar: true } },
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
      tags: { include: { tag: true } },
      attachments: true,
      comments: { 
        include: { 
          author: { select: { id: true, name: true, email: true, avatar: true, role: true } },
          attachments: true
        },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!ticket) {
    notFound();
  }

  // Filter internal comments for non-management
  const filteredComments = ticket.comments.filter(comment => {
    if (isManagement) return true;
    if (comment.isInternal) {
      // Agents can only see their own internal comments, if any
      return comment.authorId === session?.user?.id;
    }
    return true;
  });

  const mappedTicket = {
    ...ticket,
    isLocked: ticket.isLocked,
    creator: { ...ticket.creator, name: ticket.creator.name || ticket.creator.email, company: "" },
    assignee: ticket.assignee ? { ...ticket.assignee, name: ticket.assignee.name || ticket.assignee.email } : null,
    tags: ticket.tags.map(t => ({ id: t.tag.id, name: t.tag.name, color: t.tag.color })),
    comments: filteredComments,
  };

  const tags = await getTags();
  const agents = await getAgents();

  return (
    <TicketDetailClient 
      initialTicket={mappedTicket} 
      availableTags={tags} 
      agents={agents}
      isAdmin={isAdmin}
      isSupervisor={isSupervisor}
      userRole={userRole}
    />
  );
}
