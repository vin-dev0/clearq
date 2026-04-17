"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/dropdown";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  ArrowLeft,
  Send,
  Paperclip,
  User,
  Tag,
  AlertCircle,
  HelpCircle,
  AlertTriangle,
  XCircle,
  CheckSquare,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { FileUpload } from "@/components/ui/FileUpload";
import { createTicket } from "@/lib/actions/tickets";
import { getIntegrationsConfig } from "@/lib/actions/integrations";

export default function NewTicketClient({ 
  availableTags = [], 
  availableAgents = [] 
}: { 
  availableTags?: any[];
  availableAgents?: any[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [subject, setSubject] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [type, setType] = React.useState("QUESTION");
  const [priority, setPriority] = React.useState("MEDIUM");
  const [assigneeId, setAssigneeId] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [attachments, setAttachments] = React.useState<any[]>([]);

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createTicket({
        subject,
        description,
        type,
        priority,
        assigneeId: assigneeId || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      router.push("/tickets");
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/tickets"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to tickets
        </Link>
        <h1 className="text-2xl font-bold text-white">Create New Ticket</h1>
        <p className="text-zinc-400">
          Submit a new support request or report an issue
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Details</CardTitle>
                <CardDescription>
                  Provide information about your request
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Subject *
                  </label>
                  <Input
                    placeholder="Brief description of your issue"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Description *
                  </label>
                  <Textarea
                    placeholder="Provide detailed information about your issue..."
                    rows={8}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Attachments
                  </label>
                  <FileUpload onUploadComplete={setAttachments} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="relative z-20">
              <CardHeader>
                <CardTitle>Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Type
                  </label>
                  <Select
                    value={type}
                    onChange={setType}
                    options={[
                      { value: "QUESTION", label: "Question", icon: <HelpCircle className="h-4 w-4 text-cyan-400" /> },
                      { value: "INCIDENT", label: "Incident", icon: <AlertTriangle className="h-4 w-4 text-amber-400" /> },
                      { value: "PROBLEM", label: "Problem", icon: <XCircle className="h-4 w-4 text-rose-400" /> },
                      { value: "TASK", label: "Task", icon: <CheckSquare className="h-4 w-4 text-emerald-400" /> },
                      { value: "FEATURE_REQUEST", label: "Feature Request", icon: <Lightbulb className="h-4 w-4 text-violet-400" /> },
                    ]}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Priority
                  </label>
                  <Select
                    value={priority}
                    onChange={setPriority}
                    options={[
                      { value: "LOW", label: "Low" },
                      { value: "MEDIUM", label: "Medium" },
                      { value: "HIGH", label: "High" },
                      { value: "URGENT", label: "Urgent" },
                    ]}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Assign To
                  </label>
                  <Select
                    value={assigneeId}
                    onChange={setAssigneeId}
                    placeholder="Select agent..."
                    options={[
                      ...availableAgents.map(agent => ({
                        value: agent.id,
                        label: agent.name || agent.email,
                        icon: <User className="h-4 w-4" />
                      }))
                    ]}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="relative z-10">
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {availableTags.length === 0 && <span className="text-zinc-500 text-sm">No tags available</span>}
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                          isSelected
                            ? "border-teal-500 bg-teal-500/10 text-teal-400"
                            : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-teal-500 hover:bg-teal-500/10 hover:text-teal-400"
                        }`}
                      >
                        <Tag className="mr-1 inline h-3 w-3" />
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card variant="gradient">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-teal-500/10 p-2">
                    <AlertCircle className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Need help?</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      Check our{" "}
                      <Link href="/knowledge" className="text-teal-400 hover:underline">
                        Knowledge Base
                      </Link>{" "}
                      for answers to common questions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex items-center justify-end gap-4 border-t border-zinc-800 pt-6">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            <Send className="h-4 w-4" />
            Create Ticket
          </Button>
        </div>
      </form>
    </div>
  );
}



