"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { 
  Save, 
  X, 
  Eye, 
  Code, 
  Bold, 
  Italic, 
  List, 
  Link as LinkIcon,
  Image as ImageIcon,
  Check,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createArticle, updateArticle } from "@/lib/actions/kb";

interface ArticleEditorProps {
  initialArticle?: any;
  categories: any[];
}

export function ArticleEditor({ initialArticle, categories }: ArticleEditorProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isPreview, setIsPreview] = React.useState(false);
  
  const [formData, setFormData] = React.useState({
    title: initialArticle?.title || "",
    slug: initialArticle?.slug || "",
    content: initialArticle?.content || "",
    excerpt: initialArticle?.excerpt || "",
    keywords: initialArticle?.keywords || "",
    categoryId: initialArticle?.categoryId || "",
    isPublished: initialArticle?.isPublished || false,
    audience: initialArticle?.audience || "PUBLIC",
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]/g, "");
    setFormData(prev => ({ ...prev, title, slug: initialArticle ? prev.slug : slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (initialArticle) {
        await updateArticle(initialArticle.id, formData);
      } else {
        await createArticle(formData);
      }
      router.push("/kb");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to save article");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={() => router.back()}
          className="text-zinc-400 hover:text-white"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to list
        </Button>
        <div className="flex items-center gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsPreview(!isPreview)}
            className="border-zinc-800 text-zinc-400"
          >
            {isPreview ? <Code className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {isPreview ? "Edit Mode" : "Preview"}
          </Button>
          <Button 
            type="submit" 
            className="bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/20"
            isLoading={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            {initialArticle ? "Update Article" : "Publish Article"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <Input
              placeholder="Article Title..."
              value={formData.title}
              onChange={handleTitleChange}
              className="text-2xl font-bold h-14 bg-zinc-900/50 border-zinc-800 focus:ring-teal-500"
              required
            />
            <div className="flex items-center gap-2 text-sm text-zinc-500 px-1">
              <span>URL Slug:</span>
              <Input 
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="h-8 py-0 bg-transparent border-dashed border-zinc-800 focus:ring-0 text-zinc-400 w-auto min-w-[200px]"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden shadow-xl overflow-hidden">
            {/* Toolbar */}
            {!isPreview && (
              <div className="flex items-center gap-1 border-b border-zinc-800 bg-zinc-800/50 px-3 py-2">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white"><Bold className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white"><Italic className="h-4 w-4" /></Button>
                <div className="w-px h-4 bg-zinc-700 mx-1" />
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white"><List className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white"><LinkIcon className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white"><ImageIcon className="h-4 w-4" /></Button>
              </div>
            )}

            <div className="relative min-h-[500px]">
              {isPreview ? (
                <div className="prose prose-invert max-w-none p-8 article-preview h-full">
                  <h1 className="text-3xl font-bold mb-4">{formData.title}</h1>
                  <div dangerouslySetInnerHTML={{ __html: formData.content.replace(/\n/g, "<br/>") }} />
                </div>
              ) : (
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Start writing your article here..."
                  className="min-h-[500px] border-0 bg-transparent p-8 focus:ring-0 text-zinc-300 resize-none font-mono text-sm leading-relaxed"
                  required
                />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-6 shadow-xl backdrop-blur-xl">
            <h3 className="font-semibold text-white">Article Settings</h3>
            
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Audience Visibility</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, audience: "PUBLIC" }))}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl border transition-all",
                    formData.audience === "PUBLIC" 
                      ? "bg-teal-500/10 border-teal-500 text-teal-400 shadow-[0_0_15px_-3px_rgba(20,184,166,0.3)]" 
                      : "bg-zinc-800/50 border-zinc-700 text-zinc-500 hover:border-zinc-600"
                  )}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider">Public</span>
                  <span className="text-[9px] mt-0.5 opacity-60">Clients & Staff</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, audience: "INTERNAL" }))}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl border transition-all",
                    formData.audience === "INTERNAL" 
                      ? "bg-amber-500/10 border-amber-500 text-amber-400 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]" 
                      : "bg-zinc-800/50 border-zinc-700 text-zinc-500 hover:border-zinc-600"
                  )}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider">Internal</span>
                  <span className="text-[9px] mt-0.5 opacity-60">Staff Only</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Publish Status</label>
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                <div className="flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full", formData.isPublished ? "bg-teal-500" : "bg-amber-500")} />
                  <span className="text-sm font-medium text-white">{formData.isPublished ? "Published" : "Draft"}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isPublished: !prev.isPublished }))}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                    formData.isPublished ? "bg-teal-500" : "bg-zinc-700"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    formData.isPublished ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Category</label>
              <select 
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-2 text-white focus:ring-teal-500 text-sm"
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Excerpt (Short description)</label>
              <Textarea 
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Briefly describe what this article covers..."
                className="bg-zinc-800 border-zinc-700 rounded-xl text-sm min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Keywords (Comma separated)</label>
              <Input 
                value={formData.keywords}
                onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                placeholder="e.g. login, reset, password"
                className="bg-zinc-800 border-zinc-700 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl backdrop-blur-xl">
             <h3 className="font-semibold text-white mb-4">Quick Tips</h3>
             <ul className="space-y-3 text-sm text-zinc-400">
               <li className="flex gap-2">
                 <Check className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                 Keep titles concise and action-oriented.
               </li>
               <li className="flex gap-2">
                 <Check className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                 Use keywords that clients are likely to search for.
               </li>
               <li className="flex gap-2">
                 <Check className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                 Break complex steps into numbered lists.
               </li>
             </ul>
          </div>
        </div>
      </div>
    </form>
  );
}
