"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

// Pages that don't require active subscription
const ALLOWED_PATHS = [
  "/subscription-expired",
  "/settings", // Allow settings for account management
  "/help",
  "/checkout", // MUST allow checkout for renewal
];

// Roles that bypass subscription check
const BYPASS_ROLES = ["ADMIN"];

export function useSubscriptionCheck() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't check while loading or if not authenticated
    if (status === "loading" || status === "unauthenticated") return;

    // Don't check if on an allowed path
    if (ALLOWED_PATHS.some((path) => pathname.startsWith(path))) return;

    const user = session?.user as any;
    if (!user) return;

    // Debug logging
    console.log("[SubscriptionCheck] User:", user.email, "Role:", user.role, "Status:", user.subscriptionStatus);

    const subscriptionStatus = user.subscriptionStatus;

    // Redirect if status is not ACTIVE
    if (["EXPIRED", "PENDING_APPROVAL", "PAST_DUE", "UNPAID"].includes(subscriptionStatus)) {
      console.log(`[SubscriptionCheck] ${subscriptionStatus} - Redirecting to /subscription-expired`);
      router.push("/subscription-expired");
      return;
    }

    // No redirect needed
    if (!subscriptionStatus) {
      console.log("[SubscriptionCheck] WARNING: No subscriptionStatus in session!");
    }
  }, [session, status, pathname, router]);

  // Return subscription status info for UI purposes
  const user = session?.user as any;
  return {
    isLoading: status === "loading",
    isPendingApproval: user?.subscriptionStatus === "PENDING_APPROVAL",
    isExpired: user?.subscriptionStatus === "EXPIRED",
    isPastDue: user?.subscriptionStatus === "PAST_DUE",
    isActive: user?.subscriptionStatus === "ACTIVE",
    subscriptionStatus: user?.subscriptionStatus,
  };
}

