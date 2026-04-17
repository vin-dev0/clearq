"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Search, 
  Book, 
  ChevronRight, 
  ArrowRight,
  Eye,
  ThumbsUp,
  HelpCircle,
  MessageSquare
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { searchPublicArticles } from "@/lib/actions/kb";

export function KBClientHome({ 
  organizationName, 
  orgSlug,
  articles, 
  categories 
}: { 
  organizationName: string;
  orgSlug: string;
  articles: any[];
  categories: any[];
}) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchPublicArticles(orgSlug, query);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 px-6 py-16 text-center shadow-2xl backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 to-transparent" />
        <div className="relative z-10 mx-auto max-w-2xl">
          <Badge variant="success" className="mb-4 bg-teal-500/10 text-teal-400 border-teal-500/20">
            Help Center
          </Badge>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            How can we help you?
          </h1>
          <p className="mt-4 text-zinc-400">
            Search our knowledge base for answers to common questions about {organizationName}.
          </p>
          
          <div className="relative mt-8 group">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500 group-focus-within:text-teal-400 transition-colors" />
            <Input
              placeholder="Search for articles, guides, and more..."
              className="h-14 w-full pl-12 bg-zinc-950/50 border-zinc-800 focus:ring-teal-500 text-lg rounded-2xl"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
              </div>
            )}

            {/* Live Search Results Overlay */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-2 shadow-2xl z-50 text-left overflow-hidden animate-in fade-in slide-in-from-top-2">
                {searchResults.map(result => (
                  <Link 
                    key={result.id} 
                    href={`/client/kb/${result.slug}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Book className="h-4 w-4 text-zinc-500 group-hover:text-teal-400" />
                      <span className="text-sm text-zinc-300 group-hover:text-white">{result.title}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-600" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Categories Grid */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Browse by Category</h2>
            <Link href="#" className="text-sm text-teal-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href={`/client/kb?category=${category.id}`}
                className="group p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 transition-all hover:border-teal-500/30"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-teal-500/10 group-hover:text-teal-400 transition-colors">
                    <Book className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-teal-400">{category.name}</h3>
                    <p className="text-sm text-zinc-500">{category._count.articles} articles</p>
                  </div>
                </div>
                {category.description && (
                  <p className="mt-4 text-sm text-zinc-500 line-clamp-2">{category.description}</p>
                )}
              </Link>
            ))}
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Recent Articles</h2>
            <div className="space-y-4">
              {articles.slice(0, 5).map((article) => (
                <Link 
                  key={article.id} 
                  href={`/client/kb/${article.slug}`}
                  className="flex items-center justify-between p-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-teal-400">
                      <Book className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white group-hover:text-teal-400 transition-colors">{article.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-zinc-600">{article.category?.name}</span>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-600">
                          <Eye className="h-3 w-3" />
                          {article.viewCount}
                        </div>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Support Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-teal-500/5 p-6 border-l-4 border-l-teal-500">
            <h3 className="font-bold text-white flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-teal-400" />
              Still need help?
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <Link href="/client/new">
              <Button className="w-full mt-6 bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/20">
                Contact Support
              </Button>
            </Link>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="font-bold text-white mb-4">Popular Topics</h3>
            <div className="flex flex-wrap gap-2">
              {["Login Issues", "Scaling", "Billing", "Security", "Team Access", "API"].map(topic => (
                <Badge key={topic} variant="secondary" className="cursor-pointer hover:bg-zinc-800">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
