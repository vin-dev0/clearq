"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  Search,
  Send,
  Plus,
  Hash,
  Users,
  MessageSquare,
  Settings,
  MoreHorizontal,
  Smile,
  Paperclip,
  AtSign,
  Bell,
  BellOff,
  Pin,
  UserPlus,
  AlertCircle,
} from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  role: string;
  department: string | null;
  lastLoginAt: string | null;
}

interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
  type: string;
  messages: { content: string; createdAt: string }[];
  members: { userId: string }[];
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isEdited: boolean;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  attachmentSize?: number;
}

export default function MessagingClient() {
  const { data: session, status } = useSession();
  const [chatRooms, setChatRooms] = React.useState<ChatRoom[]>([]);
  const [teamMembers, setTeamMembers] = React.useState<User[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [selectedRoom, setSelectedRoom] = React.useState<ChatRoom | null>(null);
  const [selectedDM, setSelectedDM] = React.useState<User | null>(null);
  const [messageInput, setMessageInput] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [createRoomOpen, setCreateRoomOpen] = React.useState(false);
  const [addPersonOpen, setAddPersonOpen] = React.useState(false);
  const [newRoomName, setNewRoomName] = React.useState("");
  const [newRoomDescription, setNewRoomDescription] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [pendingAttachment, setPendingAttachment] = React.useState<{
    url: string;
    name: string;
    type: string;
    size: number;
  } | null>(null);
  const [mounted, setMounted] = React.useState(false);
  
  // IMPORTANT: All hooks MUST be called before any conditional returns
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Mount effect
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch chat rooms and team members on mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, membersRes] = await Promise.all([
          fetch("/api/chat-rooms"),
          fetch("/api/team-members"),
        ]);

        if (roomsRes.ok) {
          const { chatRooms } = await roomsRes.json();
          setChatRooms(chatRooms);
          if (chatRooms.length > 0) {
            setSelectedRoom(chatRooms[0]);
          }
        }

        if (membersRes.ok) {
          const { users } = await membersRes.json();
          setTeamMembers(users);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user && mounted) {
      fetchData();
    }
  }, [session, mounted]);

  // Fetch messages when room or DM changes
  React.useEffect(() => {
    if (!mounted) return;
    
    const fetchMessages = async () => {
      if (!selectedRoom && !selectedDM) return;

      try {
        const params = selectedRoom
          ? `chatRoomId=${selectedRoom.id}`
          : `receiverId=${selectedDM?.id}`;
        
        const res = await fetch(`/api/messages?${params}`);
        if (res.ok) {
          const { messages } = await res.json();
          setMessages(messages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedRoom, selectedDM, mounted]);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Loading state - AFTER all hooks
  if (!mounted || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  // Access check
  if (session?.user && (session.user as any).role === "CLIENT") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <AlertCircle className="h-12 w-12 text-zinc-500 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Access Restricted</h2>
        <p className="text-zinc-400 max-w-md mx-auto">
          Clients do not have access to the Team Chat system. Please use the comments section on your tickets to communicate with our support team.
        </p>
        <Button 
          variant="outline" 
          className="mt-6"
          onClick={() => window.location.href = "/tickets"}
        >
          Go to My Tickets
        </Button>
      </div>
    );
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setPendingAttachment(data);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() && !pendingAttachment) return;

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: messageInput,
          chatRoomId: selectedRoom?.id,
          receiverId: selectedDM?.id,
          attachment: pendingAttachment,
        }),
      });

      if (res.ok) {
        const { message } = await res.json();
        setMessages((prev) => [...prev, message]);
        setMessageInput("");
        setPendingAttachment(null);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImageType = (type?: string) => {
    return type?.startsWith("image/");
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;

    try {
      const res = await fetch("/api/chat-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoomName,
          description: newRoomDescription,
          type: "PUBLIC",
        }),
      });

      if (res.ok) {
        const { chatRoom } = await res.json();
        setChatRooms((prev) => [chatRoom, ...prev]);
        setSelectedRoom(chatRoom);
        setSelectedDM(null);
        setCreateRoomOpen(false);
        setNewRoomName("");
        setNewRoomDescription("");
      }
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const getSenderName = (senderId: string) => {
    if (senderId === session?.user?.id) return "You";
    const sender = teamMembers.find((m) => m.id === senderId);
    return sender?.name || "Unknown";
  };

  const isOnline = (user: User) => {
    if (!user.lastLoginAt) return false;
    const lastLogin = new Date(user.lastLoginAt);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastLogin > fiveMinutesAgo;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 shrink-0 border-r border-zinc-800 flex flex-col bg-zinc-900/50">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Team Chat</h2>
            <Button size="icon-sm" variant="ghost" onClick={() => setCreateRoomOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Input
            placeholder="Search..."
            icon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-sm"
          />
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <p className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Channels
            </p>
            {chatRooms.length === 0 && !loading ? (
              <p className="px-2 text-sm text-zinc-500">No channels yet</p>
            ) : (
              chatRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => {
                    setSelectedRoom(room);
                    setSelectedDM(null);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                    selectedRoom?.id === room.id
                      ? "bg-teal-500/10 text-teal-400"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  )}
                >
                  <Hash className="h-4 w-4 shrink-0" />
                  <span className="truncate">{room.name}</span>
                  {room.messages?.[0] && (
                    <span className="ml-auto text-xs text-zinc-600">
                      {formatRelativeTime(new Date(room.messages[0].createdAt))}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Direct Messages */}
          <div className="p-3 border-t border-zinc-800">
            <p className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Direct Messages
            </p>
            {teamMembers.length === 0 && !loading ? (
              <p className="px-2 text-sm text-zinc-500">No team members</p>
            ) : (
              teamMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => {
                    setSelectedDM(member);
                    setSelectedRoom(null);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                    selectedDM?.id === member.id
                      ? "bg-teal-500/10 text-teal-400"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  )}
                >
                  <div className="relative">
                    <Avatar src={member.avatar} name={member.name || member.email} size="xs" />
                    {isOnline(member) && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-900 bg-emerald-500" />
                    )}
                  </div>
                  <span className="truncate">{member.name || member.email}</span>
                  <Badge variant="secondary" className="ml-auto text-[10px]">
                    {member.role}
                  </Badge>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-3">
          <div className="flex items-center gap-3">
            {selectedRoom ? (
              <>
                <div className="rounded-lg bg-zinc-800 p-2">
                  <Hash className="h-5 w-5 text-teal-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">{selectedRoom.name}</h2>
                  <p className="text-xs text-zinc-500">
                    {selectedRoom.members?.length || 0} members
                  </p>
                </div>
              </>
            ) : selectedDM ? (
              <>
                <Avatar src={selectedDM.avatar} name={selectedDM.name || selectedDM.email} size="md" />
                <div>
                  <h2 className="font-semibold text-white">{selectedDM.name}</h2>
                  <p className="text-xs text-zinc-500">{selectedDM.email}</p>
                </div>
              </>
            ) : (
              <p className="text-zinc-400">Select a channel or team member to start chatting</p>
            )}
          </div>
          {(selectedRoom || selectedDM) && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" onClick={() => setAddPersonOpen(true)}>
                <UserPlus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-sm">
                <Pin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="h-12 w-12 text-zinc-700 mb-4" />
              <p className="text-zinc-400">No messages yet</p>
              <p className="text-sm text-zinc-600">Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.senderId === session?.user?.id;
              const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId;

              return (
                <div key={msg.id} className={cn("flex gap-3", isMe && "flex-row-reverse")}>
                  {showAvatar ? (
                    <Avatar
                      name={getSenderName(msg.senderId)}
                      size="sm"
                      className={cn(!showAvatar && "invisible")}
                    />
                  ) : (
                    <div className="w-8" />
                  )}
                  <div className={cn("max-w-lg", isMe && "text-right")}>
                    {showAvatar && (
                      <div className={cn("flex items-center gap-2 mb-1", isMe && "flex-row-reverse")}>
                        <span className="text-sm font-medium text-white">
                          {getSenderName(msg.senderId)}
                        </span>
                        <span className="text-xs text-zinc-600">
                          {formatRelativeTime(new Date(msg.createdAt))}
                        </span>
                      </div>
                    )}
                    <div
                      className={cn(
                        "inline-block rounded-2xl px-4 py-2",
                        isMe
                          ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
                          : "bg-zinc-800 text-zinc-200"
                      )}
                    >
                      {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                      {msg.attachmentUrl && (
                        <div className={cn("mt-2", !msg.content && "mt-0")}>
                          {isImageType(msg.attachmentType) ? (
                            <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer">
                              <img 
                                src={msg.attachmentUrl} 
                                alt={msg.attachmentName || "Image"} 
                                className="max-w-xs max-h-48 rounded-lg object-cover"
                              />
                            </a>
                          ) : (
                            <a
                              href={msg.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                "flex items-center gap-2 p-2 rounded-lg transition-colors",
                                isMe ? "bg-white/10 hover:bg-white/20" : "bg-zinc-700 hover:bg-zinc-600"
                              )}
                            >
                              <Paperclip className="h-4 w-4 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{msg.attachmentName}</p>
                                <p className={cn("text-xs", isMe ? "text-white/70" : "text-zinc-400")}>
                                  {msg.attachmentSize && formatFileSize(msg.attachmentSize)}
                                </p>
                              </div>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {(selectedRoom || selectedDM) && (
          <div className="border-t border-zinc-800 p-4">
            {/* Pending Attachment Preview */}
            {pendingAttachment && (
              <div className="mb-3 flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                {isImageType(pendingAttachment.type) ? (
                  <img 
                    src={pendingAttachment.url} 
                    alt={pendingAttachment.name} 
                    className="h-12 w-12 rounded object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded bg-zinc-700 flex items-center justify-center">
                    <Paperclip className="h-5 w-5 text-zinc-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{pendingAttachment.name}</p>
                  <p className="text-xs text-zinc-500">{formatFileSize(pendingAttachment.size)}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon-sm" 
                  onClick={() => setPendingAttachment(null)}
                  className="text-zinc-400 hover:text-rose-400"
                >
                  ×
                </Button>
              </div>
            )}
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
              />
              <Button 
                variant="ghost" 
                size="icon-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <div className="h-5 w-5 border-2 border-zinc-500 border-t-teal-500 rounded-full animate-spin" />
                ) : (
                  <Paperclip className="h-5 w-5" />
                )}
              </Button>
              <div className="flex-1 relative">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={`Message ${selectedRoom ? `#${selectedRoom.name}` : selectedDM?.name || ""}`}
                  className="pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button className="p-1 text-zinc-500 hover:text-white">
                    <AtSign className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-zinc-500 hover:text-white">
                    <Smile className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <Button onClick={handleSendMessage} disabled={!messageInput.trim() && !pendingAttachment}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      <Modal isOpen={createRoomOpen} onClose={() => setCreateRoomOpen(false)} size="md">
        <ModalHeader onClose={() => setCreateRoomOpen(false)}>
          Create Channel
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Channel Name
              </label>
              <Input
                placeholder="e.g., general, engineering, support"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                icon={<Hash className="h-4 w-4" />}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Description (optional)
              </label>
              <Input
                placeholder="What's this channel about?"
                value={newRoomDescription}
                onChange={(e) => setNewRoomDescription(e.target.value)}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCreateRoomOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateRoom} disabled={!newRoomName.trim()}>
            <Plus className="h-4 w-4" />
            Create Channel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Add Person Modal */}
      <Modal isOpen={addPersonOpen} onClose={() => setAddPersonOpen(false)} size="md">
        <ModalHeader onClose={() => setAddPersonOpen(false)}>
          Start a Conversation
        </ModalHeader>
        <ModalBody>
          <div className="space-y-2">
            <p className="text-sm text-zinc-400 mb-4">
              Select a team member to start a direct message conversation.
            </p>
            {teamMembers.length === 0 ? (
              <p className="text-center text-zinc-500 py-4">No team members available</p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-1">
                {teamMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => {
                      setSelectedDM(member);
                      setSelectedRoom(null);
                      setAddPersonOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-zinc-800"
                  >
                    <Avatar src={member.avatar} name={member.name || member.email} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {member.name || member.email}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">{member.email}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {member.role}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setAddPersonOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

