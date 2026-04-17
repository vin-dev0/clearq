"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  ChevronRight, 
  Check, 
  Building2,
  Globe,
  Zap,
  ArrowLeft,
  Loader2,
  Users as UsersIcon,
  Calendar,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/branding/Logo";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import Script from "next/script";
import { processSquarePayment } from "@/lib/actions/square-payments";

// These should ideally come from env, but for testing we can define placeholders
// NEXT_PUBLIC_SQUARE_APP_ID
// NEXT_PUBLIC_SQUARE_LOCATION_ID

export default function CheckoutClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedPlan, setSelectedPlan] = React.useState<"STARTER" | "PRO" | "TESTING">(
    (searchParams.get("plan") as any) || "PRO"
  );
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [inviteCode, setInviteCode] = React.useState<string | null>(null);

  // Square payment state
  const [payments, setPayments] = React.useState<any>(null);
  const [card, setCard] = React.useState<any>(null);

  // Pricing Logic
  const userCount = selectedPlan === "PRO" ? 7 : (selectedPlan === "TESTING" ? 7 : 3);
  const isClientFeePaid = (session?.user as any)?.clientFeePaid || false;
  
  const getPrice = () => {
    if (selectedPlan === "TESTING") return 0.01;
    const base = selectedPlan === "PRO" ? 468 : 228;
    const clientFee = isClientFeePaid ? 0 : 250; // Zero if already paid once
    return base + clientFee;
  };
  
  const annualTotal = getPrice();

  const isRenewal = isClientFeePaid && selectedPlan !== "TESTING";

  const [scriptLoaded, setScriptLoaded] = React.useState(false);

  // Initialize Square when script is loaded and DOM is ready
  React.useEffect(() => {
    if (!scriptLoaded || card) return;

    const initializeSquare = async () => {
      const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID || "sq0idp-W026zWJ-Jo4YtKVHHJdmgw";
      const locId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || "LA1RGCZD9RG0Z";

      if (!(window as any).Square) return;

      try {
        const square = (window as any).Square;
        const paymentsInstance = await square.payments(appId, locId);
        const cardInstance = await paymentsInstance.card();
        
        // Ensure container is empty before attaching
        const container = document.getElementById("card-container");
        if (container) {
          container.innerHTML = "";
          await cardInstance.attach("#card-container");
          setPayments(paymentsInstance);
          setCard(cardInstance);
        }
      } catch (e: any) {
        console.error("Square initialization error:", e);
        setError(`Square Error: ${e.message || "Invalid credentials"}. Please check your Production Location ID.`);
      }
    };

    initializeSquare();
  }, [scriptLoaded, card]);

  const handleSquareLoad = () => {
    setScriptLoaded(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) {
      setError("Payment fields not ready.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const email = formData.get("email") as string;
      const guestName = formData.get("name") as string;
      const guestCompany = formData.get("company") as string;

      const result = await card.tokenize();
      if (result.status === "OK") {
        // Send token to our server action
        const response = await processSquarePayment(
          result.token, 
          selectedPlan, 
          annualTotal,
          { email, name: guestName, company: guestCompany }
        );
        
        if (response.success) {
          if (response.inviteCode) setInviteCode(response.inviteCode);
          setSuccess(true);
        } else {
          setError(response.error || "Payment failed");
        }
      } else {
        setError(result.errors?.[0]?.message || "Failed to secure card data");
      }
    } catch (e: any) {
      setError("An unexpected error occurred during payment.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-center text-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full space-y-6"
        >
          <div className="h-20 w-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto">
            <Check className="h-10 w-10 text-teal-400" />
          </div>
          <h1 className="text-3xl font-bold">Access Unlocked</h1>
          <p className="text-zinc-400">
            Your {selectedPlan} account is now active with {userCount} staff seats. 
            An annual charge of ${annualTotal.toLocaleString()} has been processed by Square.
          </p>
          {!session && inviteCode && (
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
              <div className="text-zinc-500 text-xs uppercase font-black tracking-widest">Your Admin Invite Code</div>
              <div className="text-4xl font-mono font-bold text-teal-400 tracking-wider">
                {inviteCode}
              </div>
              <p className="text-zinc-500 text-sm">
                Copy this code and use it to register your primary administrator account.
              </p>
            </div>
          )}
          <Button 
            size="lg" 
            className="w-full bg-teal-600 hover:bg-teal-500 h-14 text-lg font-bold rounded-xl" 
            onClick={() => {
              if (session) {
                router.push("/dashboard");
              } else {
                router.push(`/register?code=${inviteCode || ""}`);
              }
            }}
          >
            {session ? "Enter Dashboard" : "Register Your Account"}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row font-sans selection:bg-teal-500/30">
      <Script 
        src="https://web.squarecdn.com/v1/square.js" 
        onLoad={handleSquareLoad}
        strategy="afterInteractive"
      />

      {/* Left Side - Details & Plan Picker */}
      <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between overflow-y-auto max-h-screen">
        <div className="max-w-md mx-auto lg:mx-0">
          <Link href="/" className="inline-block mb-12">
            <Logo />
          </Link>
          
          <div className="mb-8">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 font-mono">Plan Configuration</h2>
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => setSelectedPlan("STARTER")}
                className={cn(
                  "p-5 rounded-2xl border transition-all text-left flex items-center justify-between group",
                  selectedPlan === "STARTER" 
                    ? "border-teal-500 bg-teal-500/5 ring-1 ring-teal-500" 
                    : "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80"
                )}
              >
                <div>
                   <div className="font-bold text-white text-lg">Starter</div>
                   <div className="text-zinc-500 text-xs">Up to 3 staff members • $19/mo</div>
                </div>
                <div className={cn(
                  "h-6 w-6 rounded-full border flex items-center justify-center transition-colors",
                  selectedPlan === "STARTER" ? "bg-teal-500 border-teal-500" : "border-zinc-700 group-hover:border-zinc-500"
                )}>
                   {selectedPlan === "STARTER" && <Check className="h-4 w-4 text-white" />}
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedPlan("PRO")}
                className={cn(
                  "p-5 rounded-2xl border transition-all text-left flex items-center justify-between group relative overflow-hidden",
                  selectedPlan === "PRO" 
                    ? "border-teal-500 bg-teal-500/5 ring-1 ring-teal-500" 
                    : "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80"
                )}
              >
                <div>
                   <div className="font-bold text-white text-lg flex items-center gap-2">
                     Professional
                     <span className="text-[10px] bg-teal-500 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">Best Value</span>
                   </div>
                   <div className="text-zinc-500 text-xs">Up to 7 staff members • $39/mo</div>
                </div>
                <div className={cn(
                  "h-6 w-6 rounded-full border flex items-center justify-center transition-colors",
                  selectedPlan === "PRO" ? "bg-teal-500 border-teal-500" : "border-zinc-700 group-hover:border-zinc-500"
                )}>
                   {selectedPlan === "PRO" && <Check className="h-4 w-4 text-white" />}
                </div>
              </button>

            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 font-mono">Client Capacity</h2>
            <div className="bg-teal-500/10 border border-teal-500/20 p-5 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-teal-500 rounded-full flex items-center justify-center shrink-0">
                  <UsersIcon className="h-5 w-5 text-black" />
                </div>
                <div>
                  <p className="text-sm text-teal-100 font-medium leading-none mb-1">
                    Support for 10-50 Clients/Customers
                  </p>
                  <p className="text-[10px] text-teal-500/60 uppercase font-black tracking-widest">
                    {isClientFeePaid ? "Renewal Discount Applied" : "One-time setup fee included"}
                  </p>
                </div>
              </div>
              {isClientFeePaid && (
                <div className="px-3 py-1 bg-teal-500 text-black text-[10px] font-black rounded-full uppercase tracking-widest animate-pulse">
                  Lifetime Access
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1 bg-zinc-900/80 p-8 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <ShieldCheck className="h-24 w-24 text-teal-400 rotate-12" />
             </div>
             <div className="flex items-center justify-between">
                <p className="text-zinc-400 font-bold text-xs uppercase tracking-widest">Annual Subscription</p>
                <div className="px-2 py-1 rounded bg-teal-500/20 text-[10px] font-black text-teal-400 uppercase tracking-tighter">Billed Yearly</div>
             </div>
             <div className="flex items-baseline gap-2 mt-4">
                <h1 className="text-6xl font-black text-white tracking-tighter">${annualTotal.toLocaleString()}</h1>
                <span className="text-zinc-500 font-medium">/yr</span>
             </div>
             <p className="text-zinc-500 text-[11px] mt-4 flex items-center gap-2 border-t border-zinc-800/80 pt-4">
                <UsersIcon className="h-4 w-4 text-teal-500/50" />
                Includes access for <strong>up to {userCount} staff seats</strong> on the {selectedPlan} plan.
             </p>
          </div>
        </div>

        <div className="mt-12 flex items-center gap-3 text-zinc-600 text-[10px] uppercase font-black tracking-widest">
          <Lock className="h-3 w-3" />
          PCI-DSS Secure Payment • Square Gateway
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 bg-zinc-900/30 p-8 lg:p-16 flex items-center justify-center border-l border-zinc-800 backdrop-blur-3xl">
        <div className="max-w-md w-full">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-white tracking-tight">Payment Details</h2>
              
              <div className="space-y-4">
                {!session && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
                      <input 
                        type="email" 
                        name="email"
                        className="w-full bg-zinc-800 border-2 border-zinc-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-teal-500 transition-all placeholder-zinc-600"
                        placeholder="name@company.com"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
                        <input 
                          type="text" 
                          name="name"
                          className="w-full bg-zinc-800 border-2 border-zinc-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-teal-500 transition-all placeholder-zinc-600"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Company Name</label>
                        <input 
                          type="text" 
                          name="company"
                          className="w-full bg-zinc-800 border-2 border-zinc-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-teal-500 transition-all placeholder-zinc-600"
                          placeholder="Acme Inc"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Square Card Container */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Secure Card Input</label>
                <div 
                  id="card-container" 
                  className="w-full bg-zinc-800 border-2 border-zinc-700/50 rounded-2xl px-5 py-6 transition-all min-h-[100px]"
                >
                  {/* Square Card will be injected here */}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4">
              <Button 
                type="submit" 
                size="lg" 
                className={cn(
                  "w-full h-20 text-xl font-black rounded-3xl transition-all active:scale-[0.97] shadow-3xl",
                  "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white shadow-teal-500/30",
                  loading && "opacity-50"
                )}
                disabled={loading || !card}
              >
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <div className="flex flex-col items-center">
                    <span>{selectedPlan === "TESTING" ? "Verify System ($0.01)" : "Unlock Enterprise Access"}</span>
                    <span className="text-[10px] opacity-70 mt-1 uppercase tracking-widest">Billed via Square Security</span>
                  </div>
                )}
              </Button>
            </div>
          </form>

          <footer className="mt-12 pt-8 border-t border-zinc-800/50 text-center">
            <p className="text-[10px] text-zinc-600 leading-normal max-w-sm mx-auto uppercase font-black tracking-widest">
              Powered by Square Security
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
