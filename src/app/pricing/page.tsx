"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/branding/Logo";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Shield,
  Zap,
  Users,
  Mail,
  Phone,
  Building2,
  CreditCard,
} from "lucide-react";

const starterFeatures = [
  "Unlimited tickets & conversations",
  "Email & chat channels",
  "Basic SLA management",
  "Team collaboration & internal notes",
  "Real-time analytics & reporting",
  "Role-based access control",
  "Standard email support",
];

const proFeatures = [
  "Everything in Starter, plus:",
  "Ticket/Email/Messaging templates",
  "Multilingual support",
  "Inventory tracking",
  "Asset tracking with barcode labels",
  "Credit card processing",
  "Mobile app access",
  "AI-powered auto-responses",
  "Advanced automations & workflows",
  "API access & webhooks",
  "99.9% uptime SLA",
  "Priority support",
];

const enterpriseFeatures = [
  "Everything in Pro, plus:",
  "Single Sign-On (SSO) / SAML",
  "Dedicated account manager",
  "On-premise deployment options",
  "24/7 phone support",
  "Custom integrations & API limits",
  "Advanced security & compliance",
  "Volume discounts",
];

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null);

  // Placeholder payment link - replace with Stripe checkout when ready
  const handleSelectPlan = (plan: string) => {
    if (plan === "enterprise") {
      window.location.href = "mailto:sales@ClearQ.net?subject=Enterprise%20Plan%20Inquiry";
    } else {
      window.location.href = `/checkout?plan=${plan.toUpperCase()}`;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 pt-32 pb-20">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-white md:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="mt-4 text-xl text-zinc-400 max-w-2xl mx-auto">
              Choose the plan that fits your team. Unlock all features instantly.
            </p>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Starter Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8"
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white">Starter</h3>
              <p className="mt-2 text-zinc-400">Essential tools for up to 3 staff seats</p>
              <div className="mt-6 flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-white">$19</span>
                <span className="text-zinc-400">/month</span>
              </div>
              <div className="mt-4 p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs font-bold text-teal-400">
                + $250/yr Client Fee (10-50 Slots)
              </div>
              <p className="mt-2 text-sm text-zinc-500">Billed annually • 3 Staff Members</p>
            </div>
            <ul className="mt-8 space-y-4">
              {starterFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="h-5 w-5 shrink-0 text-teal-400" />
                  <span className="text-zinc-300">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button
                size="lg"
                variant="outline"
                className="w-full h-14 rounded-xl font-bold"
                onClick={() => handleSelectPlan("starter")}
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-2xl border border-teal-500/50 bg-gradient-to-b from-teal-500/10 to-transparent p-8"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-1 text-sm font-semibold text-white shadow-lg shadow-teal-500/30">
                Most Popular
              </span>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white">Pro</h3>
              <p className="mt-2 text-zinc-400">Professional support for up to 7 staff seats</p>
              <div className="mt-6 flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-white">$39</span>
                <span className="text-zinc-400">/month</span>
              </div>
              <div className="mt-4 p-3 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white">
                + $250/yr Client Fee (10-50 Slots)
              </div>
              <p className="mt-2 text-sm text-teal-200/60">Billed annually • 7 Staff Members</p>
            </div>
            <ul className="mt-8 space-y-4">
              {proFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="h-5 w-5 shrink-0 text-teal-400" />
                  <span className="text-zinc-300">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button
                size="lg"
                className="w-full bg-teal-500 hover:bg-teal-400 h-14 rounded-xl font-bold text-lg"
                onClick={() => handleSelectPlan("pro")}
              >
                Buy Now
                <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="mt-3 text-center text-sm text-teal-200/40">
                Secure Card Payment • Instant Activation
              </p>
            </div>
          </motion.div>

          {/* Enterprise Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8"
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white">Enterprise</h3>
              <p className="mt-2 text-zinc-400">Tailored solutions for large organizations</p>
              <div className="mt-6 flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-white">Custom</span>
              </div>
              <p className="mt-2 text-sm text-zinc-500">Dedicated support & advanced features</p>
            </div>
            <ul className="mt-8 space-y-4">
              {enterpriseFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="h-5 w-5 shrink-0 text-teal-400" />
                  <span className="text-zinc-300">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => handleSelectPlan("enterprise")}
              >
                Contact Sales
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {[
              {
                q: "How do I get started?",
                a: "Simply select a plan and complete the secure card payment. You will receive an activation email immediately to set up your organization and team.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards through Stripe, including Visa, Mastercard, American Express, and Discover. Enterprise customers can also pay by invoice.",
              },
              {
                q: "Can I change plans later?",
                a: "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be prorated for the remainder of your billing cycle.",
              },
              {
                q: "Is there a minimum number of users?",
                a: "No minimum for Starter or Pro plans. Enterprise plans are designed for teams of 25+ users and include volume discounts.",
              },
            ].map((faq, i) => (
              <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h3 className="font-semibold text-white">{faq.q}</h3>
                <p className="mt-2 text-sm text-zinc-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-20 text-center">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-white">Need help choosing?</h2>
            <p className="mt-2 text-zinc-400">
              Contact our sales team for a personalized recommendation
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <a
                href="mailto:sales@ClearQ.net"
                className="flex items-center gap-2 text-teal-400 hover:text-teal-300"
              >
                <Mail className="h-4 w-4" />
                sales@ClearQ.net
              </a>
              <span className="text-zinc-600">|</span>
              <a
                href="tel:+12125550147"
                className="flex items-center gap-2 text-teal-400 hover:text-teal-300"
              >
                <Phone className="h-4 w-4" />
                +1 (212) 555-0147
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
