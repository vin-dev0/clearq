import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Clock, ChevronRight } from "lucide-react";
import { getArticle } from "@/lib/actions/kb";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

export default async function ArticlePage({ 
  params 
}: { 
  params: Promise<{ orgSlug: string; slug: string }> 
}) {
  const { orgSlug, slug } = await params;
  const article = await getArticle(slug, orgSlug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <nav className="flex items-center gap-2 text-zinc-500 text-sm mb-12">
          <Link href={`/support/${orgSlug}/kb`} className="hover:text-teal-400 transition-colors">KB Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/support/${orgSlug}/kb/category/${article.categoryId}`} className="hover:text-teal-400 transition-colors">
            {(article as any).category?.name || "Uncategorized"}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-zinc-300 truncate">{article.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <article className="flex-1 min-w-0">
            <header className="mb-8">
              <Badge variant="primary" className="mb-4 border-teal-500/30 text-teal-400 bg-teal-500/5">
                {(article as any).category?.name || "General Guide"}
              </Badge>
              <h1 className="text-4xl font-extrabold mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
                {article.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-zinc-500 text-sm border-y border-zinc-800 py-6">
                <div className="flex items-center gap-3">
                  <Avatar 
                    src={(article as any).author?.avatar || (article as any).author?.image} 
                    name={(article as any).author?.name || "Support Team"} 
                    size="sm"
                  />
                  <span className="font-medium text-zinc-300">{(article as any).author?.name || "Support Team"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Updated {new Date(article.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>6 min read</span>
                </div>
              </div>
            </header>

            {/* Content actually goes here */}
            <div className="prose prose-invert prose-teal max-w-none">
              {/* Note: In a real system you'd use a markdown processor like react-markdown or similar */}
              <div className="space-y-6 text-zinc-300 leading-relaxed text-lg">
                {article.content.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            <footer className="mt-16 pt-8 border-t border-zinc-800">
              <div className="bg-zinc-900/50 rounded-2xl p-8 border border-zinc-800 text-center">
                <h3 className="text-xl font-bold mb-2">Was this article helpful?</h3>
                <p className="text-zinc-500 mb-6">Your feedback helps us improve our guides.</p>
                <div className="flex justify-center gap-4">
                  <button className="px-8 py-3 rounded-xl border border-zinc-700 hover:border-teal-500 hover:bg-teal-500/10 transition-all font-bold">
                    Yes, helpful
                  </button>
                  <button className="px-8 py-3 rounded-xl border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 transition-all font-bold">
                    No, I still need help
                  </button>
                </div>
              </div>
            </footer>
          </article>

          {/* Table of Contents/Related Sidebar */}
          <aside className="w-full lg:w-72 space-y-8">
            <div className="sticky top-8">
              <h3 className="font-bold uppercase tracking-widest text-[10px] text-zinc-500 mb-4">On this page</h3>
              <nav className="space-y-3">
                <a href="#" className="block text-sm text-teal-400 font-medium">Overview</a>
                <a href="#" className="block text-sm text-zinc-500 hover:text-zinc-300">Prerequisites</a>
                <a href="#" className="block text-sm text-zinc-500 hover:text-zinc-300">Step-by-step Guide</a>
                <a href="#" className="block text-sm text-zinc-500 hover:text-zinc-300">Common Issues</a>
                <a href="#" className="block text-sm text-zinc-500 hover:text-zinc-300">Still have questions?</a>
              </nav>

              <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-teal-500/10 to-transparent border border-teal-500/20">
                <h4 className="font-bold mb-2">Still Stuck?</h4>
                <p className="text-zinc-500 text-xs mb-4">Can't find what you're looking for?</p>
                <Link href={`/support/${orgSlug}`} className="inline-block w-full py-2 bg-teal-500 hover:bg-teal-400 text-black text-center text-xs font-bold rounded-lg transition-colors">
                  Contact Support
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
