import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Search, Book, ChevronRight, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPublicCategories, getPublicArticles } from "@/lib/actions/kb";

export default async function KBPortalPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { name: true, logo: true, slug: true }
  });

  if (!org) {
    notFound();
  }

  const categories = await getPublicCategories(orgSlug);
  const recentArticles = await getPublicArticles(orgSlug);

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center mb-12">
          <Link href={`/support/${orgSlug}`} className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-teal-400 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Support</span>
          </Link>
          
          {org.logo ? (
            <img src={org.logo} alt={org.name} className="h-12 mb-6" />
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-teal-500/20 flex items-center justify-center mb-6">
              <span className="text-2xl font-bold text-teal-400">{org.name.charAt(0)}</span>
            </div>
          )}
          <h1 className="text-4xl font-bold text-center mb-4">How can we help?</h1>
          <p className="text-zinc-400 text-center max-w-2xl">
            Search our knowledge base for quick answers or browse categories below.
          </p>
          
          <div className="w-full max-w-2xl mt-8">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl p-2 h-16 shadow-2xl overflow-hidden">
                <Search className="ml-4 h-6 w-6 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Search articles, guides, and more..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-lg px-4 placeholder:text-zinc-600"
                />
                <button className="bg-teal-500 hover:bg-teal-400 text-black font-bold px-6 py-2 rounded-xl transition-colors">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {categories.map((category) => (
            <Link key={category.id} href={`/support/${orgSlug}/kb/category/${category.id}`}>
              <Card className="bg-zinc-900/50 border-zinc-800 hover:border-teal-500/50 transition-all cursor-pointer group h-full">
                <CardHeader className="pb-2">
                  <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Book className="h-5 w-5 text-teal-400" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-teal-400 transition-colors">
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400 text-sm line-clamp-2 mb-4">
                    {category.description || `Browse articles related to ${category.name}`}
                  </p>
                  <div className="flex items-center text-teal-500 text-sm font-semibold">
                    <span>{(category as any)._count?.articles || 0} articles</span>
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Articles */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="h-8 w-1 bg-teal-500 rounded-full"></span>
            Lately Updated
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {recentArticles.slice(0, 6).map((article: any) => (
              <Link key={article.id} href={`/support/${orgSlug}/kb/${article.slug}`} className="group">
                <div className="flex flex-col">
                  <Badge variant="default" className="w-fit mb-3 border-zinc-700 text-[10px] text-zinc-500 uppercase tracking-widest">
                    {article.category?.name || "General"}
                  </Badge>
                  <h3 className="text-lg font-bold group-hover:text-teal-400 transition-colors mb-2">
                    {article.title}
                  </h3>
                  <p className="text-zinc-500 text-sm line-clamp-2">
                    {article.content.replace(/[#*`]/g, '').slice(0, 150)}...
                  </p>
                  <div className="mt-4 flex items-center text-zinc-600 text-xs gap-4">
                    <span>{new Date(article.updatedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>5 min read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
