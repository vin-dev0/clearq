"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ExternalLink,
  Book,
  Eye,
  ThumbsUp,
  Clock,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { cn, formatDateTime } from "@/lib/utils";
import { deleteArticle } from "@/lib/actions/kb";
import { useRouter } from "next/navigation";

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  isPublished: boolean;
  viewCount: number;
  helpfulCount: number;
  updatedAt: Date;
  audience: string;
  category?: { name: string } | null;
  author: { name: string | null };
}

export function KBAdminClient({ 
  initialArticles, 
  categories 
}: { 
  initialArticles: any[]; 
  categories: any[];
}) {
  const router = useRouter();
  const [articles, setArticles] = React.useState(initialArticles);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    setIsDeleting(id);
    try {
      await deleteArticle(id);
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete article");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Knowledge Base</h1>
          <p className="text-zinc-400 mt-1">Manage help articles and documentation for your clients.</p>
        </div>
        <Link href="/kb/new">
          <Button className="bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/20">
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Articles", value: articles.length, icon: Book, color: "text-blue-400" },
          { label: "Published", value: articles.filter(a => a.isPublished).length, icon: Eye, color: "text-teal-400" },
          { label: "Drafts", value: articles.filter(a => !a.isPublished).length, icon: Clock, color: "text-amber-400" },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={cn("rounded-xl bg-zinc-800 p-2.5", stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input 
            placeholder="Search articles..." 
            className="pl-10 bg-zinc-900/50 border-zinc-800 focus:ring-teal-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="border-zinc-800 text-zinc-400 hover:text-white">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Articles Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-xl backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-800/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Article</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Category</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Engagement</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Last Updated</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredArticles.length > 0 ? filteredArticles.map((article) => (
                <tr key={article.id} className="group hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-zinc-800 p-2 text-zinc-400 group-hover:text-teal-400 transition-colors">
                        <Book className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate max-w-[240px]">{article.title}</p>
                        <p className="text-xs text-zinc-500 truncate mt-0.5">/{article.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                      {article.category?.name || "Uncategorized"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      {article.isPublished ? (
                        <Badge variant="success" dot>Published</Badge>
                      ) : (
                        <Badge variant="secondary" dot>Draft</Badge>
                      )}
                      {article.audience === "INTERNAL" ? (
                        <Badge variant="warning" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] py-0">Internal</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-teal-500/10 text-teal-500 border-teal-500/20 text-[10px] py-0">Public</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Eye className="h-4 w-4 text-zinc-500" />
                        {article.viewCount}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ThumbsUp className="h-4 w-4 text-zinc-500" />
                        {article.helpfulCount}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {formatDateTime(article.updatedAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Link href={`/kb/${article.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(article.id)}
                        isLoading={isDeleting === article.id}
                        className="h-8 w-8 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 italic">
                    No articles found. Use the "New Article" button to create your first help doc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
