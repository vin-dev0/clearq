"use client";

import * as React from "react";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "away" | "busy";
}

const sizeClasses = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

const statusClasses = {
  online: "bg-emerald-500",
  offline: "bg-zinc-500",
  away: "bg-amber-500",
  busy: "bg-rose-500",
};

const statusSizes = {
  xs: "h-1.5 w-1.5 border",
  sm: "h-2 w-2 border",
  md: "h-2.5 w-2.5 border-2",
  lg: "h-3 w-3 border-2",
  xl: "h-4 w-4 border-2",
};

export function Avatar({
  src,
  name,
  size = "md",
  status,
  className,
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);

  const showFallback = !src || imgError;

  return (
    <div className={cn("relative inline-flex shrink-0", className)} {...props}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 font-semibold text-white ring-2 ring-zinc-800",
          sizeClasses[size]
        )}
      >
        {showFallback ? (
          <span>{getInitials(name || "")}</span>
        ) : (
          <img
            src={src}
            alt={name || "Avatar"}
            className="h-full w-full rounded-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-zinc-900",
            statusClasses[status],
            statusSizes[size]
          )}
        />
      )}
    </div>
  );
}

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  avatars: Array<{ src?: string | null; name?: string | null }>;
  max?: number;
  size?: "xs" | "sm" | "md" | "lg";
}

export function AvatarGroup({
  avatars,
  max = 4,
  size = "sm",
  className,
  ...props
}: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={cn("flex -space-x-2", className)} {...props}>
      {visibleAvatars.map((avatar, i) => (
        <Avatar
          key={i}
          src={avatar.src}
          name={avatar.name}
          size={size}
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            "relative flex items-center justify-center rounded-full bg-zinc-700 font-medium text-zinc-300 ring-2 ring-zinc-900",
            sizeClasses[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}



