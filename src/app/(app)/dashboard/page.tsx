import DashboardClient from "./DashboardClient";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
  getDashboardStats, 
  getRecentTickets, 
  getMyRecentTickets,
  getActivityFeed, 
  getWeeklyActivity, 
  getStatusDistribution 
} from "@/lib/actions/metrics";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch latest user state
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true, role: true }
  });

  if (dbUser?.role === "CLIENT") {
    redirect("/client");
  }

  const organizationId = dbUser?.organizationId;
  const role = dbUser?.role;
  const isGlobalManager = role === "OWNER";
  const isTenantManager = role === "ADMIN" || role === "SUPERVISOR";

  // If not management and no org, we need setup
  if (!organizationId && !isGlobalManager) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-xl font-semibold text-white mb-2">Setup Required</h2>
        <p className="text-zinc-400">Your account is not yet associated with an organization.</p>
      </div>
    );
  }

  // ONLY System Owners (OWNER) see GLOBAL data
  const metricsOrgId = isGlobalManager ? undefined : (organizationId || undefined);

  const [stats, recentTickets, myTickets, activityFeed, weeklyActivity, statusDistribution] = await Promise.all([
    getDashboardStats(metricsOrgId),
    getRecentTickets(metricsOrgId),
    getMyRecentTickets(session.user.id, organizationId || undefined), 
    getActivityFeed(metricsOrgId),
    getWeeklyActivity(metricsOrgId),
    getStatusDistribution(metricsOrgId),
  ]);

  return (
    <DashboardClient 
      stats={stats}
      recentTickets={recentTickets}
      myTickets={myTickets}
      activityFeed={activityFeed}
      weeklyActivity={weeklyActivity}
      statusDistribution={statusDistribution}
    />
  ); 
}
