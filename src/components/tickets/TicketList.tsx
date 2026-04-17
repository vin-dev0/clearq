"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/dropdown";
import { cn, formatRelativeTime } from "@/lib/utils";
import { 
  bulkDeleteTickets, 
  bulkUpdateTicketStatus, 
  bulkAssignTicketsByEmail, 
  bulkAddTag 
} from "@/lib/actions/tickets";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  MoreHorizontal,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock,
  User,
  Tag as TagIcon,
} from "lucide-react";

const statusVariants = {
  OPEN: "success",
  PENDING: "warning",
  ON_HOLD: "default",
  SOLVED: "info",
  CLOSED: "secondary",
} as const;

const priorityVariants = {
  LOW: "default",
  MEDIUM: "secondary",
  HIGH: "warning",
  URGENT: "danger",
} as const;

interface TicketListProps {
  statusFilter?: string | null;
  tagFilter?: string | null;
  initialTickets: any[];
  ticketLinkPrefix?: string;
  clearFilterLink?: string;
}

export function TicketList({ 
  statusFilter: urlStatusFilter, 
  tagFilter, 
  initialTickets = [],
  ticketLinkPrefix = "/tickets",
  clearFilterLink = "/tickets"
}: TicketListProps) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const assigneeFilter = searchParams?.get("assignee");

  const [selectedTickets, setSelectedTickets] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [localStatusFilter, setLocalStatusFilter] = React.useState("all");
  const [isPending, startTransition] = React.useTransition();
  const [mounted, setMounted] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleBulkDelete = () => {
    if (!confirm(`Are you sure you want to delete ${selectedTickets.length} tickets?`)) return;
    startTransition(async () => {
      try {
        await bulkDeleteTickets(selectedTickets);
        setSelectedTickets([]);
        router.refresh();
      } catch (e) {
        console.error(e);
        alert("Failed to delete tickets");
      }
    });
  };

  const handleBulkStatusChange = (status: string) => {
    if (!status || status === "change_status") return;
    startTransition(async () => {
      try {
        await bulkUpdateTicketStatus(selectedTickets, status);
        setSelectedTickets([]);
        router.refresh();
      } catch (e) {
        console.error(e);
        alert("Failed to update status");
      }
    });
  };

  const handleBulkAssign = () => {
    const email = prompt("Enter the email of the agent to assign these tickets to:");
    if (email) {
      startTransition(async () => {
        try {
          await bulkAssignTicketsByEmail(selectedTickets, email);
          router.refresh();
        } catch (e: any) {
          alert("Failed to assign tickets: " + e.message);
        }
      });
    }
  };

  const handleBulkTags = () => {
    const tag = prompt("Enter a tag to add to these tickets (e.g. 'urgent', 'bug'):");
    if (tag) {
      startTransition(async () => {
        try {
          await bulkAddTag(selectedTickets, tag);
          router.refresh();
        } catch (e: any) {
          alert("Failed to add tags: " + e.message);
        }
      });
    }
  };

  const activeStatusFilter = urlStatusFilter || (localStatusFilter !== "all" ? localStatusFilter : null);

  const filteredTickets = React.useMemo(() => {
    return (initialTickets || []).filter((ticket) => {
      if (activeStatusFilter && ticket.status !== activeStatusFilter) return false;
      if (assigneeFilter === "me") {
        if (!session?.user?.id) return true;
        if (ticket.assigneeId !== session.user.id) return false;
      }
      if (tagFilter && !ticket.tags.some((t: string) => t.toLowerCase() === tagFilter.toLowerCase())) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          ticket.subject.toLowerCase().includes(query) ||
          ticket.description.toLowerCase().includes(query) ||
          ticket.creator.name.toLowerCase().includes(query) ||
          ticket.number.toString().includes(query)
        );
      }
      return true;
    });
  }, [activeStatusFilter, searchQuery, assigneeFilter, tagFilter, session?.user?.id, initialTickets]);

  const toggleTicketSelection = (id: string) => {
    setSelectedTickets((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const toggleAllTickets = () => {
    if (selectedTickets.length === filteredTickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(filteredTickets.map((t) => t.id));
    }
  };

  const userRole = (session?.user as any)?.role;
  const canDelete = userRole === "ADMIN" || userRole === "SUPERVISOR" || userRole === "OWNER";

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800/50 bg-zinc-900/20 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-teal-400" />
            <Input
              placeholder="Search tickets by subject, description, or id..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md pl-10 border-zinc-800 bg-zinc-950/50 focus:ring-teal-500/50 transition-all"
            />
          </div>
          {!urlStatusFilter && userRole !== "CLIENT" && (
            <Select
              value={localStatusFilter}
              onChange={setLocalStatusFilter}
              options={[
                { value: "all", label: "All Status" },
                { value: "OPEN", label: "Open" },
                { value: "PENDING", label: "Pending" },
                { value: "ON_HOLD", label: "On Hold" },
                { value: "SOLVED", label: "Solved" },
              ]}
              className="w-40 border-zinc-800 bg-zinc-950/50"
            />
          )}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900">
              <Filter className="h-4 w-4 mr-2" /> Filters
            </Button>
          </div>
        </div>
        
        <AnimatePresence>
          {selectedTickets.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-teal-500/20 bg-teal-500/5 p-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-teal-500 text-[10px] font-bold text-zinc-950">
                    {selectedTickets.length}
                  </div>
                  <span className="text-sm font-semibold text-teal-400">tickets selected</span>
                </div>
                <div className="flex items-center gap-2">
                  {userRole !== "CLIENT" && (
                    <>
                      <Button variant="ghost" size="sm" onClick={handleBulkAssign} disabled={isPending} className="hover:bg-teal-500/10 text-teal-400">Assign</Button>
                      <Button variant="ghost" size="sm" onClick={handleBulkTags} disabled={isPending} className="hover:bg-teal-500/10 text-teal-400">Add Tags</Button>
                      <Select
                        value="change_status"
                        onChange={(val) => val !== "change_status" && handleBulkStatusChange(val)}
                        options={[
                          { value: "change_status", label: "Change Status..." },
                          { value: "OPEN", label: "Open" },
                          { value: "PENDING", label: "Pending" },
                          { value: "ON_HOLD", label: "On Hold" },
                          { value: "SOLVED", label: "Solved" },
                          { value: "CLOSED", label: "Closed" },
                        ]}
                        className="w-40 h-9 text-xs bg-zinc-900 border-teal-500/20"
                      />
                    </>
                  )}
                  {canDelete && (
                    <>
                      <div className="w-[1px] h-4 bg-teal-500/20 mx-1" />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                        onClick={handleBulkDelete}
                        disabled={isPending}
                      >
                        {isPending ? "Processing..." : "Delete Tickets"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-2 px-6 py-2">
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500/80">
          {userRole !== "CLIENT" && (
            <div className="w-8 flex justify-center">
              <input
                type="checkbox"
                checked={filteredTickets.length > 0 && selectedTickets.length === filteredTickets.length}
                onChange={toggleAllTickets}
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-teal-500 focus:ring-teal-500 focus:ring-offset-zinc-950"
              />
            </div>
          )}
          <div className="flex-1 px-4">Ticket Details</div>
          <div className="w-[100px] text-center">Status</div>
          <div className="w-[100px] text-center">Priority</div>
          <div className="w-[140px] text-center">Assignee</div>
          <div className="w-[120px] text-right pr-12">Updated</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
        {filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="h-16 w-16 text-zinc-800" />
            <p className="mt-4 text-xl font-bold text-zinc-300">Queue is Clear</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTickets.map((ticket) => {
              const isSelected = selectedTickets.includes(ticket.id);
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={ticket.id}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-1 transition-all",
                    isSelected && "border-teal-500/30 bg-teal-500/5"
                  )}
                >
                  <div className="flex items-center gap-4 px-3 py-4">
                    {userRole !== "CLIENT" && (
                      <div className="w-8 flex justify-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleTicketSelection(ticket.id)}
                          className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-teal-500"
                        />
                      </div>
                    )}
                    <Link href={`${ticketLinkPrefix}/${ticket.id}`} className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="shrink-0 flex items-center h-5 px-1.5 rounded bg-zinc-950 border border-zinc-800 font-mono text-[10px] text-zinc-500">
                          #{ticket.number}
                        </span>
                        <h3 className="truncate text-base font-bold text-zinc-100 group-hover:text-teal-400">
                          {ticket.subject}
                        </h3>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-zinc-500">
                        <span className="flex items-center gap-1.5 font-medium text-zinc-400">
                          <User className="h-3 w-3" /> {ticket.creator.name}
                        </span>

                      </div>
                    </Link>
                    <div className="w-[100px] flex justify-center">
                      <Badge variant={statusVariants[ticket.status as keyof typeof statusVariants]} dot>
                        {ticket.status}
                      </Badge>
                    </div>
                    <div className="w-[100px] flex justify-center">
                      <Badge variant={priorityVariants[ticket.priority as keyof typeof priorityVariants]}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <div className="w-[140px] flex items-center justify-center">
                      {ticket.assignee ? (
                        <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-zinc-950/50 border border-zinc-800">
                          <Avatar name={ticket.assignee.name} size="xs" />
                          <span className="truncate text-xs text-zinc-400">{ticket.assignee.name.split(" ")[0]}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-zinc-600 uppercase">Unassigned</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-3">
        <p className="text-sm text-zinc-500">
          Showing <span className="font-medium text-zinc-300">{filteredTickets.length}</span> of{" "}
          <span className="font-medium text-zinc-300">{initialTickets.length}</span> tickets
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
