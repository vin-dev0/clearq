"use client";

import * as React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CreditCard,
  Calendar,
  ArrowRight,
  Mail,
  Phone,
  LogOut,
  RefreshCw,
  CheckCircle2,
  Clock,
  Shield,
  QrCode,
  Banknote,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/branding/Logo";
import { requestManualVerification } from "@/lib/actions/subscription";

export default function SubscriptionExpiredClient() {
  const { data: session, update } = useSession();
  const [refreshing, setRefreshing] = React.useState(false);

  const user = session?.user as any;
  const subscriptionStatus = user?.subscriptionStatus;
  const gracePeriodEndsAt = user?.gracePeriodEndsAt
    ? new Date(user.gracePeriodEndsAt)
    : null;
  const trialEndsAt = user?.trialEndsAt ? new Date(user.trialEndsAt) : null;

  const isExpired = subscriptionStatus === "EXPIRED";
  const isPastDue = subscriptionStatus === "PAST_DUE";
  const isPendingApproval = subscriptionStatus === "PENDING_APPROVAL";

  // Days remaining in grace period
  const graceDaysRemaining = gracePeriodEndsAt
    ? Math.max(0, Math.ceil((gracePeriodEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Refresh session to check if subscription was updated
  const handleRefresh = async () => {
    setRefreshing(true);
    await update();
    // Check if subscription is now active
    setTimeout(() => {
      setRefreshing(false);
      window.location.reload();
    }, 1000);
  };

  const [confirming, setConfirming] = React.useState(false);

  const handleConfirmPayment = async () => {
    try {
      setConfirming(true);
      await requestManualVerification();
      alert("Payment verification requested! We'll notify you once approved.");
      await update();
    } catch (error) {
      alert("Failed to submit verification request");
      console.error(error);
    } finally {
      setConfirming(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Logo />
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full"
        >
          {/* Status Icon */}
          <div className="text-center mb-8">
            <div
              className={`inline-flex rounded-full p-4 ${
                isExpired
                  ? "bg-red-500/10"
                  : isPastDue
                  ? "bg-amber-500/10"
                  : "bg-amber-500/10"
              }`}
            >
              {isExpired ? (
                <AlertTriangle className="h-12 w-12 text-red-400" />
              ) : (
                <Clock className="h-12 w-12 text-amber-400" />
              )}
            </div>
          </div>

          {/* Message */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">
              {isPendingApproval
                ? "Payment Verification Pending"
                : isExpired
                ? "Your Subscription Has Expired"
                : isPastDue
                ? "Payment Past Due"
                : "Subscription Required"}
            </h1>
            <p className="mt-3 text-zinc-400">
              {isPendingApproval ? (
                <>
                  We&apos;ve received your request. Please wait while we verify 
                  your manual payment. This usually takes 1-12 hours.
                </>
              ) : isExpired ? (
                <>
                  Your access to ClearQ features has been suspended.
                  Please update your payment to restore access.
                </>
              ) : isPastDue ? (
                <>
                  We couldn&apos;t process your last payment. You have{" "}
                  <span className="font-semibold text-amber-400">
                    {graceDaysRemaining} days
                  </span>{" "}
                  remaining in your grace period before features are locked.
                </>
              ) : (
                <>
                  Please subscribe to a plan to unlock all ClearQ features 
                  for your organization.
                </>
              )}
            </p>
          </div>

          {/* Current Status Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-zinc-400">Account Status</span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                  isPendingApproval
                    ? "bg-blue-500/10 text-blue-400"
                    : isExpired
                    ? "bg-red-500/10 text-red-400"
                    : "bg-amber-500/10 text-amber-400"
                }`}
              >
                {isPendingApproval ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Pending Verification
                  </>
                ) : isExpired ? (
                  <>
                    <AlertTriangle className="h-3 w-3" />
                    Expired
                  </>
                ) : isPastDue ? (
                  <>
                    <Clock className="h-3 w-3" />
                    Past Due
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3" />
                    Unpaid
                  </>
                )}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">Email</span>
                <span className="text-white">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Plan</span>
                <span className="text-white">{user?.plan || "Starter"}</span>
              </div>
              {gracePeriodEndsAt && !isExpired && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Grace Period Ends</span>
                  <span className="text-amber-400">
                    {gracePeriodEndsAt.toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card Payment (NEW) */}
          {!isPendingApproval && (
            <div className="mb-6">
               <Link href="/checkout?plan=PRO">
                  <Button size="lg" className="w-full h-14 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-xl shadow-teal-500/20 text-lg font-bold">
                    <CreditCard className="mr-2 h-6 w-6" />
                    Unlock PRO Now
                  </Button>
               </Link>
                <p className="text-center text-[10px] text-zinc-500 mt-2">
                  Instant activation. PCI-DSS secure payment.
                </p>
              </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {!isPendingApproval && (
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="w-full">
                  View Other Plans
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              I&apos;ve Already Paid - Refresh Status
            </Button>
          </div>

          {/* Contact Support */}
          <div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-800/50 p-4 text-center">
            <p className="text-sm text-zinc-400 mb-3">
              Need help with your subscription?
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="mailto:billing@ClearQ.net"
                className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300"
              >
                <Mail className="h-4 w-4" />
                billing@ClearQ.net
              </a>
              <a
                href="tel:+12125550147"
                className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300"
              >
                <Phone className="h-4 w-4" />
                +1 (212) 555-0147
              </a>
            </div>
          </div>

          {/* What's Locked */}
          {isExpired && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-zinc-400 mb-3">
                Features Currently Locked:
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Ticket Management",
                  "Team Messaging",
                  "Analytics",
                  "Automations",
                  "Knowledge Base",
                  "API Access",
                ].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-sm text-zinc-500"
                  >
                    <Shield className="h-3 w-3" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Retention Warning */}
          <div className="mt-8 rounded-xl border border-red-900/50 bg-red-950/30 p-4">
            <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Important: Data Retention Policy
            </h3>
            <div className="space-y-2 text-sm text-zinc-300">
              <p className="flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">•</span>
                <span>
                  <strong className="text-amber-400">3-day grace period:</strong> You must renew your subscription within 3 days of expiration to avoid account lockout.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-red-400 font-bold shrink-0">•</span>
                <span>
                  <strong className="text-red-400">30-day data purge:</strong> All account data (tickets, assets, messages, files) will be permanently deleted 30 days after lockout.
                </span>
              </p>
              {user?.plan === "PRO" || user?.plan === "ENTERPRISE" ? (
                <p className="text-zinc-400 italic text-xs mt-3">
                  As a Pro user, you can still export your data. Contact support for assistance.
                </p>
              ) : (
                <p className="text-zinc-400 italic text-xs mt-3">
                  Pro users can export their data before deletion. Contact support if you need to recover important data.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

