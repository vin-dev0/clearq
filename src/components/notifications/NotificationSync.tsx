"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { getNotifications } from "@/lib/actions/notifications";
import { useAppStore } from "@/store";

export function NotificationSync() {
  const { data: session } = useSession();
  const setNotifications = useAppStore((state) => state.setNotifications);

  useEffect(() => {
    if (!session?.user) return;

    const fetchNotifications = async () => {
      try {
        const notifications = await getNotifications();
        // Since getNotifications returns Prisma model objects, 
        // we need to ensure they match our store's Notification type
        setNotifications(notifications as any);
      } catch (error) {
        console.error("Failed to sync notifications:", error);
      }
    };

    // Initial fetch
    fetchNotifications();

    // Poll every 20 seconds
    const interval = setInterval(fetchNotifications, 20000);

    return () => clearInterval(interval);
  }, [session, setNotifications]);

  return null; // This is a logic-only component
}
