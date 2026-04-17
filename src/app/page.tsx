"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/branding/Logo";
import { Button } from "@/components/ui/button";
import { Modal, ModalHeader, ModalBody } from "@/components/ui/modal";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Ticket,
  Zap,
  Users,
  BarChart3,
  MessageSquare,
  Shield,
  CheckCircle2,
  ArrowRight,
  Star,
  ChevronRight,
  Play,
  Mail,
  MapPin,
  Phone,
  Globe,
  Lock,
  Sparkles,
  Command,
  Layout,
  CreditCard,
} from "lucide-react";
import { AIChatWidget } from "@/components/chat/AIChatWidget";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const features = [
  {
    icon: Ticket,
    title: "Smart Ticket Management",
    description: "Automatically categorize, prioritize, and route tickets to the right agents with AI-driven intelligence.",
    size: "large",
    color: "teal",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Respond to customers in seconds with keyboard shortcuts and quick actions.",
    size: "small",
    color: "cyan",
  },
  {
    icon: Sparkles,
    title: "AI Co-pilot",
    description: "Generate responses, summarize long threads, and predict customer sentiment automatically.",
    size: "small",
    color: "purple",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track SLAs and performance with beautiful, interactive data visualizations.",
    size: "small",
    color: "amber",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "PCI-compliant transaction processing integrated directly into your support workflow.",
    size: "small",
    color: "blue",
  },
  {
    icon: Users,
    title: "Seamless Collaboration",
    description: "Internal notes, mentions, and shared views keep your entire team in sync.",
    size: "large",
    color: "emerald",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 Type II compliant with advanced RBAC and comprehensive audit logging.",
    size: "small",
    color: "rose",
  },
];

const stats = [
  { value: "Unlimited", label: "Scalability" },
  { value: "99.99%", label: "System Uptime" },
  { value: "Elite", label: "Standards" },
];

export default function LandingPage() {
  const [showPrivacyModal, setShowPrivacyModal] = React.useState(false);
  const [showContactModal, setShowContactModal] = React.useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-teal-500/30 font-sans overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 z-[60] w-full border-b border-white/5 bg-zinc-950/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-10">
            <Logo />
            <div className="hidden items-center gap-8 lg:flex">
              <a href="#features" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">Features</a>
              <a href="#pricing" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">Pricing</a>
              <Link href="/learn-more" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">Learn More</Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <Link href="/client/login">
                <Button variant="ghost" className="text-zinc-400 hover:text-white">
                  Client Portal
                </Button>
              </Link>
              <div className="h-4 w-px bg-zinc-800" />
              <Link href="/login">
                <Button variant="ghost" className="text-zinc-400 hover:text-white">
                  Agent Sign In
                </Button>
              </Link>
            </div>
            <Link href="/checkout?plan=STARTER">
              <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-6 transition-transform hover:scale-105">
                Join Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-44 pb-32 overflow-hidden">
          <div className="container mx-auto max-w-7xl px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/5 px-4 py-1.5 text-sm font-medium text-teal-400"
              >
                <Sparkles className="h-4 w-4 fill-teal-400/20" />
                <span>Next-gen AI support is here</span>
                <ChevronRight className="h-4 w-4" />
              </motion.div>

              <h1 className="mx-auto max-w-5xl text-6xl font-extrabold tracking-tight text-white md:text-7xl lg:text-8xl leading-[1.1]">
                Customer support,
                <br />
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  reimagined.
                </span>
              </h1>

              <p className="mx-auto mt-8 max-w-2xl text-lg text-zinc-400 md:text-xl leading-relaxed">
                Experience the first unified support platform that combines human empathy with
                lightning-fast AI efficiency. The desk of the future, today.
              </p>

              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/checkout?plan=PRO">
                  <Button size="xl" className="w-full sm:w-auto rounded-full px-10 bg-teal-500 hover:bg-teal-400 text-white border-0 shadow-lg shadow-teal-500/25 transition-all hover:scale-105 active:scale-95">
                    Unlock PRO Access
                    <Sparkles className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/demo-login">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto rounded-full px-10 border-zinc-800 hover:bg-zinc-900 group">
                    <Zap className="mr-2 h-4 w-4 fill-teal-400 text-teal-400 group-hover:scale-110 transition-transform" />
                    Try Demo
                  </Button>
                </Link>
              </div>

              <div className="mt-16 flex items-center justify-center gap-x-12 gap-y-6 flex-wrap opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="text-xl font-bold flex items-center gap-2 text-zinc-300"><Globe className="h-6 w-6" /> TECHCORP</div>
                <div className="text-xl font-bold flex items-center gap-2 text-zinc-300"><Zap className="h-6 w-6" /> SPEEDY</div>
                <div className="text-xl font-bold flex items-center gap-2 text-zinc-300"><Command className="h-6 w-6" /> QUANTUM</div>
                <div className="text-xl font-bold flex items-center gap-2 text-zinc-300"><Lock className="h-6 w-6" /> SECURELY</div>
              </div>
            </motion.div>

            {/* Dashboard Mockup */}
            <motion.div
              style={{ y: y1 }}
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative mt-24"
            >
              <div className="relative mx-auto max-w-[1000px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 p-1.5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] backdrop-blur-3xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
                <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3 bg-zinc-900/40">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-white/10" />
                    <div className="h-3 w-3 rounded-full bg-white/10" />
                    <div className="h-3 w-3 rounded-full bg-white/10" />
                  </div>
                  <div className="ml-4 flex items-center gap-2 text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                    <Layout className="h-3 w-3" />
                    ClearQ Command Center
                  </div>
                </div>
                <div className="aspect-[16/10] bg-zinc-950 p-6 md:p-10">
                  <div className="grid h-full grid-cols-12 gap-6">
                    <div className="col-span-8 flex flex-col gap-6">
                      <div className="h-1/3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                        <div className="flex justify-between items-center mb-6">
                          <div className="h-4 w-32 bg-zinc-800 rounded" />
                          <div className="h-4 w-20 bg-teal-500/20 rounded" />
                        </div>
                        <div className="space-y-3">
                          <div className="h-2 w-full bg-zinc-800/50 rounded" />
                          <div className="h-2 w-4/5 bg-zinc-800/50 rounded" />
                        </div>
                      </div>
                      <div className="h-2/3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col">
                        <div className="h-4 w-40 bg-zinc-800 rounded mb-8" />
                        <div className="flex-1 flex items-end gap-3">
                          {[40, 70, 45, 90, 65, 80, 55, 75, 50, 85].map((h, i) => (
                            <div key={i} className="flex-1 bg-zinc-800 rounded-t-sm" style={{ height: '100%', position: 'relative' }}>
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ duration: 1.5, delay: 0.5 + (i * 0.1) }}
                                className="absolute bottom-0 w-full bg-gradient-to-t from-teal-500 to-cyan-400 rounded-t-sm opacity-80"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-4 flex flex-col gap-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="h-8 w-8 rounded-full bg-zinc-800" />
                            <div className="h-3 w-20 bg-zinc-800 rounded" />
                          </div>
                          <div className="h-2 w-full bg-zinc-800/30 rounded mb-2" />
                          <div className="h-2 w-2/3 bg-zinc-800/30 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Mesh Gradient Effect for Dashboard */}
              <div className="absolute -inset-10 -z-10 bg-teal-500/20 blur-[120px] opacity-30 pointer-events-none" />
            </motion.div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-32 relative">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="mb-20">
              <h2 className="text-sm font-bold tracking-[0.2em] text-teal-500 uppercase mb-4">Features</h2>
              <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <h3 className="text-4xl md:text-5xl font-bold text-white max-w-2xl leading-tight">
                  Everything you need to scale your
                  <span className="text-zinc-500 italic"> support operations.</span>
                </h3>
                <p className="text-zinc-400 max-w-sm">
                  We built ClearQ to handle the scale of enterprise teams with the simplicity of a startup tool.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className={`group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-900/40 p-10 transition-all hover:border-teal-500/20 hover:bg-zinc-900/60 ${feature.size === "large" ? "md:col-span-2" : "md:col-span-1"
                    }`}
                >
                  <div className={`mb-8 inline-flex rounded-2xl bg-zinc-800 p-5 transition-transform group-hover:scale-110 duration-500 group-hover:rotate-3`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="mb-4 text-2xl font-bold text-white tracking-tight">{feature.title}</h4>
                  <p className="text-zinc-400 text-lg leading-relaxed">{feature.description}</p>

                  <div className="absolute -right-10 -bottom-10 h-32 w-32 bg-teal-500/10 blur-3xl opacity-0 transition-opacity group-hover:opacity-100" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 bg-zinc-900/30 border-y border-white/5 relative">
          <div className="absolute inset-0 pattern-grid opacity-5 pointer-events-none" />
          <div className="container mx-auto max-w-7xl px-6 relative z-10">
            <div className="flex flex-wrap justify-center gap-16 md:gap-24">
              {stats.map((stat, i) => (
                <div key={i} className="text-center group">
                  <div className="text-6xl md:text-7xl font-black text-white mb-2 tracking-tighter transition-transform group-hover:scale-110 duration-500">
                    {stat.value}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 group-hover:text-teal-500 transition-colors">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="text-center mb-24">
              <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tighter">Simple, fair pricing.</h2>
              <p className="text-zinc-400 text-xl max-w-2xl mx-auto">Choose a plan that scales with your ambition. No hidden fees, no credit card required to start.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Starter */}
              <div className="rounded-[3rem] border border-white/5 bg-zinc-900/50 p-12 flex flex-col h-full transform hover:-translate-y-2 transition-transform duration-500">
                <div className="mb-10">
                  <h4 className="text-2xl font-bold text-white mb-3">Starter</h4>
                  <p className="text-zinc-500 text-sm">For small support teams</p>
                </div>
                <div className="flex items-baseline gap-1 mb-10">
                  <span className="text-6xl font-extrabold text-white">$19</span>
                  <span className="text-zinc-500 text-lg">/user/mo</span>
                </div>
                <div className="mb-6 bg-teal-500/10 p-4 rounded-2xl border border-teal-500/20">
                  <div className="text-xs font-black text-teal-400 uppercase tracking-widest mb-1">Required Add-on</div>
                  <div className="text-white font-bold">$250/yr Client Fee</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-tighter mt-1">Covers 10-50 Customers</div>
                </div>
                <ul className="space-y-5 mb-12 flex-1">
                  {["3 Staff Seats Included", "Unlimited tickets", "Basic automation", "Role-based access"].map((f) => (
                    <li key={f} className="flex items-center gap-4 text-zinc-300 font-medium">
                      <CheckCircle2 className="h-6 w-6 text-teal-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/checkout?plan=STARTER" className="w-full">
                  <Button variant="outline" className="w-full rounded-[2rem] h-16 border-zinc-700 hover:bg-zinc-800 text-lg font-bold">Buy Starter</Button>
                </Link>
              </div>

              {/* Pro */}
              <div className="relative rounded-[3rem] border-2 border-teal-500 bg-zinc-900 p-12 flex flex-col h-full transform md:scale-105 z-10 shadow-3xl shadow-teal-500/10">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-teal-500 text-black text-[12px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg shadow-teal-500/30">
                  Most Popular
                </div>
                <div className="mb-10">
                  <h4 className="text-2xl font-bold text-white mb-3">Professional</h4>
                  <p className="text-zinc-400 text-sm">Best for growing companies</p>
                </div>
                <div className="flex items-baseline gap-1 mb-10">
                  <span className="text-6xl font-extrabold text-white">$39</span>
                  <span className="text-zinc-400 text-lg">/user/mo</span>
                </div>
                <div className="mb-6 bg-teal-500/10 p-4 rounded-2xl border border-teal-500/20">
                  <div className="text-xs font-black text-teal-400 uppercase tracking-widest mb-1">Required Add-on</div>
                  <div className="text-white font-bold">$250/yr Client Fee</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-tighter mt-1">Covers 10-50 Customers</div>
                </div>
                <ul className="space-y-5 mb-12 flex-1">
                  {["7 Staff Seats Included", "AI Co-pilot active", "Priority helpdesk", "Custom workflows", "Advanced Analytics"].map((f) => (
                    <li key={f} className="flex items-center gap-4 text-white font-bold">
                      <CheckCircle2 className="h-6 w-6 text-teal-400 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/checkout?plan=PRO" className="w-full">
                  <Button className="w-full rounded-[2rem] h-16 bg-teal-500 hover:bg-teal-400 text-white shadow-xl shadow-teal-500/20 text-lg font-bold transition-transform hover:scale-[1.02]">Get PRO Access</Button>
                </Link>
              </div>

              {/* Enterprise */}
              <div className="rounded-[3rem] border border-white/5 bg-zinc-900/50 p-12 flex flex-col h-full transform hover:-translate-y-2 transition-transform duration-500">
                <div className="mb-10">
                  <h4 className="text-2xl font-bold text-white mb-3">Enterprise</h4>
                  <p className="text-zinc-500 text-sm">Large scale operations</p>
                </div>
                <div className="flex items-baseline gap-1 mb-10">
                  <span className="text-6xl font-extrabold text-white">Custom</span>
                </div>
                <ul className="space-y-5 mb-12 flex-1">
                  {["SSO & SAML Auth", "On-premise option", "Dedicated manager", "White-label support", "Unlimited agents"].map((f) => (
                    <li key={f} className="flex items-center gap-4 text-zinc-300 font-medium">
                      <CheckCircle2 className="h-6 w-6 text-teal-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full rounded-[2rem] h-16 border-zinc-700 hover:bg-zinc-800 text-lg font-bold"
                  onClick={() => setShowContactModal(true)}
                >
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="enterprise" className="py-44 overflow-hidden bg-zinc-950 relative">
          <div className="container mx-auto max-w-5xl px-6 relative z-10">
            <div className="rounded-[4rem] bg-gradient-to-br from-teal-900/40 via-zinc-900/60 to-emerald-900/40 p-16 md:p-24 border border-white/5 text-center relative overflow-hidden backdrop-blur-sm">
              <div className="absolute inset-0 pattern-grid opacity-10 pointer-events-none" />
              <h2 className="text-5xl md:text-7xl font-black text-white mb-10 leading-tight tracking-tighter">
                Customer support,<br />reimagined.
              </h2>
              <p className="text-zinc-400 text-xl md:text-2xl max-w-2xl mx-auto mb-16 leading-relaxed">
                Join 1,000+ teams who have already switched to ClearQ. Start your trial today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/checkout?plan=PRO">
                  <Button size="xl" className="w-full sm:w-auto rounded-full px-14 py-8 bg-white text-black hover:bg-zinc-200 text-xl font-bold shadow-2xl transition-all hover:scale-105 active:scale-95">
                    Purchase Pro
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="xl"
                  className="w-full sm:w-auto text-white hover:bg-white/5 text-xl font-bold px-10"
                  onClick={() => setShowContactModal(true)}
                >
                  Talk to Sales
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-24 border-t border-white/5 bg-zinc-950 relative">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-20 text-center md:text-left">
            <div className="col-span-2 flex flex-col items-center md:items-start">
              <Logo size="lg" />
              <p className="mt-8 text-zinc-500 max-w-xs text-lg leading-relaxed font-medium">
                The modern help desk platform designed for teams who care.
              </p>
            </div>
            <div>
              <h5 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Product</h5>
              <ul className="space-y-4 text-md text-zinc-500 font-medium">
                <li><Link href="/demo-login" className="hover:text-teal-400 transition-colors">Try Demo</Link></li>
                <li><Link href="/client/login" className="hover:text-teal-400 transition-colors">Client Portal</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Company</h5>
              <ul className="space-y-4 text-md text-zinc-500 font-medium">
                <li><button onClick={() => setShowPrivacyModal(true)} className="hover:text-teal-400 transition-colors">Privacy</button></li>
                <li><button onClick={() => setShowContactModal(true)} className="hover:text-teal-400 transition-colors">Contact</button></li>
                <li><Link href="/terms" className="hover:text-teal-400 transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-zinc-600 font-medium tracking-tight">
            <p>© 2026 ClearQ Inc. Built with care.</p>
            <div className="flex gap-10">
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                Systems Operational
              </span>
              <span>Uptime: 99.99%</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <Modal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} size="lg">
        <ModalHeader onClose={() => setShowPrivacyModal(false)}>Privacy & Data Security</ModalHeader>
        <ModalBody>
          <div className="space-y-6 text-zinc-300 p-6 leading-relaxed">
            <p className="text-lg text-white font-medium">Your data is yours. Period.</p>
            <p className="text-sm">We use AES-256 at rest and TLS 1.3 in transit. We have zero knowledge of your encryption keys when managed by KMS. Our team undergoes quarterly SOC 2 audits to ensure your data stays private and secure.</p>
          </div>
        </ModalBody>
      </Modal>

      <Modal isOpen={showContactModal} onClose={() => setShowContactModal(false)} size="md">
        <ModalHeader onClose={() => setShowContactModal(false)}>Get in Touch</ModalHeader>
        <ModalBody>
          <div className="space-y-8 p-6">
            <div className="flex items-center gap-6 group cursor-pointer">
              <div className="rounded-2xl bg-teal-500/10 p-4 transition-colors group-hover:bg-teal-500/20">
                <Mail className="h-6 w-6 text-teal-400" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-white text-lg">Email Us</h4>
                <p className="text-zinc-400">hello@devcomplete.net</p>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>

      <AIChatWidget />
    </div>
  );
}
