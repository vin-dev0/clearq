"use client";

import { SessionProvider } from "next-auth/react";
import { SessionManager } from "./SessionManager";
import { NotificationProvider } from "./NotificationProvider";
import { ToastProvider } from "./ToastProvider";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      refetchOnWindowFocus={true} 
      refetchInterval={5 * 60} // Refetch every 5 minutes
    >
      <SessionManager>
        <NotificationProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </NotificationProvider>
      </SessionManager>
    </SessionProvider>
  );
}

