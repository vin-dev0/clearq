"use client";

import * as React from "react";
import { useState } from "react";
import { submitPublicTicket } from "@/lib/actions/publicTickets";
import { searchPublicArticles } from "@/lib/actions/kb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, AlertCircle, Send, Check, BookOpen, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";

export default function SupportForm({ orgSlug }: { orgSlug: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [ticketNumber, setTicketNumber] = useState<number | null>(null);
  
  // Deflection states
  const [subject, setSubject] = useState("");
  const [suggestedArticles, setSuggestedArticles] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced article search
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (subject.length >= 3) {
        setIsSearching(true);
        try {
          const articles = await searchPublicArticles(orgSlug, subject);
          setSuggestedArticles(articles);
        } catch (err) {
          console.error("Deflection search failed:", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestedArticles([]);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [subject, orgSlug]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      orgSlug,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      description: formData.get("description") as string,
    };

    try {
      const res = await submitPublicTicket(data);
      if (res.success) {
        setIsSuccess(true);
        setTicketNumber(res.ticketNumber ?? null);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-500">
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 shadow-xl shadow-emerald-500/40">
            <Check className="h-10 w-10 text-white stroke-[3]" />
          </div>
        </div>
        
        <h2 className="text-3xl font-extrabold text-white">Ticket Submitted!</h2>
        <p className="mt-2 text-zinc-400 max-w-sm mx-auto">
          We've received your request. A support specialist will be in touch shortly.
        </p>

        <div className="mt-10 w-full max-w-xs overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 shadow-2xl backdrop-blur-xl mx-auto">
          <div className="bg-zinc-800/50 px-6 py-3 border-b border-zinc-800 font-bold uppercase tracking-widest text-[10px] text-zinc-500">
            Confirmation Reference
          </div>
          <div className="p-8">
            <p className="font-mono text-5xl font-black tracking-tighter text-white">
              #{ticketNumber}
            </p>
          </div>
        </div>

        <div className="mt-12">
          <Button onClick={() => setIsSuccess(false)} variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 px-8 h-12">
            Submit Another Request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-200">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400 ml-1">Your Name *</label>
          <Input name="name" placeholder="John Doe" required disabled={isSubmitting} className="bg-zinc-950/50 border-zinc-800 focus:ring-teal-500/50 h-11" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400 ml-1">Email Address *</label>
          <Input name="email" type="email" placeholder="john@example.com" required disabled={isSubmitting} className="bg-zinc-950/50 border-zinc-800 focus:ring-teal-500/50 h-11" />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-400 ml-1">Subject *</label>
        <Input 
          name="subject" 
          placeholder="Brief summary of your issue" 
          required 
          disabled={isSubmitting} 
          className="bg-zinc-950/50 border-zinc-800 focus:ring-teal-500/50 h-11" 
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      {/* KB Deflection Suggestions */}
      {suggestedArticles.length > 0 && (
        <div className="bg-teal-500/5 border border-teal-500/20 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-teal-500/10 px-4 py-2 border-b border-teal-500/10 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Suggested Articles
            </span>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-xs text-zinc-400 mb-2">We found some articles that might help you right now:</p>
            {suggestedArticles.map((article) => (
              <a 
                key={article.id} 
                href={`/support/${orgSlug}/kb/${article.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3 rounded-xl bg-zinc-950/40 border border-zinc-800 hover:border-teal-500/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-teal-400" />
                  </div>
                  <span className="text-sm font-medium text-zinc-200 group-hover:text-teal-400 transition-colors line-clamp-1">{article.title}</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-zinc-600 group-hover:text-teal-400 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-400 ml-1">Description *</label>
        <Textarea name="description" placeholder="Please provide as much detail as possible..." rows={6} required disabled={isSubmitting} className="bg-zinc-950/50 border-zinc-800 focus:ring-teal-500/50 resize-none" />
      </div>
      
      <div className="pt-4 border-t border-zinc-800">
        <Button type="submit" className="w-full h-12 bg-teal-500 hover:bg-teal-600 text-white font-bold shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]" isLoading={isSubmitting}>
          <Send className="mr-2 h-4 w-4" />
          Submit Ticket
        </Button>
        <p className="mt-4 text-center text-xs text-zinc-500">
          Need quick help? <Link href={`/support/${orgSlug}/kb`} className="text-teal-500 hover:underline">Browse our Knowledge Base</Link>
        </p>
      </div>
    </form>
  );
}
