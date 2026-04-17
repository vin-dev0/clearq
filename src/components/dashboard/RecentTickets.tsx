"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeTime } from "@/lib/utils";
import { ChevronRight, MessageSquare } from "lucide-react";

export function RecentTickets({ 
  tickets = [], 
  title = "Recent Tickets", 
  description = "Latest support requests" 
}: { 
  tickets?: any[];
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80">
      <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-zinc-400">{description}</p>
        </div>
        <Link
          href="/tickets"
          className="flex items-center gap-1 text-sm font-medium text-teal-400 transition-colors hover:text-teal-300"
        >
          View all
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="divide-y divide-zinc-800/50">
        {tickets.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-12 text-center">
             <div className="rounded-full bg-zinc-800/50 p-4 mb-3">
               <MessageSquare className="h-8 w-8 text-zinc-600" />
             </div>
             <p className="text-zinc-400">No {title.toLowerCase()} found.</p>
           </div>
        ) : tickets.map((ticket) => {
          const priorityColor = 
            ticket.priority === "URGENT" ? "bg-rose-500" :
            ticket.priority === "HIGH" ? "bg-amber-500" :
            ticket.priority === "MEDIUM" ? "bg-sky-500" : "bg-zinc-600";

          return (
            <Link
              key={ticket.id}
              href={`/tickets/${ticket.id}`}
              className="group relative flex items-center gap-4 px-6 py-5 transition-all hover:bg-zinc-800/30 overflow-hidden"
            >
              <div className={cn("absolute left-0 top-0 bottom-0 w-1 opacity-60 group-hover:opacity-100 transition-opacity", priorityColor)} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="shrink-0 font-mono text-[10px] font-bold text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                    #{ticket.number}
                  </span>
                  <Badge
                    variant={
                      ticket.status === "OPEN"
                        ? "success"
                        : ticket.status === "PENDING"
                        ? "warning"
                        : ticket.status === "ON_HOLD"
                        ? "default"
                        : "info"
                    }
                    dot
                    className="text-[10px] px-2"
                  >
                    {ticket.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="mt-2 truncate text-base font-bold text-zinc-100 group-hover:text-teal-400 transition-colors">
                  {ticket.subject}
                </p>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-zinc-500">
                  <span className="font-medium text-zinc-400">by {ticket.creator.name}</span>
                  <span>•</span>
                  <span>{formatRelativeTime(ticket.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0">
                <div className="flex items-center gap-3">
                  {ticket.assignee ? (
                    <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-zinc-950/50 border border-zinc-800">
                      <Avatar
                        src={ticket.assignee.avatar}
                        name={ticket.assignee.name}
                        size="xs"
                      />
                    </div>
                  ) : (
                    <span className="h-6 px-2 flex items-center rounded-full border border-dashed border-zinc-700 text-[9px] font-bold text-zinc-600">
                      Unassigned
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 text-zinc-500 bg-zinc-950/30 px-2 py-1 rounded-md border border-zinc-800/50 group-hover:text-zinc-300 transition-colors">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span className="text-xs font-bold">{ticket._count?.comments || 0}</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
