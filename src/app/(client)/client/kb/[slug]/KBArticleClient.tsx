"use client";

import * as React from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  Clock, 
  User, 
  ThumbsUp, 
  Check,
  Share2,
  Printer,
  Copy
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatDateTime } from "@/lib/utils";
import { voteArticleHelpful } from "@/lib/actions/kb";

export function KBArticleClient({ article }: { article: any }) {
  const [hasVoted, setHasVoted] = React.useState(false);
  const [isVoting, setIsVoting] = React.useState(false);

  const handleVote = async () => {
    if (hasVoted) return;
    setIsVoting(true);
    try {
      await voteArticleHelpful(article.id);
      setHasVoted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/client/kb">
          <Button variant="ghost" className="text-zinc-400 hover:text-white">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Help Center
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-500 hover:text-zinc-300">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-500 hover:text-zinc-300">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Article Header */}
      <header className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          {article.category && (
            <Badge variant="success" className="bg-teal-500/10 text-teal-400 border-teal-500/20">
              {article.category.name}
            </Badge>
          )}
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Clock className="h-4 w-4" />
            <span>Updated {formatDateTime(article.updatedAt)}</span>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-white tracking-tight sm:text-5xl leading-tight">
          {article.title}
        </h1>

        <div className="flex items-center gap-4 py-4 border-y border-zinc-800/50">
          <Avatar 
            src={article.author.image || article.author.avatar} 
            name={article.author.name} 
            size="md" 
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Written by {article.author.name}</p>
            <p className="text-xs text-zinc-500">Subject Matter Expert</p>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <article className="prose prose-invert prose-zinc max-w-none">
        <div 
          className="text-zinc-300 leading-relaxed text-lg space-y-6"
          dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, "<br/>") }} 
        />
      </article>

      {/* Feedback Section */}
      <section className="mt-16 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-10 text-center shadow-xl backdrop-blur-sm">
        <div className="mx-auto max-w-xs space-y-6">
          <div className={cn(
             "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-500",
             hasVoted ? "bg-teal-500 text-white" : "bg-zinc-800 text-zinc-400"
          )}>
            {hasVoted ? <Check className="h-8 w-8" /> : <ThumbsUp className="h-8 w-8" />}
          </div>
          
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">
              {hasVoted ? "Thanks for your feedback!" : "Was this article helpful?"}
            </h3>
            <p className="text-sm text-zinc-500">
              {hasVoted 
                ? "Your input helps us improve our customer service." 
                : "Help us improve this article by letting us know what you think."}
            </p>
          </div>

          {!hasVoted && (
            <div className="flex gap-4">
              <Button 
                onClick={handleVote}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white"
                isLoading={isVoting}
              >
                <ThumbsUp className="mr-2 h-4 w-4" />
                Yes
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 border-zinc-800 text-zinc-400 hover:text-white"
              >
                No
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Footer Support Bridge */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 border-t border-zinc-800">
        <div>
          <h4 className="font-bold text-white">Need more help?</h4>
          <p className="text-sm text-zinc-500">Our specialized consultants are available 24/7.</p>
        </div>
        <Link href="/client/tickets">
          <Button className="bg-teal-500 hover:bg-teal-600 text-white px-8">
            Go to Tickets
          </Button>
        </Link>
      </div>
    </div>
  );
}
