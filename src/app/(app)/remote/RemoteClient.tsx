"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import {
  Monitor,
  Terminal,
  Plus,
  Shield,
  Activity,
  X,
  RefreshCw,
  Power,
  Globe,
  Lock,
  Trash2,
  Copy,
  ExternalLink,
  Download,
  Check,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Minimize2,
  RotateCcw,
  Layers,
  ChevronDown,
  MousePointer2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getRemoteSessions, createRemoteSession, deleteRemoteSession } from "@/lib/actions/remote";



// ---- Types ----
interface RemoteSession {
  id: string;
  name: string;
  type: string;
  host: string;
  port: number;
  username: string;
}



// ---- SSH Terminal Component (Optimized Polling) ----
function SshTerminal({
  session,
  onDisconnect,
}: {
  session: RemoteSession;
  onDisconnect: () => void;
}) {
  const termRef = React.useRef<HTMLDivElement>(null);
  const termInstance = React.useRef<any>(null);
  const pollerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = React.useState<"prompt" | "connecting" | "connected" | "error">("prompt");
  const [password, setPassword] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Authenticate SSH
  const authenticate = async () => {
    console.log("Starting authentication for:", session.host);
    setStatus("connecting");
    setErrorMsg("");

    try {
      console.log("Fetching /api/remote/ssh/connect...");
      const res = await fetch("/api/remote/ssh/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: session.host,
          port: session.port || 22,
          username: session.username,
          password,
          cols: 100, // Larger default
          rows: 30,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Connection failed");
      setStatus("connected");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Connection failed");
    }
  };

  // Mount xterm and start polling
  React.useEffect(() => {
    if (status !== "connected" || !termRef.current) return;

    let term: any;
    let cleanup: (() => void) | undefined;
    let isMounted = true;

    const initTerminal = async () => {
      try {
        const { Terminal } = await import("@xterm/xterm");
        const { FitAddon } = await import("@xterm/addon-fit");
        const { WebLinksAddon } = await import("@xterm/addon-web-links");
        await import("@xterm/xterm/css/xterm.css");

        term = new Terminal({
          cursorBlink: true,
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          theme: {
            background: "#09090b",
            foreground: "#e4e4e7",
            cursor: "#14b8a6",
          },
          allowProposedApi: true,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.loadAddon(new WebLinksAddon());
        term.open(termRef.current!);
        termInstance.current = term;

        requestAnimationFrame(() => { try { fitAddon.fit(); } catch {} });
        window.addEventListener("resize", () => fitAddon.fit());

        // Process incoming base64 data strings
        const writeOutput = (b64: string) => {
          if (!b64) return;
          const raw = atob(b64);
          const bytes = new Uint8Array(raw.length);
          for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
          term.write(bytes);
        };

        // Highly optimized adaptive polling
        let pollDelay = 40;
        const poll = async () => {
          if (!isMounted) return;
          try {
            const res = await fetch("/api/remote/ssh/input", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ host: session.host }),
            });
            const data = await res.json();
            
            if (data.d) {
              writeOutput(data.d);
              pollDelay = 30; // Speed up if data reached
            } else {
              pollDelay = Math.min(pollDelay + 5, 80); // Slow down if idle
            }

            if (data.c) {
              term.write("\r\n\x1b[33m--- Session ended ---\x1b[0m\r\n");
              return;
            }
          } catch {}
          pollerRef.current = setTimeout(poll, pollDelay);
        };

        poll();

        // Send keystrokes
        term.onData((input: string) => {
          fetch("/api/remote/ssh/input", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ host: session.host, input }),
          })
            .then((r) => r.json())
            .then((data) => { if (data.d) writeOutput(data.d); })
            .catch(() => {});
        });

        cleanup = () => {
          isMounted = false;
          if (pollerRef.current) clearTimeout(pollerRef.current);
          term.dispose();
        };
      } catch (err: any) {
        setErrorMsg(err.message);
        setStatus("error");
      }
    };

    initTerminal();
    return () => { cleanup?.(); };
  }, [status, session.host]);

  const disconnect = async () => {
    if (pollerRef.current) clearTimeout(pollerRef.current);
    termInstance.current?.dispose();
    await fetch("/api/remote/ssh/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host: session.host }),
    }).catch(() => {});
    onDisconnect();
  };

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  if (status === "prompt") {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center mx-auto">
              <Terminal className="w-7 h-7 text-teal-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">{session.name}</h3>
            <p className="text-sm text-zinc-500">
              {session.username}@{session.host}:{session.port || 22}
            </p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); authenticate(); }} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">Password</label>
              <Input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter SSH password"
                className="bg-zinc-950 border-zinc-800"
              />
            </div>
            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold">
              <Terminal className="w-4 h-4 mr-2" /> Connect
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (status === "connecting") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin mx-auto" />
          <div>
            <p className="text-sm font-medium text-white">Connecting to {session.host}...</p>
            <p className="text-xs text-zinc-500 mt-1">Authenticating as {session.username}</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-sm">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <div>
            <p className="text-sm font-medium text-white">Connection Failed</p>
            <p className="text-xs text-zinc-500 mt-2">{errorMsg}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" size="sm" onClick={() => { setStatus("prompt"); setPassword(""); }}>
              Try Again
            </Button>
            <Button variant="ghost" size="sm" onClick={onDisconnect} className="text-zinc-400">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Connected — terminal renders here, useEffect mounts xterm
  return (
    <div className={cn("flex-1 flex flex-col", isFullscreen && "fixed inset-0 z-50 bg-zinc-950")}>
      {/* Terminal toolbar */}
      <div className="h-9 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)] animate-pulse" />
            Connected
          </span>
          <span className="text-zinc-700">|</span>
          <span>{session.username}@{session.host}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 hover:bg-zinc-800"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 hover:bg-red-500/10 text-red-400"
            onClick={disconnect}
          >
            <Power className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      {/* Terminal container */}
      <div ref={termRef} className="flex-1 bg-[#09090b] p-1" />
    </div>
  );
}

// ---- Main Component ----
export default function RemoteClient() {
  const [sessions, setSessions] = React.useState<RemoteSession[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isAdding, setIsAdding] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Active Remote session (SSH)
  const [activeSession, setActiveSession] = React.useState<RemoteSession | null>(null);

  // Form
  const [form, setForm] = React.useState({
    name: "",
    type: "SSH",
    host: "",
    port: 22,
    username: "",
  });

  React.useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const data = await getRemoteSessions();
      setSessions(data as RemoteSession[]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await createRemoteSession({
        name: form.name,
        type: form.type,
        host: form.host,
        port: form.port,
        username: form.username,
      });
      setIsAddModalOpen(false);
      setForm({ name: "", type: "SSH", host: "", port: 22, username: "" });
      fetchSessions();
    } catch {
      alert("Failed to add endpoint");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this endpoint?")) return;
    try {
      await deleteRemoteSession(id);
      fetchSessions();
    } catch {
      alert("Failed to delete endpoint");
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConnect = (s: RemoteSession) => {
    setActiveSession(s);
  };

  const filteredSessions = sessions.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.host.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If a session is active, show full-screen remote client
  if (activeSession) {
    return (
        <SshTerminal
          session={activeSession}
          onDisconnect={() => setActiveSession(null)}
        />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Remote Access</h1>
          <p className="text-zinc-400">
            Connect to remote machines via secure SSH terminal sessions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchSessions}>
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Endpoint
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex w-10 h-10 items-center justify-center rounded-lg bg-teal-500/10">
              <Monitor className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium">Total Endpoints</p>
              <p className="text-xl font-bold text-white">{sessions.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex w-10 h-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Terminal className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium">SSH Sessions</p>
              <p className="text-xl font-bold text-white">
                {sessions.filter((s) => s.type === "SSH").length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex w-10 h-10 items-center justify-center rounded-lg bg-cyan-500/10">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium">Encryption</p>
              <p className="text-xl font-bold text-white">AES-256</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search endpoints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-900/80 border-zinc-800"
          />
        </div>
      </div>

      {/* Endpoint List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
        </div>
      ) : filteredSessions.length === 0 ? (
        <Card variant="bordered" className="flex flex-col items-center justify-center py-16 text-center">
          <Monitor className="w-10 h-10 text-zinc-700 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No endpoints registered</h3>
          <p className="text-sm text-zinc-500 mb-6 max-w-md">
            Add your first remote machine to start connecting via SSH directly from ClearQ.
          </p>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Endpoint
          </Button>
        </Card>
      ) : (
        <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/50">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-zinc-900 border-b border-zinc-800 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <div className="col-span-3">Endpoint</div>
            <div className="col-span-2">Host</div>
            <div className="col-span-1">Port</div>
            <div className="col-span-2">User</div>
            <div className="col-span-1">Protocol</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          {/* Table Rows */}
          {filteredSessions.map((s) => (
            <div
              key={s.id}
              className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors items-center group"
            >
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-teal-500 to-emerald-600">
                  <Terminal className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-sm text-zinc-200 group-hover:text-white transition-colors">
                  {s.name}
                </span>
              </div>

              <div className="col-span-2">
                <code className="text-sm text-zinc-400 font-mono">{s.host}</code>
              </div>

              <div className="col-span-1">
                <code className="text-sm text-zinc-500 font-mono">{s.port || 22}</code>
              </div>

              <div className="col-span-2">
                <span className="text-sm text-zinc-400">{s.username}</span>
              </div>

              <div className="col-span-1">
                  <Badge className="text-[10px] bg-teal-500/10 text-teal-400 border-teal-500/20">
                    SSH
                  </Badge>
              </div>

              <div className="col-span-3 flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  onClick={() => handleConnect(s)}
                  className="font-semibold text-xs bg-teal-600 hover:bg-teal-500 text-white"
                >
                  <Terminal className="w-3.5 h-3.5 mr-1.5" /> Open Shell
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 hover:bg-zinc-800 text-zinc-500"
                  onClick={() => handleCopy(s.host, s.id)}
                  title="Copy IP"
                >
                  {copiedId === s.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(s.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Endpoint Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} size="md">
        <ModalHeader onClose={() => setIsAddModalOpen(false)}>Add Remote Endpoint</ModalHeader>
        <form onSubmit={handleAdd}>
          <ModalBody className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">Display Name</label>
              <Input
                required
                placeholder="e.g. Production Server, Accounting PC"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-zinc-950 border-zinc-800"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">Protocol</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "SSH", port: 22 })}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all",
                    form.type === "SSH"
                      ? "border-teal-500/50 bg-teal-500/10 text-teal-400"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                  )}
                >
                  <Terminal className="w-5 h-5" />
                  <div className="text-left">
                    <p className="text-sm font-semibold">SSH</p>
                    <p className="text-[10px] opacity-60">In-app terminal</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-medium text-zinc-400">Host / IP Address</label>
                <Input
                  required
                  placeholder="192.168.1.100"
                  value={form.host}
                  onChange={(e) => setForm({ ...form, host: e.target.value })}
                  className="bg-zinc-950 border-zinc-800 font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400">Port</label>
                <Input
                  required
                  type="number"
                  value={form.port}
                  onChange={(e) => setForm({ ...form, port: parseInt(e.target.value) || 22 })}
                  className="bg-zinc-950 border-zinc-800 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">Username</label>
              <Input
                required
                placeholder={form.type === "SSH" ? "root" : "Administrator"}
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="bg-zinc-950 border-zinc-800"
              />
            </div>

              <p className="text-xs text-zinc-500 leading-relaxed">
                SSH credentials are entered at connection time and never stored.
              </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isAdding}>
              {isAdding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
                </>
              ) : (
                "Save Endpoint"
              )}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
