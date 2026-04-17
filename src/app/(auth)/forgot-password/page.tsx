"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Mail, AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { Logo } from "@/components/branding/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [devLink, setDevLink] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "An error occurred");
      setSuccess(true);
      if (data.devLink) setDevLink(data.devLink);
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
            <h1 className="mt-6 text-2xl font-bold text-white">Reset your password</h1>
            <p className="mt-2 text-zinc-400">
              Enter your email and we&apos;ll send you a link to reset your password.
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
                <div className="text-sm">
                  We&apos;ve sent a password reset link to your email. Please check your inbox and spam folder.
                </div>
              </div>
              {devLink && (
                <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4 mt-8">
                  <p className="text-xs text-amber-500 mb-2 font-bold">[Dev Mode Only] Direct Reset Link:</p>
                  <a href={devLink} className="text-sm text-teal-400 break-all hover:underline">
                    {devLink}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Email address
                </label>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  icon={<Mail className="h-4 w-4" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Send Reset Link
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
            Secure Password Recovery
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Regain access to your ClearQ dashboard securely and efficiently.
          </p>
        </div>
      </div>
    </div>
  );
}
