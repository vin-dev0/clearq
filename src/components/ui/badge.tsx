"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-zinc-800 text-zinc-300 border border-zinc-700",
        primary: "bg-teal-500/20 text-teal-400 border border-teal-500/30",
        secondary: "bg-zinc-700 text-zinc-200",
        success: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
        warning: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
        danger: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
        info: "bg-sky-500/20 text-sky-400 border border-sky-500/30",
        purple: "bg-violet-500/20 text-violet-400 border border-violet-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  dotColor?: string;
}

function Badge({ className, variant, dot, dotColor, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", dotColor || "bg-current")}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };



