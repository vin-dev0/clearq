import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import ClientDashboard from "./ClientDashboard";
import { getTickets } from "@/lib/actions/tickets";

export const dynamic = "force-dynamic";

export default async function ClientPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const tickets = await getTickets();
  return <ClientDashboard initialTickets={tickets} />;
}
