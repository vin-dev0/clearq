"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useAppStore();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "flex items-center gap-2 rounded-lg p-2 transition-colors",
        isDark 
          ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white" 
          : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      {showLabel && (
        <span className="text-sm font-medium">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}

