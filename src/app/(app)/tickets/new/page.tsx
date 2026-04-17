import NewTicketClient from "./NewTicketClient";
import { getTags } from "@/lib/actions/tags";
import { getAgents } from "@/lib/actions/users";

export const dynamic = "force-dynamic";

export default async function NewTicketPage() { 
  const [tags, agents] = await Promise.all([
    getTags(),
    getAgents()
  ]);
  
  return <NewTicketClient availableTags={tags} availableAgents={agents} />; 
}
