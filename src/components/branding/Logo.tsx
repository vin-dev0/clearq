"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  collapsed?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ collapsed = false, size = "md", className }: LogoProps) {
  const sizeClasses = {
    sm: { icon: "h-7 w-7", text: "text-lg" },
    md: { icon: "h-9 w-9", text: "text-xl" },
    lg: { icon: "h-12 w-12", text: "text-2xl" },
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Logo Icon - Reverted to Hexagonal Ticket Design */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl",
          "bg-gradient-to-br from-teal-400 via-cyan-500 to-teal-600",
          "shadow-lg shadow-teal-500/30",
          sizeClasses[size].icon
        )}
      >
        {/* Inner geometric pattern */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-[60%] w-[60%]"
        >
          {/* Hexagonal ticket shape */}
          <path
            d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
            fill="white"
            fillOpacity="0.9"
          />
          {/* Inner cutout creating ticket perforation effect */}
          <path
            d="M16 8L22 12V20L16 24L10 20V12L16 8Z"
            fill="url(#logoGradient)"
          />
          {/* Checkmark accent */}
          <path
            d="M12 15L15 18L20 13"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="logoGradient" x1="10" y1="8" x2="22" y2="24">
              <stop stopColor="#14B8A6" />
              <stop offset="1" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
        </svg>
        {/* Subtle shine effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
      </div>

      {/* Logo Text */}
      {!collapsed && (
        <div className="flex flex-col">
          <span
            className={cn(
              "font-bold tracking-tight text-white",
              sizeClasses[size].text
            )}
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Clear<span className="text-teal-400">Q</span>
          </span>
          {size === "lg" && (
            <span className="text-xs text-zinc-500 tracking-wide uppercase font-semibold">
              Intelligent Documentation & Support
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Alternative animated logo for loading states
export function LogoLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 animate-pulse rounded-xl bg-gradient-to-br from-teal-400 via-cyan-500 to-teal-600 opacity-50" />
        <div className="absolute inset-2 animate-spin rounded-lg border-2 border-transparent border-t-white" />
        <div
          className="absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 via-cyan-500 to-teal-600"
          style={{ animationDelay: "150ms" }}
        >
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 animate-pulse"
          >
            <path
              d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
              fill="white"
              fillOpacity="0.9"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
