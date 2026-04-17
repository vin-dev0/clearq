import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPublicArticles, getPublicCategories } from "@/lib/actions/kb";
import { KBClientHome } from "./KBClientHome";
import { notFound, redirect } from "next/navigation";

export default async function ClientKBPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const orgId = (session?.user as any)?.organizationId;

  if (!orgId) {
    redirect("/login");
  }

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { name: true, slug: true }
  });

  if (!org) {
    notFound();
  }

  const [articles, categories] = await Promise.all([
    getPublicArticles(org.slug),
    getPublicCategories(org.slug)
  ]);

  return (
    <KBClientHome 
      organizationName={org.name} 
      orgSlug={org.slug}
      articles={articles} 
      categories={categories} 
    />
  );
}
