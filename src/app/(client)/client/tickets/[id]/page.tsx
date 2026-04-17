import ClientTicketDetail from "./ClientTicketDetail";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ClientTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
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

  if (!ticket) notFound();

  // Map to match component expectations
  const formattedTicket = {
    ...ticket,
    comments: ticket.comments.map(c => ({
      ...c,
      isInternal: c.isInternal, // This will be passed to ClientTicketDetail which filters these away
    })),
    tags: ticket.tags.map(t => t.tag),
  };

  return <ClientTicketDetail initialTicket={formattedTicket} />;
}
