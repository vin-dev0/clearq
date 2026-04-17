import ClientNewTicket from "./ClientNewTicket";
import { getTags } from "@/lib/actions/tags";

export const dynamic = "force-dynamic";

export default async function ClientNewTicketPage() {
  const availableTags = await getTags();
  return <ClientNewTicket availableTags={availableTags} />;
}
