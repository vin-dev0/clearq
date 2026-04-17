import TeamsClient from "./TeamsClient";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TeamsPage() { 
  const session = await auth();
  const userRole = (session?.user as any)?.role || "CLIENT";
  const canManage = userRole === "ADMIN" || userRole === "SUPERVISOR";
  const orgId = (session?.user as any)?.organizationId;
  
  if (!orgId) {
    return <TeamsClient initialTeams={[]} initialAgents={[]} canManage={canManage} />;
  }

  // Fetch all teams with their members
  const teams = await prisma.team.findMany({
    where: { organizationId: orgId },
    include: {
      members: {
        include: {
          user: true
        }
      },
      _count: {
        select: {
          tickets: {
            where: { status: "OPEN" }
          }
        }
      }
    }
  });

  // Fetch all agents (users)
  const agents = await prisma.user.findMany({
    where: { 
      organizationId: orgId,
      role: { not: "CLIENT" }
    },
    include: {
      _count: {
        select: {
          assignedTickets: {
            where: { status: "OPEN" }
          }
        }
      }
    }
  });

  return <TeamsClient initialTeams={teams} initialAgents={agents} canManage={canManage} />; 
}
