"use client";

import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel = "vs last week",
  icon: Icon,
  iconColor = "text-teal-400",
  iconBg = "bg-teal-500/10",
}: StatsCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 transition-all duration-300 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20">
      {/* Background decoration */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-teal-500/5 to-cyan-500/5 transition-transform duration-500 group-hover:scale-150" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-400">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={cn(
                  "flex items-center gap-0.5 text-sm font-medium",
                  isPositive ? "text-emerald-400" : "text-rose-400"
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-zinc-500">{changeLabel}</span>
            </div>
          )}
        </div>
        <div className={cn("rounded-xl p-3", iconBg)}>
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
      </div>
    </div>
  );
}



