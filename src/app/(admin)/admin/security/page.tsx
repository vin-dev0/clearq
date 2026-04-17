"use client";

import * as React from "react";
import {
  Shield,
  Lock,
  Clock,
  Globe,
  Users,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Activity,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { 
  getOrganizationSettings, 
  updateOrganizationSettings,
  deleteAllOrganizationTickets,
  deleteAllOrganizationData,
  deleteAllRemoteSessions
} from "@/lib/actions/organizations";

export default function SecurityPage() {
  const [activeConfig, setActiveConfig] = React.useState<string | null>(null);
  const [settings, setSettings] = React.useState<any>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeletingTickets, setIsDeletingTickets] = React.useState(false);
  const [isDeletingRemote, setIsDeletingRemote] = React.useState(false);
  const [isDeletingAll, setIsDeletingAll] = React.useState(false);


  React.useEffect(() => {
    const fetchSettings = async () => {
      const data = await getOrganizationSettings();
      setSettings(data);
    };
    fetchSettings();
  }, []);

  const handleUpdateSetting = async (key: string, value: any) => {
    setIsSubmitting(true);
    try {
      const updated = await updateOrganizationSettings({ [key]: value });
      setSettings(updated);
      alert("Setting updated successfully");
    } catch (e: any) {
      alert(e.message || "Error updating setting");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAll = async (newSettings: any) => {
    setIsSubmitting(true);
    try {
      const updated = await updateOrganizationSettings(newSettings);
      setSettings(updated);
      setActiveConfig(null);
      alert("Policy updated successfully");
    } catch (e: any) {
      alert(e.message || "Error saving policy");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteTickets = async () => {
    if (!window.confirm("Are you absolutely sure you want to delete ALL tickets? This action cannot be undone.")) return;
    
    setIsDeletingTickets(true);
    try {
      await deleteAllOrganizationTickets();
      alert("All organization tickets have been deleted successfully.");
    } catch (e: any) {
      alert(e.message || "Error deleting tickets");
    } finally {
      setIsDeletingTickets(false);
    }
  };

  const handleDeleteRemoteSessions = async () => {
    if (!window.confirm("Are you absolutely sure you want to delete ALL remote connections? This action cannot be undone.")) return;
    
    setIsDeletingRemote(true);
    try {
      await deleteAllRemoteSessions();
      alert("All organization remote connections have been deleted successfully.");
    } catch (e: any) {
      alert(e.message || "Error deleting remote connections");
    } finally {
      setIsDeletingRemote(false);
    }
  };

  const handleDeleteAllData = async () => {
    const confirmationCode = Math.random().toString(36).substring(7).toUpperCase();
    const input = window.prompt(
      `CRITICAL ACTION: This will permanently delete ALL organization data, users (except you), and reset all settings.\n\nPlease type "${confirmationCode}" to confirm:`
    );
    
    if (input !== confirmationCode) {
      if (input !== null) alert("Incorrect confirmation code. Action aborted.");
      return;
    }

    setIsDeletingAll(true);
    try {
      const result = await deleteAllOrganizationData();
      const s = result.summary;
      alert(`Organization data has been completely reset.\n\n` +
            `Summary of removal:\n` +
            `- Tickets: ${s.tickets}\n` +
            `- Users: ${s.users}\n` +
            `- Assets: ${s.assets}\n` +
            `- Inventory: ${s.inventory}\n\n` +
            `Recovery Code: ${result.recoveryCode}`);
      window.location.reload();
    } catch (e: any) {
      alert(e.message || "Error resetting organization data");
    } finally {
      setIsDeletingAll(false);
    }
  };




  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Security Center</h1>
          <p className="text-zinc-400 mt-1">
            Manage organization security policies and audit and access logs.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Badge variant="success" dot>System Secure</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Policy Management */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold text-white">Active Policies</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PolicyCard 
              icon={<Lock className="text-teal-400" />}
              title="Ticket Lockdown"
              description="Protect critical tickets from accidental deletion. Only admins can toggle lock status."
              status={settings.ticketLockdownEnabled !== false ? "ENABLED" : "DISABLED"}
              badgeVariant={settings.ticketLockdownEnabled !== false ? "success" : "secondary"}
              onConfigure={() => setActiveConfig("TICKET_LOCKDOWN")}
            />
            <PolicyCard 
              icon={<Clock className="text-cyan-400" />}
              title="Session Expiry"
              description="Automatically log out users after a set period of inactivity."
              status={settings.sessionTimeout || "30m"}
              badgeVariant="default"
              onConfigure={() => setActiveConfig("SESSION_TIMEOUT")}
            />
            <PolicyCard 
              icon={<Users className="text-violet-400" />}
              title="MFA Requirement"
              description="Force Two-Factor Authentication for all users in the organization."
              status={settings.mfaRequired ? "REQUIRED" : "OPTIONAL"}
              badgeVariant={settings.mfaRequired ? "info" : "secondary"}
              onConfigure={() => setActiveConfig("MFA")}
            />

          </div>



          {/* Danger Zone */}
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-6 mt-6">
            <h3 className="text-lg font-medium text-rose-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </h3>
            <div className="space-y-4">

              <div className="flex items-center justify-between border-b border-rose-500/10 pb-4">
                <div>
                  <p className="text-sm font-medium text-white">Delete All Tickets</p>
                  <p className="text-xs text-zinc-400">Permanently remove all support tickets. This action cannot be undone.</p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDeleteTickets}
                  disabled={isDeletingTickets}
                >
                  Delete Tickets
                </Button>
              </div>
...
              <div className="flex items-center justify-between border-b border-rose-500/10 pb-4">
                <div>
                  <p className="text-sm font-medium text-white">Delete All Remote Connections</p>
                  <p className="text-xs text-zinc-400">Permanently remove all SSH and RDP connection configurations.</p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDeleteRemoteSessions}
                  isLoading={isDeletingRemote}
                >
                  Delete Connections
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Delete All Data</p>
                  <p className="text-xs text-zinc-400">Permanently remove all organization data, users, and settings.</p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDeleteAllData}
                  isLoading={isDeletingAll}
                >
                  Delete All Data
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Audit Log */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Activity Audit Log</h2>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 uppercase">Recent Events</span>
              <Button variant="ghost" size="sm" className="h-7 text-xs">View All</Button>
            </div>
            <div className="divide-y divide-zinc-800">
              <div className="p-12 text-center">
                <Shield className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 text-sm">No recent activity detected.</p>
                <p className="text-[10px] text-zinc-600 mt-1">Audit logs are kept for 90 days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfigModal 
        config={activeConfig} 
        settings={settings}
        onClose={() => setActiveConfig(null)}
        onSave={handleSaveAll}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

function PolicyCard({ icon, title, description, status, badgeVariant, onConfigure }: any) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:bg-zinc-800/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-zinc-800">
          {React.cloneElement(icon, { size: 20 })}
        </div>
        <Badge variant={badgeVariant}>{status}</Badge>
      </div>
      <h3 className="font-medium text-white mb-1">{title}</h3>
      <p className="text-xs text-zinc-500 leading-relaxed">
        {description}
      </p>
      <button 
        onClick={onConfigure}
        className="mt-4 flex items-center gap-1 text-xs text-teal-400 hover:underline"
      >
        Configure <ChevronRight size={12} />
      </button>
    </div>
  );
}

function ConfigModal({ config, settings, onClose, onSave, isSubmitting }: any) {
  const [localSettings, setLocalSettings] = React.useState<any>({});

  React.useEffect(() => {
    if (config) setLocalSettings(settings);
  }, [config, settings]);

  if (!config) return null;

  const renderContent = () => {
    switch (config) {
      case "TICKET_LOCKDOWN":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
              <div>
                <p className="text-sm font-medium text-white">Enable Lockdown</p>
                <p className="text-xs text-zinc-500">Allow tickets to be locked</p>
              </div>
              <input 
                type="checkbox" 
                checked={localSettings.ticketLockdownEnabled !== false}
                onChange={(e) => setLocalSettings((prev: any) => ({ ...prev, ticketLockdownEnabled: e.target.checked }))}
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-teal-500"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
              <div>
                <p className="text-sm font-medium text-white">Auto-lock Resolved</p>
                <p className="text-xs text-zinc-500">Lock tickets automatically when solved</p>
              </div>
              <input 
                type="checkbox" 
                checked={localSettings.autoLockSolved}
                onChange={(e) => setLocalSettings((prev: any) => ({ ...prev, autoLockSolved: e.target.checked }))}
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-teal-500"
              />
            </div>
          </div>
        );
      case "SESSION_TIMEOUT":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-300 block mb-2">Duration (minutes)</label>
              <select 
                value={localSettings.sessionTimeout || "30m"}
                onChange={(e) => setLocalSettings((prev: any) => ({ ...prev, sessionTimeout: e.target.value }))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white"
              >
                <option value="15m">15 Minutes</option>
                <option value="30m">30 Minutes</option>
                <option value="1h">1 Hour</option>
                <option value="4h">4 Hours</option>
                <option value="8h">8 Hours</option>
              </select>
            </div>
          </div>
        );
      case "MFA":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
              <div>
                <p className="text-sm font-medium text-white">Require MFA for All Users</p>
                <p className="text-xs text-zinc-500">Enforce 2FA for everyone (Agents, Clients, Admins)</p>
              </div>
              <input 
                type="checkbox" 
                checked={localSettings.mfaRequired}
                onChange={(e) => setLocalSettings((prev: any) => ({ ...prev, mfaRequired: e.target.checked }))}
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-teal-500"
              />
            </div>
          </div>
        );

      default:
        return <p className="text-zinc-400 text-sm">Settings for this policy will be available soon.</p>;
    }
  };

  return (
    <Modal isOpen={!!config} onClose={onClose} size="sm">
      <ModalHeader onClose={onClose}>Configure {config.replace("_", " ")}</ModalHeader>
      <ModalBody>
        {renderContent()}
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button isLoading={isSubmitting} onClick={() => onSave(localSettings)}>
          Save Policy
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function AuditItem({ icon, action, user, time }: any) {
  return (
    <div className="p-4 hover:bg-zinc-800/30 transition-colors">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{action}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-zinc-500">{user}</span>
            <span className="text-[10px] text-zinc-600">•</span>
            <span className="text-xs text-zinc-600">{time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
