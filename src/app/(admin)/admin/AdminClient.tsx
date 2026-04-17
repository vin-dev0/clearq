"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Users,
  Ticket,
  TrendingUp,
  TrendingDown,
  Activity,
  Database,
  Server,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Settings,
  Shield,
  MessageSquare,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";



const quickActions = [
  { label: "Manage Users", href: "/admin/users", icon: Users, description: "View, edit, and manage user accounts" },
  { label: "View Activity", href: "/admin/activity", icon: Activity, description: "Monitor system and user activity" },
  { label: "Security Settings", href: "/admin/security", icon: Shield, description: "Configure security policies" },
];

const iconMap: Record<string, any> = {
  Users,
  Ticket,
  MessageSquare,
  Clock,
  Shield,
  Activity,
  Settings,
  Database,
};

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = React.useState<any[]>([]);
  const [recentActivity, setRecentActivity] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const userName = session?.user?.name || session?.user?.email || "Admin";

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data.stats || []);
      setRecentActivity(data.recentActivity || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <p className="text-rose-400 font-medium">{error}</p>
          <Button variant="outline" onClick={fetchStats} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 overflow-hidden">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-zinc-400 mt-1">
          Welcome back, {userName}. Here&apos;s an overview of your organization&apos;s activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = iconMap[stat.icon] || Shield;
          return (
            <div
              key={stat.label}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-400`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend === "up" ? "text-emerald-400" : 
                  stat.trend === "down" ? "text-rose-400" : "text-zinc-400"
                }`}>
                  {stat.trend === "up" && <TrendingUp className="h-4 w-4" />}
                  {stat.trend === "down" && <TrendingDown className="h-4 w-4" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-zinc-500 text-sm mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-3">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-lg bg-teal-500/10">
                    <action.icon className="h-6 w-6 text-teal-400" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-zinc-600 group-hover:text-teal-400 transition-colors" />
                </div>
                <h3 className="mt-4 font-semibold text-white group-hover:text-teal-400 transition-colors">
                  {action.label}
                </h3>
                <p className="text-zinc-500 text-sm mt-1">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>


      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
          <Link href="/admin/activity">
            <Button variant="ghost" size="sm">
              View All
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Action</th>
                <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">User</th>
                <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Time</th>
                <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Type</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-zinc-500">
                    No recent activity found
                  </td>
                </tr>
              ) : (
                recentActivity.map((item, i) => (
                  <tr key={i} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/20">
                    <td className="py-3 px-4 text-white">
                      {item.action}
                    </td>
                    <td className="py-3 px-4 text-zinc-400">{item.user}</td>
                    <td className="py-3 px-4 text-zinc-500 text-sm">
                      {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.type === "user" ? "bg-teal-500/10 text-teal-400" :
                        item.type === "ticket" ? "bg-cyan-500/10 text-cyan-400" :
                        item.type === "security" ? "bg-rose-500/10 text-rose-400" :
                        item.type === "settings" ? "bg-amber-500/10 text-amber-400" :
                        "bg-zinc-700 text-zinc-300"
                      }`}>
                        {item.type}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Info Banner */}
      <div className="mt-8 bg-gradient-to-r from-rose-500/10 to-violet-500/10 border border-rose-500/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-rose-500/20">
            <Shield className="h-6 w-6 text-rose-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Admin Access</h3>
            <p className="text-zinc-400 text-sm mt-1">
              You have full administrative access to ClearQ. This includes user management, 
              system configuration, and security settings. All actions are logged for compliance.
            </p>
            <div className="mt-4 flex gap-3">
              <Link href="/admin/security">
                <Button size="sm" variant="outline">
                  Security Settings
                </Button>
              </Link>
              <Link href="/admin/activity">
                <Button size="sm" variant="ghost">
                  View Audit Log
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

