"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef } from "react";

function parseTimeoutToMs(timeoutString: string | undefined): number {
  if (!timeoutString) return 30 * 60 * 1000; // 30 mins default
  
  const value = parseInt(timeoutString.substring(0, timeoutString.length - 1));
  const unit = timeoutString.slice(-1).toLowerCase();
  
  switch (unit) {
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    default:
      return 30 * 60 * 1000;
  }
}

export function SessionManager({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const timeoutMs = parseTimeoutToMs((session?.user as any)?.sessionTimeout);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only track if user is logged in
    if (!session?.user) return;

    // Reset the inactivity timer
    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        // Log out when the timer triggers
        signOut({ callbackUrl: "/login?error=session_expired" });
      }, timeoutMs);
    };

    // Listen for activity events
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    const handleActivity = () => {
      // Throttle DOM event to avoid too many re-renders/timers resetting
      // Here just resetting timer directly since it is cheap enough
      resetTimer();
    };

    events.forEach(eventName => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });

    // Start timer initially
    resetTimer();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(eventName => {
        window.removeEventListener(eventName, handleActivity);
      });
    };
  }, [session?.user, timeoutMs]);

  return <>{children}</>;
}
