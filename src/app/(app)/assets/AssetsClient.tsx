"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Laptop,
  Monitor,
  Keyboard,
  Mouse,
  Headphones,
  Phone,
  Tablet,
  Printer,
  Router,
  Server,
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Tag,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Building,
  Shield,
  Barcode,
  QrCode,
  RefreshCw,
  Check,
  X,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Camera,
  ScanLine,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import JsBarcode from "jsbarcode";

// Pro feature access check component
function ProFeatureLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
    </div>
  );
}

function ProFeatureLocked({ featureName }: { featureName: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="rounded-full bg-amber-500/10 p-6">
        <Package className="h-12 w-12 text-amber-400" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white">{featureName} is a Pro Feature</h2>
        <p className="mt-2 max-w-md text-zinc-400">
          Upgrade to the Pro plan to access asset tracking with barcode generation, Dymo label printing, and more.
        </p>
      </div>
      <Button className="mt-4">Upgrade to Pro - $39/mo</Button>
    </div>
  );
}

// Asset type icons mapping
const assetTypeIcons: Record<string, React.ElementType> = {
  LAPTOP: Laptop,
  DESKTOP: Monitor,
  MONITOR: Monitor,
  KEYBOARD: Keyboard,
  MOUSE: Mouse,
  HEADSET: Headphones,
  PHONE: Phone,
  TABLET: Tablet,
  PRINTER: Printer,
  ROUTER: Router,
  SERVER: Server,
  OTHER: Package,
};

// Asset status colors
const statusColors: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  AVAILABLE: { bg: "bg-emerald-500/10", text: "text-emerald-400", icon: CheckCircle2 },
  IN_USE: { bg: "bg-sky-500/10", text: "text-sky-400", icon: User },
  MAINTENANCE: { bg: "bg-amber-500/10", text: "text-amber-400", icon: Clock },
  RETIRED: { bg: "bg-zinc-500/10", text: "text-zinc-400", icon: XCircle },
  LOST: { bg: "bg-red-500/10", text: "text-red-400", icon: AlertTriangle },
  DISPOSED: { bg: "bg-zinc-700/10", text: "text-zinc-500", icon: Trash2 },
};

interface Asset {
  id: string;
  assetTag: string;
  name: string;
  type: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  status: string;
  location?: string;
  department?: string;
  assignedToId?: string;
  assignedToName?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  price?: number;
  quantity?: number;
  isInventoryItem?: boolean;
  warrantyExpiry?: string;
  vendor?: string;
  poNumber?: string;
  specifications?: Record<string, string>;
  notes?: string;
  barcodeData?: string;
  createdAt: string;
}

export default function AssetsClient() {
  const { data: session, status } = useSession();
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState<Asset | null>(null);
  const [showBarcodeModal, setShowBarcodeModal] = React.useState(false);
  const barcodeRef = React.useRef<SVGSVGElement>(null);
  
  // Barcode scanning state
  const [showScannerModal, setShowScannerModal] = React.useState(false);
  const [scannerInput, setScannerInput] = React.useState("");
  const [scanResult, setScanResult] = React.useState<{ found: boolean; asset?: Asset } | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);
  const scannerInputRef = React.useRef<HTMLInputElement>(null);
  const cameraRef = React.useRef<HTMLDivElement>(null);
  const html5QrCodeRef = React.useRef<any>(null);

  // Form state for new asset
  const [formData, setFormData] = React.useState({
    name: "",
    type: "LAPTOP",
    manufacturer: "",
    model: "",
    serialNumber: "",
    status: "AVAILABLE",
    location: "",
    department: "",
    assignedToName: "",
    purchaseDate: "",
    purchasePrice: "",
    warrantyExpiry: "",
    vendor: "",
    poNumber: "",
    notes: "",
    // Specifications
    cpu: "",
    ram: "",
    storage: "",
    os: "",
  });

  // Computed values
  const userPlan = (session?.user as any)?.plan;
  const userRole = (session?.user as any)?.role;
  const hasProAccess =
    userPlan === "PRO" ||
    userPlan === "ENTERPRISE" ||
    userRole === "ADMIN" ||
    userRole === "ADMIN";

  // Set mounted on client
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch assets function
  const fetchAssets = React.useCallback(async () => {
    try {
      const res = await fetch("/api/assets");
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
      }
    } catch (error) {
      console.error("Failed to fetch assets:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch assets on mount
  React.useEffect(() => {
    if (mounted && hasProAccess) {
      fetchAssets();
    } else if (mounted) {
      setLoading(false);
    }
  }, [mounted, hasProAccess, fetchAssets]);

  // Generate barcode when asset is selected
  React.useEffect(() => {
    if (selectedAsset && barcodeRef.current && showBarcodeModal) {
      try {
        JsBarcode(barcodeRef.current, selectedAsset.assetTag, {
          format: "CODE128",
          width: 2,
          height: 80,
          displayValue: true,
          fontSize: 16,
          margin: 10,
          background: "#18181b",
          lineColor: "#ffffff",
        });
      } catch (error) {
        console.error("Barcode generation error:", error);
      }
    }
  }, [selectedAsset, showBarcodeModal]);

  // Create new asset
  const handleCreateAsset = async () => {
    try {
      const specifications: Record<string, string> = {};
      if (formData.cpu) specifications.cpu = formData.cpu;
      if (formData.ram) specifications.ram = formData.ram;
      if (formData.storage) specifications.storage = formData.storage;
      if (formData.os) specifications.os = formData.os;

      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
          specifications,
        }),
      });

      if (res.ok) {
        const newAsset = await res.json();
        setAssets((prev) => [newAsset, ...prev]);
        setShowCreateModal(false);
        resetForm();
        // Open barcode modal for the new asset
        setSelectedAsset(newAsset);
        setShowBarcodeModal(true);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create asset");
      }
    } catch (error) {
      console.error("Failed to create asset:", error);
    }
  };

  // Update existing asset
  const handleUpdateAsset = async () => {
    if (!selectedAsset) return;

    try {
      const specifications: Record<string, string> = {};
      if (formData.cpu) specifications.cpu = formData.cpu;
      if (formData.ram) specifications.ram = formData.ram;
      if (formData.storage) specifications.storage = formData.storage;
      if (formData.os) specifications.os = formData.os;

      const res = await fetch(`/api/assets/${selectedAsset.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
          specifications,
        }),
      });

      if (res.ok) {
        const updatedAsset = await res.json();
        setAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)));
        setShowCreateModal(false);
        resetForm();
        setSelectedAsset(null);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update asset");
      }
    } catch (error) {
      console.error("Failed to update asset:", error);
    }
  };

  // Handle edit click
  const handleEditClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setFormData({
      name: asset.name,
      type: asset.type,
      manufacturer: asset.manufacturer || "",
      model: asset.model || "",
      serialNumber: asset.serialNumber || "",
      status: asset.status,
      location: asset.location || "",
      department: asset.department || "",
      assignedToName: asset.assignedToName || "",
      purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split("T")[0] : "",
      purchasePrice: asset.purchasePrice?.toString() || "",
      warrantyExpiry: asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toISOString().split("T")[0] : "",
      vendor: asset.vendor || "",
      poNumber: asset.poNumber || "",
      notes: asset.notes || "",
      cpu: asset.specifications?.cpu || "",
      ram: asset.specifications?.ram || "",
      storage: asset.specifications?.storage || "",
      os: asset.specifications?.os || "",
    });
    setShowCreateModal(true);
  };

  // Delete asset
  const handleDeleteAsset = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this asset? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/assets/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setAssets((prev) => prev.filter((a) => a.id !== id));
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to delete asset");
      }
    } catch (error) {
      console.error("Failed to delete asset:", error);
      alert("An unexpected error occurred while deleting the asset");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "LAPTOP",
      manufacturer: "",
      model: "",
      serialNumber: "",
      status: "AVAILABLE",
      location: "",
      department: "",
      assignedToName: "",
      purchaseDate: "",
      purchasePrice: "",
      warrantyExpiry: "",
      vendor: "",
      poNumber: "",
      notes: "",
      cpu: "",
      ram: "",
      storage: "",
      os: "",
    });
  };

  // Barcode lookup function
  const handleBarcodeLookup = React.useCallback((barcode: string) => {
    const trimmedBarcode = barcode.trim().toUpperCase();
    if (!trimmedBarcode) return;

    // Search by asset tag or serial number
    const foundAsset = assets.find(
      (a) =>
        a.assetTag.toUpperCase() === trimmedBarcode ||
        a.serialNumber?.toUpperCase() === trimmedBarcode
    );

    if (foundAsset) {
      setScanResult({ found: true, asset: foundAsset });
      setSelectedAsset(foundAsset);
      // Auto-open the barcode modal to show asset details
      setTimeout(() => {
        setShowScannerModal(false);
        setShowBarcodeModal(true);
      }, 500);
    } else {
      setScanResult({ found: false });
    }
  }, [assets]);

  // Handle scanner input (for commercial USB barcode scanners)
  const handleScannerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBarcodeLookup(scannerInput);
      setScannerInput("");
    }
  };

  // Initialize camera scanner
  const startCameraScanner = React.useCallback(async () => {
    if (!cameraRef.current || html5QrCodeRef.current) return;

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("camera-scanner");
      html5QrCodeRef.current = scanner;
      setIsScanning(true);

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 100 },
          aspectRatio: 1.777,
        },
        (decodedText) => {
          // Barcode detected!
          handleBarcodeLookup(decodedText);
          stopCameraScanner();
        },
        () => {} // Ignore errors during scanning
      );
    } catch (error) {
      console.error("Camera scanner error:", error);
      setIsScanning(false);
    }
  }, [handleBarcodeLookup]);

  const stopCameraScanner = React.useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
    }
    setIsScanning(false);
  }, []);

  // Cleanup camera on modal close
  React.useEffect(() => {
    if (!showScannerModal) {
      stopCameraScanner();
      setScanResult(null);
      setScannerInput("");
    }
  }, [showScannerModal, stopCameraScanner]);

  // Print barcode (Dymo integration)
  const handlePrintLabel = () => {
    if (!selectedAsset) return;

    // Check if Dymo framework is available
    const dymoLabel = (window as any).dymo;
    if (dymoLabel) {
      // Dymo Label Framework is installed
      try {
        const labelXml = `<?xml version="1.0" encoding="utf-8"?>
<DieCutLabel Version="8.0" Units="twips">
  <PaperOrientation>Landscape</PaperOrientation>
  <Id>Address</Id>
  <ObjectInfo>
    <BarcodeObject>
      <Name>Barcode</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0"/>
      <BackColor Alpha="0" Red="255" Green="255" Blue="255"/>
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <BarcodeFormat>Code128Auto</BarcodeFormat>
      <Data>${selectedAsset.assetTag}</Data>
      <ShowText>True</ShowText>
    </BarcodeObject>
  </ObjectInfo>
  <ObjectInfo>
    <TextObject>
      <Name>AssetName</Name>
      <Text>${selectedAsset.name}</Text>
    </TextObject>
  </ObjectInfo>
</DieCutLabel>`;
        
        const label = dymoLabel.label.Framework.openLabelXml(labelXml);
        const printers = dymoLabel.label.Framework.getPrinters();
        if (printers.length > 0) {
          label.print(printers[0].name);
        } else {
          alert("No Dymo printer found. Please connect a Dymo label printer.");
        }
      } catch (error) {
        console.error("Dymo print error:", error);
        alert("Error printing label. Make sure Dymo Label Framework is installed.");
      }
    } else {
      // Fallback: Open print dialog with barcode
      const printWindow = window.open("", "_blank");
      if (printWindow && barcodeRef.current) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Asset Label - ${selectedAsset.assetTag}</title>
            <style>
              body { 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: center; 
                min-height: 100vh; 
                margin: 0;
                font-family: Arial, sans-serif;
              }
              .label {
                border: 2px solid #000;
                padding: 20px;
                text-align: center;
              }
              .asset-name {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .asset-details {
                font-size: 10px;
                color: #666;
                margin-top: 10px;
              }
              @media print {
                .label { border: none; }
              }
            </style>
          </head>
          <body>
            <div class="label">
              <div class="asset-name">${selectedAsset.name}</div>
              ${barcodeRef.current.outerHTML.replace(/fill="[^"]*"/g, 'fill="#000"').replace(/background="[^"]*"/g, 'background="#fff"')}
              <div class="asset-details">
                ${selectedAsset.manufacturer || ""} ${selectedAsset.model || ""}<br/>
                S/N: ${selectedAsset.serialNumber || "N/A"}
              </div>
            </div>
            <script>window.onload = function() { window.print(); }</script>
          </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  // Filter assets
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assignedToName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !typeFilter || asset.type === typeFilter;
    const matchesStatus = !statusFilter || asset.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return <ProFeatureLoading />;
  }

  // Show loading while mounting or session loading
  if (!mounted || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  if (!hasProAccess) {
    return <ProFeatureLocked featureName="Asset Tracking" />;
  }

  const AssetIcon = selectedAsset ? assetTypeIcons[selectedAsset.type] || Package : Laptop;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Assets</h1>
          <p className="text-zinc-400">
            Manage and track all your hardware assets
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {[
          { label: "Total Assets", value: assets.length, icon: Package, color: "text-teal-400" },
          { label: "Total Value", value: `$${assets.reduce((sum, a) => sum + (Number((a as any).purchasePrice || (a as any).price || 0) * ((a as any).quantity || 1)), 0).toLocaleString()}`, icon: DollarSign, color: "text-emerald-400" },
          { label: "Available", value: assets.filter((a) => a.status === "AVAILABLE").length, icon: CheckCircle2, color: "text-emerald-400" },
          { label: "In Use", value: assets.filter((a) => a.status === "IN_USE").length, icon: User, color: "text-sky-400" },
          { label: "Maintenance", value: assets.filter((a) => a.status === "MAINTENANCE").length, icon: Clock, color: "text-amber-400" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg bg-zinc-800 p-2 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-zinc-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search assets by name, tag, serial, or assignee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 py-2 pl-10 pr-4 text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-white focus:border-teal-500 focus:outline-none"
        >
          <option value="">All Types</option>
          <option value="LAPTOP">Laptop</option>
          <option value="DESKTOP">Desktop</option>
          <option value="MONITOR">Monitor</option>
          <option value="KEYBOARD">Keyboard</option>
          <option value="MOUSE">Mouse</option>
          <option value="HEADSET">Headset</option>
          <option value="PHONE">Phone</option>
          <option value="TABLET">Tablet</option>
          <option value="PRINTER">Printer</option>
          <option value="SERVER">Server</option>
          <option value="OTHER">Other</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-white focus:border-teal-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="IN_USE">In Use</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="RETIRED">Retired</option>
          <option value="LOST">Lost</option>
        </select>
        
        {/* Scan Barcode Button */}
        <Button
          onClick={() => setShowScannerModal(true)}
          variant="outline"
          className="gap-2 border-teal-500/50 text-teal-400 hover:bg-teal-500/10"
        >
          <ScanLine className="h-4 w-4" />
          Scan Barcode
        </Button>
      </div>

      {/* Assets Table/Grid */}
      {filteredAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 py-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <Laptop className="h-24 w-24 text-zinc-700" />
          </motion.div>
          <h3 className="mt-6 text-lg font-semibold text-white">No assets found</h3>
          <p className="mt-2 text-zinc-400">
            {assets.length === 0
              ? "Get started by adding your first asset"
              : "Try adjusting your filters"}
          </p>
          {assets.length === 0 && (
            <Button onClick={() => setShowCreateModal(true)} className="mt-6">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Asset
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full">
            <thead className="border-b border-zinc-800 bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Asset</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Assigned To</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Location</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredAssets.map((asset) => {
                const TypeIcon = assetTypeIcons[asset.type] || Package;
                const statusInfo = statusColors[asset.status] || statusColors.AVAILABLE;
                const StatusIcon = statusInfo.icon;

                return (
                  <motion.tr
                    key={asset.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-zinc-900/30 hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-zinc-800 p-2">
                           <TypeIcon className="h-5 w-5 text-teal-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white">{(asset as any).name}</p>
                            {(asset as any).isInventoryItem && (
                              <span className="rounded bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-bold text-teal-400 border border-teal-500/20">
                                ASSET
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 font-mono">{(asset as any).assetTag}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-300">{(asset as any).type.replace("_", " ")}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                        <StatusIcon className="h-3 w-3" />
                        {(asset as any).status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-300">{(asset as any).assignedToName || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-300">{(asset as any).location || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {!(asset as any).isInventoryItem ? (
                          <>
                            <button
                              onClick={() => {
                                setSelectedAsset(asset);
                                setShowBarcodeModal(true);
                              }}
                              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                              title="View Barcode"
                            >
                              <Barcode className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditClick(asset)}
                              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAsset(asset.id)}
                              className="rounded-lg p-2 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <Link 
                            href="/inventory" 
                            className="text-xs text-teal-500 hover:text-teal-400 hover:underline transition-colors pr-2 italic"
                          >
                            Manage in Assets
                          </Link>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Asset Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} size="lg">
        <ModalHeader onClose={() => {
          setShowCreateModal(false);
          setSelectedAsset(null);
          resetForm();
        }}>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-500/10 p-2">
              <Plus className="h-5 w-5 text-teal-400" />
            </div>
            {selectedAsset ? "Edit Item" : "Add Item"}
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column - Device Preview */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800/30 p-8">
              <motion.div
                key={formData.type}
                initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="relative"
              >
                {React.createElement(assetTypeIcons[formData.type] || Package, {
                  className: "h-32 w-32 text-teal-400",
                  strokeWidth: 1,
                })}
                <motion.div
                  className="absolute -bottom-2 left-1/2 h-4 w-24 -translate-x-1/2 rounded-full bg-zinc-900/50 blur-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                />
              </motion.div>
              <div className="mt-6 text-center">
                <p className="text-lg font-semibold text-white">
                  {formData.name || "New Asset"}
                </p>
                <p className="text-sm text-zinc-400">
                  {formData.manufacturer} {formData.model}
                </p>
                {formData.serialNumber && (
                  <p className="mt-2 font-mono text-xs text-zinc-500">
                    S/N: {formData.serialNumber}
                  </p>
                )}
              </div>
              <div className="mt-6 flex items-center gap-2 text-zinc-500">
                <Barcode className="h-4 w-4" />
                <span className="text-xs">Barcode will be auto-generated</span>
              </div>
            </div>

            {/* Right Column - Form Fields */}
            <div className="space-y-4">
              {/* Basic Info */}
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <Tag className="h-4 w-4 text-teal-400" />
                  Basic Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs text-zinc-400">Asset Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., MacBook Pro 14-inch"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs text-zinc-400">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none"
                      >
                        <option value="LAPTOP">Laptop</option>
                        <option value="DESKTOP">Desktop</option>
                        <option value="MONITOR">Monitor</option>
                        <option value="KEYBOARD">Keyboard</option>
                        <option value="MOUSE">Mouse</option>
                        <option value="HEADSET">Headset</option>
                        <option value="PHONE">Phone</option>
                        <option value="TABLET">Tablet</option>
                        <option value="PRINTER">Printer</option>
                        <option value="SERVER">Server</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-zinc-400">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none"
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="IN_USE">In Use</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="RETIRED">Retired</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs text-zinc-400">Manufacturer</label>
                      <input
                        type="text"
                        value={formData.manufacturer}
                        onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                        placeholder="e.g., Apple"
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-zinc-400">Model</label>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        placeholder="e.g., A2779"
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-zinc-400">Serial Number</label>
                    <input
                      type="text"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      placeholder="e.g., C02XL3FGJGH5"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm font-mono text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Assignment */}
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <MapPin className="h-4 w-4 text-teal-400" />
                  Location & Assignment
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-zinc-400">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., NYC Office - Floor 3"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-zinc-400">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g., Engineering"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="mb-1 block text-xs text-zinc-400">Assigned To</label>
                  <input
                    type="text"
                    value={formData.assignedToName}
                    onChange={(e) => setFormData({ ...formData, assignedToName: e.target.value })}
                    placeholder="e.g., John Smith"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Purchase Info */}
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <DollarSign className="h-4 w-4 text-teal-400" />
                  Purchase Information
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-zinc-400">Purchase Date</label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-zinc-400">Purchase Price</label>
                    <input
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-zinc-400">Warranty Expiry</label>
                    <input
                      type="date"
                      value={formData.warrantyExpiry}
                      onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-zinc-400">Vendor</label>
                    <input
                      type="text"
                      value={formData.vendor}
                      onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                      placeholder="e.g., CDW"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Specifications (for computers) */}
              {["LAPTOP", "DESKTOP", "SERVER"].includes(formData.type) && (
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                    <Server className="h-4 w-4 text-teal-400" />
                    Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs text-zinc-400">CPU</label>
                      <input
                        type="text"
                        value={formData.cpu}
                        onChange={(e) => setFormData({ ...formData, cpu: e.target.value })}
                        placeholder="e.g., M3 Pro"
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-zinc-400">RAM</label>
                      <input
                        type="text"
                        value={formData.ram}
                        onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                        placeholder="e.g., 32GB"
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-zinc-400">Storage</label>
                      <input
                        type="text"
                        value={formData.storage}
                        onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                        placeholder="e.g., 1TB SSD"
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-zinc-400">OS</label>
                      <input
                        type="text"
                        value={formData.os}
                        onChange={(e) => setFormData({ ...formData, os: e.target.value })}
                        placeholder="e.g., macOS Sonoma"
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes about this asset..."
                  rows={2}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full items-center justify-between">
            <div>
              {selectedAsset && (
                <Button
                  variant="outline"
                  className="border-rose-500/50 text-rose-400 hover:bg-rose-500/10"
                  onClick={() => {
                    handleDeleteAsset(selectedAsset.id);
                    setShowCreateModal(false);
                    setSelectedAsset(null);
                    resetForm();
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Asset
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedAsset(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={selectedAsset ? handleUpdateAsset : handleCreateAsset}>
                {selectedAsset ? "Save Changes" : "Create Asset"}
              </Button>
            </div>
          </div>
        </ModalFooter>
      </Modal>

      {/* Barcode Modal */}
      <Modal isOpen={showBarcodeModal} onClose={() => setShowBarcodeModal(false)} size="md">
        <ModalHeader onClose={() => setShowBarcodeModal(false)}>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-500/10 p-2">
              <Barcode className="h-5 w-5 text-teal-400" />
            </div>
            Asset Label
          </div>
        </ModalHeader>
        <ModalBody>
          {selectedAsset && (
            <div className="flex flex-col items-center">
              {/* Animated Asset Icon */}
              <motion.div
                initial={{ scale: 0, rotateY: -180 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="mb-6"
              >
                <AssetIcon className="h-24 w-24 text-teal-400" strokeWidth={1} />
              </motion.div>

              {/* Asset Info */}
              <div className="mb-6 text-center">
                <h3 className="text-xl font-bold text-white">{selectedAsset.name}</h3>
                <p className="text-zinc-400">
                  {selectedAsset.manufacturer} {selectedAsset.model}
                </p>
                {selectedAsset.serialNumber && (
                  <p className="mt-1 font-mono text-sm text-zinc-500">
                    S/N: {selectedAsset.serialNumber}
                  </p>
                )}
              </div>

              {/* Barcode */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl border border-zinc-700 bg-zinc-800 p-4"
              >
                <svg ref={barcodeRef} />
              </motion.div>

              {/* Quick Info */}
              <div className="mt-6 grid w-full grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
                  <p className="text-zinc-500">Status</p>
                  <p className="font-medium text-white">{selectedAsset.status.replace("_", " ")}</p>
                </div>
                <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
                  <p className="text-zinc-500">Location</p>
                  <p className="font-medium text-white">{selectedAsset.location || "Not set"}</p>
                </div>
                <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
                  <p className="text-zinc-500">Assigned To</p>
                  <p className="font-medium text-white">{selectedAsset.assignedToName || "Unassigned"}</p>
                </div>
                <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
                  <p className="text-zinc-500">Department</p>
                  <p className="font-medium text-white">{selectedAsset.department || "Not set"}</p>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowBarcodeModal(false)}>
            Close
          </Button>
          <Button onClick={handlePrintLabel}>
            <Printer className="mr-2 h-4 w-4" />
            Print Label (Dymo)
          </Button>
        </ModalFooter>
      </Modal>

      {/* Scanner Modal */}
      <Modal isOpen={showScannerModal} onClose={() => setShowScannerModal(false)} size="md">
        <ModalHeader onClose={() => setShowScannerModal(false)}>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-500/10 p-2">
              <ScanLine className="h-5 w-5 text-teal-400" />
            </div>
            Scan Asset Barcode
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            {/* Scanner Input (for commercial USB barcode scanners) */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                <Barcode className="h-4 w-4 text-teal-400" />
                USB Barcode Scanner
              </label>
              <p className="mb-3 text-xs text-zinc-400">
                Click the field below and scan with your barcode scanner. The scanner acts like a keyboard and types the barcode automatically.
              </p>
              <div className="relative">
                <input
                  ref={scannerInputRef}
                  type="text"
                  value={scannerInput}
                  onChange={(e) => setScannerInput(e.target.value)}
                  onKeyDown={handleScannerKeyDown}
                  placeholder="Scan barcode or type asset tag (e.g., AST-00001)..."
                  autoFocus
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-3 font-mono text-lg text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
                <Zap className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-amber-400 animate-pulse" />
              </div>
              <Button
                onClick={() => {
                  handleBarcodeLookup(scannerInput);
                  setScannerInput("");
                }}
                disabled={!scannerInput}
                className="mt-3 w-full"
              >
                <Search className="mr-2 h-4 w-4" />
                Look Up Asset
              </Button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-zinc-700" />
              <span className="text-xs text-zinc-500">OR</span>
              <div className="h-px flex-1 bg-zinc-700" />
            </div>

            {/* Camera Scanner */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                <Camera className="h-4 w-4 text-teal-400" />
                Phone Camera Scanner
              </label>
              <p className="mb-3 text-xs text-zinc-400">
                Use your device&apos;s camera to scan barcodes. Works great on mobile!
              </p>
              
              {!isScanning ? (
                <Button onClick={startCameraScanner} variant="outline" className="w-full">
                  <Camera className="mr-2 h-4 w-4" />
                  Start Camera Scanner
                </Button>
              ) : (
                <div className="space-y-3">
                  <div
                    id="camera-scanner"
                    ref={cameraRef}
                    className="overflow-hidden rounded-lg border border-zinc-700"
                  />
                  <Button onClick={stopCameraScanner} variant="outline" className="w-full">
                    <X className="mr-2 h-4 w-4" />
                    Stop Camera
                  </Button>
                </div>
              )}
            </div>

            {/* Scan Result */}
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg border p-4 ${
                  scanResult.found
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-red-500/50 bg-red-500/10"
                }`}
              >
                {scanResult.found && scanResult.asset ? (
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    <div>
                      <p className="font-semibold text-white">{scanResult.asset.name}</p>
                      <p className="text-sm text-zinc-400">
                        {scanResult.asset.assetTag} • {scanResult.asset.status.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                    <div>
                      <p className="font-semibold text-white">Asset Not Found</p>
                      <p className="text-sm text-zinc-400">
                        No asset matches this barcode. Check the tag or add a new asset.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Tips */}
            <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
              <h4 className="mb-2 text-sm font-semibold text-white">Tips</h4>
              <ul className="space-y-1 text-xs text-zinc-400">
                <li>• USB scanners are fastest — just plug in and scan</li>
                <li>• Camera works best in good lighting</li>
                <li>• Supports CODE128 barcodes (standard for asset tags)</li>
                <li>• You can also type the asset tag manually</li>
              </ul>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowScannerModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

