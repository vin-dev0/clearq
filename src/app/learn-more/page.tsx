"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/branding/Logo";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  ShieldCheck, 
  Zap, 
  Building2, 
  Ticket, 
  BookOpen, 
  Cpu,
  BarChart,
  MessageCircle,
  Clock
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const sections = [
  {
    title: "Who is ClearQ For?",
    description: "Built for teams that demand excellence and efficiency in every interaction.",
    items: [
      {
        icon: Building2,
        title: "IT Support Teams",
        text: "Streamline internal help desk requests with automated routing and priority management."
      },
      {
        icon: Users,
        title: "Modern MSPs",
        text: "Manage multiple clients from a single pane of glass with strict data isolation."
      },
      {
        icon: Zap,
        title: "Fast-Growth SaaS",
        text: "Scale your customer support without losing the personal touch that built your brand."
      }
    ]
  },
  {
    title: "How It Works",
    description: "A simple, powerful workflow that turns customer frustration into loyalty.",
    items: [
      {
        icon: Ticket,
        title: "1. Centralized Ticketing",
        text: "Every request becomes a smart ticket, enriched with customer history and system data."
      },
      {
        icon: BookOpen,
        title: "2. Self-Service KB",
        text: "Our AI-powered knowledge base handles the easy questions so your team can focus on the hard ones."
      },
      {
        icon: Cpu,
        title: "3. Asset Intelligence",
        text: "Link hardware and software assets directly to tickets to identify recurring system failures."
      }
    ]
  }
];

export default function LearnMorePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-teal-500/30 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 z-[60] w-full border-b border-white/5 bg-zinc-950/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" className="text-zinc-400 hover:text-white">Sign In</Button>
            </Link>
            <Link href="/checkout?plan=PRO">
              <Button className="bg-teal-500 hover:bg-teal-400 text-white rounded-full px-6">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="container mx-auto max-w-5xl px-6 text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">
              Crafted for the <br/>
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent italic">
                Support Professional.
              </span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              ClearQ isn't just another ticket system. It's an ecosystem designed to eliminate friction 
              between you and your customers, no matter the scale.
            </p>
          </motion.div>
        </section>

        {/* Feature Grid */}
        {sections.map((section, sectionIdx) => (
          <section key={sectionIdx} className="container mx-auto max-w-7xl px-6 mb-32">
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">{section.title}</h2>
              <p className="text-zinc-500 text-lg">{section.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {section.items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2rem] hover:border-teal-500/20 transition-all group"
                >
                  <div className="h-14 w-14 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-teal-500/10 transition-all">
                    <item.icon className="h-7 w-7 text-teal-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </section>
        ))}

        {/* The Experience Section */}
        <section className="container mx-auto max-w-7xl px-6 mb-32">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/5 rounded-[3rem] p-12 md:p-20 overflow-hidden relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold text-white mb-8 tracking-tight">The Unified Experience</h2>
                <div className="space-y-6">
                  {[
                    { icon: MessageCircle, title: "Internal Chat", desc: "Collaborate on tickets without leaving the app." },
                    { icon: BarChart, title: "Live SLA Monitoring", desc: "Never miss a deadline with visual countdowns." },
                    { icon: Clock, title: "Automated Workflows", desc: "If this, then support. Set rules and forget them." }
                  ].map((feat, i) => (
                    <div key={i} className="flex gap-6 items-start">
                      <div className="h-10 w-10 flex-shrink-0 bg-teal-500/10 rounded-lg flex items-center justify-center">
                        <feat.icon className="h-5 w-5 text-teal-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{feat.title}</h4>
                        <p className="text-zinc-400 text-sm">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-zinc-800/50 rounded-2xl border border-white/5 relative overflow-hidden p-8">
                  <div className="absolute top-0 right-0 p-8">
                    <ShieldCheck className="h-32 w-32 text-teal-500/20 rotate-12" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 w-1/2 bg-zinc-700 rounded-full animate-pulse" />
                    <div className="h-4 w-3/4 bg-zinc-700/50 rounded-full" />
                    <div className="h-24 w-full bg-zinc-900 rounded-xl border border-white/5 mt-8" />
                  </div>
                </div>
                {/* Decorative glow */}
                <div className="absolute -inset-10 bg-teal-500/10 blur-[100px] -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto max-w-4xl px-6 text-center">
          <div className="inline-block p-1 rounded-full bg-teal-500/10 border border-teal-500/20 mb-8 px-4 py-1 text-sm font-bold text-teal-400 uppercase tracking-widest">
            Ready to upgrade?
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-10 leading-tight">
            Stop juggling tools.<br/>Start delivering results.
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/checkout?plan=PRO">
              <Button size="xl" className="w-full sm:w-auto rounded-full px-12 bg-white text-black hover:bg-zinc-200 text-xl font-bold">
                Get Access
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="xl" className="text-white hover:bg-white/5 text-xl font-bold px-10">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 mt-20">
        <div className="container mx-auto max-w-7xl px-6 text-center text-zinc-500 text-sm">
          <p>© 2026 ClearQ Support Technologies. Fully PCI Compliant.</p>
        </div>
      </footer>
    </div>
  );
}
