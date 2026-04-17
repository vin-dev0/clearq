import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminCategories } from "@/lib/actions/kb";
import { ArticleEditor } from "../ArticleEditor";

export default async function NewArticlePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const categories = await getAdminCategories();
  
  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Create Article</h1>
        <p className="text-zinc-400 mt-1">Draft a new knowledge base article for your clients.</p>
      </div>
      <ArticleEditor categories={categories} />
    </div>
  );
}
