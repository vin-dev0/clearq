"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  Smartphone,
  Bell,
  MessageSquare,
  Ticket,
  Camera,
  Lock,
  Sparkles,
  CheckCircle2,
  Apple,
  QrCode,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function MobilePageContent() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  const userPlan = (session?.user as any)?.plan || "STARTER";
  const userRole = (session?.user as any)?.role || "CLIENT";

  // Check if user has Pro access (Pro/Enterprise plan OR Admin/Admin role)
  const hasProAccess = userPlan === "PRO" || userPlan === "ENTERPRISE" || userRole === "ADMIN" || userRole === "ADMIN";

  if (!hasProAccess) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20">
            <Lock className="h-8 w-8 text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Pro Feature</h2>
          <p className="mt-3 text-zinc-400">
            Mobile app access is available on the Pro plan. Manage tickets, respond to customers,
            and stay connected on the go.
          </p>
          <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
            <p className="text-sm text-zinc-300">
              <strong>Starter plan users:</strong> The mobile app add-on will be available for just{" "}
              <span className="font-semibold text-teal-400">$9.99/month</span> when it launches.
            </p>
          </div>
          <div className="mt-6 flex flex-col items-center gap-3">
            <Button>
              <Sparkles className="h-4 w-4" />
              Upgrade to Pro
            </Button>
            <Button variant="outline" disabled>
              <Smartphone className="h-4 w-4" />
              Get Mobile App (Coming Soon)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">Mobile App</h1>
            <Badge variant="warning">Coming Soon</Badge>
          </div>
          <p className="mt-1 text-zinc-400">
            Access ClearQ on your mobile device (Currently in Development)
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Download Section */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500">
              <Smartphone className="h-10 w-10 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-white">ClearQ Mobile</h2>
            <p className="mx-auto mt-2 max-w-sm text-zinc-400">
              Your help desk in your pocket. Available for iOS and Android.
            </p>

            <div className="mt-6 flex justify-center gap-4">
              <button disabled className="flex cursor-not-allowed items-center gap-2 rounded-xl bg-black px-6 py-3 opacity-50 transition-colors">
                <Apple className="h-6 w-6 text-white" />
                <div className="text-left">
                  <p className="text-[10px] text-zinc-400">Coming soon to</p>
                  <p className="text-sm font-semibold text-white">App Store</p>
                </div>
              </button>
              <button disabled className="flex cursor-not-allowed items-center gap-2 rounded-xl bg-black px-6 py-3 opacity-50 transition-colors">
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="text-left">
                  <p className="text-[10px] text-zinc-400">Coming soon to</p>
                  <p className="text-sm font-semibold text-white">Google Play</p>
                </div>
              </button>
            </div>

            <div className="mt-8">
              <p className="mb-2 text-sm text-zinc-500">Or scan to download</p>
              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-xl bg-white">
                <QrCode className="h-24 w-24 text-zinc-900" />
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Mobile Features</h3>
          
          {[
            {
              icon: Ticket,
              title: "Manage Tickets",
              desc: "View, respond to, and resolve tickets from anywhere",
              color: "text-blue-400 bg-blue-500/10",
            },
            {
              icon: MessageSquare,
              title: "Real-time Chat",
              desc: "Chat with customers and team members instantly",
              color: "text-teal-400 bg-teal-500/10",
            },
            {
              icon: Bell,
              title: "Push Notifications",
              desc: "Get instant alerts for new tickets and mentions",
              color: "text-amber-400 bg-amber-500/10",
            },
            {
              icon: Camera,
              title: "Capture & Attach",
              desc: "Take photos and attach them directly to tickets",
              color: "text-purple-400 bg-purple-500/10",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
            >
              <div className={cn("rounded-lg p-2", feature.color)}>
                <feature.icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-white">{feature.title}</h4>
                <p className="mt-0.5 text-sm text-zinc-500">{feature.desc}</p>
              </div>
            </div>
          ))}

          <div className="mt-6 rounded-xl border border-teal-500/30 bg-teal-500/5 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-teal-400" />
              <p className="font-medium text-white">Included with Pro Plan</p>
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              Your Pro subscription includes unlimited mobile app access for all team members.
            </p>
          </div>
        </div>
      </div>

      {/* Device Status */}
      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="mb-4 font-semibold text-white">Connected Devices</h3>
        <div className="text-center py-8">
          <Smartphone className="mx-auto h-12 w-12 text-zinc-700" />
          <p className="mt-4 text-zinc-400">No devices connected yet</p>
          <p className="mt-1 text-sm text-zinc-600">
            Download the app and sign in to see your connected devices
          </p>
        </div>
      </div>
    </div>
  );
}

