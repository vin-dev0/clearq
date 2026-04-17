import TagsClient from "./TagsClient";
import { getTags } from "@/lib/actions/tags";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const tags = await getTags();
  return <TagsClient initialTags={tags} />;
}
