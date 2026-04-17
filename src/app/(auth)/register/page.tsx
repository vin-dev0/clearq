"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/branding/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Users,
  Building2,
  Eye,
  EyeOff,
  CheckCircle2,
  Key,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";

// Loading fallback for Suspense
function RegisterLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
    </div>
  );
}

// Main register form component
function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteFromUrl = searchParams.get("invite") || searchParams.get("code") || "";
  const oauthError = searchParams.get("error");

  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(
    oauthError === "oauth_no_account" 
      ? "No account found for this Google login. You need an invite code to create a new account." 
      : ""
  );

  // Form state
  const [inviteCode, setInviteCode] = React.useState(inviteFromUrl);
  const [inviteValid, setInviteValid] = React.useState<boolean | null>(null);
  const [invitePlan, setInvitePlan] = React.useState<string | null>(null);
  const [targetRole, setTargetRole] = React.useState<string | null>(null);
  const [validatingInvite, setValidatingInvite] = React.useState(false);

  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    password: "",
  });

  // Auto-validate invite from URL on mount
  React.useEffect(() => {
    if (inviteFromUrl) {
      validateInviteCode(inviteFromUrl);
    }
  }, [inviteFromUrl]);

  const validateInviteCode = async (code: string) => {
    if (!code.trim()) {
      setInviteValid(null);
      setInvitePlan(null);
      return;
    }

    setValidatingInvite(true);
    setError("");

    try {
      const res = await fetch("/api/invite-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), email: formData.email }),
      });

      const data = await res.json();

      if (data.valid) {
        setInviteValid(true);
        setInvitePlan(data.plan);
        setTargetRole(data.targetRole);
      } else {
        setInviteValid(false);
        setError(data.error || "Invalid invite code");
      }
    } catch (err) {
      setInviteValid(false);
      setError("Failed to validate invite code");
    } finally {
      setValidatingInvite(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Must have valid invite
    if (!inviteValid) {
      setError("Please enter a valid invite code to register");
      return;
    }

    setIsLoading(true);

    try {
      // Create the user account
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: `${formData.firstName} ${formData.lastName}`,
          companyName: formData.company,
          inviteCode: inviteCode.trim(),
          plan: invitePlan,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // Mark invite as used
      await fetch("/api/invite-codes/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inviteCode.trim(), userId: data.userId }),
      });

      // Redirect to login
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="mb-8">
            <Logo size="lg" />
            <h1 className="mt-6 text-2xl font-bold text-white">
              Create your account
            </h1>
            <p className="mt-2 text-zinc-400">
              Enter your invite code to get started.
            </p>
          </div>

          {/* No invite code message */}
          {!inviteFromUrl && !inviteValid && (
            <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="flex items-start gap-3">
                <Key className="mt-0.5 h-5 w-5 text-amber-400" />
                <div>
                  <h3 className="font-semibold text-amber-200">Invite Code Required</h3>
                  <p className="mt-1 text-sm text-amber-200/70">
                    ClearQ is invite-only. You need a valid invite code to create an account.
                  </p>
                  <Link href="/pricing" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-300 hover:text-amber-200">
                    Get access <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Invite Code Field */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Invite Code *
              </label>
              <div className="relative">
                <Input
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value.toUpperCase());
                    setInviteValid(null);
                    setError("");
                  }}
                  onBlur={() => validateInviteCode(inviteCode)}
                  placeholder="ST-XXXXXXXX"
                  icon={<Key className="h-4 w-4" />}
                  className={`font-mono ${
                    inviteValid === true
                      ? "border-emerald-500 focus:border-emerald-500"
                      : inviteValid === false
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                  required
                />
                {validatingInvite && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
                  </div>
                )}
                {inviteValid === true && !validatingInvite && (
                  <CheckCircle2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-400" />
                )}
              </div>
              {inviteValid && (invitePlan || targetRole) && (
                <div className="mt-2 flex flex-col gap-1.5 rounded-lg border border-teal-500/20 bg-teal-500/5 p-3">
                  {invitePlan && (
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-teal-400" />
                      <span className="text-xs font-medium text-teal-400 uppercase tracking-wider">
                        {invitePlan} Plan
                      </span>
                    </div>
                  )}
                  {targetRole && (
                    <div className="flex items-center gap-2">
                      {targetRole === "AGENT" ? (
                        <Users className="h-4 w-4 text-teal-400" />
                      ) : (
                        <Building2 className="h-4 w-4 text-amber-400" />
                      )}
                      <span className="text-sm text-zinc-300">
                        Joining as <span className="font-bold text-white">{targetRole === "AGENT" ? "Team Member" : "Client / User"}</span>
                      </span>
                    </div>
                  )}
                  <p className="text-[10px] text-zinc-500 italic">
                    You will be routed to the {targetRole === "AGENT" ? "Staff Dashboard" : "Client Portal"} after login.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  First Name
                </label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                  icon={<User className="h-4 w-4" />}
                  required
                  disabled={!inviteValid}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Last Name
                </label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                  required
                  disabled={!inviteValid}
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Work Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@company.com"
                icon={<Mail className="h-4 w-4" />}
                required
                disabled={!inviteValid}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Company Name
              </label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Acme Inc"
                icon={<Building2 className="h-4 w-4" />}
                required
                disabled={!inviteValid}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a strong password"
                  icon={<Lock className="h-4 w-4" />}
                  required
                  disabled={!inviteValid}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="mt-2 space-y-1">
                {[
                  "At least 8 characters",
                  "One uppercase letter",
                  "One number or symbol",
                ].map((req, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-zinc-500">
                    <CheckCircle2 className="h-3 w-3" />
                    {req}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-teal-500"
                required
                disabled={!inviteValid}
              />
              <label htmlFor="terms" className="text-sm text-zinc-400">
                I agree to the{" "}
                <a href="/terms" className="text-teal-400 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-teal-400 hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              disabled={!inviteValid}
            >
              Create Account
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="text-teal-400 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:bg-gradient-to-br lg:from-teal-900/30 lg:via-zinc-900 lg:to-cyan-900/30 lg:p-12">
        <div className="max-w-lg">
          <h2 className="text-3xl font-bold text-white">
            Join companies delivering exceptional support
          </h2>
          <div className="mt-8 space-y-6">
            {[
              { title: "Unlimited tickets", desc: "Handle all your support requests in one place" },
              { title: "Team collaboration", desc: "Work together with internal notes and assignments" },
              { title: "Analytics & reports", desc: "Track performance and customer satisfaction" },
              { title: "Automation rules", desc: "Save time with smart ticket routing" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="rounded-lg bg-teal-500/10 p-2">
                  <CheckCircle2 className="h-5 w-5 text-teal-400" />
                </div>
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="text-sm text-zinc-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-xl border border-zinc-700 bg-zinc-800/50 p-6">
            <p className="text-sm text-zinc-400">
              Need an invite code?
            </p>
            <p className="mt-2 text-white">
              <Link href="/pricing" className="text-teal-400 hover:underline">
                View pricing plans
              </Link>{" "}
              or contact{" "}
              <a href="mailto:sales@ClearQ.net" className="text-teal-400 hover:underline">
                sales@ClearQ.net
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Default export with Suspense wrapper
export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterLoading />}>
      <RegisterForm />
    </Suspense>
  );
}
