"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/branding/Logo";
import { Tooltip } from "@/components/ui/tooltip";
import { useAppStore } from "@/store";
import {
  LayoutDashboard,
  Ticket,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Shield,
  HelpCircle,
  Book,
  Tag,
  Clock,
  Inbox,
  User,
  AlertCircle,
  CheckCircle2,
  PauseCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Building2,
  FileText,
  Globe,
  Package,
  CreditCard,
  Smartphone,
  Sparkles,
  Barcode,
  Download,
  CheckSquare,
  Calendar as CalendarIcon,
  GitBranch,
  Blocks,
  Terminal,
  Lock as LockIcon,
  KeyRound,
  Activity,
  Timer,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { getTicketCounts } from "@/lib/actions/tickets";

const defaultMainNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Tickets",
    href: "/tickets",
    icon: Ticket,
  },
  {
    title: "Knowledge Base",
    href: "/kb",
    icon: Book,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    title: "Team Chat",
    href: "/messaging",
    icon: MessageSquare,
  },
];

const defaultTicketViews = [
  { title: "All Tickets", href: "/tickets", icon: Inbox },
  { title: "Assigned to Me", href: "/tickets?assignee=me", icon: User, color: "text-purple-400" },
  { title: "Open", href: "/tickets?status=OPEN", icon: AlertCircle, color: "text-emerald-400" },
  { title: "Pending", href: "/tickets?status=PENDING", icon: Clock, color: "text-amber-400" },
  { title: "On Hold", href: "/tickets?status=ON_HOLD", icon: PauseCircle, color: "text-zinc-400" },
  { title: "Solved", href: "/tickets?status=SOLVED", icon: CheckCircle2, color: "text-sky-400" },
];

const secondaryNavItems = [
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Calendar", href: "/calendar", icon: CalendarIcon },
  { title: "Reports", href: "/reports", icon: BarChart3 },
  { title: "Teams", href: "/teams", icon: Building2 },
  { title: "Tags", href: "/tags", icon: Tag },
  { title: "Remote", href: "/remote", icon: Terminal },
  { title: "Scripts", href: "/scripts", icon: FileText },
  { title: "Staff Review", href: "/review", icon: Activity, managementOnly: true },
  { title: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard, adminOnly: true },
  { title: "Admin Portal", href: "/admin", icon: Shield },
];

const proNavItems = [
  { title: "Source Control", href: "/git", icon: GitBranch },
  { title: "Templates", href: "/templates", icon: FileText },
  { title: "Inventory", href: "/assets", icon: Barcode },
  { title: "Assets", href: "/inventory", icon: Package },
  { title: "Payments", href: "/payments", icon: CreditCard },
  { title: "Mobile App", href: "/mobile", icon: Smartphone },
  { title: "Data Export", href: "/export", icon: Download },
  { title: "App Store", href: "/apps", icon: Blocks },
];

const bottomNavItems = [
  { title: "Settings", href: "/settings", icon: Settings },
  { title: "Help & Support", href: "/help", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { sidebarCollapsed, collapseSidebar, theme } = useAppStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Use false for SSR, actual value on client
  const isCollapsed = mounted ? sidebarCollapsed : false;
  const isLight = theme === "light";
  const userPlan = (session?.user as any)?.plan || "STARTER";
  const userRole = (session?.user as any)?.role || "CLIENT";
  const isAdmin = userRole === "ADMIN";
  const isSupervisor = userRole === "SUPERVISOR";
  const isStaff = ["ADMIN", "SUPERVISOR", "AGENT"].includes(userRole);
  const canManage = isAdmin || isSupervisor;
  
  // Admins always have Pro access, plus Pro/Enterprise subscribers
  const isManagement = isAdmin || isSupervisor;
  const isAgent = userRole === "AGENT";
  // Only Pro/Enterprise subscribers have Pro access
  const hasProAccess = userPlan === "PRO" || userPlan === "ENTERPRISE";

  const [counts, setCounts] = React.useState<{
    total: number;
    open: number;
    pending: number;
    onHold: number;
    solved: number;
    assignedToMe: number;
  } | null>(null);

  React.useEffect(() => {
    if (!session?.user) return;
    const fetchCounts = () => {
      getTicketCounts().then(setCounts).catch(console.error);
    };
    fetchCounts();
    const timer = setInterval(fetchCounts, 5000);
    return () => clearInterval(timer);
  }, [session]);

  const mainNavItems = React.useMemo(() => {
    return defaultMainNavItems.map(item => {
      if (item.title === "Tickets" && counts) {
        return { ...item, badge: counts.total.toString() };
      }
      return item;
    });
  }, [counts]);

  const ticketViews = React.useMemo(() => {
    if (!counts) return defaultTicketViews;
    return [
      { ...defaultTicketViews[0], count: counts.total },
      { ...defaultTicketViews[1], count: counts.assignedToMe },
      { ...defaultTicketViews[2], count: counts.open },
      { ...defaultTicketViews[3], count: counts.pending },
      { ...defaultTicketViews[4], count: counts.onHold },
      { ...defaultTicketViews[5], count: counts.solved },
    ];
  }, [counts]);

  const NavItem = ({
    href,
    icon: Icon,
    title,
    badge,
    count,
    color,
  }: {
    href: string;
    icon: React.ElementType;
    title: string;
    badge?: string;
    count?: number;
    color?: string;
  }) => {
    // Parse the href to check for query strings
    const hasQueryString = href.includes("?");
    const basePath = href.split("?")[0];
    const hrefParams = hasQueryString ? new URLSearchParams(href.split("?")[1]) : null;

    let isActive = false;
    if (hasQueryString) {
      // For items with query strings, match both path AND query params
      const currentStatus = searchParams.get("status");
      const currentAssignee = searchParams.get("assignee");

      const hrefStatus = hrefParams?.get("status");
      const hrefAssignee = hrefParams?.get("assignee");

      const statusMatches = hrefStatus ? currentStatus === hrefStatus : true;
      const assigneeMatches = hrefAssignee ? currentAssignee === hrefAssignee : true;

      isActive = pathname === basePath && statusMatches && assigneeMatches && (hrefStatus || hrefAssignee) !== null;
    } else if (href === "/dashboard") {
      // Dashboard is only active on exact match
      isActive = pathname === href;
    } else if (href === "/tickets") {
      // Base tickets page is active only when no status filter
      isActive = pathname === href && !searchParams.get("status");
    } else {
      // Other items use prefix matching but not for child routes of other sections
      isActive = pathname === href || (pathname.startsWith(basePath) && !pathname.includes("/", basePath.length + 1));
    }

    const content = (
      <Link
        href={href}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-teal-500/10 text-teal-600"
            : isLight
              ? "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5 shrink-0 transition-colors",
            color,
            isActive && "text-teal-400"
          )}
        />
        {!isCollapsed && (
          <>
            <span className="flex-1 truncate">{title}</span>
            {badge && (
              <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-xs font-semibold text-teal-400">
                {badge}
              </span>
            )}
            {count !== undefined && (
              <span className={cn("text-xs", isLight ? "text-slate-400" : "text-zinc-500")}>{count}</span>
            )}
          </>
        )}
      </Link>
    );

    return isCollapsed ? (
      <Tooltip content={title} position="right">
        {content}
      </Tooltip>
    ) : (
      content
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r transition-all duration-300",
        isLight
          ? "border-slate-200 bg-white"
          : "border-zinc-800 bg-zinc-950",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center justify-between border-b px-4",
        isLight ? "border-slate-200" : "border-zinc-800"
      )}>
        <Logo collapsed={isCollapsed} />
        <button
          onClick={() => collapseSidebar(!sidebarCollapsed)}
          className={cn(
            "rounded-lg p-1.5 transition-colors",
            isLight
              ? "text-slate-400 hover:bg-slate-100 hover:text-slate-900"
              : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
            isCollapsed && (isLight
              ? "absolute -right-3 top-6 rounded-full border border-slate-300 bg-white"
              : "absolute -right-3 top-6 rounded-full border border-zinc-700 bg-zinc-900")
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* New Ticket Button */}
      {!isCollapsed && (
        <div className="p-4">
          <Link
            href="/tickets/new"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-teal-500/40"
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </Link>
        </div>
      )}
      {isCollapsed && (
        <div className="flex justify-center p-3">
          <Tooltip content="New Ticket" position="right">
            <Link
              href="/tickets/new"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25"
            >
              <Plus className="h-5 w-5" />
            </Link>
          </Tooltip>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {/* Main Navigation */}
        <div className="space-y-1">
          {mainNavItems
            .filter(item => userRole !== "CLIENT" || ["Dashboard", "Tickets"].includes(item.title))
            .map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
        </div>

        {/* Ticket Views */}
        <div className="py-2">
          {!isCollapsed && (
            <h3 className={cn("mb-2 px-3 text-xs font-semibold uppercase tracking-wider", isLight ? "text-slate-400" : "text-zinc-500")}>
              Views
            </h3>
          )}
          <div className="space-y-0.5">
            {ticketViews.map((item) => (
              <NavItem key={item.href + item.title} {...item} />
            ))}
          </div>
        </div>

        {/* Staff Only Sections */}
        {userRole !== "CLIENT" && (
          <>
            {/* Secondary Navigation */}
            {userRole !== "CLIENT" && (
              <div className="py-2">
                {!isCollapsed && (
                  <h3 className={cn("mb-2 px-3 text-xs font-semibold uppercase tracking-wider", isLight ? "text-slate-400" : "text-zinc-500")}>
                    Manage
                  </h3>
                )}
                <div className="space-y-0.5">
                  {secondaryNavItems
                    .filter(item => {
                      if (item.title === "Admin Portal") return isAdmin;
                      if ((item as any).adminOnly) return isAdmin;
                      if ((item as any).managementOnly) return isAdmin || isSupervisor;
                      return true;
                    })
                    .map((item) => (
                      <NavItem key={item.href} {...item} />
                    ))}
                </div>
              </div>
            )}

            {/* Pro Features */}
            <div className="py-2">
              {!isCollapsed && (
                <h3 className={cn("mb-2 flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wider", isLight ? "text-slate-400" : "text-zinc-500")}>
                  Pro Features
                  {hasProAccess ? (
                    <span className="rounded bg-teal-500/20 px-1.5 py-0.5 text-[10px] font-bold text-teal-400">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-bold text-zinc-500">
                      <LockIcon className="h-2 w-2" />
                      LOCKED
                    </span>
                  )}
                </h3>
              )}
              <div className="space-y-0.5">
                {proNavItems.map((item) => (
                  <NavItem
                    key={item.href}
                    {...item}
                    color={!hasProAccess ? "text-zinc-600" : undefined}
                    href={hasProAccess ? item.href : "#upgrade"}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Bottom Navigation */}
      <div className={cn("border-t px-3 py-3", isLight ? "border-slate-200" : "border-zinc-800")}>
        {bottomNavItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </div>
    </aside>
  );
}



