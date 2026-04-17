import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch all users that can be messaged (scoped to organization)
export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const organizationId = (session.user as any).organizationId;

  try {
    // If no organization, user can only see themselves (edge case)
    if (!organizationId) {
      return NextResponse.json({ users: [] });
    }

    // Multi-tenancy: Only show users from the same organization
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        organizationId, // CRITICAL: Filter by organization
        // Exclude CLIENT role from messaging
        role: { not: "CLIENT" },
        // Exclude the current user from the list
        NOT: { id: userId },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        department: true,
        lastLoginAt: true,
      },
      orderBy: [
        // Prioritize staff members
        { role: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
  }
}

