"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/dropdown";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/tabs";
import { cn, formatDateTime, formatRelativeTime } from "@/lib/utils";
import {
  ArrowLeft,
  Send,
  Paperclip,
  MoreHorizontal,
  Clock,
  User,
  Tag,
  MessageSquare,
  Eye,
  History,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  Lock,
  Plus,
  Check,
  X,
  FileIcon,
  Download,
  Sparkles,
  Star,
  Heart,
  Smile,
  Meh,
  Frown,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { addComment } from "@/lib/actions/comments";
import { updateTicketTags, updateTicketStatus, updateTicketPriority, claimTicket, toggleTicketLock, bulkDeleteTickets, unassignTickets, bulkAssignTickets } from "@/lib/actions/tickets";
import { getTemplates, incrementTemplateUsage } from "@/lib/actions/templates";
import { submitCSAT, getTicketCSAT } from "@/lib/actions/csat";
import { useRouter } from "next/navigation";

const mockActivities: any[] = [];
export default function TicketDetailClient({ 
  initialTicket, 
  availableTags = [],
  agents = [],
  isAdmin = false,
  isSupervisor = false,
  userRole = "CLIENT"
}: { 
  initialTicket: any, 
  availableTags?: any[],
  agents?: any[],
  isAdmin?: boolean,
  isSupervisor?: boolean,
  userRole?: string
}) {
  const { data: session } = useSession();
  const isManagement = isAdmin || isSupervisor;
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState("comments");
  const [replyText, setReplyText] = React.useState("");
  const [isInternal, setIsInternal] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isClosed = initialTicket.status === "SOLVED" || initialTicket.status === "CLOSED";
  
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [isUpdatingPriority, setIsUpdatingPriority] = React.useState(false);
  const [templates, setTemplates] = React.useState<any[]>([]);
  const [showMacros, setShowMacros] = React.useState(false);

  React.useEffect(() => {
    if (isManagement) {
      getTemplates().then(setTemplates);
    }
  }, [isManagement]);

  const applyTemplate = async (template: any) => {
    let content = template.content;
    
    // Simple variable replacement
    const vars: Record<string, string> = {
      "{{customer_name}}": mockTicket.creator.name || "",
      "{{agent_name}}": session?.user?.name || "",
      "{{ticket_id}}": `#${mockTicket.number}`,
      "{{ticket_subject}}": mockTicket.subject || "",
      "{{company_name}}": "ClearQ Support"
    };

    Object.entries(vars).forEach(([key, value]) => {
      content = content.replaceAll(key, value);
    });

    setReplyText((prev) => prev ? `${prev}\n${content}` : content);
    setShowMacros(false);
    await incrementTemplateUsage(template.id);
  };

  const [isTagDropdownOpen, setIsTagDropdownOpen] = React.useState(false);
  const [isUpdatingTags, setIsUpdatingTags] = React.useState(false);
  
  const [isLocked, setIsLocked] = React.useState(initialTicket.isLocked);
  const [isTogglingLock, setIsTogglingLock] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  
  // Track selected tag IDs locally and their full objects for display
  const [selectedTagObjects, setSelectedTagObjects] = React.useState<any[]>(initialTicket.tags || []);

  const mockTicket = {
    ...initialTicket,
    team: initialTicket.team || { name: "Support", color: "#14b8a6" },
    watchers: initialTicket.watchers || [],
  };
  const mockComments = initialTicket.comments || [];

  const [csat, setCsat] = React.useState<any>(null);
  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [csatComment, setCsatComment] = React.useState("");
  const [isSubmittingCSAT, setIsSubmittingCSAT] = React.useState(false);

  React.useEffect(() => {
    getTicketCSAT(initialTicket.id).then(setCsat);
  }, [initialTicket.id]);

  const handleCSATSubmit = async () => {
    if (rating === 0) return;
    setIsSubmittingCSAT(true);
    try {
      const res = await submitCSAT({
        ticketId: initialTicket.id,
        rating,
        comment: csatComment
      });
      setCsat(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingCSAT(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      await addComment({ ticketId: initialTicket.id, content: replyText, isInternal });
      setReplyText("");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTag = async (tag: any) => {
    setIsUpdatingTags(true);
    const isCurrentlySelected = selectedTagObjects.some(t => t.id === tag.id);
    let newTags = [];
    if (isCurrentlySelected) {
      newTags = selectedTagObjects.filter(t => t.id !== tag.id);
    } else {
      newTags = [...selectedTagObjects, tag];
    }
    
    setSelectedTagObjects(newTags);
    try {
      await updateTicketTags(initialTicket.id, newTags.map(t => t.id));
    } catch (e) {
      console.error(e);
      // Revert on error
      setSelectedTagObjects(selectedTagObjects);
    } finally {
      setIsUpdatingTags(false);
    }
  };

  const handleStatusChange = async (value: string) => {
    setIsUpdatingStatus(true);
    try {
      await updateTicketStatus(initialTicket.id, value);
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (value: string) => {
    setIsUpdatingPriority(true);
    try {
      await updateTicketPriority(initialTicket.id, value);
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingPriority(false);
    }
  };

  const handleAssignTicket = async (assigneeId: string) => {
    try {
      await bulkAssignTickets([initialTicket.id], assigneeId);
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Failed to assign ticket");
    }
  };

  const handleClaimTicket = async () => {
    try {
      await claimTicket(initialTicket.id);
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleLock = async () => {
    setIsTogglingLock(true);
    try {
      await toggleTicketLock(initialTicket.id);
      setIsLocked(!isLocked);
      alert(isLocked ? "Ticket unlocked" : "Ticket locked");
    } catch (e: any) {
      alert(e.message || "Failed to toggle lock");
    } finally {
      setIsTogglingLock(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    setIsDeleting(true);
    try {
      await bulkDeleteTickets([initialTicket.id]);
      alert("Ticket deleted");
      router.push("/tickets");
    } catch (e: any) {
      alert(e.message || "Failed to delete ticket");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUnassign = async () => {
    try {
      await unassignTickets([initialTicket.id]);
      router.refresh();
    } catch (e: any) {
      alert(e.message || "Failed to unassign");
    }
  };

  function AttachmentItem({ attachment, size = "md" }: { attachment: any, size?: "sm" | "md" }) {
    const isImage = attachment.mimeType?.startsWith("image/");
    const formatSize = (bytes: number) => {
      if (bytes < 1024) return bytes + " B";
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
      return (bytes / 1048576).toFixed(1) + " MB";
    };

    return (
      <a 
        href={attachment.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className={cn(
          "group flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 transition-colors hover:border-teal-500/50 hover:bg-zinc-800",
          size === "sm" ? "p-2" : "p-3"
        )}
      >
        <div className={cn(
          "flex items-center justify-center rounded bg-zinc-800 text-zinc-400 group-hover:text-teal-400",
          size === "sm" ? "h-8 w-8" : "h-10 w-10"
        )}>
          {isImage ? (
            <img src={attachment.url} alt="" className="h-full w-full object-cover rounded" />
          ) : (
            <FileIcon className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn("truncate font-medium text-zinc-300 group-hover:text-white", size === "sm" ? "text-xs" : "text-sm")}>
            {attachment.filename}
          </p>
          <p className="text-[10px] text-zinc-500">{formatSize(attachment.size)}</p>
        </div>
        <Download className="h-4 w-4 text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100" />
      </a>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/tickets"
                className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-zinc-500">
                    #{mockTicket.number}
                  </span>
                  <Badge variant="success" dot>
                    {mockTicket.status}
                  </Badge>
                  <Badge variant="warning">{mockTicket.priority}</Badge>
                  {isLocked && (
                    <Badge variant="danger">
                      <Lock className="h-3 w-3 mr-1" /> Locked
                    </Badge>
                  )}
                </div>
                <h1 className="mt-1 text-lg font-semibold text-white">
                  {mockTicket.subject}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Copy className="h-4 w-4" />
              </Button>
              <Link href={`/tickets/${initialTicket.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => handleStatusChange("SOLVED")}
                isLoading={isUpdatingStatus}
                disabled={isClosed}
              >
                <CheckCircle2 className="h-4 w-4" />
                Resolve
              </Button>
              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleToggleLock}
                  isLoading={isTogglingLock}
                  className={isLocked ? "text-rose-400 border-rose-500/30 hover:bg-rose-500/10" : ""}
                >
                  {isLocked ? <Lock className="h-4 w-4" /> : <Lock className="h-4 w-4 opacity-50" />}
                  {isLocked ? "Unlock" : "Lock"}
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDelete}
                isLoading={isDeleting}
                disabled={(isLocked && !isAdmin) || !isManagement}
                className={cn(
                  "text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10",
                  !isManagement && "hidden"
                )}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <button className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isClosed && (
            <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 flex items-center gap-3">
              <Lock className="h-5 w-5 text-rose-500" />
              <div>
                <p className="text-sm font-medium text-rose-400">Permanently Closed</p>
                <p className="text-xs text-rose-500/80">This ticket is closed and no longer accepts replies or modifications.</p>
              </div>
            </div>
          )}
          {/* Original Message */}
          <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/80 p-6">
            <div className="flex items-start gap-4">
              <Avatar
                src={mockTicket.creator.avatar}
                name={mockTicket.creator.name}
                size="md"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-white">
                      {mockTicket.creator.name}
                    </span>
                    <span className="ml-2 text-sm text-zinc-500">
                      {mockTicket.creator.email}
                    </span>
                  </div>
                  <span className="text-sm text-zinc-500">
                    {formatDateTime(mockTicket.createdAt)}
                  </span>
                </div>
                <div className="mt-4 whitespace-pre-wrap text-zinc-300">
                  {mockTicket.description}
                </div>

                {mockTicket.attachments && mockTicket.attachments.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-zinc-800">
                    <h4 className="text-sm font-medium text-white mb-3">Attachments</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {mockTicket.attachments.map((att: any) => (
                        <AttachmentItem key={att.id} attachment={att} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments/Activity Tabs */}
          <Tabs value={activeTab} onChange={setActiveTab}>
            <TabList>
              <Tab value="comments" icon={<MessageSquare className="h-4 w-4" />}>
                Comments
              </Tab>
              <Tab value="activity" icon={<History className="h-4 w-4" />}>
                Activity
              </Tab>
            </TabList>

            <TabPanel value="comments">
              <div className="space-y-4">
                {mockComments.map((comment: any) => (
                  <div
                    key={comment.id}
                    className={cn(
                      "rounded-xl border p-4",
                      comment.isInternal
                        ? "border-amber-500/30 bg-amber-500/5"
                        : "border-zinc-800 bg-zinc-900/50"
                    )}
                  >
                    {comment.isInternal && (
                      <div className="mb-3 flex items-center gap-2 text-xs text-amber-400">
                        <Lock className="h-3 w-3" />
                        Internal Note
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={comment.author.avatar}
                        name={comment.author.name}
                        size="sm"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {comment.author.name}
                          </span>
                          <Badge variant="secondary" className="text-[10px]">
                            {comment.author.role}
                          </Badge>
                          <span className="text-xs text-zinc-500">
                            {formatRelativeTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="mt-2 text-zinc-300">{comment.content}</p>
                        
                        {comment.attachments && comment.attachments.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {comment.attachments.map((att: any) => (
                              <AttachmentItem key={att.id} attachment={att} size="sm" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabPanel>

            <TabPanel value="activity">
              <div className="space-y-3">
                {mockActivities.map((activity, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-zinc-600" />
                    <span className="text-zinc-300">{activity.action}</span>
                    <span className="text-zinc-500">by {activity.user}</span>
                    <span className="text-zinc-600">
                      {formatRelativeTime(activity.time)}
                    </span>
                  </div>
                ))}
              </div>
            </TabPanel>
          </Tabs>
        </div>

        {/* Reply Box - Only show if NOT closed */}
        {!isClosed ? (
          <div className="border-t border-zinc-800 p-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80">
              <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2">
                <button
                  onClick={() => setIsInternal(false)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    !isInternal
                      ? "bg-teal-500/10 text-teal-400"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  Public Reply
                </button>
                {isManagement && (
                  <button
                    onClick={() => setIsInternal(true)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      isInternal
                        ? "bg-amber-500/10 text-amber-400"
                        : "text-zinc-400 hover:text-white"
                    )}
                  >
                    <Lock className="h-3 w-3" />
                    Internal Note
                  </button>
                )}
              </div>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={
                  isInternal
                    ? "Add an internal note (only visible to agents)..."
                    : "Write your reply to the customer..."
                }
                className="border-0 bg-transparent focus:ring-0"
                rows={3}
              />
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white">
                      <Paperclip className="h-5 w-5" />
                    </button>
                    {isManagement && (
                      <div className="relative">
                        <button 
                          onClick={() => setShowMacros(!showMacros)}
                          className={cn(
                            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                            showMacros ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                          )}
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Macros
                        </button>
                        
                        {showMacros && (
                          <div className="absolute bottom-full left-0 mb-2 w-64 rounded-xl border border-zinc-800 bg-zinc-900 p-2 shadow-2xl z-50">
                            <div className="mb-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                              Available Macros
                            </div>
                            <div className="max-h-48 overflow-y-auto space-y-1">
                              {templates.length > 0 ? templates.map(t => (
                                <button
                                  key={t.id}
                                  onClick={() => applyTemplate(t)}
                                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                >
                                  {t.name}
                                </button>
                              )) : (
                                <div className="px-3 py-4 text-center text-xs text-zinc-500">
                                  No macros found. Create them in Templates.
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Button size="sm" disabled={!replyText.trim() || isSubmitting} isLoading={isSubmitting} onClick={handleReply}>
                    <Send className="h-4 w-4" />
                    {isInternal ? "Add Note" : "Send Reply"}
                  </Button>
                </div>
              </div>
            </div>
        ) : (
          <div className="border-t border-zinc-800 bg-zinc-950/30 p-8">
            {csat ? (
              <div className="max-w-md mx-auto text-center space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 mb-4">
                  <Heart className="h-8 w-8 text-teal-400 fill-teal-400" />
                </div>
                <h3 className="text-2xl font-bold">Feedback Received!</h3>
                <p className="text-zinc-500">
                  Thank you for rating your experience. Your feedback helps us improve our service.
                </p>
                <div className="flex justify-center gap-1 mt-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "h-6 w-6", 
                        i <= csat.rating ? "text-amber-400 fill-amber-400" : "text-zinc-800"
                      )} 
                    />
                  ))}
                </div>
                {csat.comment && (
                  <div className="mt-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 italic text-zinc-400 text-sm">
                    "{csat.comment}"
                  </div>
                )}
              </div>
            ) : userRole === "CLIENT" ? (
              <div className="max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">How did we do?</h3>
                  <p className="text-zinc-500 text-sm">Your feedback is incredibly valuable to us.</p>
                </div>

                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      onMouseEnter={() => setHoverRating(i)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(i)}
                      className="transition-transform active:scale-90"
                    >
                      <Star 
                        className={cn(
                          "h-10 w-10 transition-colors",
                          i <= (hoverRating || rating) ? "text-amber-400 fill-amber-400" : "text-zinc-800 hover:text-amber-400/50"
                        )}
                      />
                    </button>
                  ))}
                </div>

                {rating > 0 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Textarea
                      placeholder="Any additional thoughts? (Optional)"
                      value={csatComment}
                      onChange={(e) => setCsatComment(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 focus:ring-teal-500 px-4 py-3 min-h-[100px]"
                    />
                    <Button 
                      onClick={handleCSATSubmit} 
                      className="w-full h-12 bg-teal-500 hover:bg-teal-600 font-bold"
                      isLoading={isSubmittingCSAT}
                    >
                      Submit Rating
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-6">
                <p className="text-sm text-zinc-500 italic">This ticket is closed. No further replies can be sent.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-80 shrink-0 overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-4">
        <div className="space-y-6">
          {/* Requester */}
          <Card variant="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Requester</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar
                  src={mockTicket.creator.avatar}
                  name={mockTicket.creator.name}
                  size="md"
                />
                <div>
                  <p className="font-medium text-white">
                    {mockTicket.creator.name}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {mockTicket.creator.company}
                  </p>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-zinc-400">{mockTicket.creator.email}</p>
                <a
                  href="#"
                  className="flex items-center gap-1 text-teal-400 hover:underline"
                >
                  View profile <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Properties */}
          <Card variant="glass" className="relative z-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Properties</CardTitle>
            </CardHeader>
            <CardContent className={cn("space-y-4", isClosed && "pointer-events-none opacity-60")}>
              <div className={isUpdatingStatus ? "opacity-50 pointer-events-none" : ""}>
                <label className="text-xs text-zinc-500">Status</label>
                <Select
                  value={mockTicket.status}
                  onChange={handleStatusChange}
                  options={[
                    { value: "OPEN", label: "Open" },
                    { value: "PENDING", label: "Pending" },
                    { value: "ON_HOLD", label: "On Hold" },
                    { value: "SOLVED", label: "Solved" },
                  ]}
                  className="mt-1"
                />
              </div>
               <div className={isUpdatingPriority ? "opacity-50 pointer-events-none" : ""}>
                <label className="text-xs text-zinc-500">Priority</label>
                <Select
                  value={mockTicket.priority}
                  onChange={handlePriorityChange}
                  options={[
                    { value: "LOW", label: "Low" },
                    { value: "MEDIUM", label: "Medium" },
                    { value: "HIGH", label: "High" },
                    { value: "URGENT", label: "Urgent" },
                  ]}
                  className="mt-1"
                />
              </div>

              {/* SLA Section */}
              {mockTicket.dueAt && !isClosed && (
                <div className="rounded-xl bg-teal-500/5 border border-teal-500/10 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                      {mockTicket.slaRule?.name || "SLA Milestone"}
                    </span>
                    <Clock className="h-3 w-3 text-teal-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold text-white tabular-nums">
                      {new Date(mockTicket.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <Badge variant={new Date(mockTicket.dueAt) < new Date() ? "danger" : "secondary"} className="text-[10px] py-0">
                      {new Date(mockTicket.dueAt) < new Date() ? "Breached" : "Due Soon"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[10px] text-teal-500/60 font-medium">
                    {mockTicket.firstResponseAt ? "Resolution Time" : "First Response Time"} ({mockTicket.priority} Priority)
                  </p>
                </div>
              )}
              <div>
                <label className="text-xs text-zinc-500">Assignee</label>
                <div className="mt-1">
                  {isManagement ? (
                    <Select
                      value={mockTicket.assigneeId || ""}
                      onChange={handleAssignTicket}
                      placeholder="Select agent..."
                      options={[
                        { value: "", label: "Unassigned", icon: <User className="h-4 w-4 opacity-50" /> },
                        ...agents.map((agent: any) => ({
                          value: agent.id,
                          label: agent.name || agent.email,
                          icon: (
                            <Avatar
                              src={agent.image || agent.avatar}
                              name={agent.name || "Agent"}
                              size="xs"
                              className="mr-1"
                            />
                          )
                        }))
                      ]}
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      {mockTicket.assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={mockTicket.assignee.avatar}
                            name={mockTicket.assignee.name}
                            size="sm"
                          />
                          <span className="text-sm text-zinc-300">
                            {mockTicket.assignee.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-zinc-500">Unassigned</span>
                          {/* Agents can still claim for themselves even if not management */}
                          {userRole === "AGENT" && (
                            <Button onClick={handleClaimTicket} variant="outline" size="sm" className="h-7 text-xs px-2 ml-2">
                              Claim
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500">Team</label>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: mockTicket.team.color }}
                  />
                  <span className="text-sm text-zinc-300">
                    {mockTicket.team.name}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card variant="glass" className="relative z-10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 relative">
                {selectedTagObjects.map((tag: any) => (
                  <span
                    key={tag.id}
                    className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs text-white"
                    style={{ backgroundColor: tag.color || "#3f3f46" }}
                  >
                    {tag.name}
                    <button 
                      onClick={() => handleToggleTag(tag)}
                      disabled={isUpdatingTags}
                      className="ml-1 rounded-full p-0.5 hover:bg-black/20 disabled:opacity-50"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                
                <div className="relative">
                  <button 
                    onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                    disabled={isUpdatingTags}
                    className="rounded-full border border-dashed border-zinc-700 px-2.5 py-1 text-xs text-zinc-500 transition-colors hover:border-zinc-600 hover:text-zinc-400 disabled:opacity-50"
                  >
                    <Plus className="h-3 w-3 inline mr-1" /> Add
                  </button>

                  {isTagDropdownOpen && (
                    <div className="absolute left-0 top-full z-10 mt-2 w-48 rounded-lg border border-zinc-800 bg-zinc-950 p-2 shadow-xl">
                      <div className="mb-2 px-2 text-xs font-medium text-zinc-500">Available Tags</div>
                      {availableTags.length === 0 ? (
                        <div className="px-2 py-1 text-xs text-zinc-500">No tags available</div>
                      ) : (
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {availableTags.map((tag) => {
                            const isSelected = selectedTagObjects.some((t: any) => t.id === tag.id);
                            return (
                              <button
                                key={tag.id}
                                onClick={() => handleToggleTag(tag)}
                                className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-zinc-800"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />
                                  <span className="text-zinc-300">{tag.name}</span>
                                </div>
                                {isSelected && <Check className="h-3 w-3 text-teal-500" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>



          {/* SLA - Only show if implemented, for now hide or show empty */}
          <Card variant="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">SLA Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-zinc-500 italic">No SLA policy applied</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}



