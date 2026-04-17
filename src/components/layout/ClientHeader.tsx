"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/store";
import { Avatar } from "@/components/ui/avatar";
import { Dropdown, DropdownItem, DropdownDivider } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth";
import { Logo } from "@/components/branding/Logo";
import { LogOut, Sun, Moon, User, ChevronDown } from "lucide-react";

export function ClientHeader() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const { theme, toggleTheme } = useAppStore();

  const currentUser = session?.user;

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between border-b px-6 backdrop-blur-xl transition-all duration-300",
        "border-zinc-800 bg-zinc-950/80 dark:border-zinc-800 dark:bg-zinc-950/80",
        theme === "light" && "border-slate-200 bg-white/90"
      )}
    >
      <div className="flex items-center gap-6">
        <Link href="/client" className="hover:opacity-80 transition-opacity">
          <Logo />
        </Link>
        <span className="text-zinc-600 font-bold mx-2">|</span>
        <span className="text-zinc-300 font-medium">Client Portal</span>
        <div className="flex items-center gap-4 ml-6 pl-6 border-l border-zinc-800">
          <Link 
            href="/client/kb" 
            className="text-sm font-medium text-zinc-400 hover:text-teal-400 transition-colors"
          >
            Knowledge Base
          </Link>
          <Link 
            href="/client" 
            className="text-sm font-medium text-zinc-400 hover:text-teal-400 transition-colors"
          >
            My Tickets
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className={cn(
            "rounded-lg p-2 transition-colors",
            theme === "dark" 
              ? "text-zinc-400 hover:bg-zinc-800 hover:text-white" 
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          )}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <Dropdown
          align="right"
          trigger={
            <button 
              disabled={isLoading}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-zinc-800 disabled:opacity-50"
            >
              <Avatar src={currentUser?.image} name={currentUser?.name || "User"} size="sm" status={isLoading ? undefined : "online"} />
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
          <DropdownItem icon={<User className="h-4 w-4" />}>My Profile</DropdownItem>
          <DropdownDivider />
          <button onClick={() => logout()} className="w-full">
            <DropdownItem icon={<LogOut className="h-4 w-4" />} destructive>Sign Out</DropdownItem>
          </button>
        </Dropdown>
      </div>
    </header>
  );
}
