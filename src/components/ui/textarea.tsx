"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div>
        <textarea
          className={cn(
            "flex min-h-[120px] w-full rounded-lg border bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100",
            "placeholder:text-zinc-500 border-zinc-700 resize-none",
            "focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20",
            "transition-all duration-200 outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
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
Textarea.displayName = "Textarea";

export { Textarea };



