"use client";

import * as React from "react";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  MoreHorizontal,
  Users,
  Ticket,
  Clock,
  Settings,
  X,
} from "lucide-react";

import { updateUserProfile } from "@/lib/actions/users";
import { createTeam, inviteAgent, getPendingInvites, revokeInvite, removeUserFromTeam } from "@/lib/actions/teams";
import { useRouter } from "next/navigation";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

interface TeamsClientProps {
  initialTeams: any[];
  initialAgents: any[];
  canManage?: boolean;
}

export default function TeamsClient({ 
  initialTeams = [], 
  initialAgents = [],
  canManage = false
}: TeamsClientProps) {
  const router = useRouter();
  const [editingAgent, setEditingAgent] = React.useState<any>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [createTeamModalOpen, setCreateTeamModalOpen] = React.useState(false);
  const [inviteAgentModalOpen, setInviteAgentModalOpen] = React.useState(false);
  
  const [newTeam, setNewTeam] = React.useState({ name: "", description: "", color: "#6366f1" });
  const [newInvite, setNewInvite] = React.useState({ email: "", role: "AGENT" });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [lastInviteCode, setLastInviteCode] = React.useState<string | null>(null);
  const [pendingInvites, setPendingInvites] = React.useState<any[]>([]);
  const [loadingInvites, setLoadingInvites] = React.useState(false);

  // Stats calculate
  const mappedTeams = initialTeams.map(team => ({
    id: team.id,
    name: team.name,
    description: team.description,
    color: team.color,
    members: team.members.map((tm: any) => ({
      id: tm.user.id,
      name: tm.user.name || tm.user.email,
      avatar: tm.user.avatar,
      role: tm.role
    })),
    stats: { tickets: team._count?.tickets || 0, avgResponse: "N/A", resolved: 0 } // Mocked stats for now
  }));

  const handleEditClick = (agent: any) => {
    setEditingAgent({
      id: agent.id,
      name: agent.name || "",
      avatar: agent.avatar || ""
    });
  };

  // Fetch pending invites
  const fetchInvites = React.useCallback(async () => {
    setLoadingInvites(true);
    try {
      const invites = await getPendingInvites();
      setPendingInvites(invites);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInvites(false);
    }
  }, []);

  React.useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2MB");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { 
        method: "POST", 
        body: formData,
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setEditingAgent((prev: any) => ({ ...prev, avatar: data.url }));
    } catch (err) {
      alert("Failed to upload image");
    }
  };

  const handleSaveProfile = async () => {
    if (!editingAgent) return;
    setIsUploading(true);
    try {
      await updateUserProfile(editingAgent.id, {
        name: editingAgent.name,
        avatar: editingAgent.avatar
      });
      setEditingAgent(null);
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Error saving profile");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeam.name) return;
    setIsSubmitting(true);
    try {
      await createTeam(newTeam);
      setCreateTeamModalOpen(false);
      setNewTeam({ name: "", description: "", color: "#6366f1" });
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Error creating team");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteAgent = async () => {
    if (!newInvite.email) return;
    setIsSubmitting(true);
    try {
      const res = await inviteAgent(newInvite);
      setLastInviteCode(res.code);
      setNewInvite({ email: "", role: "AGENT" });
      router.refresh();
      fetchInvites();
    } catch (e) {
      console.error(e);
      alert("Error inviting agent");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeInvite = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this invitation?")) return;
    try {
      await revokeInvite(id);
      fetchInvites();
    } catch (e) {
      console.error(e);
      alert("Error revoking invite");
    }
  };

  const handleRemoveFromTeam = async (teamId: string, userId: string) => {
    if (!confirm("Are you sure you want to remove this user from the team?")) return;
    try {
      await removeUserFromTeam(teamId, userId);
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Error removing user from team");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Teams & Agents</h1>
          <p className="text-zinc-400">
            Manage your support teams and agent assignments
          </p>
        </div>
        {canManage && (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setInviteAgentModalOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              <Users className="h-4 w-4" />
              Invite Agent
            </button>
            <Button onClick={() => setCreateTeamModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Team
            </Button>
          </div>
        )}
      </div>

      {/* Teams Grid */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-white">Teams</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {mappedTeams.map((team) => (
            <Card key={team.id} hover>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-lg"
                      style={{ backgroundColor: team.color + "20" }}
                    >
                      <div
                        className="flex h-full w-full items-center justify-center rounded-lg"
                        style={{ backgroundColor: team.color }}
                      >
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{team.name}</h3>
                      <p className="text-sm text-zinc-400">{team.description}</p>
                    </div>
                  </div>
                  <button className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-zinc-300">Team Members ({team.members.length})</span>
                    <AvatarGroup avatars={team.members} max={4} size="xs" />
                  </div>
                  {canManage && (
                    <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                      {team.members.map((member: any) => (
                        <div key={member.id} className="flex items-center justify-between group rounded px-2 py-1 hover:bg-zinc-800/50">
                          <div className="flex items-center gap-2">
                            <Avatar src={member.avatar} name={member.name} size="xs" />
                            <span className="text-xs text-zinc-400 truncate max-w-[120px]">{member.name}</span>
                          </div>
                          <button 
                            onClick={() => handleRemoveFromTeam(team.id, member.id)}
                            className="hidden group-hover:block text-zinc-500 hover:text-rose-400"
                            title="Remove from team"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4 border-t border-zinc-800 pt-4">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-white">
                      {team.stats.tickets}
                    </p>
                    <p className="text-xs text-zinc-500">Open Tickets</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-teal-400">
                      {team.stats.avgResponse}
                    </p>
                    <p className="text-xs text-zinc-500">Avg Response</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-emerald-400">
                      {team.stats.resolved}%
                    </p>
                    <p className="text-xs text-zinc-500">Resolved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pending Invitations (NEW) */}
      {pendingInvites.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-white">Pending Invitations</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {pendingInvites.map((invite) => (
              <Card key={invite.id} className="relative overflow-hidden border-teal-500/20 bg-teal-500/5">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono font-bold text-teal-400 tracking-wider">
                        {invite.code}
                      </p>
                      <p className="mt-1 text-sm text-zinc-300">{invite.email || "Anyone with code"}</p>
                      <p className="mt-2 text-xs text-zinc-500">
                        Expires: {invite.expiresAt ? new Date(invite.expiresAt).toLocaleDateString() : "Never"}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleRevokeInvite(invite.id)}
                      className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-rose-400"
                      title="Revoke Invite"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Agents */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">All Agents</h2>
          <Input
            placeholder="Search agents..."
            icon={<Search className="h-4 w-4" />}
            className="w-64"
          />
        </div>
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Open Tickets
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {initialAgents.map((agent: any, i: number) => (
                  <tr key={i} className="hover:bg-zinc-800/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={agent.avatar}
                          name={agent.name || agent.email}
                          size="sm"
                          status={agent.isActive ? "online" : "offline"}
                        />
                        <div>
                          <p className="font-medium text-white">{agent.name || agent.email}</p>
                          <p className="text-sm text-zinc-400">{agent.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">{agent.department || "No Department"}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={agent.isActive ? "success" : "default"}
                        dot
                      >
                        {agent.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-300">{agent._count?.assignedTickets || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleEditClick(agent)} 
                        className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Agent Modal */}
      {editingAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
              <button
                onClick={() => setEditingAgent(null)}
                className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Display Name</label>
                <Input 
                  value={editingAgent.name} 
                  onChange={(e) => setEditingAgent((prev: any) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Avatar</label>
                <div className="flex items-center gap-4">
                  <Avatar name={editingAgent.name} src={editingAgent.avatar} size="lg" />
                  <div className="space-y-1">
                    <Input 
                      type="file" 
                      accept="image/*" 
                      className="max-w-[200px]"
                      onChange={handleFileChange}
                    />
                    <p className="text-xs text-zinc-500">Upload a square image (max 2MB)</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditingAgent(null)}>
                  Cancel
                </Button>
                <Button isLoading={isUploading} onClick={handleSaveProfile}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      <Modal isOpen={createTeamModalOpen} onClose={() => setCreateTeamModalOpen(false)}>
        <ModalHeader onClose={() => setCreateTeamModalOpen(false)}>Create New Team</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">Team Name</label>
              <Input 
                placeholder="e.g., Engineering Support" 
                value={newTeam.name}
                onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">Description</label>
              <Input 
                placeholder="What does this team handle?" 
                value={newTeam.description}
                onChange={(e) => setNewTeam(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">Brand Color</label>
              <div className="flex flex-wrap gap-2">
                {["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6"].map(c => (
                  <button
                    key={c}
                    onClick={() => setNewTeam(prev => ({ ...prev, color: c }))}
                    className={cn(
                      "h-8 w-8 rounded-full border-2 transition-all",
                      newTeam.color === c ? "border-white scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCreateTeamModalOpen(false)}>Cancel</Button>
          <Button isLoading={isSubmitting} onClick={handleCreateTeam}>Create Team</Button>
        </ModalFooter>
      </Modal>

      {/* Invite Agent Modal */}
      <Modal isOpen={inviteAgentModalOpen} onClose={() => { setInviteAgentModalOpen(false); setLastInviteCode(null); }}>
        <ModalHeader onClose={() => { setInviteAgentModalOpen(false); setLastInviteCode(null); }}>
          Invite Support Agent
        </ModalHeader>
        <ModalBody>
          {lastInviteCode ? (
            <div className="rounded-lg bg-teal-500/10 p-4 text-center">
              <p className="text-sm text-teal-400">Invite Code Generated!</p>
              <p className="mt-2 text-2xl font-mono font-bold text-white tracking-widest">{lastInviteCode}</p>
              <p className="mt-2 text-xs text-zinc-500">Share this code with the agent to join your team.</p>
              <Button className="mt-4 w-full" variant="outline" onClick={() => { setInviteAgentModalOpen(false); setLastInviteCode(null); }}>
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Email Address</label>
                <Input 
                  type="email" 
                  placeholder="agent@company.com" 
                  value={newInvite.email}
                  onChange={(e) => setNewInvite(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Initial Role</label>
                <select 
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white"
                  value={newInvite.role}
                  onChange={(e) => setNewInvite(prev => ({ ...prev, role: e.target.value }))}
                >
                  <option value="AGENT">Agent</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {!lastInviteCode && (
            <>
              <Button variant="outline" onClick={() => setInviteAgentModalOpen(false)}>Cancel</Button>
              <Button isLoading={isSubmitting} onClick={handleInviteAgent}>Send Invitation</Button>
            </>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
}



