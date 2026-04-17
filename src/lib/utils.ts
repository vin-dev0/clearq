import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(d);
}

export function generateTicketNumber(): string {
  return `TKT-${Date.now().toString(36).toUpperCase()}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export const priorityColors = {
  LOW: { bg: "bg-slate-500/20", text: "text-slate-400", dot: "bg-slate-400" },
  MEDIUM: { bg: "bg-amber-500/20", text: "text-amber-400", dot: "bg-amber-400" },
  HIGH: { bg: "bg-orange-500/20", text: "text-orange-400", dot: "bg-orange-400" },
  URGENT: { bg: "bg-rose-500/20", text: "text-rose-400", dot: "bg-rose-400" },
};

export const statusColors = {
  OPEN: { bg: "bg-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-400" },
  PENDING: { bg: "bg-amber-500/20", text: "text-amber-400", dot: "bg-amber-400" },
  ON_HOLD: { bg: "bg-slate-500/20", text: "text-slate-400", dot: "bg-slate-400" },
  SOLVED: { bg: "bg-sky-500/20", text: "text-sky-400", dot: "bg-sky-400" },
  CLOSED: { bg: "bg-zinc-500/20", text: "text-zinc-400", dot: "bg-zinc-400" },
};

export const typeIcons = {
  QUESTION: "HelpCircle",
  INCIDENT: "AlertTriangle",
  PROBLEM: "XCircle",
  TASK: "CheckSquare",
  FEATURE_REQUEST: "Lightbulb",
};



