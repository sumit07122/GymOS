"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, AlertTriangle, Package } from "lucide-react";
import { InventoryOverviewCards } from "./inventory-overview-cards";
import { InventoryListTable } from "./inventory-list-table";
import { ItemFormModal } from "./item-form-modal";
import { StockAdjustmentModal } from "./stock-adjustment-modal";
import { archiveItemAction } from "@/lib/actions/inventory";
import { InventoryOverview } from "@/lib/services/inventory.service";
import { InventoryItem } from "@prisma/client";
import { PageHeader } from "@/components/design-system/page-header";

interface InventoryHubProps {
  items: InventoryItem[];
  overview: InventoryOverview;
  gymId: string;
  gymSlug: string;
  canManage: boolean;
  currency?: string;
}

export function InventoryHub({
  items,
  overview,
  gymId,
  gymSlug,
  canManage,
  currency = "INR",
}: InventoryHubProps) {
  const [activeTab, setActiveTab] = useState<"all" | "low_stock">("all");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Modals
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [targetItem, setTargetItem] = useState<InventoryItem | null>(null);

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setItemModalOpen(true);
  };

  const handleAdjustStock = (item: InventoryItem) => {
    setTargetItem(item);
    setStockModalOpen(true);
  };

  const handleArchive = async (item: InventoryItem) => {
    if (confirm(`Archive item "${item.name}"? It will be removed from active inventory.`)) {
      const formData = new FormData();
      formData.append("gymId", gymId);
      formData.append("gymSlug", gymSlug);
      formData.append("itemId", item.id);
      await archiveItemAction(null, formData);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeTab === "low_stock" && item.currentStock > item.reorderPoint) {
        return false;
      }
      if (categoryFilter !== "ALL" && item.category !== categoryFilter) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          (item.category?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [items, activeTab, categoryFilter, search]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set).sort();
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Retail & Inventory Management"
        description="Supplements, merchandise, retail consumables, stock levels, and replenishment reorders."
        actions={
          canManage && (
            <Button
              className="text-xs h-9 bg-pine hover:bg-pine/90 text-white rounded-lg shadow-xs transition"
              onClick={() => {
                setEditingItem(null);
                setItemModalOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              <span>Add Product SKU</span>
            </Button>
          )
        }
      />

      {/* KPI Overview Cards */}
      <InventoryOverviewCards overview={overview} currency={currency} />

      {/* Low stock alert banner */}
      {overview.lowStockCount > 0 && activeTab !== "low_stock" && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              <strong>{overview.lowStockCount} item{overview.lowStockCount !== 1 ? "s" : ""}</strong>{" "}
              have reached or dropped below their reorder threshold.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("low_stock")}
            className="text-xs font-semibold text-amber-800 underline hover:text-amber-950 ml-4 shrink-0"
          >
            Filter Low Stock &rarr;
          </button>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex border-b border-line text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "all"
              ? "border-pine text-pine font-bold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <Package className="h-4 w-4" />
          <span>All Inventory ({items.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("low_stock")}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "low_stock"
              ? "border-pine text-pine font-bold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span>Low Stock Reorders ({overview.lowStockCount})</span>
        </button>
      </div>

      {/* Search and category filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-xl border border-line shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU, or brand..."
            className="pl-9 text-xs h-9 bg-canvas border-line text-ink placeholder:text-muted rounded-lg"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-line bg-canvas h-9 px-3 text-xs text-ink focus:outline-hidden focus:ring-1 focus:ring-pine"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {(search || categoryFilter !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setCategoryFilter("ALL");
              }}
              className="text-xs h-9 text-muted hover:text-ink"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Table view */}
      <div className="rounded-xl border border-line bg-white shadow-xs overflow-hidden">
        <div className="p-4 border-b border-line">
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
            {activeTab === "low_stock" ? "Items Below Reorder Threshold" : "Stock Roster"}
          </h3>
        </div>
        <div className="p-0">
          <InventoryListTable
            items={filteredItems}
            currency={currency}
            canManage={canManage}
            onEdit={handleEdit}
            onAdjustStock={handleAdjustStock}
            onArchive={handleArchive}
          />
        </div>
      </div>

      {/* Item Modal (Add / Edit) */}
      <ItemFormModal
        open={itemModalOpen}
        onClose={() => {
          setItemModalOpen(false);
          setEditingItem(null);
        }}
        item={editingItem}
        gymId={gymId}
        gymSlug={gymSlug}
      />

      {/* Stock Adjustment Modal */}
      {targetItem && (
        <StockAdjustmentModal
          open={stockModalOpen}
          onClose={() => {
            setStockModalOpen(false);
            setTargetItem(null);
          }}
          item={targetItem}
          gymId={gymId}
          gymSlug={gymSlug}
        />
      )}
    </div>
  );
}
