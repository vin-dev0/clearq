"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/store";
import { getNotifications } from "@/lib/actions/notifications";
const POLLING_INTERVAL = 10000; // 10 seconds
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const fetchNotifications = React.useCallback(async () => {
    if (!userId) return;
    try {
      const data = await getNotifications();
      if (!data) return; // Ignore null errors

      // We need to convert the Date objects from server actions if they are strings
      const formattedData = data.map(n => ({
        ...n,
        createdAt: new Date(n.createdAt)
      }));

      // Access current state directly to avoid dependency loop
      const state = useAppStore.getState();
      const currentNotifications = state.notifications;

      // Check for new notifications to show toasts
      if (currentNotifications.length > 0) {
        const newItems = formattedData.filter(
          newItem => !currentNotifications.some(oldItem => oldItem.id === newItem.id)
        );

        newItems.forEach(item => {
          state.addToast({
            type: item.type === "CHAT_MESSAGE" ? "info" : "success",
            title: item.title,
            message: item.message,
          });
        });
      }

      state.setNotifications(formattedData as any);
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
    }
  }, [userId]);

  React.useEffect(() => {
    if (!userId) return;

    // Initial fetch
    fetchNotifications();

    // Set up polling
    const interval = setInterval(fetchNotifications, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [userId, fetchNotifications]);

  return <>{children}</>;
}
