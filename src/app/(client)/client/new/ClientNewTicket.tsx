"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/dropdown";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowLeft, Send, Paperclip, HelpCircle, AlertTriangle, XCircle, CheckSquare, Lightbulb, Check } from "lucide-react";
import Link from "next/link";
import { FileUpload } from "@/components/ui/FileUpload";
import { createTicket } from "@/lib/actions/tickets";
import { getIntegrationsConfig } from "@/lib/actions/integrations";

export default function ClientNewTicket({ availableTags = [] }: { availableTags?: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successData, setSuccessData] = React.useState<{ number: number; id: string } | null>(null);

  const [subject, setSubject] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [type, setType] = React.useState("QUESTION");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [attachments, setAttachments] = React.useState<any[]>([]);

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const ticket = await createTicket({
        subject,
        description,
        type,
        priority: "MEDIUM",
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      setSuccessData({ number: ticket.number, id: ticket.id });
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="flex h-[calc(100vh-12rem)] flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 shadow-xl shadow-emerald-500/40">
            <Check className="h-10 w-10 text-white stroke-[3]" />
          </div>
        </div>
        
        <h2 className="text-3xl font-extrabold text-white">Ticket Submitted!</h2>
        <p className="mt-2 text-lg text-zinc-400">
          Your request has been securely delivered and is in the queue.
        </p>

        <div className="mt-10 w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 shadow-2xl backdrop-blur-xl">
          <div className="bg-zinc-800/50 px-6 py-3 border-b border-zinc-800">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Confirmation Reference</p>
          </div>
          <div className="p-8">
            <p className="font-mono text-5xl font-black tracking-tighter text-white">
              #{successData.number}
            </p>
            <p className="mt-4 text-xs text-zinc-500 uppercase tracking-widest font-bold">Please keep this number for your records</p>
          </div>
        </div>

        <div className="mt-12 flex items-center gap-4">
          <Link href={`/client/tickets/${successData.id}`}>
            <Button size="lg" className="h-12 px-8 bg-teal-500 hover:bg-teal-600 text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-teal-500/20">
              View Ticket Details
            </Button>
          </Link>
          <Link href="/client">
            <Button variant="outline" size="lg" className="h-12 px-8 border-zinc-800 text-zinc-300 hover:bg-zinc-800">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-6 pt-2">
        <div>
          <Link
            href="/client"
            className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white">Submit a Request</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Provide details about your issue and we'll get back to you shortly.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
                <CardDescription>
                  Provide clear information about your request
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
                    className="bg-zinc-950/50 border-zinc-800 focus:ring-teal-500/50"
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
                    className="bg-zinc-950/50 border-zinc-800 focus:ring-teal-500/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Attachments (Optional)
                  </label>
                  <FileUpload onUploadComplete={setAttachments} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="relative z-20 border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Category
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
              </CardContent>
            </Card>

            <Card className="relative z-10 border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
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
                         className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                           isSelected
                             ? "text-white shadow-lg"
                             : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                         }`}
                         style={isSelected ? { backgroundColor: tag.color, boxShadow: `0 0 12px ${tag.color}40` } : {}}
                       >
                         {tag.name}
                         {isSelected && <Check className="h-3 w-3" />}
                       </button>
                     );
                   })}
                 </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white shadow-xl shadow-teal-500/20 py-6 text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={!subject || !description || isSubmitting} isLoading={isSubmitting}>
              <Send className="mr-2 h-5 w-5" />
              Submit Ticket
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
