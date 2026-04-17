"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, error, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg border bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500",
            "border-zinc-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20",
            "transition-all duration-200 outline-none",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-10",
            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-rose-400">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };



