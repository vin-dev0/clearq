"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SubscriptionBanner } from "./SubscriptionBanner";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function MainLayout({ children, title, subtitle, actions }: MainLayoutProps) {
  const { sidebarCollapsed } = useAppStore();

  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar />
      <div
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "pl-16" : "pl-64"
        )}
      >
        <SubscriptionBanner />
        <Header title={title} subtitle={subtitle} actions={actions} />
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
