"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/branding/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { loginWithCredentials } from "@/lib/actions/auth";
import { logAction } from "@/hooks/useAccessLog";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-950"><div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" /></div>}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [needs2FA, setNeeds2FA] = React.useState(false);
  
  React.useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError === "oauth_no_account") {
      setError("No account found with this email. Please register first.");
    } else if (urlError === "session_expired") {
      setError("Your session has expired. Please sign in again.");
    } else if (urlError) {
      setError("Sign in failed. Please try again.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    
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
        logAction("LOGIN_FAILED", { email, reason: result.error });
      } else {
        logAction("LOGIN", { email, method: "credentials" });
      }
    } catch (err: any) {
      if (err?.digest?.includes("NEXT_REDIRECT")) {
        window.location.href = "/dashboard";
      } else {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 font-sans selection:bg-teal-500/30">
      {/* Left Side - Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-[45%] lg:px-12 xl:px-20 relative z-10 bg-zinc-950">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="group mb-12 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to home
          </Link>

          <div className="mb-10 text-center lg:text-left">
            <Logo size="lg" />
            <h1 className="mt-8 text-3xl font-bold tracking-tight text-white">Staff Login</h1>
            <p className="mt-3 text-zinc-400 leading-relaxed">
              Access the ClearQ agent command center.
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-rose-400"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className={needs2FA ? "hidden" : "block space-y-5"}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-300 ml-1">
                  Agent Email
                </label>
                <Input
                  type="email"
                  name="email"
                  placeholder="name@devcomplete.net"
                  icon={<Mail className="h-4 w-4 text-zinc-500" />}
                  className="h-12 bg-zinc-900/50 border-zinc-800 focus:border-teal-500/50 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-semibold text-zinc-300">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-teal-500 hover:text-teal-400"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    icon={<Lock className="h-4 w-4 text-zinc-500" />}
                    className="h-12 bg-zinc-900/50 border-zinc-800 focus:border-teal-500/50 rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-teal-500 focus:ring-teal-500/20 cursor-pointer"
                />
                <label htmlFor="remember" className="text-sm text-zinc-500 select-none cursor-pointer">
                  Keep me signed in
                </label>
              </div>
            </div>

            {needs2FA && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-5"
              >
                <div className="rounded-xl bg-teal-500/5 p-4 border border-teal-500/10">
                  <h3 className="text-teal-400 font-bold text-sm mb-1 uppercase tracking-wider">2FA Verification</h3>
                  <p className="text-zinc-500 text-xs">Enter the 6-digit code sent to your agent email.</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-300 ml-1">
                    Verification Code
                  </label>
                  <Input
                    type="text"
                    name="otp"
                    placeholder="000000"
                    className="h-14 text-center tracking-[0.5em] font-mono text-xl bg-zinc-900/50 border-zinc-800 rounded-xl"
                    maxLength={6}
                    required={needs2FA}
                  />
                </div>
              </motion.div>
            )}

            <Button type="submit" className="w-full h-12 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 transition-all border-0" size="lg" isLoading={isLoading}>
              Sign In to Dashboard
            </Button>
          </form>

          <div className="mt-10 pt-10 border-t border-zinc-900 text-center">
             <p className="text-sm text-zinc-500">
               Need an agent account?{" "}
               <Link href="/register" className="font-bold text-white hover:text-teal-400 transition-colors">
                 Join the team
               </Link>
             </p>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-zinc-950 to-emerald-500/20 z-0" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 [mask-image:radial-gradient(white,transparent_85%)]" />
        
        {/* Floating Abstract UI Fragment */}
        <div className="relative z-10 w-full flex items-center justify-center p-20">
           <motion.div 
             initial={{ opacity: 0, y: 20, rotate: -2 }}
             animate={{ opacity: 1, y: 0, rotate: 0 }}
             transition={{ duration: 1 }}
             className="w-full max-w-[500px] aspect-square rounded-[2rem] border border-white/10 bg-zinc-950/40 backdrop-blur-3xl shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] p-8 flex flex-col"
           >
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/40" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/40" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/40" />
                </div>
                <Sparkles className="h-5 w-5 text-teal-500/50" />
              </div>
              
              <div className="flex-1 space-y-6">
                <div className="space-y-3">
                  <div className="h-4 w-1/2 bg-zinc-800/50 rounded-full" />
                  <div className="h-3 w-3/4 bg-zinc-800/30 rounded-full" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-teal-500/5 rounded-2xl border border-teal-500/10 flex flex-col items-center justify-center gap-2">
                    <span className="text-xs text-teal-500/50 font-bold uppercase tracking-widest">Active Tickets</span>
                    <span className="text-3xl font-black text-teal-400">12</span>
                  </div>
                  <div className="h-24 bg-cyan-500/5 rounded-2xl border border-cyan-500/10 flex flex-col items-center justify-center gap-2">
                    <span className="text-xs text-cyan-500/50 font-bold uppercase tracking-widest">SLA Status</span>
                    <CheckCircle2 className="h-8 w-8 text-emerald-500/50" />
                  </div>
                </div>
                
                <div className="h-32 bg-zinc-900/50 rounded-2xl border border-white/5 p-4 flex items-end gap-2">
                   {[40, 70, 45, 90, 60, 85, 55].map((h, i) => (
                     <motion.div 
                       key={i} 
                       initial={{ height: 0 }}
                       animate={{ height: `${h}%` }}
                       transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
                       className="flex-1 bg-gradient-to-t from-teal-500/20 to-teal-400/50 rounded-t-sm" 
                     />
                   ))}
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                 <p className="text-zinc-500 text-sm font-medium italic">
                   "The smarter way to handle professional support."
                 </p>
              </div>
           </motion.div>
        </div>

        {/* Animated Glows */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-teal-500/20 blur-[100px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full" 
        />
      </div>
    </div>
  );
}
