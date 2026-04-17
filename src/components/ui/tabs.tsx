"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onChange, children, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabList({ children, className }: TabListProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 border-b border-zinc-800 pb-px",
        className
      )}
    >
      {children}
    </div>
  );
}

interface TabProps {
  value: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  count?: number;
}

export function Tab({ value, children, icon, count }: TabProps) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("Tab must be used within Tabs");

  const isActive = context.value === value;

  return (
    <button
      onClick={() => context.onChange(value)}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "text-teal-400"
          : "text-zinc-400 hover:text-zinc-200"
      )}
    >
      {icon}
      {children}
      {count !== undefined && (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs",
            isActive
              ? "bg-teal-500/20 text-teal-400"
              : "bg-zinc-800 text-zinc-400"
          )}
        >
          {count}
        </span>
      )}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500" />
      )}
    </button>
  );
}

interface TabPanelProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ value, children, className }: TabPanelProps) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabPanel must be used within Tabs");

  if (context.value !== value) return null;

  return <div className={cn("mt-4", className)}>{children}</div>;
}



