"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TicketList } from "@/components/tickets/TicketList";
import { Button } from "@/components/ui/button";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Plus, Download, Upload, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";

function TicketsContent({ initialTickets }: { initialTickets: any[] }) {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status");
  const tagFilter = searchParams.get("tag");
  
  const [importModalOpen, setImportModalOpen] = React.useState(false);
  const [exportModalOpen, setExportModalOpen] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const [exportSuccess, setExportSuccess] = React.useState(false);
  const [importSuccess, setImportSuccess] = React.useState(false);

  const handleImport = async () => {
    setImporting(true);
    // Simulate import
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setImporting(false);
    setImportSuccess(true);
    setTimeout(() => {
      setImportModalOpen(false);
      setImportSuccess(false);
    }, 1500);
  };

  const handleExport = async (format: string) => {
    setExporting(true);
    // Simulate export
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Create a dummy file download
    const data = {
      exportedAt: new Date().toISOString(),
      format,
      tickets: [
        { id: 1234, subject: "Unable to login", status: "OPEN", priority: "HIGH" },
        { id: 1233, subject: "Payment error", status: "PENDING", priority: "URGENT" },
        { id: 1232, subject: "Feature request", status: "OPEN", priority: "LOW" },
      ],
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tickets-export-${new Date().toISOString().split("T")[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setExporting(false);
    setExportSuccess(true);
    setTimeout(() => {
      setExportModalOpen(false);
      setExportSuccess(false);
    }, 1500);
  };

  const getPageTitle = () => {
    if (tagFilter) return `Tickets tagged "${tagFilter}"`;
    if (!statusFilter) return "All Tickets";
    return `${statusFilter.replace("_", " ")} Tickets`;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-white">{getPageTitle()}</h1>
          <p className="text-sm text-zinc-400">
            {tagFilter
              ? `Showing tickets with tag ${tagFilter}`
              : statusFilter 
              ? `Showing ${statusFilter.toLowerCase().replace("_", " ")} tickets`
              : "Manage and respond to support tickets"
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)}>
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={() => setExportModalOpen(true)}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Link href="/tickets/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New Ticket
            </Button>
          </Link>
        </div>
      </div>

      {/* Ticket List */}
      <TicketList statusFilter={statusFilter} tagFilter={tagFilter} initialTickets={initialTickets} />

      {/* Import Modal */}
      <Modal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} size="md">
        <ModalHeader onClose={() => setImportModalOpen(false)}>Import Tickets</ModalHeader>
        <ModalBody>
          {importSuccess ? (
            <div className="flex flex-col items-center py-8">
              <div className="rounded-full bg-emerald-500/20 p-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-400" />
              </div>
              <p className="mt-4 text-lg font-medium text-white">Import Successful!</p>
              <p className="text-zinc-400">Your tickets have been imported.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-zinc-400">
                Upload a CSV or JSON file containing ticket data to import.
              </p>
              <div className="rounded-lg border-2 border-dashed border-zinc-700 p-8 text-center transition-colors hover:border-zinc-600">
                <Upload className="mx-auto h-10 w-10 text-zinc-500" />
                <p className="mt-3 text-sm text-zinc-400">
                  Drag and drop your file here, or{" "}
                  <label className="cursor-pointer text-teal-400 hover:underline">
                    browse
                    <input type="file" className="hidden" accept=".csv,.json" />
                  </label>
                </p>
                <p className="mt-1 text-xs text-zinc-500">CSV or JSON files up to 10MB</p>
              </div>
              <div className="rounded-lg bg-zinc-800/50 p-4">
                <p className="text-sm font-medium text-white">Expected format:</p>
                <pre className="mt-2 text-xs text-zinc-400 overflow-x-auto">
{`{
  "tickets": [
    {
      "subject": "Ticket subject",
      "description": "Description...",
      "priority": "HIGH",
      "type": "INCIDENT"
    }
  ]
}`}
                </pre>
              </div>
            </div>
          )}
        </ModalBody>
        {!importSuccess && (
          <ModalFooter>
            <Button variant="outline" onClick={() => setImportModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} isLoading={importing}>
              <Upload className="h-4 w-4" />
              Import Tickets
            </Button>
          </ModalFooter>
        )}
      </Modal>

      {/* Export Modal */}
      <Modal isOpen={exportModalOpen} onClose={() => setExportModalOpen(false)} size="md">
        <ModalHeader onClose={() => setExportModalOpen(false)}>Export Tickets</ModalHeader>
        <ModalBody>
          {exportSuccess ? (
            <div className="flex flex-col items-center py-8">
              <div className="rounded-full bg-emerald-500/20 p-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-400" />
              </div>
              <p className="mt-4 text-lg font-medium text-white">Export Complete!</p>
              <p className="text-zinc-400">Your file is downloading now.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-zinc-400">
                Choose a format to export your tickets.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleExport("json")}
                  disabled={exporting}
                  className="flex flex-col items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 p-6 transition-colors hover:border-teal-500 hover:bg-teal-500/10 disabled:opacity-50"
                >
                  <FileText className="h-10 w-10 text-teal-400" />
                  <div className="text-center">
                    <p className="font-medium text-white">JSON</p>
                    <p className="text-xs text-zinc-400">Structured data format</p>
                  </div>
                </button>
                <button
                  onClick={() => handleExport("csv")}
                  disabled={exporting}
                  className="flex flex-col items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 p-6 transition-colors hover:border-teal-500 hover:bg-teal-500/10 disabled:opacity-50"
                >
                  <FileText className="h-10 w-10 text-cyan-400" />
                  <div className="text-center">
                    <p className="font-medium text-white">CSV</p>
                    <p className="text-xs text-zinc-400">Spreadsheet compatible</p>
                  </div>
                </button>
              </div>
              {exporting && (
                <div className="flex items-center justify-center gap-2 text-teal-400">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Preparing export...</span>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        {!exportSuccess && !exporting && (
          <ModalFooter>
            <Button variant="outline" onClick={() => setExportModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        )}
      </Modal>
    </div>
  );
}

function TicketsLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
    </div>
  );
}

export default function TicketsClient({ initialTickets }: { initialTickets: any[] }) {
  return (
    <Suspense fallback={<TicketsLoading />}>
      <TicketsContent initialTickets={initialTickets} />
    </Suspense>
  );
}
