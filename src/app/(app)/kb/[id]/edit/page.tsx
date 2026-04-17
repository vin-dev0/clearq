import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminArticleById, getAdminCategories } from "@/lib/actions/kb";
import { ArticleEditor } from "../../ArticleEditor";
import { notFound } from "next/navigation";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [article, categories] = await Promise.all([
    getAdminArticleById(id),
    getAdminCategories()
  ]);

  if (!article) {
    notFound();
  }
  
  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Edit Article</h1>
        <p className="text-zinc-400 mt-1">Update your knowledge base article.</p>
      </div>
      <ArticleEditor initialArticle={article} categories={categories} />
    </div>
  );
}
