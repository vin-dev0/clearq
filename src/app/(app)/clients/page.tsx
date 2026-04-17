import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import ClientsClient from "./ClientsClient";

export const dynamic = "force-dynamic";

export default async function ClientsPage() { 
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return <ClientsClient />; 
}
