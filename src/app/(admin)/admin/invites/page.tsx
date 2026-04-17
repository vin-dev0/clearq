"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import {
  Key,
  Plus,
  Copy,
  Check,
  Mail,
  Users,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  UserCheck,
  UserX,
  Link2,
  Shield,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";

interface InviteCode {
  id: string;
  code: string;
  email: string | null;
  plan: string;
  type: string;
  usedBy: string | null;
  usedAt: string | null;
  expiresAt: string | null;
  maxUses: number;
  currentUses: number;
  createdAt: string;
  notes: string | null;
}

interface JoinRequest {
  id: string;
  userId: string;
  status: string;
  message: string | null;
  createdAt: string;
  user?: { id: string; name: string | null; email: string };
}

export default function InvitesPage() {
  const { data: session, status } = useSession();
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "ADMIN";
  const isSupervisor = userRole === "SUPERVISOR";

  const [activeTab, setActiveTab] = React.useState<"invites" | "requests">("invites");
  const [inviteCodes, setInviteCodes] = React.useState<InviteCode[]>([]);
  const [joinRequests, setJoinRequests] = React.useState<JoinRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [processingRequest, setProcessingRequest] = React.useState<string | null>(null);

  // Form state
  const [formData, setFormData] = React.useState({
    email: "",
    expiresInDays: "",
    maxUses: "1",
    notes: "",
    type: "DIRECT", 
    targetRole: "AGENT", 
  });

  // Fetch data on mount
  React.useEffect(() => {
    if (status === "authenticated" && (isAdmin || isSupervisor)) {
      fetchData();
    }
  }, [status, isAdmin, isSupervisor]);

  if (status === "loading") return null;
  if (!isAdmin && !isSupervisor) {
    redirect("/dashboard");
    return null;
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invitesRes, requestsRes] = await Promise.all([
        fetch("/api/invite-codes"),
        fetch("/api/join-requests"),
      ]);

      if (invitesRes.ok) {
        const data = await invitesRes.json();
        setInviteCodes(data.inviteCodes || []);
      }

      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setJoinRequests(data.joinRequests || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    setProcessingRequest(requestId);
    try {
      const res = await fetch("/api/join-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action: "approve" }),
      });

      if (res.ok) {
        setJoinRequests((prev) => prev.filter((r) => r.id !== requestId));
      }
    } catch (error) {
      console.error("Failed to approve request:", error);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    setProcessingRequest(requestId);
    try {
      const res = await fetch("/api/join-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action: "decline" }),
      });

      if (res.ok) {
        setJoinRequests((prev) => prev.filter((r) => r.id !== requestId));
      }
    } catch (error) {
      console.error("Failed to decline request:", error);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleCreateInvite = async (overrideData?: Partial<typeof formData>) => {
    setCreating(true);
    const dataToSubmit = { ...formData, ...overrideData };
    try {
      const res = await fetch("/api/invite-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: dataToSubmit.email || null,
          expiresInDays: dataToSubmit.expiresInDays ? parseInt(dataToSubmit.expiresInDays) : null,
          maxUses: parseInt(dataToSubmit.maxUses) || 1,
          notes: dataToSubmit.notes || null,
          type: dataToSubmit.type,
          targetRole: dataToSubmit.targetRole,
        }),
      });

      if (res.ok) {
        const newInvite = await res.json();
        setInviteCodes((prev) => [newInvite, ...prev]);
        setShowCreateModal(false);
        resetForm();
        copyInviteUrl(newInvite.code);
      }
    } catch (error) {
      console.error("Failed to create invite code:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (!window.confirm("Are you sure you want to revoke this invite? It will no longer be usable.")) return;
    
    try {
      const res = await fetch(`/api/invite-codes/${inviteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setInviteCodes((prev) => prev.filter((i) => i.id !== inviteId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to revoke invite");
      }
    } catch (error) {
      console.error("Failed to revoke invite:", error);
      alert("An error occurred while revoking the invite");
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      expiresInDays: "",
      maxUses: "1",
      notes: "",
      type: "DIRECT",
      targetRole: "AGENT",
    });
  };

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getInviteUrl = (code: string) => {
    return `${window.location.origin}/register?invite=${code}`;
  };

  const copyInviteUrl = async (code: string) => {
    await navigator.clipboard.writeText(getInviteUrl(code));
    setCopiedCode(`url-${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusBadge = (invite: InviteCode) => {
    if (invite.currentUses >= invite.maxUses) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-500/10 px-2 py-1 text-xs font-medium text-zinc-400">
          <XCircle className="h-3 w-3" />
          Used
        </span>
      );
    }
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400">
          <Clock className="h-3 w-3" />
          Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
        <CheckCircle2 className="h-3 w-3" />
        Active
      </span>
    );
  };

  const stats = {
    total: inviteCodes.length,
    active: inviteCodes.filter((i) => i.currentUses < i.maxUses && (!i.expiresAt || new Date(i.expiresAt) > new Date())).length,
    used: inviteCodes.filter((i) => i.currentUses >= i.maxUses).length,
    pendingRequests: joinRequests.length,
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Invitations</h1>
          <p className="text-zinc-400 mt-1">
            Manage team access and invitation links for your organization.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Invite
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Invites", value: stats.total, icon: Key, color: "text-teal-400" },
          { label: "Active", value: stats.active, icon: CheckCircle2, color: "text-emerald-400" },
          { label: "Used", value: stats.used, icon: Users, color: "text-sky-400" },
          { label: "Pending Requests", value: stats.pendingRequests, icon: Clock, color: "text-amber-400" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg bg-zinc-800 p-2 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-zinc-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab("invites")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "invites"
              ? "border-teal-500 text-teal-400"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Link2 className="h-4 w-4" />
          Invite Links
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "requests"
              ? "border-teal-500 text-teal-400"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Shield className="h-4 w-4" />
          Join Requests
          {stats.pendingRequests > 0 && (
            <span className="ml-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
              {stats.pendingRequests}
            </span>
          )}
        </button>
      </div>

      {/* Quick Generate */}
      {activeTab === "invites" && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-teal-500/10 p-3">
                <Sparkles className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">Generate Quick Invite</p>
                <p className="text-sm text-zinc-400">Quickly create a one-time agent invite link</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => handleCreateInvite({ targetRole: "AGENT", maxUses: "1" })} 
                disabled={creating}
                className="bg-zinc-800 hover:bg-zinc-700 text-white"
              >
                <Users className="mr-2 h-4 w-4" />
                Invite Agent
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Codes Table */}
      {activeTab === "invites" && (
        <>
          {inviteCodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 py-16">
              <Key className="h-16 w-16 text-zinc-700" />
              <h3 className="mt-6 text-lg font-semibold text-white">No invite links yet</h3>
              <p className="mt-2 text-zinc-400">Create your first invite link to add team members.</p>
              <Button onClick={() => setShowCreateModal(true)} className="mt-6">
                <Plus className="mr-2 h-4 w-4" />
                Create Invite Link
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30">
              <table className="w-full text-left">
                <thead className="border-b border-zinc-800 bg-zinc-900/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Code</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Role</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Type</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Uses</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {inviteCodes.map((invite) => (
                    <motion.tr
                      key={invite.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="rounded bg-zinc-800/80 px-2 py-1 font-mono text-sm text-teal-400">
                            {invite.code}
                          </code>
                          <button
                            onClick={() => copyToClipboard(invite.code)}
                            className="rounded p-1 text-zinc-500 hover:bg-zinc-700 hover:text-white transition-colors"
                          >
                            {copiedCode === invite.code ? (
                              <Check className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-zinc-300">{(invite as any).targetRole || "AGENT"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          invite.type === "REQUEST"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-emerald-500/10 text-emerald-400"
                        }`}>
                          {invite.type === "REQUEST" ? "Approval Required" : "Direct Access"}
                        </span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(invite)}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-300">
                          {invite.currentUses} / {invite.maxUses}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => copyInviteUrl(invite.code)}
                            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                            title="Copy invite URL"
                          >
                            {copiedCode === `url-${invite.code}` ? (
                              <Check className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleRevokeInvite(invite.id)}
                            className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Join Requests Tab */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {joinRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 py-16">
              <Shield className="h-16 w-16 text-zinc-700" />
              <h3 className="mt-6 text-lg font-semibold text-white">No pending requests</h3>
              <p className="mt-2 text-zinc-400">
                Join requests from "Approval Required" links will appear here.
              </p>
            </div>
          ) : (
            joinRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white font-bold text-lg shadow-lg shadow-teal-500/20">
                    {request.user?.name?.charAt(0) || request.user?.email?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{request.user?.name || "New Applicant"}</h4>
                    <p className="text-sm text-zinc-400">{request.user?.email}</p>
                    {request.message && (
                      <p className="mt-1 text-sm text-zinc-500 italic">"{request.message}"</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDeclineRequest(request.id)}
                    disabled={processingRequest === request.id}
                    className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-rose-400 transition-colors"
                  >
                    Decline
                  </button>
                  <Button
                    size="sm"
                    onClick={() => handleApproveRequest(request.id)}
                    disabled={processingRequest === request.id}
                    className="bg-emerald-600 hover:bg-emerald-700 h-9"
                  >
                    {processingRequest === request.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Approve
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} size="md">
        <ModalHeader onClose={() => setShowCreateModal(false)}>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-500/10 p-2 text-teal-400">
              <Plus className="h-5 w-5" />
            </div>
            Generate Invite Link
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6 py-2">
            <div>
              <label className="mb-3 block text-sm font-medium text-zinc-300">
                Invitation Strategy
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "DIRECT" })}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    formData.type === "DIRECT"
                      ? "border-teal-500 bg-teal-500/10 shadow-lg shadow-teal-500/5"
                      : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-white mb-1">
                    <UserCheck className="h-4 w-4 text-emerald-400" />
                    Direct
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Automatic Entry</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "REQUEST" })}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    formData.type === "REQUEST"
                      ? "border-teal-500 bg-teal-500/10 shadow-lg shadow-teal-500/5"
                      : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-white mb-1">
                    <Shield className="h-4 w-4 text-amber-400" />
                    Requested
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Manual Review</p>
                </button>
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-zinc-300">
                Assigned Staff Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["AGENT", "SUPERVISOR", "ADMIN", "CLIENT"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({ ...formData, targetRole: role })}
                    className={`rounded-lg py-2 text-xs font-bold transition-all ${
                      formData.targetRole === role
                        ? "bg-teal-500 text-white shadow-lg shadow-teal-500/25"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Usage Limit
                </label>
                <Input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  placeholder="1"
                  min="1"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Expires (Days)
                </label>
                <Input
                  type="number"
                  value={formData.expiresInDays}
                  onChange={(e) => setFormData({ ...formData, expiresInDays: e.target.value })}
                  placeholder="Never"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Target Email (Optional)
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@company.com"
                icon={<Mail className="h-4 w-4" />}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full gap-3">
            <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCreateInvite} disabled={creating} className="flex-1 bg-teal-600 hover:bg-teal-700">
              {creating ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Generate Link"}
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
}
