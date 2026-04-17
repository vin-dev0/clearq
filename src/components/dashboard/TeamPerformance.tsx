"use client";

import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

// No mock data for brand new app
const teamMembers: any[] = [];

export function TeamPerformance() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-6">
      <h3 className="text-lg font-semibold text-white">Team Performance</h3>
      <p className="text-sm text-zinc-400">This week&apos;s metrics</p>

      <div className="mt-4 space-y-4">
        {teamMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-8 w-8 text-zinc-600 mb-2" />
            <p className="text-zinc-500 text-sm">No team members active yet.</p>
          </div>
        ) : teamMembers.map((member) => (
          <div
            key={member.name}
            className="flex items-center gap-4 rounded-lg bg-zinc-800/40 p-3 transition-colors hover:bg-zinc-800/60"
          >
            <Avatar
              src={member.avatar}
              name={member.name}
              size="md"
              status={member.status}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-white">{member.name}</p>
                <span className="text-xs text-zinc-500">{member.role}</span>
              </div>
              <div className="mt-1 flex items-center gap-4 text-xs text-zinc-400">
                <span>
                  <strong className="text-white">{member.ticketsResolved}</strong> resolved
                </span>
                <span>
                  <strong className="text-white">{member.avgResponseTime}</strong> avg response
                </span>
              </div>
            </div>
            <div className="text-right">
              <div
                className={cn(
                  "text-lg font-bold",
                  member.satisfaction >= 95
                    ? "text-emerald-400"
                    : member.satisfaction >= 90
                    ? "text-amber-400"
                    : "text-rose-400"
                )}
              >
                {member.satisfaction}%
              </div>
              <p className="text-xs text-zinc-500">satisfaction</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



