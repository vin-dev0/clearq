import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const organizationId = (session.user as any).organizationId;

    const whereClause: any = {
      role: "CLIENT"
    };

    // If not a global ADMIN, restrict to their organization
    if (userRole !== "ADMIN" || organizationId) {
      if (!organizationId) {
         return NextResponse.json({ clients: [] });
      }
      whereClause.organizationId = organizationId;
    }

    const clients = await prisma.user.findMany({
      where: whereClause,
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
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as any).organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: "No organization assigned" }, { status: 400 });
    }

    const body = await request.json();
    const { name, email, phone, company } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });
    }

    // Auto-generate password
    const password = Math.random().toString(36).slice(-10);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const client = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        department: company,
        passwordHash,
        role: "CLIENT",
        organizationId,
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

    return NextResponse.json({ client, password });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
