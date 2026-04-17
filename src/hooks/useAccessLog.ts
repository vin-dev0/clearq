"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export function useAccessLog() {
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    // Don't log API routes or static assets
    if (pathname.startsWith("/api") || pathname.includes(".")) return;

    // Don't log the access log page itself to avoid infinite loops
    if (pathname.includes("/admin/access-logs")) return;

    // Log the page view
    const logAccess = async () => {
      try {
        await fetch("/api/access-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: pathname,
            method: "GET",
            action: "PAGE_VIEW",
            email: session?.user?.email,
          }),
        });
      } catch (error) {
        // Silently fail - don't disrupt user experience
        console.debug("Failed to log access:", error);
      }
    };

    logAccess();
  }, [pathname, session?.user?.email]);
}

// Log specific actions
export async function logAction(action: string, metadata?: Record<string, any>) {
  try {
    await fetch("/api/access-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: window.location.pathname,
        method: "POST",
        action,
        metadata,
      }),
    });
  } catch (error) {
    console.debug("Failed to log action:", error);
  }
}

