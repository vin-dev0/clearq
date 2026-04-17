"use client";

import * as React from "react";
import { 
  Terminal, 
  Search, 
  Code2, 
  Monitor, 
  Info, 
  ChevronRight, 
  Copy, 
  Check, 
  Play, 
  Save, 
  FileCode,
  Sparkles,
  Command,
  HelpCircle,
  X
} from "lucide-react";
import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Badge
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// ---- Data Definitions ----
const LANGUAGES = [
  { value: "powershell", label: "PowerShell", icon: "💎" },
  { value: "bash", label: "Bash", icon: "🐚" },
  { value: "python", label: "Python", icon: "🐍" },
  { value: "javascript", label: "JavaScript", icon: "🟨" },
  { value: "typescript", label: "TypeScript", icon: "🟦" },
  { value: "tsx", label: "TSX", icon: "⚛️" },
  { value: "html", label: "HTML", icon: "🌐" },
  { value: "css", label: "CSS", icon: "🎨" },
  { value: "rust", label: "Rust", icon: "🦀" },
  { value: "cpp", label: "C++", icon: "🤖" },
  { value: "c", label: "C", icon: "⚙️" },
  { value: "csharp", label: "C#", icon: "🎮" },
  { value: "kotlin", label: "Kotlin", icon: "📱" },
  { value: "swift", label: "Swift", icon: "🍎" },
  { value: "dart", label: "Dart", icon: "🎯" },
  { value: "ruby", label: "Ruby", icon: "💎" },
];

const EXTENSIONS: Record<string, string> = {
  powershell: ".ps1",
  bash: ".sh",
  python: ".py",
  javascript: ".js",
  typescript: ".ts",
  tsx: ".tsx",
  html: ".html",
  css: ".css",
  rust: ".rs",
  cpp: ".cpp",
  c: ".c",
  csharp: ".cs",
  kotlin: ".kt",
  swift: ".swift",
  dart: ".dart",
  ruby: ".rb",
};

const WINDOWS_CMDS = [
  { id: 1, cmd: "Get-Process", desc: "Lists all currently running processes.", script: "Get-Process | Sort-Object CPU -Descending | Select-Object -First 10" },
  { id: 2, cmd: "Get-Service", desc: "Gets the services on a local or remote computer.", script: "Get-Service | Where-Object {$_.Status -eq 'Running'}" },
  { id: 3, cmd: "Restart-Computer", desc: "Restarts the computer.", script: "Restart-Computer -Force" },
  { id: 4, cmd: "Test-Connection", desc: "PowerShell's version of ping.", script: "Test-Connection -ComputerName 8.8.8.8 -Count 4" },
  { id: 5, cmd: "Get-EventLog", desc: "Gets the events in an event log.", script: "Get-EventLog -LogName System -Newest 10" },
  { id: 6, cmd: "Set-ExecutionPolicy", desc: "Sets the user execution policy.", script: "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned" },
  { id: 7, cmd: "Get-Content", desc: "Reads the content of a file.", script: "Get-Content -Path '.\\log.txt' -Tail 10" },
  { id: 8, cmd: "Copy-Item", desc: "Copies an item from one location to another.", script: "Copy-Item -Path 'C:\\Source' -Destination '\\\\Server\\Backup' -Recurse" },
  { id: 9, cmd: "New-Item", desc: "Creates a new item.", script: "New-Item -Path 'C:\\Scripts' -Name 'init.ps1' -ItemType File" },
  { id: 10, cmd: "Invoke-WebRequest", desc: "Gets content from a web page on the internet.", script: "Invoke-WebRequest -Uri 'https://api.github.com' -Method Get" },
  { id: 11, cmd: "Get-HotFix", desc: "Gets the hotfixes that have been applied to the computer.", script: "Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 15" },
  { id: 12, cmd: "Get-NetIPAddress", desc: "Gets the IP address configuration.", script: "Get-NetIPAddress | Where-Object {$_.AddressFamily -eq 'IPv4'} | Select-Object InterfaceAlias, IPAddress" },
  { id: 13, cmd: "Clear-EventLog", desc: "Clears all entries from specified event logs.", script: "Clear-EventLog -LogName System, Application" },
  { id: 14, cmd: "New-LocalUser", desc: "Creates a new local user account.", script: "$Password = Read-Host -AsSecureString\nNew-LocalUser 'HelpDesk_Admin' -Password $Password -FullName 'Temporary Admin' -Description 'Created via ClearQ'" },
  { id: 15, cmd: "Get-Disk", desc: "Gets one or more disk objects visibly.", script: "Get-Disk | Select-Object Number, FriendlyName, OperationalStatus, Size" },
  { id: 16, cmd: "Stop-Service", desc: "Stops one or more running services.", script: "Stop-Service -Name 'Spooler' -Force" },
  { id: 17, cmd: "gpupdate", desc: "Refreshes local and Active Directory-based Group Policy settings.", script: "gpupdate /force" },
  { id: 18, cmd: "Get-Alias", desc: "Gets the aliases for cmdlets or other commands.", script: "Get-Alias | Where-Object {$_.Definition -like '*Process*'}" },
  { id: 19, cmd: "Compress-Archive", desc: "Creates a compressed archive from specified files.", script: "Compress-Archive -Path 'C:\\Logs\\*.log' -DestinationPath 'C:\\Backups\\Logs.zip' -Force" },
  { id: 20, cmd: "Expand-Archive", desc: "Extracts files from a specified archive file.", script: "Expand-Archive -Path '.\\Update.zip' -DestinationPath 'C:\\Updates\\v2'" },
];

const LINUX_CMDS = [
  { id: 1, cmd: "ls -la", desc: "List files with detailed information and hidden files.", script: "ls -la /var/log/" },
  { id: 2, cmd: "grep -r", desc: "Search for patterns recursively in directories.", script: "grep -r \"error\" /var/log/syslog" },
  { id: 3, cmd: "systemctl", desc: "Control the systemd system and service manager.", script: "sudo systemctl restart nginx" },
  { id: 4, cmd: "journalctl -u", desc: "Query and display logs from systemd-journald.", script: "journalctl -u docker.service -n 50 --no-pager" },
  { id: 5, cmd: "chmod", desc: "Change file mode bits (permissions).", script: "chmod +x startup.sh" },
  { id: 6, cmd: "chown", desc: "Change file admin and group.", script: "sudo chown -R www-data:www-data /var/www/html" },
  { id: 7, cmd: "df -h", desc: "Display free disk space in human-readable format.", script: "df -h --total" },
  { id: 8, cmd: "htop", desc: "Interactive system-monitor process-viewer.", script: "htop" },
  { id: 9, cmd: "ssh -i", desc: "Connect via SSH using a specific identity file.", script: "ssh -i ~/.ssh/key.pem user@remote-host" },
  { id: 10, cmd: "curl -X", desc: "Transfer data from or to a server.", script: "curl -X POST -H \"Content-type: application/json\" -d '{\"status\":\"up\"}' https://api.endpoint.com" },
  { id: 11, cmd: "find / -name", desc: "Search for files in a directory hierarchy.", script: "find /home/user/projects -name \"*.log\" -mtime -7" },
  { id: 12, cmd: "ps aux | grep", desc: "Report a snapshot of the current processes.", script: "ps aux | grep node | grep -v grep" },
  { id: 13, cmd: "top -n 1", desc: "Display Linux processes.", script: "top -b -n 1 | head -n 20" },
  { id: 14, cmd: "ufw status", desc: "Manage a Netfilter firewall.", script: "sudo ufw status numbered" },
  { id: 15, cmd: "netstat -tulpn", desc: "Print network connections, routing tables, etc.", script: "sudo netstat -tulpn | grep LISTEN" },
  { id: 16, cmd: "crontab -l", desc: "Maintain crontab files for individual users.", script: "crontab -l" },
  { id: 17, cmd: "tar -czvf", desc: "Store, list or extract files in an archive.", script: "tar -czvf backup-$(date +%F).tar.gz /var/www/html/uploads" },
  { id: 18, cmd: "du -sh *", desc: "Estimate file space usage.", script: "du -sh /var/log/* | sort -h" },
  { id: 19, cmd: "ln -s", desc: "Make links between files.", script: "ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/" },
  { id: 20, cmd: "ip a", desc: "Show / manipulate routing, network devices, interfaces and tunnels.", script: "ip -c a" },
];

export default function ScriptsPage() {
  const [language, setLanguage] = React.useState("powershell");
  const [code, setCode] = React.useState("");
  const [isCopied, setIsCopied] = React.useState(false);
  const [showCheatSheet, setShowCheatSheet] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const preRef = React.useRef<HTMLDivElement>(null);
  const lineNumbersRef = React.useRef<HTMLDivElement>(null);

  const syncScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = () => {
    if (!code) return;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `new_script${EXTENSIONS[language] || ".txt"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const ALL_CMDS = [...WINDOWS_CMDS.map(c => ({...c, platform: 'Windows'})), ...LINUX_CMDS.map(c => ({...c, platform: 'Linux'}))];
  const filteredCmds = ALL_CMDS.filter(c => 
    c.cmd.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Header bar */}
      <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
            <Terminal className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Automation Hub</h1>
            <p className="text-xs text-zinc-500">Engineer Scripting & Command Center</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-zinc-900 border-zinc-800 text-zinc-400 gap-1.5 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            IDE Active
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-zinc-400 hover:text-white"
            onClick={() => setShowCheatSheet(true)}
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Cheat Sheet
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Editor Section */}
        <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Editor Config */}
            <Card className="lg:col-span-1 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm self-start">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white">
                  <Monitor className="w-4 h-4 text-teal-400" />
                  Target Environment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-500 uppercase flex items-center gap-1.5">
                    <Code2 className="w-3 h-3 text-teal-400" />
                    Language Support
                  </label>
                  <div className="grid grid-cols-1 gap-1 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.value}
                        onClick={() => setLanguage(lang.value)}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all",
                          language === lang.value 
                            ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" 
                            : "text-zinc-400 hover:bg-zinc-800 hover:text-white border border-transparent"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span>{lang.icon}</span>
                          {lang.label}
                        </span>
                        {language === lang.value && <ChevronRight className="w-3 h-3 text-teal-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Code Editor */}
            <div className="lg:col-span-3 flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="default" className="border-zinc-800 text-zinc-400 capitalize">
                    {language}
                  </Badge>
                  <span className="text-xs text-zinc-600 font-mono">new_script{EXTENSIONS[language] || ".txt"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={handleCopy} className="text-zinc-400">
                    {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-teal-600 hover:bg-teal-500 text-white font-semibold"
                    onClick={handleSave}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Script
                  </Button>
                </div>
              </div>

              <div className="relative flex-1 group">
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
                
                <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl h-[600px] flex flex-col">
                  <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900/50 border-b border-zinc-800/50">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">editor.canvas</span>
                    </div>
                  </div>

                  <div className="flex-1 relative flex overflow-hidden">
                     <div 
                        ref={lineNumbersRef}
                        className="w-12 bg-zinc-900/30 border-r border-zinc-800/50 py-4 flex flex-col items-center select-none text-zinc-600 font-mono text-xs leading-6 overflow-hidden"
                     >
                        {Array.from({length: Math.max(code.split('\n').length, 25)}).map((_, i) => (
                           <div key={i} className="h-6 flex items-center">{i + 1}</div>
                        ))}
                     </div>

                     <div className="flex-1 relative h-full overflow-hidden bg-zinc-950">
                        <textarea
                          ref={textareaRef}
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          onScroll={syncScroll}
                          spellCheck={false}
                          className="absolute inset-0 z-10 w-full h-full bg-transparent p-4 text-transparent caret-teal-400 font-mono text-sm resize-none focus:outline-none whitespace-pre overflow-auto custom-scrollbar"
                          placeholder={`Write your ${language} script here...`}
                        />
                        <div 
                          ref={preRef}
                          className="absolute inset-0 w-full h-full p-0 pointer-events-none overflow-hidden"
                        >
                          <SyntaxHighlighter
                            language={language === 'powershell' ? 'powershell' : language}
                            style={vscDarkPlus}
                            customStyle={{
                              margin: 0,
                              padding: '1rem',
                              background: 'transparent',
                              fontSize: '0.875rem',
                              lineHeight: '1.5rem',
                              fontFamily: 'monospace',
                              width: '100%',
                              minHeight: '100%',
                              overflow: 'visible',
                              whiteSpace: 'pre'
                            }}
                          >
                            {code || ' '}
                          </SyntaxHighlighter>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Cheat Sheet Sidebar */}
        <AnimatePresence>
          {showCheatSheet && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCheatSheet(false)}
                className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute right-0 top-0 bottom-0 w-full max-w-sm z-50 bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col"
              >
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Command className="w-5 h-5 text-teal-400" />
                    <h2 className="text-lg font-bold text-white">Command Library</h2>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowCheatSheet(false)} className="text-zinc-400">
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="p-4 flex flex-col flex-1 overflow-hidden">
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input 
                      placeholder="Search commands..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-zinc-900 border-zinc-800 focus:ring-teal-500/50"
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest px-1">
                      System Command Templates
                    </p>
                    {filteredCmds.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-teal-500/30 hover:bg-zinc-800 transition-all cursor-pointer"
                        onClick={() => {
                          setCode(item.script);
                          if (item.platform === 'Windows') setLanguage('powershell');
                          else setLanguage('bash');
                          setShowCheatSheet(false);
                        }}
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-mono font-bold text-teal-400">{item.cmd}</span>
                            <Badge variant={item.platform === 'Windows' ? 'primary' : 'secondary'} className="w-fit text-[9px] px-1 py-0">
                              {item.platform}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-zinc-600 font-mono">#0{item.id}</span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed mb-3">{item.desc}</p>
                        <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-zinc-500 italic flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Use code
                          </span>
                          <ChevronRight className="w-3 h-3 text-teal-500" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-zinc-900/30 border-t border-zinc-800">
                   <div className="flex items-start gap-3 p-3 rounded-lg bg-teal-500/5 border border-teal-500/10 text-[11px] text-teal-400/80 leading-relaxed">
                     <Info className="w-4 h-4 flex-shrink-0" />
                     Tip: Clicking a command will automatically populate the editor with a best-practice starter script.
                   </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
}
