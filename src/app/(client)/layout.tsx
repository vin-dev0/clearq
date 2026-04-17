"use client";

import { AIChatWidget } from "@/components/chat/AIChatWidget";
import { useAccessLog } from "@/hooks/useAccessLog";
import { useSubscriptionCheck } from "@/hooks/useSubscriptionCheck";
import { ClientHeader } from "@/components/layout/ClientHeader";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAccessLog();
  useSubscriptionCheck();

  return (
    <div className="min-h-screen bg-zinc-950">
      <ClientHeader />
      <main className="min-h-[calc(100vh-4rem)] p-6">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
      <AIChatWidget />
    </div>
  );
}
