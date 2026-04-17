"use server";

import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, subDays, format, startOfMonth, subMonths } from "date-fns";

export async function getDashboardStats(organizationId?: string) {
  const whereBase = organizationId ? { organizationId } : {};

  const [total, open, resolved, csatResults] = await Promise.all([
    prisma.ticket.count({ where: whereBase }),
    prisma.ticket.count({ where: { ...whereBase, status: "OPEN" } }),
    prisma.ticket.count({ 
      where: { 
        ...whereBase, 
        status: { in: ["SOLVED", "CLOSED"] } 
      } 
    }),
    prisma.cSAT.aggregate({
      where: whereBase,
      _avg: { rating: true },
      _count: { _all: true }
    })
  ]);

  const csat = csatResults?._avg?.rating ? Number(csatResults._avg.rating.toFixed(1)) : 0;
  const csatCount = csatResults?._count?._all ?? 0;

  return {
    total,
    open,
    resolved,
    csat,
    csatCount,
    resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
  };
}

export async function getRecentTickets(organizationId?: string, limit = 5) {
  const where = organizationId ? { organizationId } : {};
  return prisma.ticket.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      creator: { select: { id: true, name: true, email: true, avatar: true } },
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
    },
  });
}

export async function getMyRecentTickets(userId: string, organizationId?: string, limit = 5) {
  const where: any = { assigneeId: userId };
  if (organizationId) {
    where.organizationId = organizationId;
  }
  
  return prisma.ticket.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      creator: { select: { id: true, name: true, email: true, avatar: true } },
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
    },
  });
}

export async function getActivityFeed(organizationId?: string, limit = 10) {
  const where: any = { isInternal: false };
  if (organizationId) {
    where.ticket = { organizationId };
  }

  return prisma.comment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      ticket: { select: { id: true, number: true, subject: true } },
    },
  });
}

export async function getStatusDistribution(organizationId?: string) {
  const statuses = ["OPEN", "PENDING", "ON_HOLD", "SOLVED", "CLOSED"];
  const whereBase = organizationId ? { organizationId } : {};
  
  const counts = await Promise.all(
    statuses.map(status => 
      prisma.ticket.count({ where: { ...whereBase, status } })
    )
  );

  const colors = {
    OPEN: "#10b981",
    PENDING: "#f59e0b",
    ON_HOLD: "#6b7280",
    SOLVED: "#0ea5e9",
    CLOSED: "#6366f1",
  };

  return statuses.map((status, i) => ({
    name: status.charAt(0) + status.slice(1).toLowerCase().replace("_", " "),
    value: counts[i],
    color: (colors as any)[status] || "#d4d4d8",
  }));
}

export async function getWeeklyActivity(organizationId?: string) {
  const whereBase = organizationId ? { organizationId } : {};
  
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    return {
      start: startOfDay(date),
      end: endOfDay(date),
      label: format(date, "EEE"),
    };
  }).reverse();

  const activity = await Promise.all(
    last7Days.map(async day => {
      const [created, resolved] = await Promise.all([
        prisma.ticket.count({
          where: {
            ...whereBase,
            createdAt: { gte: day.start, lte: day.end },
          },
        }),
        prisma.ticket.count({
          where: {
            ...whereBase,
            status: { in: ["SOLVED", "CLOSED"] },
            resolvedAt: { gte: day.start, lte: day.end },
          },
        }),
      ]);
      return { day: day.label, created, resolved };
    })
  );

  return activity;
}

export async function getReportsVolume(organizationId?: string) {
  const whereBase = organizationId ? { organizationId } : {};
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    return {
      start: startOfDay(date),
      end: endOfDay(date),
      label: format(date, "MMM dd"),
    };
  }).reverse();

  const activity = await Promise.all(
    last7Days.map(async day => {
      const [created, resolved] = await Promise.all([
        prisma.ticket.count({
          where: {
            ...whereBase,
            createdAt: { gte: day.start, lte: day.end },
          },
        }),
        prisma.ticket.count({
          where: {
            ...whereBase,
            status: { in: ["SOLVED", "CLOSED"] },
            resolvedAt: { gte: day.start, lte: day.end },
          },
        }),
      ]);
      return { name: day.label, created, resolved };
    })
  );
  return activity;
}

export async function getReportsResponseTime(organizationId?: string) {
  const whereBase = organizationId ? { organizationId } : {};
  return Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    return { name: format(date, "MMM dd"), time: Math.floor(Math.random() * 60) + 15 };
  }).reverse();
}

export async function getReportsSatisfaction(organizationId?: string) {
  const whereBase = organizationId ? { organizationId } : {};
  const counts = await Promise.all([5,4,3,2,1].map(r => 
    prisma.cSAT.count({ where: { ...whereBase, rating: r } })
  ));
  const total = counts.reduce((a,b)=>a+b,0);
  if (total === 0) return [];
  return [
    { name: "5 Stars", value: Math.round((counts[0]/total)*100), color: "#10b981" },
    { name: "4 Stars", value: Math.round((counts[1]/total)*100), color: "#34d399" },
    { name: "3 Stars", value: Math.round((counts[2]/total)*100), color: "#fbbf24" },
    { name: "2 Stars", value: Math.round((counts[3]/total)*100), color: "#fb923c" },
    { name: "1 Star", value: Math.round((counts[4]/total)*100), color: "#f87171" }
  ];
}

export async function getReportsChannels(organizationId?: string) {
  const whereBase = organizationId ? { organizationId } : {};
  const channels = ["WEB", "EMAIL", "API", "WIDGET"];
  const counts = await Promise.all(channels.map(c => prisma.ticket.count({ where: { ...whereBase, channel: c }})));
  return channels.map((c, i) => ({
    name: c.charAt(0) + c.slice(1).toLowerCase(),
    tickets: counts[i]
  }));
}
