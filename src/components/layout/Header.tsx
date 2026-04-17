"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/store";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Dropdown, DropdownItem, DropdownDivider, DropdownLabel } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth";
import {
  Search,
  Bell,
  Command,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  HelpCircle,
  ChevronDown,
  Ticket,
  MessageSquare,
  AlertTriangle,
  AlertCircle,
  FileText,
  Info,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from "@/lib/actions/notifications";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const { 
    sidebarCollapsed, 
    notifications, 
    unreadCount, 
    theme, 
    toggleTheme, 
    setCommandPaletteOpen, 
    markAsRead, 
    markAllAsRead 
  } = useAppStore();
  const [searchFocused, setSearchFocused] = React.useState(false);

  // Use session user or fallback
  const currentUser = session?.user;

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between border-b px-6 backdrop-blur-xl transition-all duration-300",
        "border-zinc-800 bg-zinc-950/80 dark:border-zinc-800 dark:bg-zinc-950/80",
        theme === "light" && "border-slate-200 bg-white/90",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}
    >
      {/* Left Section - Title or Search */}
      <div className="flex items-center gap-6">
        {title ? (
          <div>
            <h1 className="text-xl font-semibold text-white">{title}</h1>
            {subtitle && <p className="text-sm text-zinc-400">{subtitle}</p>}
          </div>
        ) : (
          <div className="relative">
            <Input
              placeholder="Search tickets, customers..."
              icon={<Search className="h-4 w-4" />}
              className={cn(
                "w-80 transition-all duration-200",
                searchFocused && "w-96 ring-2 ring-teal-500/20"
              )}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
              <Command className="inline h-3 w-3" />K
            </kbd>
          </div>
        )}
      </div>

      {/* Right Section - Actions & User */}
      <div className="flex items-center gap-3">
        {actions}

        {/* Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white lg:flex lg:items-center lg:gap-2"
        >
          <Command className="h-3 w-3" />
          Quick actions
          <kbd className="rounded bg-zinc-700 px-1 text-[10px]">⌘K</kbd>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            "rounded-lg p-2 transition-colors",
            theme === "dark" 
              ? "text-zinc-400 hover:bg-zinc-800 hover:text-white" 
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          )}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        {/* Notifications */}
        <Dropdown
          align="right"
          trigger={
            <button className="relative rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          }
          className="w-80"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unreadCount > 0 && (
              <button 
                onClick={async () => {
                  try {
                    await markAllNotificationsAsRead();
                    markAllAsRead();
                  } catch (e) {}
                }}
                className="text-xs text-teal-400 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  id={notification.id}
                  icon={getNotificationIcon(notification.type)}
                  title={notification.title}
                  message={notification.message}
                  time={formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  unread={!notification.isRead}
                  link={notification.link}
                  onMarkRead={async () => {
                    if (!notification.isRead) {
                      markAsRead(notification.id);
                      await markNotificationAsRead(notification.id);
                    }
                  }}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500">
                <Bell className="h-8 w-8 text-zinc-800 mb-2" />
                <p className="text-sm">No notifications</p>
              </div>
            )}
          </div>
          <DropdownDivider />
          <Link href="/notifications" className="block w-full">
            <DropdownItem className="justify-center text-teal-400">
              View all notifications
            </DropdownItem>
          </Link>
        </Dropdown>

        {/* User Menu */}
        <Dropdown
          align="right"
          trigger={
            <button 
              disabled={isLoading}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-zinc-800 disabled:opacity-50"
            >
              <Avatar
                src={currentUser?.image}
                name={currentUser?.name || "User"}
                size="sm"
                status={isLoading ? undefined : "online"}
              />
              <div className="hidden text-left lg:block">
                {isLoading ? (
                  <div className="space-y-1">
                    <div className="h-4 w-24 animate-pulse rounded bg-zinc-800" />
                    <div className="h-3 w-32 animate-pulse rounded bg-zinc-800/50" />
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-white">{currentUser?.name || currentUser?.email?.split('@')[0] || "User"}</p>
                    <p className="text-xs text-zinc-400">{currentUser?.email || "guest@example.com"}</p>
                  </>
                )}
              </div>
              <ChevronDown className="hidden h-4 w-4 text-zinc-400 lg:block" />
            </button>
          }
        >
          <div className="px-3 py-2">
            <p className="font-medium text-white">{currentUser?.name || currentUser?.email?.split('@')[0] || "User"}</p>
            <p className="text-sm text-zinc-400">{currentUser?.email || "guest@example.com"}</p>
          </div>
          <DropdownDivider />
          <Link href="/profile">
            <DropdownItem icon={<User className="h-4 w-4" />}>
              My Profile
            </DropdownItem>
          </Link>
          <Link href="/settings">
            <DropdownItem icon={<Settings className="h-4 w-4" />}>
              Settings
            </DropdownItem>
          </Link>
          <Link href="/help">
            <DropdownItem icon={<HelpCircle className="h-4 w-4" />}>
              Help & Support
            </DropdownItem>
          </Link>
          <DropdownDivider />
          <button onClick={handleSignOut} className="w-full">
            <DropdownItem icon={<LogOut className="h-4 w-4" />} destructive>
              Sign Out
            </DropdownItem>
          </button>
        </Dropdown>
      </div>
    </header>
  );
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "TICKET_CREATED":
      return <Ticket className="h-4 w-4 text-teal-400" />;
    case "TICKET_ASSIGNED":
      return <FileText className="h-4 w-4 text-violet-400" />;
    case "CHAT_MESSAGE":
      return <MessageSquare className="h-4 w-4 text-cyan-400" />;
    case "SYSTEM":
      return <Info className="h-4 w-4 text-blue-400" />;
    default:
      return <AlertCircle className="h-4 w-4 text-zinc-400" />;
  }
}

function NotificationItem({
  id,
  icon,
  title,
  message,
  time,
  unread,
  link,
  onMarkRead,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  message: string;
  time: string;
  unread?: boolean;
  link?: string | null;
  onMarkRead: () => void;
}) {
  const content = (
    <div
      onClick={onMarkRead}
      className={cn(
        "flex cursor-pointer gap-3 px-4 py-3 transition-colors hover:bg-zinc-800/50",
        unread && "bg-teal-500/5"
      )}
    >
      <div className="mt-0.5 rounded-lg bg-zinc-800 p-2 text-zinc-400">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn("text-xs font-medium truncate", unread ? "text-white" : "text-zinc-400")}>{title}</p>
          {unread && <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />}
        </div>
        <p className={cn("text-xs leading-relaxed", unread ? "text-zinc-300" : "text-zinc-500")}>{message}</p>
        <p className="mt-1 text-[10px] text-zinc-600">{time}</p>
      </div>
    </div>
  );

  if (link) {
    return <Link href={link}>{content}</Link>;
  }

  return content;
}
