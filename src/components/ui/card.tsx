"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "gradient" | "bordered";
  hover?: boolean;
}

export function Card({
  className,
  variant = "default",
  hover = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-6",
        {
          default: "bg-zinc-900/80 border border-zinc-800",
          glass: "bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50",
          gradient:
            "bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-700/50",
          bordered: "bg-zinc-900/60 border-2 border-zinc-700",
        }[variant],
        hover && "transition-all duration-300 hover:border-zinc-600 hover:shadow-lg hover:shadow-black/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 pb-4", className)}
      {...props}
    />
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4";
}

export function CardTitle({ className, as: Tag = "h3", ...props }: CardTitleProps) {
  return (
    <Tag
      className={cn("text-lg font-semibold text-white tracking-tight", className)}
      {...props}
    />
  );
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-zinc-400", className)}
      {...props}
    />
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("", className)} {...props} />;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn("flex items-center pt-4 border-t border-zinc-800", className)}
      {...props}
    />
  );
}



