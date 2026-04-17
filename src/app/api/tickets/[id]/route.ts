import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const orgId = (session?.user as any)?.organizationId;

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { subject, description, priority, status } = body;

    const ticket = await prisma.ticket.update({
      where: {
        id: params.id,
        organizationId: orgId,
      },
      data: {
        subject,
        description,
        priority,
        status,
      },
    });

    revalidatePath("/tickets");
    revalidatePath(`/tickets/${params.id}`);

    return NextResponse.json(ticket);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
