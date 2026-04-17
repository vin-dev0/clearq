"use client";

import * as React from "react";
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Shield,
  Ban,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Download,
  RefreshCw,
  Bell,
  Trash2,
  KeyRound,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Types for user data
interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

interface PendingInvite {
  id: string;
  code: string;
  email: string | null;
  targetRole: string;
  createdAt: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [pendingInvites, setPendingInvites] = React.useState<PendingInvite[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<string>("all");
  const [pendingCount, setPendingCount] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [resetModal, setResetModal] = React.useState<{ isOpen: boolean; password?: string; name?: string }>({
    isOpen: false,
  });

  // Fetch data on mount
  React.useEffect(() => {
    fetchUsers();
    fetchPendingInvites();
    fetchPendingCount();
  }, []);

  const fetchPendingInvites = async () => {
    try {
      const res = await fetch("/api/invite-codes");
      if (res.ok) {
        const data = await res.json();
        // Filter for staff roles
        const staffInvites = (data.inviteCodes || []).filter((inv: any) => 
          inv.targetRole !== "CLIENT" && inv.currentUses < inv.maxUses
        );
        setPendingInvites(staffInvites);
      }
    } catch (err) {
      console.error("Failed to fetch pending invites", err);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const res = await fetch("/api/join-requests?status=PENDING");
      if (res.ok) {
        const data = await res.json();
        setPendingCount(data.joinRequests?.length || 0);
      }
    } catch (err) {
      console.error("Failed to fetch pending count", err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError("Failed to load users. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error(err);
      alert("Failed to update user role");
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error(err);
      alert("Failed to update user status");
    }
  };

  const deleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete ${user.name || user.email}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user");
      }
      
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  const resetPassword = async (user: User) => {
    if (!confirm(`Are you sure you want to reset the password for ${user.name || user.email}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}/reset-password`, {
        method: "POST",
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reset password");
      }
      
      const data = await res.json();
      setResetModal({
        isOpen: true,
        password: data.password,
        name: data.name,
      });
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  // Filter users based on search and role
  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesRole = (selectedRole === "all" ? user.role !== "CLIENT" : user.role === selectedRole);
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedRole]);

  const roleColors: Record<string, string> = {
    ADMIN: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    SUPERVISOR: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    AGENT: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    CLIENT: "bg-zinc-700/50 text-zinc-300 border-zinc-600",
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-zinc-400 mt-1">
            View and manage all users in your organization.
          </p>
          {pendingCount > 0 && (
            <Link href="/admin/invites?tab=requests">
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors">
                <Bell className="h-4 w-4" />
                {pendingCount} pending member {pendingCount === 1 ? 'approval' : 'approvals'}
              </div>
            </Link>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchUsers}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Link href="/admin/invites">
            <Button>
              <UserPlus className="h-4 w-4" />
              Invite User
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by name or email..."
            icon={<Search className="h-5 w-5" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-300 focus:outline-none focus:border-teal-500"
        >
          <option value="all">All Staff</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPERVISOR">Supervisor</option>
          <option value="AGENT">Agent</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {["ADMIN", "SUPERVISOR", "AGENT"].map((role) => (
          <div
            key={role}
            className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4"
          >
            <p className="text-2xl font-bold text-white">
              {users.filter((u) => u.role === role).length}
            </p>
            <p className="text-zinc-500 text-sm">{role.charAt(0) + role.slice(1).toLowerCase()}s</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="h-8 w-8 text-teal-500 animate-spin mx-auto" />
            <p className="text-zinc-400 mt-4">Loading users...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-rose-400">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchUsers}>
              Try Again
            </Button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-zinc-600 mx-auto" />
            <p className="text-zinc-400 mt-4">No users found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">User</th>
                <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Role</th>
                <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Status</th>
                <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Joined</th>
                <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Last Login</th>
                <th className="text-right py-3 px-4 text-zinc-400 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-medium">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name || "No name"}</p>
                        <p className="text-zinc-500 text-sm">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded border ${roleColors[user.role]} bg-transparent cursor-pointer focus:outline-none`}
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="SUPERVISOR">Supervisor</option>
                      <option value="AGENT">Agent</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    {user.isActive ? (
                      <span className="flex items-center gap-1 text-emerald-400 text-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-zinc-500 text-sm">
                        <Ban className="h-4 w-4" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-zinc-400 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-zinc-500 text-sm">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                        onClick={() => resetPassword(user)}
                      >
                        <KeyRound className="h-4 w-4" />
                        Reset
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                        onClick={() => deleteUser(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleUserStatus(user.id, user.isActive)}
                      >
                        {user.isActive ? (
                          <>
                            <Ban className="h-4 w-4" />
                            Disable
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Enable
                          </>
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Pending Invites Section */}
              {pendingInvites.length > 0 && selectedRole === "all" && (
                <>
                  <tr className="bg-zinc-800/30 border-y border-zinc-800">
                    <td colSpan={6} className="py-2 px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Pending Team Invites
                    </td>
                  </tr>
                  {pendingInvites.map((invite) => (
                    <tr key={invite.id} className="border-b border-zinc-800 last:border-0 opacity-70 hover:opacity-100 transition-opacity">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500">
                            <Mail className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-zinc-300 font-medium italic">Invitation Sent</p>
                            <p className="text-zinc-500 text-sm">{invite.email || "Anyone with link"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded border ${roleColors[invite.targetRole]} opacity-70`}>
                          {invite.targetRole}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-zinc-500 text-sm">
                          <Clock className="h-4 w-4" />
                          Pending
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-500 text-sm">
                        {new Date(invite.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-zinc-500 text-sm">
                        —
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href="/admin/invites">
                          <Button variant="ghost" size="sm" className="text-zinc-400">
                            Manage
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-zinc-500 text-sm">
          Showing {filteredUsers.length} of {users.length} users
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Password Reset Modal */}
      {resetModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="mx-auto rounded-full bg-amber-500/20 p-4 w-16 h-16 flex items-center justify-center mb-4">
              <KeyRound className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-white">{resetModal.name}&apos;s password reset!</h3>
            <p className="text-zinc-400 mt-2 text-sm">
              Please provide this temporary password to the user. They should change it upon login.
            </p>
            
            <div className="mt-6 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700 font-mono text-xl text-teal-400 break-all select-all">
              {resetModal.password}
            </div>

            <Button 
              className="mt-8 w-full"
              onClick={() => setResetModal({ isOpen: false })}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

