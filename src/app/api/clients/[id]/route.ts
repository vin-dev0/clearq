import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const organizationId = (session.user as any).organizationId;
    const body = await request.json();
    const { name, email, phone, company } = body;

    const client = await prisma.user.update({
      where: { id, organizationId, role: "CLIENT" },
      data: {
        name,
        email,
        phone,
        department: company,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        department: true,
        isActive: true,
        lastLoginAt: true,
        _count: {
          select: { createdTickets: true }
        }
      }
    });

    return NextResponse.json({ client });
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const organizationId = (session.user as any).organizationId;

    await prisma.user.delete({
      where: { id, organizationId, role: "CLIENT" }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }
}
