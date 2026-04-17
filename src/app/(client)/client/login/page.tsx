"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/branding/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";
import { loginWithCredentials } from "@/lib/actions/auth";
import { motion } from "framer-motion";

export default function ClientLoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-950"><div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" /></div>}>
      <ClientLoginPageContent />
    </Suspense>
  );
}

function ClientLoginPageContent() {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [needs2FA, setNeeds2FA] = React.useState(false);

  React.useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError === "session_expired") {
      setError("Your session has expired. Please sign in again.");
    } else if (urlError) {
      setError("Sign in failed. Please check your credentials.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    try {
      const result = await loginWithCredentials(formData);
      if (result?.needs2FA) {
        setNeeds2FA(true);
        setIsLoading(false);
        return;
      }

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      }
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 items-center justify-center p-6 relative overflow-hidden selection:bg-teal-500/30 font-sans">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 [mask-image:radial-gradient(white,transparent_85%)]" />
      <div className="absolute top-[-10%] right-[-10%] w-[30%] h-[30%] bg-teal-500/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-zinc-800/20 blur-[100px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Link
          href="/"
          className="group mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to home
        </Link>

        <div className="bg-zinc-900/60 border border-white/5 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl p-10 md:p-12">
          <div className="flex flex-col items-center text-center mb-10">
            <Logo size="lg" />
            <h1 className="text-3xl font-bold text-white mt-8 tracking-tight">Client Portal</h1>
            <p className="text-zinc-400 mt-3 leading-relaxed">
              Sign in to manage your support tickets and access our knowledge base.
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-rose-400"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={needs2FA ? "hidden" : "block space-y-6"}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-300 ml-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  icon={<Mail className="h-4 w-4 text-zinc-500" />}
                  className="h-12 bg-zinc-950/50 border-zinc-800 focus:border-teal-500/50 rounded-2xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-semibold text-zinc-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    icon={<Lock className="h-4 w-4 text-zinc-500" />}
                    className="h-12 bg-zinc-950/50 border-zinc-800 focus:border-teal-500/50 rounded-2xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {needs2FA && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="rounded-2xl bg-teal-500/5 p-5 border border-teal-500/10 text-center">
                  <h3 className="text-teal-400 font-bold text-sm mb-1 uppercase tracking-widest">Verify Identity</h3>
                  <p className="text-zinc-500 text-xs">Enter code from your email.</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-300 ml-1">
                    Verification Code
                  </label>
                  <Input
                    type="text"
                    name="otp"
                    placeholder="000000"
                    className="h-14 text-center tracking-[0.5em] font-mono text-xl bg-zinc-950/50 border-zinc-800 rounded-2xl"
                    maxLength={6}
                    required={needs2FA}
                  />
                </div>
              </motion.div>
            )}

            <Button type="submit" className="w-full h-14 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-2xl shadow-xl shadow-teal-500/20 transition-all border-0 text-md" size="lg" isLoading={isLoading}>
              Enter Portal
            </Button>
          </form>

          <div className="mt-10 text-center flex flex-col gap-3">
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Quick Links</p>
              <div className="flex justify-center gap-6">
                <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors font-medium">
                  IT Support Sign In
                </Link>
                <div className="w-px h-4 bg-zinc-800" />
                <Link href="/support" className="text-sm text-zinc-400 hover:text-white transition-colors font-medium">
                  Help Center
                </Link>
              </div>
          </div>
        </div>
        
        <p className="mt-8 text-center text-xs text-zinc-600">
           Protected by enterprise-grade security. Built with ClearQ.
        </p>
      </motion.div>
    </div>
  );
}
