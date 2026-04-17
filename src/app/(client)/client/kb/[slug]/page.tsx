import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getArticle } from "@/lib/actions/kb";
import { KBArticleClient } from "./KBArticleClient";
import { notFound, redirect } from "next/navigation";

export default async function ClientArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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
    select: { slug: true }
  });

  if (!org) {
    notFound();
  }

  const article = await getArticle(slug, org.slug);

  if (!article) {
    notFound();
  }

  return (
    <KBArticleClient article={article} />
  );
}
