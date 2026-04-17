"use client";

import * as React from "react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Download,
  FileJson,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Database,
  FileText,
  Package,
  Users,
  Activity,
} from "lucide-react";

export default function ExportClient() {
  const { data: session, status } = useSession();
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  const userRole = (session?.user as any)?.role;
  const userPlan = (session?.user as any)?.plan;

  const hasAccess =
    ["ADMIN"].includes(userRole) ||
    ["PRO", "ENTERPRISE"].includes(userPlan);

  const handleExport = async () => {
    setIsExporting(true);
    setExportResult(null);

    try {
      const response = await fetch("/api/export");

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Export failed");
      }

      // Get filename from header or generate one
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `ClearQ-export-${Date.now()}.json`;

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportResult({
        success: true,
        message: "Your data has been exported successfully!",
      });
    } catch (error) {
      setExportResult({
        success: false,
        message: error instanceof Error ? error.message : "Export failed",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (!hasAccess) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-8 text-center">
            <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">
              Pro Feature Required
            </h1>
            <p className="text-gray-400 mb-6">
              Data export is available for Pro and Enterprise plan members.
              Upgrade your plan to access this feature.
            </p>
            <a
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-colors"
            >
              View Pricing
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Data Export & Backup
          </h1>
          <p className="text-gray-400">
            Download a complete backup of your account data
          </p>
        </div>

        {/* What's Included */}
        <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-violet-400" />
            What&apos;s Included in Your Export
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-[#0d0d1a] rounded-lg">
              <FileText className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-white">Tickets</h3>
                <p className="text-sm text-gray-400">
                  All tickets you&apos;ve created with comments and status history
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-[#0d0d1a] rounded-lg">
              <Package className="w-5 h-5 text-emerald-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-white">Assets</h3>
                <p className="text-sm text-gray-400">
                  All tracked assets with barcodes and specifications
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-[#0d0d1a] rounded-lg">
              <Users className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-white">Teams</h3>
                <p className="text-sm text-gray-400">
                  Your team memberships and roles
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-[#0d0d1a] rounded-lg">
              <Activity className="w-5 h-5 text-pink-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-white">Activity History</h3>
                <p className="text-sm text-gray-400">
                  Last 500 activity log entries
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Export Card */}
        <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-violet-500/20 rounded-xl">
              <FileJson className="w-8 h-8 text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Export as JSON
              </h2>
              <p className="text-gray-400">
                Download all your data in a structured JSON format
              </p>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Preparing Export...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download My Data
              </>
            )}
          </button>

          {exportResult && (
            <div
              className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
                exportResult.success
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-400"
              }`}
            >
              {exportResult.success ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              {exportResult.message}
            </div>
          )}
        </div>

        {/* Data Retention Notice */}
        <div className="bg-[#1a1a2e] rounded-xl border border-yellow-500/20 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            Data Retention Policy
          </h2>
          <div className="space-y-3 text-gray-400 text-sm">
            <p className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-white">3-Day Grace Period:</strong> If your
                subscription expires or payment fails, you have 3 days to update
                your payment information before your account is locked.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-white">30-Day Purge:</strong> Accounts that
                remain expired for more than 30 days will have all data permanently
                deleted. We strongly recommend exporting your data before this
                deadline.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-white">Secure Export:</strong> Your exported
                data is encrypted during transit and contains no sensitive
                authentication credentials.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

