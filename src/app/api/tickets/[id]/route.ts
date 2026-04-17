import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// VERCEL VERIFICATION COMMIT
export async function PATCH(
  r: NextRequest,
  c: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await c.params;


    const session = await auth();

    const orgId = (session?.user as any)?.organizationId;

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await r.json();
    const { subject, description, priority, status } = body;

    const ticket = await prisma.ticket.update({
      where: {
        id: id,
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
    revalidatePath(`/tickets/${id}`);

    return NextResponse.json(ticket);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
