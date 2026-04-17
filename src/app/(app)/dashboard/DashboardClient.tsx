"use client";

import { useEffect, useState } from "react";
import { getIntegrationsConfig } from "@/lib/actions/integrations";

import { StatsCard } from "@/components/dashboard/StatsCard";
import { TicketChart } from "@/components/dashboard/TicketChart";
import { RecentTickets } from "@/components/dashboard/RecentTickets";
import { StatusDistribution } from "@/components/dashboard/StatusDistribution";
import { TeamPerformance } from "@/components/dashboard/TeamPerformance";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Button } from "@/components/ui/button";
import {
  Ticket,
  Clock,
  CheckCircle2,
  TrendingUp,
  Users,
  Zap,
  Download,
  RefreshCw,
  Blocks,
  Terminal,
  Database,
  Globe,
  MessageSquare,
  ShieldAlert,
  LayoutGrid
} from "lucide-react";

const INTEGRATIONS_MAP: Record<string, {name: string, icon: any, color: string}> = {
  slack: { name: "Slack Connect", icon: MessageSquare, color: "from-emerald-400 to-teal-500" },
  docker: { name: "Docker Hub", icon: Database, color: "from-blue-400 to-sky-500" },
  discord: { name: "Discord", icon: MessageSquare, color: "from-indigo-500 to-indigo-600" },
  teams: { name: "Microsoft Teams", icon: MessageSquare, color: "from-blue-600 to-indigo-600" },
  zapier: { name: "Zapier", icon: Blocks, color: "from-orange-500 to-amber-500" },
  "google-analytics": { name: "Google Analytics", icon: Globe, color: "from-amber-400 to-orange-500" }
};

function ActiveIntegrations() {
  const [apps, setApps] = useState<string[]>([]);
  
  useEffect(() => {
    async function loadApps() {
      try {
        const db = await getIntegrationsConfig();
        if (db && db.apps) {
          const installed = Object.keys(db.apps).filter(k => db.apps[k] === "INSTALLED");
          setApps(installed);
        }
      } catch (err) {
        console.error("Failed to load integrations", err);
      }
    }
    loadApps();
  }, []);

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Blocks className="w-5 h-5 text-teal-400"/>
          Active Integrations
        </h3>
        <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">{apps.length} connected</span>
      </div>
      
      {apps.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500/50 py-10 border border-dashed border-zinc-800/50 rounded-lg">
           <Blocks className="w-8 h-8 mb-2 opacity-50"/>
           <span className="text-xs">No active integrations found.</span>
        </div>
      ) : (
        <div className="space-y-3 mt-2 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
          {apps.map(id => {
            const data = INTEGRATIONS_MAP[id];
            if(!data) return null;
            const Icon = data.icon;
            return (
              <div key={id} className="group flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-950 p-3 shadow-md hover:border-zinc-700 transition-colors">
                 <div className="flex items-center gap-3">
                   <div className={`flex w-9 h-9 items-center justify-center rounded-lg bg-gradient-to-br shadow-inner ${data.color}`}>
                     <Icon className="w-4 h-4 text-white" />
                   </div>
                   <span className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">{data.name}</span>
                 </div>
                 <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                 </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DashboardClient({
  stats,
  recentTickets,
  myTickets = [],
  activityFeed,
  weeklyActivity,
  statusDistribution
}: {
  stats: any;
  recentTickets: any[];
  myTickets?: any[];
  activityFeed: any[];
  weeklyActivity: any[];
  statusDistribution: any[];
}) {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-400">
            Welcome back! Here&apos;s what&apos;s happening with your support desk.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="secondary" size="sm">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-fade-in stagger-1">
          <StatsCard
            title="Total Tickets"
            value={stats.total}
            change={0}
            icon={Ticket}
            iconColor="text-teal-400"
            iconBg="bg-teal-500/10"
          />
        </div>
        <div className="animate-fade-in stagger-2">
          <StatsCard
            title="Open Tickets"
            value={stats.open}
            change={0}
            icon={Clock}
            iconColor="text-amber-400"
            iconBg="bg-amber-500/10"
          />
        </div>
        <div className="animate-fade-in stagger-3">
          <StatsCard
            title="Customer Satisfaction"
            value={stats.csat > 0 ? `${stats.csat.toFixed(1)}/5` : "No ratings"}
            change={0}
            changeLabel={stats.csatCount > 0 ? `from ${stats.csatCount} reviews` : "no reviews yet"}
            icon={TrendingUp}
            iconColor="text-emerald-400"
            iconBg="bg-emerald-500/10"
          />
        </div>
        <div className="animate-fade-in stagger-4">
          <StatsCard
            title="Resolved Tickets"
            value={stats.resolved}
            change={0}
            changeLabel={`${stats.resolutionRate}% resolution rate`}
            icon={TrendingUp}
            iconColor="text-cyan-400"
            iconBg="bg-cyan-500/10"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="animate-fade-in stagger-5 lg:col-span-2">
          <TicketChart data={weeklyActivity} />
        </div>
        <div className="animate-fade-in stagger-5">
          <StatusDistribution data={statusDistribution} />
        </div>
      </div>

      {/* Tickets Row */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="animate-fade-in stagger-5 lg:col-span-2">
          <RecentTickets tickets={recentTickets} />
        </div>
        <div className="animate-fade-in stagger-6">
          <RecentTickets 
            tickets={myTickets} 
            title="My Assignments" 
            description="Tickets assigned to you"
          />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="animate-fade-in lg:col-span-1 stagger-7">
           <ActiveIntegrations />
        </div>
        <div className="animate-fade-in lg:col-span-1 stagger-8">
          <TeamPerformance />
        </div>
        <div className="animate-fade-in lg:col-span-1 stagger-9">
          <ActivityFeed activities={activityFeed} />
        </div>
      </div>
    </div>
  );
}



