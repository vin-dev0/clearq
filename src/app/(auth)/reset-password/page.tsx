"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/branding/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = React.useState(searchParams.get("token") || "");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("A valid reset token is required to reset your password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "An error occurred");
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="flex min-h-screen">
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/login"
            className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>

          <div className="mb-8">
            <Logo size="lg" />
            <h1 className="mt-6 text-2xl font-bold text-white">Create new password</h1>
            <p className="mt-2 text-zinc-400">
              Your new password must be securely formed with at least 6 characters.
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-400">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success ? (
            <div className="space-y-4">
              <div className="mb-4 flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-400">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="text-sm font-medium">
                  Password reset successfully! Redirecting you to login...
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!searchParams.get("token") && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Reset Token
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter reset token from email"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                  />
                </div>
              )}

              <div>
                 <label className="mb-2 block text-sm font-medium text-zinc-300">
                   New Password
                 </label>
                 <div className="relative">
                   <Input
                     type={showPassword ? "text" : "password"}
                     placeholder="••••••••"
                     icon={<Lock className="h-4 w-4" />}
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
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
              </div>

              <div>
                 <label className="mb-2 block text-sm font-medium text-zinc-300">
                   Confirm Password
                 </label>
                 <div className="relative">
                   <Input
                     type={showPassword ? "text" : "password"}
                     placeholder="••••••••"
                     icon={<Lock className="h-4 w-4" />}
                     value={confirmPassword}
                     onChange={(e) => setConfirmPassword(e.target.value)}
                     required
                   />
                 </div>
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Reset Password
              </Button>
            </form>
          )}
        </div>
      </div>
      
      {/* Right Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:bg-gradient-to-br lg:from-teal-900/30 lg:via-zinc-900 lg:to-cyan-900/30 lg:p-12">
        <div className="max-w-lg text-center">
          <div className="mb-8 flex justify-center">
             <div className="inline-flex rounded-full bg-teal-500/20 p-6">
                <Lock className="h-16 w-16 text-teal-500" />
             </div>
          </div>
          <h2 className="text-3xl font-bold text-white">
            Secure Data Enforcement
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Please make sure never to share your passwords anywhere else. Use strong passwords mapped inside a password manager.
          </p>
        </div>
      </div>
    </div>
  );
}
