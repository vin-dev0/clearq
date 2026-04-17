"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Lock,
  Sparkles,
  ArrowUpDown,
  Loader2,
  PackagePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { getInventoryItems, createInventoryItem, updateInventoryItem, deleteInventoryItem } from "@/lib/actions/inventory";

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  price: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  lastUpdated: string;
}

// No mock data for brand new app
const sampleInventory: any[] = [];

const statusColors = {
  in_stock: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  low_stock: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  out_of_stock: "bg-rose-500/10 text-rose-400 border-rose-500/30",
};

const statusLabels = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
};

export default function InventoryClient() {
  const { data: session, status } = useSession();
  const [inventory, setInventory] = React.useState<InventoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<InventoryItem | null>(null);
  const [mounted, setMounted] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState({
    sku: "",
    name: "",
    category: "Licenses",
    quantity: "0",
    minStock: "10",
    price: "0",
  });

  const fetchInventory = React.useCallback(async () => {
    try {
      setError(null);
      const data = await getInventoryItems();
      const mapped = data.map((item: any) => {
        const quantity = item.quantity || 0;
        const minStock = item.minStock || 0;
        return {
          ...item,
          quantity,
          minStock,
          price: item.price || 0,
          status: (quantity === 0 ? "out_of_stock" : quantity <= minStock ? "low_stock" : "in_stock") as keyof typeof statusColors,
        };
      });
      setInventory(mapped);
    } catch (err: any) {
      console.error("Fetch error:", err);
      const errorMessage = err.message || "Unknown error";
      setError(`Failed to fetch inventory: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mounted && session?.user && status === "authenticated") {
      fetchInventory();
    }
  }, [mounted, session?.user?.id, status, fetchInventory]);

  const openAddModal = () => {
    setSelectedItem(null);
    setFormData({
      sku: "",
      name: "",
      category: "Licenses",
      quantity: "0",
      minStock: "10",
      price: "0",
    });
    setAddModalOpen(true);
  };

  const handleAddItem = async () => {
    if (!formData.sku || !formData.name) {
      alert("SKU and Name are required");
      return;
    }

    setSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        quantity: parseInt(formData.quantity) || 0,
        minStock: parseInt(formData.minStock) || 0,
        price: parseFloat(formData.price) || 0,
      };
      await createInventoryItem(dataToSubmit);
      alert("Item added successfully");
      setAddModalOpen(false);
      openAddModal(); // Clear form
      fetchInventory();
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Unique constraint") || err.message?.includes("sku")) {
        alert("Failed to add item. SKU must be unique across your organization.");
      } else {
        alert(`Failed to add item: ${err.message || "Unknown error"}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({
      sku: item.sku,
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      minStock: item.minStock.toString(),
      price: item.price.toString(),
    });
    setEditModalOpen(true);
  };

  const handleUpdateItem = async () => {
    if (!selectedItem) return;
    setSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        quantity: parseInt(formData.quantity) || 0,
        minStock: parseInt(formData.minStock) || 0,
        price: parseFloat(formData.price) || 0,
      };
      await updateInventoryItem(selectedItem.id, dataToSubmit);
      alert("Item updated successfully");
      setEditModalOpen(false);
      fetchInventory();
    } catch (err: any) {
      console.error(err);
      alert(`Failed to update item: ${err.message || "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      await deleteInventoryItem(id);
      alert("Item deleted");
      fetchInventory();
    } catch (err) {
      console.error(err);
      alert("Failed to delete item");
    }
  };

  if (!mounted || status === "loading" || (loading && session?.user)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          <p className="text-sm text-zinc-500">Loading inventory...</p>
        </div>
      </div>
    );
  }

  const userPlan = (session?.user as any)?.plan || "STARTER";
  const userRole = (session?.user as any)?.role || "CLIENT";

  // Check if user has Pro access (Pro/Enterprise plan OR Admin/Admin role)
  const hasProAccess = userPlan === "PRO" || userPlan === "ENTERPRISE" || userRole === "ADMIN" || userRole === "ADMIN";

  const categories = inventory.length > 0 
    ? [...new Set(inventory.map((i) => i.category))]
    : ["Licenses", "Hardware", "Services", "Add-ons"];

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: inventory.length,
    inStock: inventory.filter((i) => i.status === "in_stock").length,
    lowStock: inventory.filter((i) => i.status === "low_stock").length,
    outOfStock: inventory.filter((i) => i.status === "out_of_stock").length,
    totalValue: inventory.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0),
  };

  if (!hasProAccess) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20">
            <Lock className="h-8 w-8 text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Pro Feature</h2>
          <p className="mt-3 text-zinc-400">
            Inventory tracking is available on the Pro plan. Track products, services,
            and licenses to provide better support and sales integration.
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
          <h1 className="text-3xl font-bold text-white">Inventory</h1>
          <p className="mt-1 text-zinc-400">
            Track products, licenses, and services
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-rose-400">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-zinc-400" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-zinc-500">Total Items</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.inStock}</p>
              <p className="text-xs text-zinc-500">In Stock</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.lowStock}</p>
              <p className="text-xs text-zinc-500">Low Stock</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <TrendingDown className="h-5 w-5 text-rose-400" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.outOfStock}</p>
              <p className="text-xs text-zinc-500">Out of Stock</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-teal-400" />
            <div>
              <p className="text-2xl font-bold text-white">${stats.totalValue.toLocaleString()}</p>
              <p className="text-xs text-zinc-500">Total Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by name or SKU..."
            icon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white"
        >
          <option value="all">All Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">SKU</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Quantity</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item: any) => (
              <tr key={item.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/30">
                <td className="px-4 py-3 font-mono text-sm text-zinc-400">
                  <div className="flex items-center gap-2">
                    {item.sku}
                    {item.isAsset && (
                      <Badge variant="secondary" className="text-[10px] py-0 border-zinc-700">ASSET</Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-white">{item.name}</td>
                <td className="px-4 py-3 text-zinc-400">{item.category}</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "font-medium",
                    item.quantity <= item.minStock ? "text-amber-400" : "text-white"
                  )}>
                    {item.quantity}
                  </span>
                  {!item.isAsset && (
                    <span className="text-zinc-600"> / min {item.minStock}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-white">${Number(item.price).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <Badge className={statusColors[item.status as keyof typeof statusColors]}>
                    {statusLabels[item.status as keyof typeof statusLabels]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {!item.isAsset && (
                      <>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleEditItem(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon-sm" 
                          className="text-rose-400"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {item.isAsset && (
                      <Link href="/assets" className="text-xs text-teal-500 hover:underline italic transition-colors">
                        Manage in Assets
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredInventory.length === 0 && (
          <div className="py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-zinc-700" />
            <p className="mt-4 text-zinc-400">No inventory items found</p>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} size="md">
        <ModalHeader onClose={() => setAddModalOpen(false)}>
          Add Inventory Item
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">SKU</label>
                <Input 
                  placeholder="PROD-001" 
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Category</label>
                <select 
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option>Licenses</option>
                  <option>Hardware</option>
                  <option>Services</option>
                  <option>Add-ons</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">Name</label>
              <Input 
                placeholder="Product name" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Quantity</label>
                <Input 
                  placeholder="0" 
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Min Stock</label>
                <Input 
                  placeholder="10" 
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Price</label>
                <Input 
                  placeholder="0.00" 
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setAddModalOpen(false)}>Cancel</Button>
          <Button onClick={handleAddItem} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : "Add Asset"}
          </Button>
        </ModalFooter>
      </Modal>
      {/* Edit Item Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} size="md">
        <ModalHeader onClose={() => setEditModalOpen(false)}>
          Edit Inventory Item
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">SKU</label>
                <Input 
                  placeholder="PROD-001" 
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Category</label>
                <select 
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option>Licenses</option>
                  <option>Hardware</option>
                  <option>Services</option>
                  <option>Add-ons</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">Name</label>
              <Input 
                placeholder="Product name" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Quantity</label>
                <Input 
                  placeholder="0" 
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Min Stock</label>
                <Input 
                  placeholder="10" 
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Price</label>
                <Input 
                  placeholder="0.00" 
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateItem} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : "Save Changes"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

