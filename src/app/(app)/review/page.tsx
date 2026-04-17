import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import Link from "next/link";
import { 
  MessageSquare, 
  Ticket, 
  Users, 
  Clock, 
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  const orgId = (session?.user as any)?.organizationId;

  if (userRole !== "ADMIN" && userRole !== "SUPERVISOR") {
    notFound();
  }

  // Fetch some management stats
  const [
    activeTickets,
    internalComments,
    agentStats
  ] = await Promise.all([
    prisma.ticket.count({
      where: { organizationId: orgId, status: { in: ["OPEN", "PENDING"] } }
    }),
    prisma.comment.findMany({
      where: { 
        isInternal: true,
        ticket: { organizationId: orgId }
      },
      include: {
        author: { select: { name: true, email: true, avatar: true } },
        ticket: { select: { id: true, number: true, subject: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.user.findMany({
      where: { organizationId: orgId, role: "AGENT" },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        _count: {
          select: { assignedTickets: { where: { status: { in: ["OPEN", "PENDING"] } } } }
        }
      }
    })
  ]);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Staff Review</h1>
        <p className="text-zinc-400 mt-2">
          Management overview of team performance and internal discussions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardDescription>Management Scope</CardDescription>
            <CardTitle className="text-2xl font-bold text-teal-400">
              {activeTickets} Active Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-zinc-500">
            Tickets currently being handled by your staff agents.
          </CardContent>
        </Card>
        
        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardDescription>Team Capacity</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-400">
              {agentStats.length} Agents Online
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-zinc-500">
            Total active agents assigned to your organization.
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardDescription>Internal Chatter</CardDescription>
            <CardTitle className="text-2xl font-bold text-rose-400">
              {internalComments.length} Recent Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-zinc-500">
            Private management communications in the last 24h.
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Internal Notes */}
        <Card variant="default" className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-teal-400" />
              <CardTitle>Recent Internal Notes</CardTitle>
            </div>
            <CardDescription>Messages Agents cannot see</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {internalComments.length === 0 ? (
              <p className="text-center py-8 text-zinc-500 italic">No recent internal notes found.</p>
            ) : (
              internalComments.map((comment) => (
                <div key={comment.id} className="p-4 rounded-lg bg-zinc-950/50 border border-zinc-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar src={comment.author.avatar} name={comment.author.name || ""} size="xs" />
                      <span className="text-sm font-medium text-white">{comment.author.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-600 font-mono">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 line-clamp-2">"{comment.content}"</p>
                  <div className="pt-2 flex items-center justify-between border-t border-zinc-800/50">
                    <Link 
                      href={`/tickets/${comment.ticketId}`}
                      className="text-[10px] text-teal-500 hover:underline flex items-center gap-1"
                    >
                      View Ticket #{comment.ticket.number} <ArrowRight className="h-2 w-2" />
                    </Link>
                    <span className="text-[10px] text-zinc-500 truncate max-w-[150px]">
                      {comment.ticket.subject}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Agent Activity */}
        <Card variant="default" className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-400" />
              <CardTitle>Agent Performance</CardTitle>
            </div>
            <CardDescription>Workload overview for your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentStats.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar src={agent.avatar} name={agent.name || ""} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-white">{agent.name}</p>
                      <p className="text-xs text-zinc-500">{agent.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={agent._count.assignedTickets > 5 ? "warning" : "secondary"}>
                      {agent._count.assignedTickets} Active
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
