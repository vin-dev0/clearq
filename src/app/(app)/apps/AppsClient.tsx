"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Loader2, 
  Star, 
  LayoutGrid, 
  Globe, 
  MessageSquare,
  ShieldAlert,
  Terminal,
  Database,
  Blocks,
  ArrowDownToLine,
  Settings,
  X,
  FileEdit,
  GitMerge
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getIntegrationsConfig, saveIntegrationsConfig } from "@/lib/actions/integrations";

type AppCategory = "All" | "Development" | "Communication" | "DevOps" | "Analytics";

interface AppItem {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: AppCategory;
  rating: number;
  downloads: string;
  color: string;
  isPopular?: boolean;
}

const INTEGRATIONS: AppItem[] = [
  {
    id: "slack",
    name: "Slack Connect",
    description: "Receive instant notifications and create team tickets directly from any Slack channel.",
    icon: MessageSquare,
    category: "Communication",
    rating: 4.8,
    downloads: "120k+",
    color: "from-emerald-400 to-teal-500",
    isPopular: true
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    description: "Publish interactive support cards automatically to your MS Teams channels.",
    icon: MessageSquare,
    category: "Communication",
    rating: 4.6,
    downloads: "410k+",
    color: "from-blue-600 to-indigo-600",
    isPopular: true
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect ClearQ to 5000+ apps by firing universal webhook payloads.",
    icon: Blocks,
    category: "DevOps",
    rating: 4.9,
    downloads: "800k+",
    color: "from-orange-500 to-amber-500",
    isPopular: true
  },
  {
    id: "docker",
    name: "Docker Hub Sync",
    description: "Deploy environments with one click using our container synchronization mechanisms.",
    icon: Database,
    category: "DevOps",
    rating: 4.5,
    downloads: "210k+",
    color: "from-blue-400 to-sky-500"
  },
  {
    id: "discord",
    name: "Discord Webhooks",
    description: "Send robust graphical embeds of system events straight into your Discord servers.",
    icon: MessageSquare,
    category: "Communication",
    rating: 4.9,
    downloads: "300k+",
    color: "from-indigo-500 to-indigo-600",
    isPopular: true
  },
  {
    id: "google-analytics",
    name: "Google Analytics 4",
    description: "Aggregate user engagement metrics seamlessly alongside support ticket volumes.",
    icon: Globe,
    category: "Analytics",
    rating: 4.4,
    downloads: "900k+",
    color: "from-amber-400 to-orange-500"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function AppsClient() {
  const [activeCategory, setActiveCategory] = useState<AppCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [installStatus, setInstallStatus] = useState<Record<string, "UNINSTALLED" | "INSTALLING" | "INSTALLED">>({});
  const [activeModalAppId, setActiveModalAppId] = useState<string | null>(null);

  // Discord State
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState("");
  const [discordBotName, setDiscordBotName] = useState("");
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  // Slack State
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [isTestingSlack, setIsTestingSlack] = useState(false);

  // Google Analytics State
  const [gaMeasurementId, setGaMeasurementId] = useState("");

  // Additional Hook States
  const [teamsWebhookUrl, setTeamsWebhookUrl] = useState("");
  const [isTestingTeams, setIsTestingTeams] = useState(false);
  const [zapierWebhookUrl, setZapierWebhookUrl] = useState("");

  // Load from Server DB on mount
  useEffect(() => {
    async function loadConfigs() {
      const db = await getIntegrationsConfig();
      if (db) {
        if (db.apps) setInstallStatus(db.apps);
        if (db.webhooks) {
          if (db.webhooks.discord_webhook) setDiscordWebhookUrl(db.webhooks.discord_webhook);
          if (db.webhooks.discord_botname) setDiscordBotName(db.webhooks.discord_botname);
          if (db.webhooks.teams_webhook) setTeamsWebhookUrl(db.webhooks.teams_webhook);
          if (db.webhooks.zapier_webhook) setZapierWebhookUrl(db.webhooks.zapier_webhook);
          if (db.webhooks.slack_webhook) setSlackWebhookUrl(db.webhooks.slack_webhook);
          if (db.webhooks.ga_measurement_id) setGaMeasurementId(db.webhooks.ga_measurement_id);
        }
      }
    }
    loadConfigs();
  }, []);

  const handleTestDiscordWebhook = async () => {
    if (!discordWebhookUrl) {
      alert("Please enter a valid Discord Webhook URL first.");
      return;
    }
    
    setIsTestingWebhook(true);
    try {
      const response = await fetch(discordWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: discordBotName || "ClearQ Integration",
          avatar_url: "https://ui-avatars.com/api/?name=ST&background=14b8a6&color=fff",
          content: "🚀 **ClearQ Test Connection**\nYour webhook has been successfully mapped to the backend system!"
        })
      });

      if (response.ok) {
        alert("Success! Check your Discord server for the test message.");
      } else {
        alert("Failed to send webhook. Response status: " + response.status);
      }
    } catch (error) {
      alert("Error sending webhook: " + String(error));
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleTestSlackWebhook = async () => {
    if (!slackWebhookUrl) {
      alert("Please enter a valid Slack Webhook URL first.");
      return;
    }
    
    setIsTestingSlack(true);
    try {
      const response = await fetch(slackWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "🚀 *ClearQ Slack Connection Test*\nYour webhook has been successfully mapped to the backend system! Notifications will appear here when new tickets are created."
        })
      });

      if (response.ok) {
        alert("Success! Check your Slack channel for the test message.");
      } else {
        alert("Failed to send webhook. Response status: " + response.status);
      }
    } catch (error) {
      alert("Error sending Slack webhook: " + String(error));
    } finally {
      setIsTestingSlack(false);
    }
  };

  const handleTestTeamsWebhook = async () => {
    if (!teamsWebhookUrl) {
      alert("Please enter a valid Teams Webhook URL first.");
      return;
    }
    
    setIsTestingTeams(true);
    try {
      // Teams Incoming Webhooks expect an Adaptive Card or simple text
      const response = await fetch(teamsWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "@type": "MessageCard",
          "@context": "http://schema.org/extensions",
          "themeColor": "4F46E5",
          "summary": "ClearQ Notification",
          "sections": [{
            "activityTitle": "🚀 ClearQ Integration Active",
            "activitySubtitle": "Microsoft Teams Connection Test",
            "activityImage": "https://ui-avatars.com/api/?name=ST&background=4F46E5&color=fff",
            "facts": [{
              "name": "Status",
              "value": "Connected"
            }, {
              "name": "Integration Type",
              "value": "Incoming Webhook"
            }],
            "markdown": true,
            "text": "Your Teams channel is now successfully connected to ClearQ. You will receive interactive support cards for new tickets here."
          }],
          "potentialAction": [{
            "@type": "OpenUri",
            "name": "View Dashboard",
            "targets": [{ "os": "default", "uri": "https://ClearQ.io/dashboard" }]
          }]
        })
      });

      if (response.ok) {
        alert("Success! Check your Teams channel for the test card.");
      } else {
        alert("Failed to send Teams webhook. Response status: " + response.status);
      }
    } catch (error) {
      alert("Error sending Teams webhook: " + String(error));
    } finally {
      setIsTestingTeams(false);
    }
  };

  const categories: AppCategory[] = ["All", "Development", "Communication", "DevOps", "Analytics"];

  const handleInstall = (appId: string) => {
    setInstallStatus(prev => ({ ...prev, [appId]: "INSTALLING" }));
    
    setTimeout(async () => {
      const newStatus = { ...installStatus, [appId]: "INSTALLED" as const };
      setInstallStatus(newStatus);
      const db = await getIntegrationsConfig();
      await saveIntegrationsConfig({ ...db, apps: newStatus });
    }, 1500);
  };

  const handleUninstall = async (appId: string) => {
    const newStatus = { ...installStatus, [appId]: "UNINSTALLED" as const };
    setInstallStatus(newStatus);
    const db = await getIntegrationsConfig();
    await saveIntegrationsConfig({ ...db, apps: newStatus });
  };

  const filteredApps = INTEGRATIONS.filter(app => {
    const matchesCategory = activeCategory === "All" || app.category === activeCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950 text-white">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-8 py-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30 shadow-lg shadow-teal-500/10">
            <Blocks className="h-6 w-6 text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">App Store</h1>
            <p className="text-sm text-zinc-400">Discover and install powerful integrations for your workspace</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-72 rounded-full border border-zinc-800 bg-zinc-900/80 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all shadow-inner"
            />
          </div>
          <button className="flex h-10 items-center justify-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white shadow-sm">
            <Filter className="h-4 w-4" />
            Sort & Filter
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Categories Sidebar */}
        <aside className="w-64 border-r border-zinc-800/50 bg-zinc-900/20 p-6 flex flex-col gap-2">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Categories</h3>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                activeCategory === cat 
                  ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" 
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent"
              )}
            >
              {cat}
              <span className={cn(
                "rounded-full px-2 py-0.5 text-[10px]",
                activeCategory === cat ? "bg-teal-500/20 text-teal-500" : "bg-zinc-800 text-zinc-500"
              )}>
                {cat === "All" ? INTEGRATIONS.length : INTEGRATIONS.filter(a => a.category === cat).length}
              </span>
            </button>
          ))}
          
          <div className="mt-8 rounded-xl bg-gradient-to-b from-indigo-500/10 to-transparent p-4 border border-indigo-500/20">
            <h4 className="text-sm font-semibold text-indigo-400 mb-2">Build Your Own</h4>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Have a custom tool? Check out our API documentation to build internal integrations.
            </p>
            <button className="w-full rounded-lg bg-zinc-900 border border-zinc-700 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
              Developer Docs
            </button>
          </div>
        </aside>

        {/* App Grid Render */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {filteredApps.length === 0 ? (
             <div className="flex h-full flex-col items-center justify-center text-zinc-500">
               <Blocks className="w-16 h-16 opacity-20 mb-4" />
               <p>No integrations found matching your search.</p>
             </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filteredApps.map((app) => {
                const status = installStatus[app.id] || "UNINSTALLED";
                const Icon = app.icon;

                return (
                  <motion.div 
                    variants={itemVariants}
                    key={app.id} 
                    className="group relative overflow-hidden flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/80 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    {/* Background glow on hover */}
                    <div className={cn(
                      "absolute -inset-20 opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500 bg-gradient-to-br",
                      app.color
                    )}></div>
                    
                    <div className="relative z-10 flex items-start justify-between">
                       <div className={cn(
                         "flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br shadow-inner border border-white/10",
                         app.color
                       )}>
                         <Icon className="h-7 w-7 text-white drop-shadow-md" />
                       </div>
                       {app.isPopular && (
                         <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-500 border border-amber-500/20 shadow-sm shadow-amber-500/10">
                           <Star className="h-3 w-3 fill-amber-500/50" />
                           POPULAR
                         </span>
                       )}
                    </div>

                    <div className="relative z-10 mt-5 mb-2">
                      <h3 className="text-xl font-bold text-zinc-100 group-hover:text-white transition-colors">{app.name}</h3>
                      <div className="mt-2 flex items-center gap-3 text-xs font-medium text-zinc-500">
                        <span className="flex items-center gap-1"><LayoutGrid className="w-3.5 h-3.5" />{app.category}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                        <span className="flex items-center gap-1 text-amber-400"><Star className="w-3.5 h-3.5 fill-amber-400" />{app.rating}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                        <span className="flex items-center gap-1"><ArrowDownToLine className="w-3.5 h-3.5" />{app.downloads}</span>
                      </div>
                    </div>
                    
                    <p className="relative z-10 mt-2 text-sm text-zinc-400 flex-1 leading-relaxed">
                      {app.description}
                    </p>

                    <div className="relative z-10 mt-6 pt-5 border-t border-zinc-800/60">
                      {status === "UNINSTALLED" && (
                        <button 
                          onClick={() => handleInstall(app.id)}
                          className="w-full flex items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-all hover:bg-white hover:scale-[1.02] shadow-md shadow-white/5"
                        >
                          <Download className="h-4 w-4" />
                          Install Integration
                        </button>
                      )}
                      
                      {status === "INSTALLING" && (
                        <div className="w-full relative overflow-hidden rounded-lg bg-zinc-800/50 border border-zinc-700 p-1 flex items-center justify-center h-10">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: "100%" }}
                             transition={{ duration: 2.5, ease: "linear" }}
                             className="absolute left-0 top-0 bottom-0 bg-teal-500/20"
                           />
                           <div className="flex items-center gap-2 text-sm font-medium text-teal-400 relative z-10">
                             <Loader2 className="w-4 h-4 animate-spin" />
                             Downloading assets...
                           </div>
                        </div>
                      )}

                      {status === "INSTALLED" && (
                        <div className="flex w-full items-center gap-2">
                          <button 
                            onClick={() => setActiveModalAppId(app.id)}
                            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-teal-500 hover:bg-teal-400 border border-teal-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition-all"
                          >
                            <Settings className="h-4 w-4" />
                            Configure
                          </button>
                          <button 
                            onClick={() => handleUninstall(app.id)}
                            className="flex px-4 py-2.5 items-center justify-center gap-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm font-semibold text-zinc-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
                          >
                            Uninstall
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{__html:`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #27272a;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #3f3f46;
        }
      `}} />

      {/* Dynamic Configure Modal */}
      <AnimatePresence>
        {activeModalAppId && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => setActiveModalAppId(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden flex flex-col"
            >
               {(() => {
                 const appData = INTEGRATIONS.find(a => a.id === activeModalAppId);
                 if(!appData) return null;
                 const Icon = appData.icon;

                 return (
                   <>
                     {/* Modal Header */}
                     <div className="relative overflow-hidden p-6 border-b border-zinc-800/80">
                        <div className={cn("absolute inset-0 opacity-10 blur-xl bg-gradient-to-br", appData.color)} />
                        <div className="relative z-10 flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className={cn("flex w-12 h-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-inner border border-white/10", appData.color)}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                               <h2 className="text-xl font-bold text-white">{appData.name} Configuration</h2>
                               <p className="text-xs text-zinc-400 mt-1">{appData.category} Integration</p>
                            </div>
                          </div>
                          <button onClick={() => setActiveModalAppId(null)} className="text-zinc-500 hover:text-white transition-colors p-1 bg-zinc-900 rounded-lg border border-zinc-800">
                             <X className="w-4 h-4" />
                          </button>
                        </div>
                     </div>

                     {/* Dynamic Modal Body */}
                     <div className="p-6 bg-zinc-900/20 space-y-5">
                       {appData.id === "slack" && (
                         <>
                           <div>
                             <label className="text-sm font-medium text-zinc-300 block mb-2">Slack Webhook URL</label>
                             <input 
                               type="text" 
                               value={slackWebhookUrl}
                               onChange={e => setSlackWebhookUrl(e.target.value)}
                               placeholder="https://hooks.slack.com/services/..." 
                               className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" 
                             />
                           </div>
                           <p className="text-xs text-zinc-500 mt-2">
                             Create an incoming webhook URL in your Slack workspace settings to send notifications to your preferred channel.
                           </p>
                           <div className="pt-2">
                             <button
                               onClick={handleTestSlackWebhook}
                               disabled={isTestingSlack || !slackWebhookUrl}
                               className="w-full flex items-center justify-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                             >
                               {isTestingSlack ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                               Send Test Alert to Slack
                             </button>
                           </div>
                         </>
                       )}

                       {appData.id === "teams" && (
                          <>
                            <div>
                              <label className="text-sm font-medium text-zinc-300 block mb-2">Microsoft Teams Webhook URL</label>
                              <input 
                                type="text" 
                                value={teamsWebhookUrl}
                                onChange={e => setTeamsWebhookUrl(e.target.value)}
                                placeholder="https://outlook.office.com/webhook/..." 
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" 
                              />
                            </div>
                            <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                              ClearQ uses Adaptive Cards to send rich, interactive notifications. 
                              Create an "Incoming Webhook" in your Teams Channel connectors to get your URL.
                            </p>
                            <div className="pt-2">
                              <button
                                onClick={handleTestTeamsWebhook}
                                disabled={isTestingTeams || !teamsWebhookUrl}
                                className="w-full flex items-center justify-center gap-2 rounded-lg border border-blue-500/50 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {isTestingTeams ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                                Send Test Adaptive Card
                              </button>
                            </div>
                            <div className="rounded-lg bg-zinc-900/50 border border-zinc-800 p-4 mt-4">
                               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Preview Integration</span>
                               <div className="flex gap-3">
                                  <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold">ST</div>
                                  <div className="flex-1">
                                     <div className="text-xs font-bold text-zinc-200">ClearQ <span className="text-[10px] font-normal text-zinc-500 ml-2">via Webhook</span></div>
                                     <div className="mt-1 p-2 rounded bg-zinc-800 border-l-2 border-blue-500 text-[10px] text-zinc-400">
                                        New Ticket: [ST-402] Server down in Sector 7...
                                     </div>
                                  </div>
                               </div>
                            </div>
                          </>
                        )}

                       {appData.id === "datadog" && (
                         <>
                           <div>
                             <label className="text-sm font-medium text-zinc-300 block mb-2">Datadog API Key</label>
                             <input type="password" placeholder="****************************" className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none" />
                           </div>
                           <div className="flex items-center gap-3 mt-4 border border-zinc-800 bg-zinc-900/50 p-4 rounded-lg">
                             <input type="checkbox" id="auto-ticket" className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-teal-500 focus:ring-teal-500" defaultChecked/>
                             <div className="flex flex-col">
                               <label htmlFor="auto-ticket" className="text-sm font-medium text-white cursor-pointer">Auto-create Incident Tickets</label>
                               <span className="text-xs text-zinc-500">When Datadog registers an active severity alert, generate an automatic P1 ticket.</span>
                             </div>
                           </div>
                         </>
                       )}

                       {appData.id === "sentry" && (
                         <>
                           <div>
                             <label className="text-sm font-medium text-zinc-300 block mb-2">Sentry DSN Sync</label>
                             <input type="text" placeholder="https://abc@o1.ingest.sentry.io/123" className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none" />
                           </div>
                           <div>
                             <label className="text-sm font-medium text-zinc-300 block mb-2">Minimum Log Level</label>
                             <select className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none">
                                <option>Error</option>
                                <option>Fatal</option>
                                <option>Warning</option>
                                <option>Info</option>
                             </select>
                           </div>
                         </>
                       )}

                       {appData.id === "docker" && (
                         <>
                           <div>
                             <label className="text-sm font-medium text-zinc-300 block mb-2">Docker Daemon Host API</label>
                             <input type="text" placeholder="tcp://192.168.1.100:2375" className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none" />
                           </div>
                           <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-blue-400">Connection Validated</span>
                                <span className="text-xs text-blue-500/70">Verified 2 minutes ago via SSH</span>
                              </div>
                              <CheckCircle2 className="w-5 h-5 text-blue-400" />
                           </div>
                         </>
                       )}

                       {appData.id === "discord" && (
                         <>
                           <div>
                             <label className="text-sm font-medium text-zinc-300 block mb-2">Discord Webhook URL</label>
                             <input 
                               type="text" 
                               value={discordWebhookUrl}
                               onChange={e => setDiscordWebhookUrl(e.target.value)}
                               placeholder="https://discord.com/api/webhooks/..." 
                               className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none" 
                             />
                           </div>
                           <div>
                             <label className="text-sm font-medium text-zinc-300 block mb-2">Bot Name Override (Optional)</label>
                             <input 
                               type="text" 
                               value={discordBotName}
                               onChange={e => setDiscordBotName(e.target.value)}
                               placeholder="ClearQ Alerts" 
                               className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none" 
                             />
                           </div>
                           <div className="pt-2">
                             <button
                               onClick={handleTestDiscordWebhook}
                               disabled={isTestingWebhook || !discordWebhookUrl}
                               className="w-full flex items-center justify-center gap-2 rounded-lg border border-indigo-500/50 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-400 hover:bg-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                             >
                               {isTestingWebhook ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                               Send Test Alert to Channel
                             </button>
                           </div>
                         </>
                       )}

                       {appData.id === "google-analytics" && (
                         <>
                           <div>
                             <label className="text-sm font-medium text-zinc-300 block mb-2">GA4 Measurement ID</label>
                             <input 
                               type="text" 
                               value={gaMeasurementId}
                               onChange={e => setGaMeasurementId(e.target.value)}
                               placeholder="G-XXXXXXXXXX" 
                               className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none" 
                             />
                           </div>
                           <p className="text-xs text-zinc-500 mt-2">
                             Enter your Google Analytics 4 Measurement ID to start tracking user engagement across the dashboard.
                           </p>
                         </>
                       )}

                     </div>

                     {/* Modal Footer */}
                     <div className="p-4 border-t border-zinc-800/80 flex justify-end gap-3 bg-zinc-950">
                        <button 
                          onClick={() => setActiveModalAppId(null)}
                          className="px-5 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={async () => {
                            const db = await getIntegrationsConfig();
                            const newWebhooks = { ...db.webhooks };

                            if (appData.id === "discord") {
                              newWebhooks.discord_webhook = discordWebhookUrl;
                              newWebhooks.discord_botname = discordBotName;
                            }
                            if (appData.id === "teams") {
                              newWebhooks.teams_webhook = teamsWebhookUrl;
                            }
                            if (appData.id === "zapier") {
                              newWebhooks.zapier_webhook = zapierWebhookUrl;
                            }
                            if (appData.id === "slack") {
                              newWebhooks.slack_webhook = slackWebhookUrl;
                            }
                            if (appData.id === "google-analytics") {
                              newWebhooks.ga_measurement_id = gaMeasurementId;
                            }
                            
                            await saveIntegrationsConfig({ ...db, webhooks: newWebhooks });
                            
                            alert(`${appData.name} configuration saved securely to backend!`);
                            setActiveModalAppId(null);
                          }}
                          className={cn("px-6 py-2 text-sm font-semibold text-white rounded-lg transition-transform hover:scale-105 shadow-lg", `bg-gradient-to-r ${appData.color}`)}
                        >
                          Save Configuration
                        </button>
                     </div>
                   </>
                 );
               })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
