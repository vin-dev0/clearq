"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/dropdown";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { updateTicketPriority, updateTicketStatus } from "@/lib/actions/tickets";
import { ArrowLeft, Save, X } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default function TicketEditClient({ ticket }: { ticket: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    subject: ticket.subject,
    description: ticket.description,
    priority: ticket.priority,
    status: ticket.status,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Need a unified update action, but for now we'll use existing ones or create a new one
      // I will implement a more comprehensive updateTicket action in lib/actions/tickets.ts
      await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      router.push(`/tickets/${ticket.id}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to update ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/tickets/${ticket.id}`}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Edit Ticket Details</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg">General Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Subject</label>
              <Input
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="bg-zinc-950 border-zinc-800"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Description</label>
              <Textarea
                required
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-zinc-950 border-zinc-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300">Priority</label>
                <Select
                  value={formData.priority}
                  onChange={(val) => setFormData({ ...formData, priority: val })}
                  options={[
                    { value: "LOW", label: "Low" },
                    { value: "MEDIUM", label: "Medium" },
                    { value: "HIGH", label: "High" },
                    { value: "URGENT", label: "Urgent" },
                  ]}
                  className="bg-zinc-950 border-zinc-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300">Status</label>
                <Select
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val })}
                  options={[
                    { value: "OPEN", label: "Open" },
                    { value: "PENDING", label: "Pending" },
                    { value: "ON_HOLD", label: "On Hold" },
                    { value: "SOLVED", label: "Solved" },
                    { value: "CLOSED", label: "Closed" },
                  ]}
                  className="bg-zinc-950 border-zinc-800"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link href={`/tickets/${ticket.id}`}>
            <Button variant="outline" type="button" disabled={isSubmitting}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </Link>
          <Button type="submit" isLoading={isSubmitting} className="bg-teal-500 hover:bg-teal-600">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
