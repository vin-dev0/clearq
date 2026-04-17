"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Select } from "@/components/ui/dropdown";
import {
  Plus,
  Zap,
  Play,
  Pause,
  Edit,
  Trash2,
  ChevronRight,
  Clock,
  Tag,
  User,
  Mail,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";

const automations = [
  {
    id: "1",
    name: "Auto-assign urgent tickets",
    description: "Automatically assign urgent priority tickets to senior agents",
    trigger: "Ticket created with priority URGENT",
    action: "Assign to Senior Agent team",
    enabled: true,
    runsToday: 12,
    lastRun: "5 minutes ago",
  },
  {
    id: "2",
    name: "SLA breach warning",
    description: "Send notification when ticket is approaching SLA breach",
    trigger: "Ticket SLA at 75% elapsed",
    action: "Send email notification to assignee",
    enabled: true,
    runsToday: 8,
    lastRun: "15 minutes ago",
  },
  {
    id: "3",
    name: "Auto-close resolved tickets",
    description: "Close tickets 7 days after being marked as solved",
    trigger: "Ticket solved for 7 days",
    action: "Change status to CLOSED",
    enabled: true,
    runsToday: 5,
    lastRun: "1 hour ago",
  },
  {
    id: "4",
    name: "Tag billing tickets",
    description: "Add billing tag to tickets with billing keywords",
    trigger: "Ticket contains 'invoice', 'payment', or 'billing'",
    action: "Add tag: billing",
    enabled: false,
    runsToday: 0,
    lastRun: "2 days ago",
  },
  {
    id: "5",
    name: "Welcome message",
    description: "Send automated welcome message to new customers",
    trigger: "First ticket from customer",
    action: "Send welcome email template",
    enabled: true,
    runsToday: 3,
    lastRun: "30 minutes ago",
  },
];

export default function AutomationsClient() {
  const [createModalOpen, setCreateModalOpen] = React.useState(false);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Automations</h1>
          <p className="text-zinc-400">
            Create rules to automate repetitive tasks
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4" />
          New Automation
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-zinc-400">Total Automations</p>
            <p className="mt-1 text-3xl font-bold text-white">{automations.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-zinc-400">Active</p>
            <p className="mt-1 text-3xl font-bold text-emerald-400">
              {automations.filter((a) => a.enabled).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-zinc-400">Runs Today</p>
            <p className="mt-1 text-3xl font-bold text-teal-400">
              {automations.reduce((acc, a) => acc + a.runsToday, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-zinc-400">Time Saved</p>
            <p className="mt-1 text-3xl font-bold text-cyan-400">~4.2h</p>
          </CardContent>
        </Card>
      </div>

      {/* Automations List */}
      <div className="space-y-4">
        {automations.map((automation) => (
          <Card key={automation.id} hover>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`rounded-lg p-3 ${
                      automation.enabled ? "bg-teal-500/10" : "bg-zinc-800"
                    }`}
                  >
                    <Zap
                      className={`h-6 w-6 ${
                        automation.enabled ? "text-teal-400" : "text-zinc-500"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-white">{automation.name}</h3>
                      <Badge variant={automation.enabled ? "success" : "default"}>
                        {automation.enabled ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">
                      {automation.description}
                    </p>
                    <div className="mt-3 flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <AlertTriangle className="h-4 w-4" />
                        <span>When: {automation.trigger}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500">
                        <ChevronRight className="h-4 w-4" />
                        <span>Then: {automation.action}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
                      <span>{automation.runsToday} runs today</span>
                      <span>•</span>
                      <span>Last run: {automation.lastRun}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon-sm">
                    {automation.enabled ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon-sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" className="text-rose-400 hover:text-rose-300">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} size="lg">
        <ModalHeader onClose={() => setCreateModalOpen(false)}>
          Create New Automation
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Automation Name
              </label>
              <Input placeholder="e.g., Auto-assign VIP customers" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Description
              </label>
              <Input placeholder="What does this automation do?" />
            </div>
            <div className="rounded-lg border border-zinc-800 p-4">
              <h4 className="mb-3 font-medium text-white">When this happens...</h4>
              <Select
                value=""
                onChange={() => {}}
                placeholder="Select a trigger"
                options={[
                  { value: "ticket_created", label: "Ticket is created" },
                  { value: "ticket_updated", label: "Ticket is updated" },
                  { value: "status_changed", label: "Ticket status changes" },
                  { value: "sla_warning", label: "SLA warning triggered" },
                  { value: "customer_reply", label: "Customer replies" },
                ]}
              />
            </div>
            <div className="rounded-lg border border-zinc-800 p-4">
              <h4 className="mb-3 font-medium text-white">Do this...</h4>
              <Select
                value=""
                onChange={() => {}}
                placeholder="Select an action"
                options={[
                  { value: "assign", label: "Assign to agent/team" },
                  { value: "add_tag", label: "Add tag" },
                  { value: "change_priority", label: "Change priority" },
                  { value: "send_email", label: "Send email notification" },
                  { value: "add_note", label: "Add internal note" },
                ]}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setCreateModalOpen(false)}>
            <Zap className="h-4 w-4" />
            Create Automation
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

