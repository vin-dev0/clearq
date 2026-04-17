"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AIChatWidget } from "@/components/chat/AIChatWidget";
import { useAccessLog } from "@/hooks/useAccessLog";
import { useSubscriptionCheck } from "@/hooks/useSubscriptionCheck";
import { useAppStore } from "@/store";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Log user page views
  useAccessLog();
  
  // Check subscription status and redirect if expired
  const { isExpired } = useSubscriptionCheck();

  const { data: session, update } = useSession();
  const { setUser } = useAppStore();

  // Sync session user with app store
  React.useEffect(() => {
    if (session?.user) {
      setUser(session.user as any);
    } else {
      setUser(null);
    }
  }, [session, setUser]);

  // Force session sync if plan is STARTER but should be PRO
  // This helps when a user is upgraded behind the scenes (e.g. via seed or admin)
  React.useEffect(() => {
    if (session?.user && (session.user as any).plan === "STARTER") {
      // Small delay to avoid infinite loops if it doesn't update
      const timer = setTimeout(() => {
        update();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [session, update]);

  const userPlan = (session?.user as any)?.plan;
  const userRole = (session?.user as any)?.role;
  const isStaff = ["ADMIN", "SUPERVISOR", "AGENT"].includes(userRole);
  const hasProAccess = userPlan === "PRO" || userPlan === "ENTERPRISE";

  return (
    <MainLayout>
      {children}
      {hasProAccess && <AIChatWidget />}
    </MainLayout>
  );
}



