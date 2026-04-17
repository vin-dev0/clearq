"use client";

import * as React from "react";
import Link from "next/link";
import { TicketList } from "@/components/tickets/TicketList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ClientDashboard({ initialTickets }: { initialTickets: any[] }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-6 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-white">My Tickets</h1>
          <p className="mt-1 text-sm text-zinc-400">
            View and manage all your submitted support requests.
          </p>
        </div>
        <div>
          <Link href="/client/new">
            <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/20">
              <Plus className="mr-2 h-5 w-5" />
              Submit New Ticket
            </Button>
          </Link>
        </div>
      </div>

      {/* Ticket List */}
      <div className="bg-zinc-950/50 rounded-xl border border-zinc-800 shadow-xl overflow-hidden min-h-[500px]">
         <TicketList 
            initialTickets={initialTickets} 
            ticketLinkPrefix="/client/tickets"
            clearFilterLink="/client"
         />
      </div>
    </div>
  );
}
