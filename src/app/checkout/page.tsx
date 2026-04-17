import CheckoutClient from "./CheckoutClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Checkout | ClearQ",
  description: "Complete your subscription to unlock ClearQ features.",
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" /></div>}>
      <CheckoutClient />
    </Suspense>
  );
}
