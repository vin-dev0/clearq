import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import TicketEditClient from "./TicketEditClient";

export default async function TicketEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const orgId = (session?.user as any)?.organizationId;

  if (!orgId) {
    return notFound();
  }

  const ticket = await prisma.ticket.findUnique({
    where: {
      id: id,
      organizationId: orgId,
    },
    include: {
      creator: true,
    },
  });

  if (!ticket) {
    return notFound();
  }

  return <TicketEditClient ticket={ticket} />;
}
