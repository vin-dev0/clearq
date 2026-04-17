"use client";

import * as React from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDateTime, formatRelativeTime } from "@/lib/utils";
import { ArrowLeft, Send, CheckCircle2, FileIcon, Download, Star, Heart } from "lucide-react";
import { addComment } from "@/lib/actions/comments";
import { submitCSAT, getTicketCSAT } from "@/lib/actions/csat";
import { useRouter } from "next/navigation";

export default function ClientTicketDetail({ initialTicket }: { initialTicket: any }) {
  const router = useRouter();
  const [replyText, setReplyText] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isClosed = initialTicket.status === "SOLVED" || initialTicket.status === "CLOSED";

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

  // Filter out internal comments for the client
  const publicComments = initialTicket.comments?.filter((c: any) => !c.isInternal) || [];

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      await addComment({ ticketId: initialTicket.id, content: replyText, isInternal: false });
      setReplyText("");
      router.refresh(); // Refresh page to see new comment
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-6 pt-2">
        <div className="flex items-center gap-4">
          <Link
            href="/client"
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-zinc-500">
                #{initialTicket.number}
              </span>
              <Badge variant="success" dot>
                {initialTicket.status}
              </Badge>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-white">
              {initialTicket.subject}
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Discussion Thread */}
        <div className="lg:col-span-2 space-y-6">
          {isClosed && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-rose-500" />
              <div>
                <p className="text-sm font-medium text-rose-400">This request is resolved</p>
                <p className="text-xs text-rose-500/80">No further replies can be sent. Please create a new ticket if you need additional help.</p>
              </div>
            </div>
          )}
          {/* Original Message */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-lg shadow-black/20">
            <div className="flex items-start gap-4">
              <Avatar
                src={initialTicket.creator.avatar}
                name={initialTicket.creator.name}
                size="md"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-white">
                      {initialTicket.creator.name}
                    </span>
                  </div>
                  <span className="text-sm text-zinc-500">
                    {formatDateTime(initialTicket.createdAt)}
                  </span>
                </div>
                <div className="mt-4 whitespace-pre-wrap text-zinc-300">
                  {initialTicket.description}
                </div>

                {initialTicket.attachments && initialTicket.attachments.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-zinc-800">
                    <h4 className="text-sm font-medium text-white mb-3">Attachments</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {initialTicket.attachments.map((att: any) => (
                        <AttachmentItem key={att.id} attachment={att} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-4">
            {publicComments.map((comment: any) => (
              <div
                key={comment.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
              >
                <div className="flex items-start gap-4">
                  <Avatar
                    src={comment.author.avatar}
                    name={comment.author.name}
                    size="md"
                    className={
                      comment.author.role === "CLIENT" ? "" : "ring-2 ring-teal-500/50"
                    }
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                          {comment.author.name}
                        </span>
                        {comment.author.role !== "CLIENT" && (
                          <Badge variant="success" className="bg-teal-500/10 text-teal-400">
                            Support Team
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-zinc-500">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <div className="mt-2 whitespace-pre-wrap text-zinc-300">
                      {comment.content}
                    </div>

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

          {/* Reply Box */}
          {!isClosed ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-xl">
               <Textarea
                placeholder="Type your reply to the support team..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="resize-none border-0 bg-transparent p-2 focus-visible:ring-0"
                rows={4}
              />
              <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4">
                <span className="text-xs text-zinc-500">Your replies are sent directly to your assigned agent.</span>
                <Button onClick={handleReply} disabled={!replyText.trim() || isSubmitting} isLoading={isSubmitting} className="bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/20">
                  <Send className="mr-2 h-4 w-4" />
                  Send Reply
                </Button>
              </div>
            </div>
          ) : (
             <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8">
                {csat ? (
                  <div className="max-w-md mx-auto text-center space-y-4 animate-in fade-in zoom-in duration-500">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 mb-4">
                      <Heart className="h-8 w-8 text-teal-400 fill-teal-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Feedback Received!</h3>
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
                ) : (
                  <div className="max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-white mb-2">How did we do?</h3>
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
                          className="bg-zinc-900 border-zinc-800 focus:ring-teal-500 px-4 py-3 min-h-[100px] text-zinc-300"
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
                    
                    <div className="pt-8 border-t border-zinc-800/50 text-center">
                      <p className="text-zinc-500 italic text-sm mb-4">This ticket has been permanently closed.</p>
                      <Link href="/client/new">
                        <Button variant="outline" className="border-zinc-800 hover:bg-zinc-800">
                          Create New Ticket
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
             </div>
          )}
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-6">
            <h3 className="font-medium text-white mb-4">Request Status</h3>
            <div className="space-y-4">
               <div>
                  <p className="text-sm text-zinc-500">Status</p>
                  <Badge variant="success" className="mt-1">{initialTicket.status.replace("_", " ")}</Badge>
               </div>
               <div>
                  <p className="text-sm text-zinc-500">Priority</p>
                  <p className="text-sm font-medium text-zinc-300 mt-1">{initialTicket.priority.replace("_", " ")}</p>
               </div>
               {initialTicket.assignee && (
                 <div>
                    <p className="text-sm text-zinc-500">Assigned To</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar src={initialTicket.assignee.avatar} name={initialTicket.assignee.name} size="sm" />
                      <p className="text-sm font-medium text-white">{initialTicket.assignee.name}</p>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
        "flex items-center justify-center rounded bg-zinc-800 text-zinc-400 group-hover:text-teal-400 font-mono text-[10px]",
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
      <Download className={cn("text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100", size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
    </a>
  );
}
