"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Logo } from "@/components/branding/Logo";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  Activity,
  ChevronLeft,
  LogOut,
  Loader2,
  AlertTriangle,
  Key,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useAccessLog } from "@/hooks/useAccessLog";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/invites", label: "Invite Codes", icon: Key },
  { href: "/admin/activity", label: "Activity Logs", icon: Activity },
  { href: "/admin/security", label: "Security", icon: Shield },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const userRole = (session?.user as any)?.role;
  
  // Log admin page views
  useAccessLog();

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500 mx-auto" />
          <p className="mt-4 text-zinc-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto" />
          <h1 className="mt-6 text-2xl font-bold text-white">Access Denied</h1>
          <p className="mt-2 text-zinc-400">You must be logged in to access this area.</p>
          <Link href="/login">
            <Button className="mt-6">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Not an admin - show fake 404 to hide admin area existence
  if (userRole !== "ADMIN") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <p className="text-8xl font-bold text-zinc-800">404</p>
          <h1 className="mt-4 text-2xl font-bold text-white">Page not found</h1>
          <p className="mt-2 text-zinc-400">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
          <div className="mt-6 flex gap-4 justify-center">
            <Link href="/">
              <Button variant="outline">
                <ChevronLeft className="h-4 w-4" />
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <Link href="/admin" className="flex items-center gap-2">
            <Logo />
            <span className="ml-2 text-xs font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
              ADMIN
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-teal-500/10 text-teal-400"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

