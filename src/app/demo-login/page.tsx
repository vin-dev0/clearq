"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/branding/Logo";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  Trash2, 
  Zap, 
  ShieldCheck,
  ArrowRight,
  Loader2
} from "lucide-react";
import { setupDemo } from "@/lib/actions/demo";
import { loginWithCredentials } from "@/lib/actions/auth";
import { motion, AnimatePresence } from "framer-motion";

export default function DemoLoginPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [demoCreds, setDemoCreds] = React.useState<{email: string, password: string} | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleLaunchDemo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const creds = await setupDemo();
      setDemoCreds(creds);
    } catch (err) {
      console.error(err);
      setError("Failed to initialize demo environment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!demoCreds) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", demoCreds.email);
      formData.append("password", demoCreds.password);
      
      const result = await loginWithCredentials(formData);
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      }
    } catch (err: any) {
      // NextAuth redirect happens here
      if (err?.digest?.includes("NEXT_REDIRECT")) {
        window.location.href = "/dashboard";
      } else {
        setError("Sign in failed. Please try again.");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 font-sans selection:bg-teal-500/30 overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="container relative z-10 mx-auto flex max-w-7xl flex-col px-6 py-12">
        <nav className="flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to landing
          </Link>
        </nav>

        <main className="flex flex-1 items-center justify-center py-20">
          <div className="w-full max-w-2xl">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/5 px-4 py-1.5 text-sm font-medium text-teal-400"
              >
                <Sparkles className="h-4 w-4 fill-teal-400/20" />
                <span>Interactive Sandboxed Experience</span>
              </motion.div>
              
              <h1 className="text-5xl font-black tracking-tight text-white md:text-6xl mb-6">
                Test drive the<br />
                <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent italic">
                  future of support.
                </span>
              </h1>
              
              <p className="mx-auto max-w-md text-lg text-zinc-400 leading-relaxed mb-12">
                Get a private, fully-featured instance of ClearQ to explore for 15 minutes.
                <br />
                <Link href="/checkout?plan=PRO" className="text-teal-400 hover:text-teal-300 text-sm font-bold mt-2 inline-block">
                  Ready to buy instead? Skip the demo →
                </Link>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              {[
                { icon: Clock, label: "15 Minute Session", sub: "Auto-expires" },
                { icon: Zap, label: "Full Enterprise Access", sub: "All features enabled" },
                { icon: Trash2, label: "Automatic Cleanup", sub: "Zero data footprint" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 text-center"
                >
                  <item.icon className="mx-auto h-6 w-6 text-teal-500 mb-3" />
                  <div className="text-sm font-bold text-white mb-1">{item.label}</div>
                  <div className="text-xs text-zinc-500">{item.sub}</div>
                </motion.div>
              ))}
            </div>

            <div className="relative">
              <AnimatePresence mode="wait">
                {!demoCreds ? (
                  <motion.div
                    key="launch"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center"
                  >
                    <Button
                      size="xl"
                      onClick={handleLaunchDemo}
                      disabled={isLoading}
                      className="w-full sm:w-auto min-w-[300px] rounded-full h-16 bg-white text-black hover:bg-zinc-200 text-lg font-bold shadow-2xl shadow-white/10"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Provisioning...
                        </>
                      ) : (
                        <>
                          Launch Demo Environment
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                    <p className="mt-6 text-sm text-zinc-500 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      No credit card or registration required.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="creds"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-3xl border border-teal-500/20 bg-zinc-900/80 backdrop-blur-xl p-8 shadow-3xl shadow-teal-500/10"
                  >
                    <div className="mb-8 text-center">
                      <div className="h-12 w-12 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-4">
                        <Zap className="h-6 w-6 text-teal-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">Environment Ready!</h3>
                      <p className="text-zinc-400 mt-2">Use the credentials below to enter your sandbox.</p>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="rounded-2xl bg-zinc-950 p-4 border border-zinc-800">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Email</div>
                        <div className="text-white font-mono break-all">{demoCreds.email}</div>
                      </div>
                      <div className="rounded-2xl bg-zinc-950 p-4 border border-zinc-800">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Password</div>
                        <div className="text-white font-mono">{demoCreds.password}</div>
                      </div>
                    </div>

                    <Button
                      size="xl"
                      onClick={handleSignIn}
                      disabled={isLoading}
                      className="w-full rounded-2xl h-14 bg-teal-500 hover:bg-teal-400 text-white text-lg font-bold"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        "Sign In to Demo"
                      )}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-center text-rose-500 text-sm font-medium"
                >
                  {error}
                </motion.div>
              )}
            </div>
          </div>
        </main>

        <footer className="mt-auto pt-12 text-center text-sm text-zinc-600">
          <p>© 2026 ClearQ. All demo data is strictly temporary and isolated.</p>
        </footer>
      </div>
    </div>
  );
}
