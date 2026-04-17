import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch current user's organization and members
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as any).organizationId;

    if (!organizationId) {
      return NextResponse.json({ 
        organization: null, 
        members: [] 
      });
    }

    // Fetch organization
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        stripeApiKey: true,
      },
    });

    // Fetch members
    const members = await prisma.user.findMany({
      where: { 
        organizationId,
        isActive: true,
        role: {
          not: "CLIENT",
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        lastLoginAt: true,
      },
      orderBy: [
        { role: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({ 
      organization, 
      members 
    });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json({ error: "Failed to fetch organization" }, { status: 500 });
  }
}

// PATCH - Update organization settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const organizationId = (session.user as any).organizationId;

    // Only admins and admins can update organization
    if (!["ADMIN"].includes(userRole)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    if (!organizationId) {
      return NextResponse.json({ error: "No organization assigned" }, { status: 400 });
    }

    const body = await request.json();
    const { name, stripeApiKey } = body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (stripeApiKey !== undefined) data.stripeApiKey = stripeApiKey;

    const updatedOrg = await prisma.organization.update({
      where: { id: organizationId },
      data,
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        stripeApiKey: true,
      },
    });

    return NextResponse.json({ organization: updatedOrg });
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json({ error: "Failed to update organization" }, { status: 500 });
  }
}

