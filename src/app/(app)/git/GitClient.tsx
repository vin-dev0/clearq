"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { 
  GitBranch, 
  GitCommit, 
  GitMerge, 
  GitPullRequest, 
  RefreshCw, 
  Settings, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Server, 
  Clock, 
  Terminal,
  ExternalLink,
  ChevronRight,
  FolderDot,
  LogOut,
  Eye,
  FileText,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- SVG Icons for Providers ---
const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const GitlabIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path fill="#e24329" d="M11.996 23.013l-4.572-14.07h9.145l-4.573 14.07z"/>
      <path fill="#fc6d26" d="M12 23.012l4.572-14.07h4.86l-6.858 10.428z"/>
      <path fill="#fca326" d="M21.431 8.941l-2.091-6.435a.497.497 0 0 0-.946 0l-1.821 5.606h4.858z"/>
      <path fill="#fc6d26" d="M12 23.012l-4.572-14.07H2.568l6.858 10.428z"/>
      <path fill="#fca326" d="M2.568 8.941l2.091-6.435a.497.497 0 0 1 .946 0l1.821 5.606H2.568z"/>
  </svg>
);

const BitbucketIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M1.384 1.341c-.48-.029-.922.361-.922.846v.38c.007.411.02.822.04 1.231l2.793 16.732a.91.91 0 0 0 .895.772l15.65.021a.908.908 0 0 0 .9-.747L23.863 3.42C23.953 2.19 22.956 1.15 21.722 1.15H2.433a11.9 11.9 0 0 0-1.049.191zm13.197 12.02l-4.896-.002-1.348-8.225h7.625l-1.381 8.227z" />
  </svg>
);

const CodebergIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="12" fill="#2185D0"/>
    <path fill="#FFF" d="M18.5 14L13.8 4.2c-.4-.9-1.3-.9-1.6 0L8.8 11.8 1 14c1 4.5 5 8 9.9 8h2.2c4.9 0 8.9-3.5 9.9-8H18.5z"/>
  </svg>
);

type Provider = "GITHUB" | "GITLAB" | "BITBUCKET" | "CODEBERG";

const providers = [
  { id: "GITHUB" as Provider, name: "GitHub", icon: GithubIcon, color: "hover:bg-zinc-800 text-white border-zinc-700" },
  { id: "GITLAB" as Provider, name: "GitLab", icon: GitlabIcon, color: "hover:bg-orange-500/10 text-white border-orange-500/50" },
  { id: "BITBUCKET" as Provider, name: "Bitbucket", icon: BitbucketIcon, color: "hover:bg-blue-500/10 text-white border-blue-500/50" },
  { id: "CODEBERG" as Provider, name: "Codeberg", icon: CodebergIcon, color: "hover:bg-sky-500/10 text-white border-sky-500/50" },
];

const getFileLanguage = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  switch (ext) {
    case "js":
    case "jsx": return "javascript";
    case "ts":
    case "tsx": return "typescript";
    case "html": return "html";
    case "css": return "css";
    case "json": return "json";
    case "py": return "python";
    case "java": return "java";
    case "cpp":
    case "cc":
    case "c": return "cpp";
    case "go": return "go";
    case "rs": return "rust";
    case "md": return "markdown";
    case "sh": return "bash";
    case "yaml":
    case "yml": return "yaml";
    default: return "text";
  }
};



export default function GitClient() {
  const [activeProvider, setActiveProvider] = useState<Provider>("GITHUB");
  const [connectedProviders, setConnectedProviders] = useState<Provider[]>([]);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [activeRepo, setActiveRepo] = useState<any>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [activeBranch, setActiveBranch] = useState("");
  const [commits, setCommits] = useState<any[]>([]);
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [githubToken, setGithubToken] = useState("");

  const [isAddRepoOpen, setIsAddRepoOpen] = useState(false);
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoPrivate, setNewRepoPrivate] = useState(true);
  const [isAddingRepo, setIsAddingRepo] = useState(false);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [commitMessage, setCommitMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<{name: string, content: string} | null>(null);

  // New Branch states
  const [isNewBranchOpen, setIsNewBranchOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);

  React.useEffect(() => {
    if (activeRepo && activeRepo.provider === "GITHUB" && githubToken) {
      // Simulate branches
      setBranches(["main", "develop", "feature/auth", "bugfix/header"]);
      
      // Simulate commits
      setCommits([
        {
          id: "a1b2c3d",
          message: "Update authentication flow",
          author: "Demo User",
          time: new Date().toLocaleDateString(),
          branch: "main"
        },
        {
          id: "e4f5g6h",
          message: "Fix layout bug in Sidebar",
          author: "Admin",
          time: new Date(Date.now() - 86400000).toLocaleDateString(),
          branch: "main"
        }
      ]);
    }
  }, [activeRepo, githubToken]);

  React.useEffect(() => {
    const savedToken = localStorage.getItem("ClearQ_github_token");
    if (savedToken) {
      setGithubToken(savedToken);
      setTokenInput(savedToken);
      setConnectedProviders(prev => prev.includes("GITHUB") ? prev : [...prev, "GITHUB"]);
      
      const mockedRepos = [
        {
          id: "1",
          name: "devcomplete-core",
          status: "SYNCED",
          provider: "GITHUB",
          defaultBranch: "main"
        },
        {
          id: "2",
          name: "frontend-app",
          status: "SYNCED",
          provider: "GITHUB",
          defaultBranch: "main"
        }
      ];
      
      setRepositories(prev => {
        const others = prev.filter(r => r.provider !== "GITHUB");
        return [...mockedRepos, ...others];
      });
      if (mockedRepos.length > 0) {
        setActiveRepo(mockedRepos[0]);
        setActiveBranch(mockedRepos[0].defaultBranch);
      }
    }
  }, []);

  const handleCreateRepo = async () => {
    if (!githubToken) return alert("Must connect GitHub first!");
    if (!newRepoName.trim()) return alert("Repository name required!");
    
    setIsAddingRepo(true);
    setTimeout(() => {
      const newRepo = {
        id: Math.random().toString(),
        name: newRepoName,
        status: "SYNCED",
        provider: "GITHUB",
        defaultBranch: "main"
      };
      setRepositories([newRepo, ...repositories]);
      setActiveRepo(newRepo);
      setActiveBranch(newRepo.defaultBranch);
      setIsAddRepoOpen(false);
      setNewRepoName("");
      setIsAddingRepo(false);
    }, 1000);
  };

  const handleDisconnect = () => {
    if (confirm("Are you sure you want to disconnect from " + providers.find(p => p.id === activeProvider)?.name + "?")) {
      if (activeProvider === "GITHUB") {
        localStorage.removeItem("ClearQ_github_token");
        setGithubToken("");
      }
      setConnectedProviders(prev => prev.filter(p => p !== activeProvider));
      setRepositories(prev => prev.filter(r => r.provider !== activeProvider));
      setActiveRepo(null);
      setBranches([]);
      setCommits([]);
    }
  };

  const handleUploadFiles = async () => {
    if (!githubToken || !activeRepo || filesToUpload.length === 0) return;
    setIsUploading(true);
    
    try {
      // Simulate upload delay
      await new Promise(r => setTimeout(r, 1000));
      
      const newCommit = {
        id: Math.random().toString(36).substring(2, 9),
        message: commitMessage || `Add ${filesToUpload.length} files`,
        author: "Current User",
        time: new Date().toLocaleDateString(),
        branch: activeBranch || activeRepo.defaultBranch
      };
      
      setCommits([newCommit, ...commits]);
      
      alert(`Successfully committed ${filesToUpload.length} file(s) to ${activeBranch || activeRepo.defaultBranch}!`);
      setIsUploadOpen(false);
      setFilesToUpload([]);
      setCommitMessage("");
    } catch(err: any) {
      alert("Upload error: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePreviewFile = async (file: File) => {
    try {
      const text = await file.text();
      setPreviewFile({ name: file.name, content: text });
    } catch (err) {
      alert("Cannot preview this file type");
    }
  };

  const handleCreateBranch = async () => {
    if (!githubToken || !activeRepo || !newBranchName.trim() || !activeBranch) return;
    setIsCreatingBranch(true);

    try {
      // Simulate branch creation
      await new Promise(r => setTimeout(r, 800));

      alert("Branch created successfully!");
      setBranches((prev) => [...prev, newBranchName]);
      setActiveBranch(newBranchName);
      setIsNewBranchOpen(false);
      setNewBranchName("");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsCreatingBranch(false);
    }
  };

  const handleDeploy = () => {
    setIsDeploying(true);
    setTimeout(() => setIsDeploying(false), 2000); // mock deploy action
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      if (activeProvider === "GITHUB") {
        if (!tokenInput.trim()) {
           throw new Error("A Personal Access Token is required to connect to GitHub.");
        }
        
        // Simulate delay
        await new Promise(r => setTimeout(r, 1000));
        
        const mappedRepos = [
          {
            id: "1",
            name: "devcomplete-core",
            status: "SYNCED",
            provider: "GITHUB",
            defaultBranch: "main"
          },
          {
            id: "2",
            name: "frontend-app",
            status: "SYNCED",
            provider: "GITHUB",
            defaultBranch: "main"
          }
        ];
        
        const otherRepos = repositories.filter((r: any) => r.provider !== "GITHUB");
        setRepositories([...mappedRepos, ...otherRepos]);

        if (mappedRepos.length > 0) {
          setActiveRepo(mappedRepos[0]);
          setActiveBranch(mappedRepos[0].defaultBranch);
        } else {
           setActiveRepo(null);
        }
        setGithubToken(tokenInput);
        localStorage.setItem("ClearQ_github_token", tokenInput);
      }

      if (!connectedProviders.includes(activeProvider)) {
        setConnectedProviders([...connectedProviders, activeProvider]);
      }
    } catch(err: any) {
      alert("Failed to connect: " + err.message);
    } finally {
      setIsConnecting(false);
      setTokenInput("");
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950 text-white">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-8 py-5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
            <GitBranch className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Source Control & Deployments</h1>
            <p className="text-sm text-zinc-400">Manage code, track changes, and automate builds.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {connectedProviders.includes(activeProvider) && (
            <button onClick={handleDisconnect} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 hover:border-red-500/50">
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          )}

          <button 
            onClick={() => connectedProviders.includes(activeProvider) ? setIsAddRepoOpen(true) : alert("Please connect to a provider first.")}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-zinc-900 shadow-lg shadow-white/10 transition-all hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            Add Repository
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 overflow-auto p-8 custom-scrollbar">
        <div className="mx-auto max-w-7xl space-y-8">
          
          {/* Workflows / Providers Row */}
          <div>
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Connected Workflows</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {providers.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActiveProvider(p.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 rounded-xl border p-6 transition-all duration-300",
                    activeProvider === p.id 
                      ? `bg-zinc-800/80 border-zinc-600 shadow-lg` 
                      : `bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 opacity-60 hover:opacity-100`
                  )}
                >
                  <p.icon className={cn(
                    "h-10 w-10", 
                    p.id === "BITBUCKET" ? "text-blue-500" : ""
                  )} />
                  <span className="font-semibold text-white flex items-center gap-2">
                    {p.name}
                    {connectedProviders.includes(p.id) && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                  </span>
                  {activeProvider === p.id && (
                    <motion.div layoutId="activeProviderIndicator" className="h-1 w-8 rounded-full bg-indigo-500 mt-2" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {connectedProviders.includes(activeProvider) ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Repositories & Branches */}
            <div className="lg:col-span-1 space-y-6">
              
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden backdrop-blur-sm">
                <div className="border-b border-zinc-800 p-4 flex items-center justify-between bg-zinc-900/50">
                  <h3 className="font-semibold text-zinc-200 flex items-center gap-2">
                    <FolderDot className="w-4 h-4 text-zinc-400"/>
                    Repositories
                  </h3>
                </div>
                <div className="p-2 space-y-1">
                  {repositories.filter(r => r.provider === activeProvider || activeProvider === "GITHUB").map(repo => (
                    <button
                      key={repo.id}
                      onClick={() => setActiveRepo(repo)}
                      className={cn(
                        "w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors",
                        activeRepo?.id === repo.id ? "bg-indigo-500/10 text-indigo-400" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                      )}
                    >
                      <span className="font-medium truncate">{repo.name}</span>
                      {repo.status === "SYNCED" 
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        : <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      }
                    </button>
                  ))}
                  {repositories.filter(r => r.provider === activeProvider || activeProvider === "GITHUB").length === 0 && (
                     <div className="p-4 text-center text-sm text-zinc-500">No repositories linked for this provider.</div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Col: Commits & Deployments */}
            <div className="lg:col-span-2 space-y-6">
               
              {/* Branch Manager */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden backdrop-blur-sm">
                 <div className="border-b border-zinc-800 p-4 flex items-center justify-between bg-zinc-900/50">
                  <h3 className="font-semibold text-zinc-200 flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-zinc-400"/>
                    Branch Manager
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="text-xs text-zinc-500 mb-2 block">Active Workspace Branch</label>
                    <select
                      value={activeBranch}
                      onChange={(e) => setActiveBranch(e.target.value)}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {branches.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                      {branches.length === 0 && <option value="">No branches found</option>}
                    </select>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex flex-1 gap-2">
                      <button className="flex-1 rounded-lg bg-zinc-800 py-2 text-xs font-medium text-white hover:bg-zinc-700 transition-colors">
                        Checkout Branch
                      </button>
                      <button 
                        onClick={() => { if(activeRepo) setIsNewBranchOpen(true); else alert("Select a repo first!"); }}
                        className="flex-1 rounded-lg border border-zinc-700 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
                      >
                        New Branch
                      </button>
                    </div>
                    <button 
                      onClick={() => setIsUploadOpen(true)}
                      className="flex-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 py-2 text-xs font-medium text-indigo-400 hover:bg-indigo-500/20 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      Upload to Branch
                    </button>
                  </div>
                </div>
              </div>

               {/* Deployments Section */}
               <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden backdrop-blur-sm shadow-xl shadow-black/20 opacity-70">
                  <div className="border-b border-zinc-800 p-5 flex items-center justify-between bg-gradient-to-r from-zinc-900 to-zinc-900/50">
                    <div>
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Server className="w-5 h-5 text-indigo-400" />
                        Deployments
                        <span className="ml-2 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-indigo-400 border border-indigo-500/20 uppercase">Coming Soon</span>
                      </h3>
                      <p className="text-sm text-zinc-400 mt-1">Manage and trigger builds for {activeRepo?.name || "your repo"}</p>
                    </div>
                    <button 
                      onClick={() => alert("CI/CD Deployment hook integrations are coming in a future update!")}
                      className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all shadow-lg bg-zinc-800/50 text-zinc-500 cursor-not-allowed border border-zinc-700/50"
                    >
                      <UploadCloud className="w-4 h-4" />
                      Deploy Now
                    </button>
                  </div>
                  <div className="divide-y divide-zinc-800/80 bg-zinc-950/50 p-4 min-h-[100px] flex items-center justify-center">
                    <p className="text-zinc-600 text-sm italic">Connect your Vercel, Netlify, or AWS webhooks soon.</p>
                  </div>
               </div>

                {/* Commits List */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden backdrop-blur-sm">
                  <div className="border-b border-zinc-800 p-4 flex items-center justify-between bg-zinc-900/50">
                    <h3 className="font-semibold text-zinc-200 flex items-center gap-2">
                      <GitCommit className="w-4 h-4 text-zinc-400"/>
                      Recent Updates
                    </h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="relative border-l-2 border-zinc-800 ml-3 space-y-6 pb-2">
                      {commits.length === 0 && <span className="text-zinc-500 text-sm ml-6">No recent commits found.</span>}
                      {commits.map((commit, idx) => (
                        <div key={commit.id} className="relative pl-6">
                            <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-zinc-500 ring-4 ring-zinc-950" />
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono font-bold text-indigo-400">{commit.id}</span>
                                <span className="text-sm font-medium text-zinc-200">{commit.message}</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-zinc-500">
                                <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-[8px] text-white overflow-hidden"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${commit.author}`} alt=""/></span>{commit.author}</span>
                                <span>•</span>
                                <span>{commit.time}</span>
                                <span>•</span>
                                <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[10px] text-zinc-400 border border-zinc-700/50">
                                  {commit.branch}
                                </span>
                              </div>
                            </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

            </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm mt-8 shadow-xl">
              <div className="mb-6 p-5 rounded-full bg-zinc-800/50 outline outline-1 outline-zinc-700">
                {React.createElement(providers.find(p => p.id === activeProvider)?.icon as any, { className: "w-16 h-16 opacity-90 text-white" })}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Connect to {providers.find(p => p.id === activeProvider)?.name}</h3>
              <p className="text-zinc-400 mb-8 max-w-md leading-relaxed">
                Authenticate with your {providers.find(p => p.id === activeProvider)?.name} account to sync repositories, view branches, and trigger automated deployments directly from ClearQ.
              </p>

              <div className="w-full max-w-sm space-y-4 text-left">
                <div>
                  <label className="text-sm font-medium text-zinc-300 flex mb-1.5 items-center justify-between">
                    Personal Access Token
                    <span className="text-[10px] text-indigo-400 hover:text-indigo-300 cursor-pointer">Where do I find this?</span>
                  </label>
                  <input 
                    type="password" 
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder={activeProvider === "GITHUB" ? "ghp_xxxxxxxxxxxxxxxxxxxx" : "Enter access token..."}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-inner"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Requires repo, workflow, and read:org scopes.</p>
                </div>
                <button 
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all shadow-lg",
                    isConnecting
                      ? "bg-zinc-800 text-zinc-400 cursor-not-allowed" 
                      : "bg-indigo-500 text-white hover:bg-indigo-400 shadow-indigo-500/20 hover:shadow-indigo-500/40"
                  )}
                >
                  {isConnecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                  {isConnecting ? "Authenticating..." : `Authorize ${providers.find(p => p.id === activeProvider)?.name}`}
                </button>
                
                <div className="relative mt-6 flex items-center py-2">
                  <div className="flex-grow border-t border-zinc-800"></div>
                  <span className="flex-shrink-0 px-4 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Or continue with</span>
                  <div className="flex-grow border-t border-zinc-800"></div>
                </div>

                <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition-colors shadow-sm">
                  Connect via OAuth App
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Repo Modal */}
      <AnimatePresence>
        {isAddRepoOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-2">Create New Repository</h3>
              <p className="text-sm text-zinc-400 mb-6">This will create a new repository directly on your {providers.find(p => p.id === activeProvider)?.name} account.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Repository Name</label>
                  <input
                    type="text"
                    value={newRepoName}
                    onChange={e => setNewRepoName(e.target.value)}
                    placeholder="e.g. awesome-project"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                
                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    id="private-repo"
                    checked={newRepoPrivate}
                    onChange={e => setNewRepoPrivate(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-indigo-500"
                  />
                  <label htmlFor="private-repo" className="text-sm font-medium text-zinc-300 cursor-pointer">
                    Private Repository
                  </label>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setIsAddRepoOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRepo}
                  disabled={isAddingRepo}
                  className="flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingRepo ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Files Modal */}
      <AnimatePresence>
        {isUploadOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-2">Upload Files</h3>
              <p className="text-sm text-zinc-400 mb-6">Select files to commit directly to the <span className="font-mono text-indigo-400">{activeBranch}</span> branch on {activeRepo?.name}.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Select Files</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-700 border-dashed rounded-lg cursor-pointer bg-zinc-900/50 hover:bg-zinc-800/80 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 text-zinc-500 mb-2" />
                      <p className="text-sm text-zinc-400">
                        <span>Click to select files</span>
                      </p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      multiple 
                      onChange={e => setFilesToUpload(Array.from(e.target.files || []))} 
                    />
                  </label>
                  
                  {filesToUpload.length > 0 && (
                    <div className="mt-3 max-h-32 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                      {filesToUpload.map((f, i) => (
                        <div key={i} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
                            <span className="text-sm text-zinc-300 truncate">{f.name}</span>
                          </div>
                          <button 
                            onClick={() => handlePreviewFile(f)}
                            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-indigo-400 transition-colors shrink-0"
                            title="Preview file content"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Commit Message</label>
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={e => setCommitMessage(e.target.value)}
                    placeholder="e.g. Upload new assets"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadFiles}
                  disabled={isUploading || filesToUpload.length === 0}
                  className="flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Commit Files"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Branch Modal */}
      <AnimatePresence>
        {isNewBranchOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-2">Create New Branch</h3>
              <p className="text-sm text-zinc-400 mb-6">Create a new branch in <span className="font-mono text-indigo-400">{activeRepo?.name}</span> based on <span className="font-mono text-indigo-400">{activeBranch}</span>.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Branch Name</label>
                  <input
                    type="text"
                    value={newBranchName}
                    onChange={e => setNewBranchName(e.target.value.replace(/\s+/g, '-'))}
                    placeholder="e.g. feature/new-login"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setIsNewBranchOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBranch}
                  disabled={isCreatingBranch || !newBranchName.trim()}
                  className="flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingBranch ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Create Branch"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Code Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 p-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  {previewFile.name}
                </h3>
                <button 
                  onClick={() => setPreviewFile(null)}
                  className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar bg-[#1E1E1E] rounded-b-2xl">
                <SyntaxHighlighter
                  language={getFileLanguage(previewFile.name)}
                  style={vscDarkPlus}
                  customStyle={{ margin: 0, padding: "1rem", background: "transparent", fontSize: "0.875rem" }}
                  showLineNumbers={true}
                  wrapLines={true}
                >
                  {previewFile.content}
                </SyntaxHighlighter>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
    </div>
  );
}

// Simple internal icon for MoreHorizontal
const MoreHorizontalIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);
