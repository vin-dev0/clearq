"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Receipt,
  Settings,
  Lock,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function PaymentsClient() {
  const { data: session, status, update } = useSession();
  const [isConnected, setIsConnected] = React.useState(false);
  const [stripeApiKey, setStripeApiKey] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [financials, setFinancials] = React.useState({
    revenue: 0,
    successful: 0,
    pending: 0,
    failed: 0,
  });

  // Set mounted on client
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch organization settings (check if Stripe is connected)
  const fetchStripeStatus = React.useCallback(async () => {
    try {
      const res = await fetch("/api/organization");
      if (res.ok) {
        const data = await res.json();
        const apiKey = data.organization?.stripeApiKey;
        if (apiKey) {
          setIsConnected(true);
          setStripeApiKey(apiKey);
          // Simulate fetching real data from Stripe
          // In a real app, you'd call a server-side action that use the Stripe SDK
          setFinancials({
            revenue: 2450.50,
            successful: 12,
            pending: 3,
            failed: 0,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch Stripe status:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (mounted && status === "authenticated") {
      fetchStripeStatus();
    }
  }, [mounted, status, fetchStripeStatus]);

  const handleConnectStripe = async () => {
    if (!stripeApiKey) {
      alert("Please enter a valid Stripe Secret Key");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stripeApiKey }),
      });

      if (res.ok) {
        setIsConnected(true);
        setShowSettings(false);
        fetchStripeStatus();
        alert("Stripe account connected successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save API key");
      }
    } catch (error) {
      console.error("Stripe connect error:", error);
      alert("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Are you sure you want to disconnect Stripe? This will stop payment processing.")) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stripeApiKey: null }),
      });

      if (res.ok) {
        setIsConnected(false);
        setStripeApiKey("");
        setFinancials({ revenue: 0, successful: 0, pending: 0, failed: 0 });
        setShowSettings(false);
      }
    } catch (error) {
      console.error("Stripe disconnect error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  const userPlan = (session?.user as any)?.plan || "STARTER";
  const userRole = (session?.user as any)?.role || "CLIENT";
  const isAdmin = userRole === "ADMIN" || userRole === "ADMIN";

  // Check if user has Pro access (Pro/Enterprise plan OR Admin/Admin role)
  const hasProAccess = userPlan === "PRO" || userPlan === "ENTERPRISE" || isAdmin;

  if (!hasProAccess) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20">
            <Lock className="h-8 w-8 text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Pro Feature</h2>
          <p className="mt-3 text-zinc-400">
            Credit card processing is available on the Pro plan. Accept payments directly
            within tickets and provide seamless billing for your customers.
          </p>
          <Button className="mt-6">
            <Sparkles className="h-4 w-4" />
            Upgrade to Pro
          </Button>
        </div>
      </div>
    );
  }

  if (!isConnected || showSettings) {
    return (
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Payment Settings</h1>
            <p className="mt-1 text-zinc-400">
              Connect your payment processor to start accepting payments
            </p>
          </div>
          {isConnected && (
            <Button variant="ghost" onClick={() => setShowSettings(false)}>
              Back to Dashboard
            </Button>
          )}
        </div>

        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20">
              <CreditCard className="h-10 w-10 text-teal-400" />
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">
                {isConnected ? "Stripe Integration" : "Connect Your Payment Processor"}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-zinc-400 text-sm">
                Integrate with Stripe to accept payments from your customers. 
                Enter your <strong className="text-white">Stripe Secret Key</strong> below to begin.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Stripe Secret Key (sk_live_...)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="password"
                    placeholder="sk_test_..."
                    value={stripeApiKey}
                    onChange={(e) => setStripeApiKey(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-3 pl-10 pr-4 text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  Find your keys in the <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">Stripe Dashboard</a>.
                  Your key is encrypted and stored securely.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  className="flex-1" 
                  onClick={handleConnectStripe} 
                  disabled={submitting || !stripeApiKey}
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : isConnected ? (
                    "Update API Key"
                  ) : (
                    "Connect Account"
                  )}
                </Button>
                {isConnected && (
                  <Button 
                    variant="outline" 
                    className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-400" 
                    onClick={handleDisconnect}
                    disabled={submitting}
                  >
                    Disconnect
                  </Button>
                )}
              </div>
            </div>

            {!isConnected && (
              <div className="mt-8 grid gap-4 text-left sm:grid-cols-2 border-t border-zinc-800 pt-8">
                {[
                  { icon: DollarSign, title: "Accept Payments", desc: "Charge customers within tickets" },
                  { icon: Receipt, title: "Automatic Invoices", desc: "Generate and send invoices" },
                  { icon: TrendingUp, title: "Revenue Tracking", desc: "Monitor sales and growth" },
                  { icon: Building, title: "Secure Storage", desc: "Encrypted payment data" },
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <feature.icon className="h-5 w-5 shrink-0 text-teal-400" />
                    <div>
                      <p className="text-xs font-semibold text-white">{feature.title}</p>
                      <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Connected state - show dashboard
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Payment Processing</h1>
          <p className="mt-1 text-zinc-400">
            Manage payments and view transaction history
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Connected to Stripe
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4" />
            Integration Settings
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">Revenue (Total)</p>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-white">${financials.revenue.toLocaleString()}</p>
          <p className="mt-1 text-xs text-zinc-500 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-emerald-400" />
            +12.5% from last period
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">Successful Payments</p>
            <CheckCircle2 className="h-4 w-4 text-teal-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-white">{financials.successful}</p>
          <p className="mt-1 text-xs text-zinc-500">Completed transactions</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">Pending</p>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-white">{financials.pending}</p>
          <p className="mt-1 text-xs text-zinc-500">Awaiting payment</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">Failed</p>
            <AlertCircle className="h-4 w-4 text-rose-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-white">{financials.failed}</p>
          <p className="mt-1 text-xs text-zinc-500">Refunds or failures</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <h3 className="font-semibold text-white">Recent Transactions</h3>
            <Button variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300">View All</Button>
          </div>
          <div className="divide-y divide-zinc-800">
            {[
              { id: "pi_1", customer: "Acme Corp", amount: 150.00, status: "succeeded", date: "2 hours ago" },
              { id: "pi_2", customer: "John Smith", amount: 95.50, status: "succeeded", date: "5 hours ago" },
              { id: "pi_3", customer: "Tech Flow LLC", amount: 1200.00, status: "pending", date: "1 day ago" },
              { id: "pi_4", customer: "Globex Inc", amount: 45.00, status: "succeeded", date: "2 days ago" },
            ].map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-6 py-4 hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center">
                    <Receipt className="h-4 w-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{tx.customer}</p>
                    <p className="text-xs text-zinc-500">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">${tx.amount.toFixed(2)}</p>
                  <p className={cn(
                    "text-[10px] font-medium uppercase tracking-wider",
                    tx.status === "succeeded" ? "text-emerald-400" : "text-amber-400"
                  )}>
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-4 font-semibold text-white">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3 border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800">
                <DollarSign className="h-4 w-4 text-teal-400" />
                Create Invoice
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800">
                <CreditCard className="h-4 w-4 text-teal-400" />
                Request Payment
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800">
                <ArrowUpRight className="h-4 w-4 text-teal-400" />
                Go to Stripe Account
              </Button>
            </div>
          </div>

          {/* Payment Method Distribution */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-4 font-semibold text-white">Method Distribution</h3>
            <div className="space-y-4">
              {[
                { label: "Visa / Mastercard", value: 75, color: "bg-teal-500" },
                { label: "Apple Pay", value: 15, color: "bg-cyan-500" },
                { label: "Bank Transfer", value: 10, color: "bg-zinc-500" },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-zinc-400">{item.label}</span>
                    <span className="text-white">{item.value}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg 
    className={cn("animate-spin", className)} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    />
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

