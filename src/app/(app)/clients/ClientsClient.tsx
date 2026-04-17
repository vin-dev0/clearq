"use client";

import * as React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";
import {
  Search,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  Building2,
  Ticket,
  MessageSquare,
  Filter,
  Download,
  Edit,
  Trash2,
  Users,
  CheckCircle2,
  Copy,
  Key,
  Clock,
} from "lucide-react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import Link from "next/link";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  avatar: string | null;
  status: "active" | "inactive" | "pending";
  ticketCount: number;
  lastActivity: string | Date | null;
  satisfaction: number;
  isInvite?: boolean;
  code?: string;
}

export default function ClientsClient() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [clients, setClients] = React.useState<Client[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isAdding, setIsAdding] = React.useState(false);
  const [newClient, setNewClient] = React.useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  });
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingClient, setEditingClient] = React.useState<Client | null>(null);
  const [generatedPassword, setGeneratedPassword] = React.useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [newlyCreatedClientName, setNewlyCreatedClientName] = React.useState("");

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [res, invitesRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/invite-codes")
      ]);

      if (res.ok && invitesRes.ok) {
        const data = await res.json();
        const invitesData = await invitesRes.json();
        
        const formatted = (data.clients || []).map((c: any) => ({
          id: c.id,
          name: c.name || "Unknown",
          email: c.email,
          phone: c.phone,
          company: c.department,
          avatar: null,
          status: c.isActive ? "active" : "inactive",
          ticketCount: c._count?.createdTickets || 0,
          lastActivity: c.lastLoginAt || null,
          satisfaction: 100,
        }));

        // Add pending CLIENT invites
        const pendingInvites = (invitesData.inviteCodes || [])
          .filter((inv: any) => inv.targetRole === "CLIENT" && inv.currentUses < inv.maxUses)
          .map((inv: any) => ({
            id: inv.id,
            name: "Pending Invitee",
            email: inv.email || "Anyone with link",
            phone: null,
            company: inv.notes || "Invited Client",
            avatar: null,
            status: "pending",
            ticketCount: 0,
            lastActivity: inv.createdAt,
            satisfaction: 0,
            isInvite: true,
            code: inv.code,
          }));

        setClients([...formatted, ...pendingInvites]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.email) return;
    setIsAdding(true);
    
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add client");

      const c = data.client;
      const client: Client = {
        id: c.id,
        name: c.name || "Unknown",
        email: c.email,
        phone: c.phone,
        company: c.department,
        avatar: null,
        status: c.isActive ? "active" : "inactive",
        ticketCount: c._count?.createdTickets || 0,
        lastActivity: c.lastLoginAt || null,
        satisfaction: 100,
      };
      
      setClients([client, ...clients]);
      setIsAddModalOpen(false);
      setNewClient({ name: "", email: "", phone: "", company: "" });
      setGeneratedPassword(data.password);
      setNewlyCreatedClientName(client.name);
      setIsPasswordModalOpen(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingClient || !editingClient.name || !editingClient.email) return;
    setIsEditing(true);

    try {
      const res = await fetch(`/api/clients/${editingClient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingClient.name,
          email: editingClient.email,
          phone: editingClient.phone,
          company: editingClient.company,
        }),
      });

      if (!res.ok) throw new Error("Failed to update client");
      
      setClients(clients.map((c) => (c.id === editingClient.id ? editingClient : c)));
      setIsEditModalOpen(false);
      setEditingClient(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await fetch(`/api/clients/${id}`, { method: "DELETE" });
        setClients(clients.filter((c) => c.id !== id));
      } catch (err) {
        alert("Failed to delete client");
      }
    }
  };

  const handleResetPassword = async (id: string) => {
    if (window.confirm("Are you sure you want to reset this client's password? This action cannot be undone.")) {
      try {
        const res = await fetch(`/api/clients/${id}/reset-password`, { method: "POST" });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Failed to reset password");
        
        setGeneratedPassword(data.password);
        setNewlyCreatedClientName(data.name);
        setIsPasswordModalOpen(true);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const filteredClients = React.useMemo(() => {
    if (!searchQuery) return clients;
    const query = searchQuery.toLowerCase();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        (client.company && client.company.toLowerCase().includes(query))
    );
  }, [clients, searchQuery]);

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Company", "Status", "Tickets", "Satisfaction"];
    const csvContent = [
      headers.join(","),
      ...clients.map(c => [
        `"${c.name}"`,
        `"${c.email}"`,
        `"${c.phone || ""}"`,
        `"${c.company || ""}"`,
        `"${c.status}"`,
        c.ticketCount,
        `${c.satisfaction}%`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "clients.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-zinc-400">
            Manage your client directory and view their support history
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-zinc-400">Total Clients</p>
            <p className="mt-1 text-3xl font-bold text-white">{clients.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-zinc-400">Active This Month</p>
            <p className="mt-1 text-3xl font-bold text-teal-400">
              {clients.filter(c => c.status === "active").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-zinc-400">Pending Invites</p>
            <p className="mt-1 text-3xl font-bold text-amber-400">
              {clients.filter(c => c.status === "pending").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-zinc-400">Avg. Satisfaction</p>
            <p className="mt-1 text-3xl font-bold text-emerald-400">100%</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex items-center gap-4">
        <Input
          placeholder="Search clients..."
          icon={<Search className="h-4 w-4" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Client Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredClients.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
            <div className="rounded-full bg-zinc-800/50 p-6 mb-4">
              <Users className="h-10 w-10 text-zinc-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Clients Yet</h3>
            <p className="text-zinc-500 max-w-xs mx-auto mb-6">
              Your client directory is currently empty. Start by adding your first client manually or via import.
            </p>
            <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Your First Client
            </Button>
          </div>
        ) : filteredClients.map((client) => (
          <Card key={client.id} hover className="cursor-pointer overflow-hidden border-zinc-800 bg-zinc-900/40">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-0.5 border-2 ${client.status === 'pending' ? 'border-amber-500/50 border-dashed' : 'border-teal-500/30'}`}>
                    <Avatar
                      src={client.avatar}
                      name={client.name}
                      size="lg"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {client.status === 'pending' ? (client.email.split('@')[0]) : client.name}
                      {client.status === "pending" && (
                        <span className="ml-2 text-[10px] uppercase font-bold tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded">
                          Invited
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-zinc-500">{client.company}</p>
                  </div>
                </div>
                {!client.isInvite && (
                  <Dropdown
                    align="right"
                    trigger={
                      <button className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    }
                  >
                    <div onClick={() => handleEditClick(client)}>
                      <DropdownItem icon={<Edit className="h-4 w-4" />}>
                        Edit Client
                      </DropdownItem>
                    </div>
                    <div onClick={() => handleResetPassword(client.id)}>
                      <DropdownItem icon={<Key className="h-4 w-4" />}>
                        Reset Password
                      </DropdownItem>
                    </div>
                    <div onClick={() => handleDeleteClient(client.id)}>
                      <DropdownItem icon={<Trash2 className="h-4 w-4" />} destructive>
                        Delete Client
                      </DropdownItem>
                    </div>
                  </Dropdown>
                )}
                {client.isInvite && (
                  <Link href="/admin/invites">
                    <button className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white">
                      <Edit className="h-4 w-4" />
                    </button>
                  </Link>
                )}
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Mail className="h-4 w-4" />
                  {client.email}
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Phone className="h-4 w-4" />
                    {client.phone}
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-zinc-800/50 pt-4">
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Ticket className="h-3.5 w-3.5" />
                    {client.ticketCount}
                  </span>
                  <span className="flex items-center gap-1 uppercase tracking-tighter decoration-zinc-700 underline-offset-4 underline">
                    {client.status === 'pending' ? 'Invited' : 'Last Active'}
                  </span>
                  <span>{client.lastActivity ? formatRelativeTime(client.lastActivity) : "Never"}</span>
                </div>
                {client.status !== 'pending' && (
                   <Badge variant="success">
                    {client.satisfaction}% CSAT
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Client Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <ModalHeader onClose={() => setIsAddModalOpen(false)}>
          Add New Client
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Full Name <span className="text-red-500">*</span></label>
              <Input 
                placeholder="John Doe" 
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Email <span className="text-red-500">*</span></label>
              <Input 
                type="email" 
                placeholder="john@example.com"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Phone</label>
              <Input 
                placeholder="+1 (555) 000-0000"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Company</label>
              <Input 
                placeholder="Acme Corp"
                value={newClient.company}
                onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddClient} 
            disabled={!newClient.name || !newClient.email || isAdding}
          >
            {isAdding ? "Adding..." : "Add Client"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Client Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <ModalHeader onClose={() => setIsEditModalOpen(false)}>
          Edit Client
        </ModalHeader>
        <ModalBody>
          {editingClient && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Full Name <span className="text-red-500">*</span></label>
                <Input 
                  placeholder="John Doe" 
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Email <span className="text-red-500">*</span></label>
                <Input 
                  type="email" 
                  placeholder="john@example.com"
                  value={editingClient.email}
                  onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Phone</label>
                <Input 
                  placeholder="+1 (555) 000-0000"
                  value={editingClient.phone || ""}
                  onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Company</label>
                <Input 
                  placeholder="Acme Corp"
                  value={editingClient.company || ""}
                  onChange={(e) => setEditingClient({ ...editingClient, company: e.target.value })}
                />
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveEdit} 
            disabled={!editingClient?.name || !editingClient?.email || isEditing}
          >
            {isEditing ? "Saving..." : "Save Changes"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Password Modal */}
      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)}>
        <ModalHeader onClose={() => setIsPasswordModalOpen(false)}>
          Password Generated
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4 text-center py-4">
            <div className="mx-auto rounded-full bg-emerald-500/20 p-4 w-16 h-16 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-white">{newlyCreatedClientName}&apos;s password is ready!</h3>
            <p className="text-zinc-400">
              Please securely share the temporary password below with the client so they can log in.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-zinc-950 p-4 border border-zinc-800">
              <code className="text-2xl font-mono text-teal-400 tracking-wider font-bold">
                {generatedPassword}
              </code>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  if (generatedPassword) {
                    navigator.clipboard.writeText(generatedPassword);
                    alert("Copied directly to clipboard!");
                  }
                }}
              >
                <Copy className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-red-500 mt-4">
              Warning: This password will not be shown again.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setIsPasswordModalOpen(false)} className="w-full">
            I have saved the password
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
