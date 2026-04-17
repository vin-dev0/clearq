"use client";

import { useState, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils";
import {
  Ticket,
  MessageSquare,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Tag,
  Zap,
} from "lucide-react";

const activityIcons = {
  comment: { icon: MessageSquare, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  ticket_created: { icon: Ticket, color: "text-teal-400", bg: "bg-teal-500/10" },
  assigned: { icon: UserPlus, color: "text-violet-400", bg: "bg-violet-500/10" },
  resolved: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  sla_warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
  tagged: { icon: Tag, color: "text-rose-400", bg: "bg-rose-500/10" },
};

export function ActivityFeed({ activities = [] }: { activities?: any[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-6">
      <h3 className="text-lg font-semibold text-white">Activity Feed</h3>
      <p className="text-sm text-zinc-400">Recent actions in your workspace</p>

      <div className="mt-4 space-y-4">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Zap className="h-8 w-8 text-zinc-600 mb-2" />
            <p className="text-zinc-500 text-sm">No recent activity.</p>
          </div>
        ) : activities.map((activity) => {
          // Fallback to comment icon if type is missing (our metrics return comments)
          const type = activity.type || 'comment';
          const iconConfig = activityIcons[type as keyof typeof activityIcons];
          const Icon = iconConfig.icon;

          return (
            <div key={activity.id} className="flex gap-3">
              <div className={`rounded-lg p-2 ${iconConfig.bg}`}>
                <Icon className={`h-4 w-4 ${iconConfig.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-300">
                  <span className="font-medium text-white">
                    {activity.author?.name || activity.author?.email || 'System'}
                  </span>
                  {" "}commented on{" "}
                  <span className="font-medium text-teal-400">
                    #{activity.ticket?.number} {activity.ticket?.subject}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-zinc-500" suppressHydrationWarning>
                  {/* Force reload fix for hydration mismatch */}
                  {mounted ? formatRelativeTime(activity.createdAt) : "Updating..."}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



