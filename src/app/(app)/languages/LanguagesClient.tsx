"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  Globe,
  Plus,
  Check,
  Settings,
  Languages,
  Lock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  enabled: boolean;
  isDefault: boolean;
  completionRate: number;
}

const availableLanguages: Language[] = [
  { code: "en", name: "English", nativeName: "English", enabled: true, isDefault: true, completionRate: 100 },
  { code: "es", name: "Spanish", nativeName: "Español", enabled: true, isDefault: false, completionRate: 95 },
  { code: "fr", name: "French", nativeName: "Français", enabled: true, isDefault: false, completionRate: 92 },
  { code: "de", name: "German", nativeName: "Deutsch", enabled: false, isDefault: false, completionRate: 88 },
  { code: "pt", name: "Portuguese", nativeName: "Português", enabled: false, isDefault: false, completionRate: 85 },
  { code: "it", name: "Italian", nativeName: "Italiano", enabled: false, isDefault: false, completionRate: 82 },
  { code: "ja", name: "Japanese", nativeName: "日本語", enabled: false, isDefault: false, completionRate: 78 },
  { code: "zh", name: "Chinese", nativeName: "中文", enabled: false, isDefault: false, completionRate: 75 },
  { code: "ko", name: "Korean", nativeName: "한국어", enabled: false, isDefault: false, completionRate: 70 },
  { code: "ar", name: "Arabic", nativeName: "العربية", enabled: false, isDefault: false, completionRate: 65 },
  { code: "ru", name: "Russian", nativeName: "Русский", enabled: false, isDefault: false, completionRate: 72 },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", enabled: false, isDefault: false, completionRate: 80 },
];

export default function LanguagesClient() {
  const { data: session, status, update } = useSession();
  const [languages, setLanguages] = React.useState(availableLanguages);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [settings, setSettings] = React.useState({
    autoDetect: true,
    autoTranslate: true,
  });
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings/languages");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
      setSettings({
        autoDetect: data.autoDetect,
        autoTranslate: data.autoTranslate
      });

      setLanguages(prev => prev.map(lang => ({
        ...lang,
        enabled: data.enabled.includes(lang.code),
        isDefault: data.default === lang.code
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (updates: any) => {
    setSaving(true);
    try {
      // Calculate new state based on current languages if not provided
      const currentDefault = updates.default || languages.find(l => l.isDefault)?.code || "en";
      const currentEnabled = updates.enabled || languages.filter(l => l.enabled).map(l => l.code);
      const currentAutoDetect = updates.autoDetect !== undefined ? updates.autoDetect : settings.autoDetect;
      const currentAutoTranslate = updates.autoTranslate !== undefined ? updates.autoTranslate : settings.autoTranslate;

      const res = await fetch("/api/admin/settings/languages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          default: currentDefault,
          enabled: currentEnabled,
          autoDetect: currentAutoDetect,
          autoTranslate: currentAutoTranslate
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || data.details || "Failed to save");
      }

      // Refresh session to apply new locale immediately
      if (updates.default) {
        await update({
          user: {
            ...session?.user,
            locale: updates.default
          }
        });
      }
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  const userPlan = (session?.user as any)?.plan || "STARTER";
  const userRole = (session?.user as any)?.role || "CLIENT";

  // Check if user has Pro access (Pro/Enterprise plan OR Admin/Admin role)
  const hasProAccess = userPlan === "PRO" || userPlan === "ENTERPRISE" || userRole === "ADMIN" || userRole === "ADMIN";

  const toggleLanguage = async (code: string) => {
    const newLanguages = languages.map((lang) =>
      lang.code === code ? { ...lang, enabled: !lang.enabled } : lang
    );
    setLanguages(newLanguages);
    await saveSettings({
      enabled: newLanguages.filter(l => l.enabled).map(l => l.code)
    });
  };

  const setDefaultLanguage = async (code: string) => {
    const newLanguages = languages.map((lang) => ({
      ...lang,
      isDefault: lang.code === code,
      enabled: lang.code === code ? true : lang.enabled,
    }));
    setLanguages(newLanguages);
    await saveSettings({
      default: code,
      enabled: newLanguages.filter(l => l.enabled).map(l => l.code)
    });
  };

  const toggleSetting = async (key: 'autoDetect' | 'autoTranslate') => {
    const newVal = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newVal }));
    await saveSettings({ [key]: newVal });
  };

  const enabledCount = languages.filter((l) => l.enabled).length;

  if (!hasProAccess) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20">
            <Lock className="h-8 w-8 text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Pro Feature</h2>
          <p className="mt-3 text-zinc-400">
            Multilingual support is available on the Pro plan. Support customers in their
            preferred language with automatic translations and localized content.
          </p>
          <Button className="mt-6">
            <Sparkles className="h-4 w-4" />
            Upgrade to Pro
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Languages</h1>
          <p className="mt-1 text-zinc-400">
            Configure multilingual support for your help desk
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{enabledCount}</p>
            <p className="text-xs text-zinc-500">Languages enabled</p>
          </div>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-500/10 p-2">
              <Globe className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Auto-Detection</h3>
              <p className="text-sm text-zinc-500">Detect customer language automatically</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-zinc-400">Enabled</span>
            <button 
              onClick={() => toggleSetting('autoTranslate')}
              className={cn("transition-colors", settings.autoTranslate ? "text-teal-400" : "text-zinc-600")}
            >
              {settings.autoTranslate ? (
                <ToggleRight className="h-6 w-6" />
              ) : (
                <ToggleLeft className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <Languages className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Auto-Translation</h3>
              <p className="text-sm text-zinc-500">Translate responses automatically</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-zinc-400">Enabled</span>
            <button 
              onClick={() => toggleSetting('autoDetect')}
              className={cn("transition-colors", settings.autoDetect ? "text-teal-400" : "text-zinc-600")}
            >
              {settings.autoDetect ? (
                <ToggleRight className="h-6 w-6" />
              ) : (
                <ToggleLeft className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2">
              <Settings className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Knowledge Base</h3>
              <p className="text-sm text-zinc-500">Translate KB articles</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-zinc-400">Enabled</span>
            <button className="text-zinc-600">
              <ToggleLeft className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Languages List */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
        <div className="border-b border-zinc-800 px-6 py-4">
          <h3 className="font-semibold text-white">Available Languages</h3>
          <p className="text-sm text-zinc-500">Enable languages your team can support</p>
        </div>

        <div className="divide-y divide-zinc-800">
          {languages.map((lang) => (
            <div
              key={lang.code}
              className="flex items-center justify-between px-6 py-4 hover:bg-zinc-800/30"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-lg font-bold text-white">
                  {lang.code.toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{lang.name}</span>
                    <span className="text-zinc-500">({lang.nativeName})</span>
                    {lang.isDefault && (
                      <Badge variant="default" className="text-xs">Default</Badge>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 w-24 rounded-full bg-zinc-800">
                      <div
                        className="h-1.5 rounded-full bg-teal-500"
                        style={{ width: `${lang.completionRate}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500">{lang.completionRate}% translated</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!lang.isDefault && lang.enabled && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDefaultLanguage(lang.code)}
                  >
                    Set as Default
                  </Button>
                )}
                <button
                  onClick={() => toggleLanguage(lang.code)}
                  disabled={lang.isDefault}
                  className={cn(
                    "transition-colors",
                    lang.isDefault && "cursor-not-allowed opacity-50"
                  )}
                >
                  {lang.enabled ? (
                    <ToggleRight className="h-6 w-6 text-teal-400" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-zinc-600" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

