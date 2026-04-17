import ReportsClient from "./ReportsClient";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  getReportsVolume, 
  getReportsResponseTime, 
  getReportsSatisfaction, 
  getReportsChannels,
  getDashboardStats
} from "@/lib/actions/metrics";

export const dynamic = "force-dynamic";

export default async function ReportsPage() { 
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const organizationId = (session.user as any).organizationId;

  const [volume, responseTime, satisfaction, channels, stats] = await Promise.all([
    getReportsVolume(organizationId),
    getReportsResponseTime(organizationId),
    getReportsSatisfaction(organizationId),
    getReportsChannels(organizationId),
    getDashboardStats(organizationId),
  ]);

  return (
    <ReportsClient 
      volumeData={volume}
      responseTimeData={responseTime}
      satisfactionData={satisfaction}
      channelData={channels}
      stats={stats}
    />
  ); 
}
