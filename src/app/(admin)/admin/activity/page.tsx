"use client";

import * as React from "react";
import {
  Activity,
  Search,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  User,
  Eye,
  LogIn,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AccessLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  ipAddress: string;
  country: string | null;
  city: string | null;
  region: string | null;
  userAgent: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  path: string;
  method: string;
  statusCode: number | null;
  action: string;
  metadata: string;
  createdAt: string;
}

const actionIcons: Record<string, React.ReactNode> = {
  LOGIN: <LogIn className="h-4 w-4" />,
  LOGIN_FAILED: <Shield className="h-4 w-4" />,
  LOGOUT: <LogOut className="h-4 w-4" />,
  PAGE_VIEW: <Eye className="h-4 w-4" />,
  API_CALL: <Activity className="h-4 w-4" />,
};

const actionColors: Record<string, string> = {
  LOGIN: "bg-emerald-500/10 text-emerald-400",
  LOGIN_FAILED: "bg-rose-500/10 text-rose-400",
  LOGOUT: "bg-amber-500/10 text-amber-400",
  PAGE_VIEW: "bg-blue-500/10 text-blue-400",
  API_CALL: "bg-purple-500/10 text-purple-400",
};

const deviceIcons: Record<string, React.ReactNode> = {
  Desktop: <Monitor className="h-4 w-4" />,
  Mobile: <Smartphone className="h-4 w-4" />,
  Tablet: <Tablet className="h-4 w-4" />,
};

export default function ActivityPage() {
  const [logs, setLogs] = React.useState<AccessLog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [actions, setActions] = React.useState<string[]>([]);
  const [stats, setStats] = React.useState<{ action: string; _count: { action: number } }[]>([]);

  const fetchLogs = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
      });
      if (search) params.set("search", search);
      if (actionFilter) params.set("action", actionFilter);

      const res = await fetch(`/api/admin/access-logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
        setActions(data.actions || []);
        setStats(data.stats || []);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, actionFilter]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const exportLogs = () => {
    const csv = [
      ["Time", "User", "IP", "Location", "Device", "Browser", "OS", "Action", "Path"].join(","),
      ...logs.map((log) =>
        [
          new Date(log.createdAt).toISOString(),
          log.userEmail || "Anonymous",
          log.ipAddress,
          [log.city, log.region, log.country].filter(Boolean).join(" ") || "Unknown",
          log.device || "Unknown",
          log.browser || "Unknown",
          log.os || "Unknown",
          log.action,
          log.path,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Activity Logs</h1>
          <p className="text-zinc-400 mt-1">
            Monitor user access, IPs, locations, and devices in real-time.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportLogs}
            className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={() => fetchLogs()}
            className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm text-white hover:bg-teal-500"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Eye className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{total.toLocaleString()}</p>
              <p className="text-sm text-zinc-400">Total Events</p>
            </div>
          </div>
        </div>
        {stats.slice(0, 3).map((stat) => (
          <div key={stat.action} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="flex items-center gap-3">
              <div className={cn("rounded-lg p-2", actionColors[stat.action] || "bg-zinc-800")}>
                {actionIcons[stat.action] || <Activity className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat._count.action.toLocaleString()}</p>
                <p className="text-sm text-zinc-400">{stat.action.replace("_", " ")}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email, IP, path, or location..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:border-teal-500 focus:outline-none"
            />
          </div>
        </form>
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-zinc-300 focus:border-teal-500 focus:outline-none"
        >
          <option value="">All Actions</option>
          {actions.map((action) => (
            <option key={action} value={action}>
              {action.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Activity Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Time</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">User</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">IP / Location</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Device</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Action</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Path</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                  <RefreshCw className="mx-auto h-6 w-6 animate-spin" />
                  <p className="mt-2">Loading activity logs...</p>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                  <Activity className="mx-auto h-8 w-8" />
                  <p className="mt-2">No activity logs found</p>
                  <p className="text-sm">Activity will appear here as users browse the site</p>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-zinc-500" />
                      <div>
                        <p className="text-white">{new Date(log.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-zinc-500">{new Date(log.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700">
                        <User className="h-4 w-4 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white">{log.userEmail || "Anonymous"}</p>
                        {log.userId && <p className="text-xs text-zinc-500">{log.userId.slice(0, 8)}...</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-zinc-500" />
                      <div>
                        <p className="text-sm font-mono text-white">{log.ipAddress}</p>
                        {(log.city || log.country) && (
                          <p className="flex items-center gap-1 text-xs text-zinc-500">
                            <MapPin className="h-3 w-3" />
                            {[log.city, log.region, log.country].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {deviceIcons[log.device || "Desktop"] || <Monitor className="h-4 w-4 text-zinc-500" />}
                      <div>
                        <p className="text-sm text-white">{log.browser || "Unknown"}</p>
                        <p className="text-xs text-zinc-500">{log.os || "Unknown"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn("text-xs px-2 py-1 rounded-full", actionColors[log.action] || "bg-zinc-800 text-zinc-400")}>
                      {log.action.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="max-w-[150px] truncate text-sm font-mono text-zinc-400">{log.path}</p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-3">
            <p className="text-sm text-zinc-400">
              Showing {((page - 1) * 50) + 1} to {Math.min(page * 50, total)} of {total} logs
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-zinc-700 p-2 text-zinc-400 hover:bg-zinc-800 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-white">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-zinc-700 p-2 text-zinc-400 hover:bg-zinc-800 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-teal-500/10">
            <Activity className="h-6 w-6 text-teal-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Activity Log Retention</h3>
            <p className="text-zinc-400 text-sm mt-1">
              Activity logs track user logins, page views, and system events with IP addresses and device information.
              Logs are retained for 90 days. Security-related events are flagged and retained for 1 year.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
