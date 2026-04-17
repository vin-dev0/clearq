"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { AlertTriangle, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function SubscriptionBanner() {
  const { data: session } = useSession();
  const user = session?.user as any;

  if (!user || user.role === "CLIENT") return null;

  const subscriptionEndsAt = user.subscriptionEndsAt ? new Date(user.subscriptionEndsAt) : null;
  if (!subscriptionEndsAt) return null;

  const now = new Date();
  const timeDiff = subscriptionEndsAt.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  // Only show if expiring in 7 days or less
  if (daysDiff > 7 || daysDiff < -1) return null;

  const isExpired = daysDiff <= 0;

  return (
    <div className={cn(
      "w-full px-4 py-2 flex items-center justify-between text-xs font-bold transition-all",
      isExpired ? "bg-red-500 text-white" : "bg-amber-500 text-black"
    )}>
      <div className="flex items-center gap-3">
        {isExpired ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
        <span>
          {isExpired 
            ? "Your subscription has expired. Access is restricted until payment is renewed." 
            : `Your subscription expires in ${daysDiff} ${daysDiff === 1 ? 'day' : 'days'}. Renew now to avoid lockout.`
          }
        </span>
      </div>
      <Link 
        href="/checkout" 
        className={cn(
          "flex items-center gap-1 px-3 py-1 rounded-full uppercase tracking-tighter hover:scale-105 transition-transform",
          isExpired ? "bg-white text-red-600" : "bg-black text-white"
        )}
      >
        Renew Plan
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
