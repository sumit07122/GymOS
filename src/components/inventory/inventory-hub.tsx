"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, AlertTriangle, Layers } from "lucide-react";
import { InventoryOverviewCards } from "./inventory-overview-cards";
import { InventoryListTable } from "./inventory-list-table";
import { ItemFormModal } from "./item-form-modal";
import { StockAdjustmentModal } from "./stock-adjustment-modal";
import { archiveItemAction } from "@/lib/actions/inventory";
import { InventoryOverview } from "@/lib/services/inventory.service";
import { InventoryItem } from "@prisma/client";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inventory & Products</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track gym supplies, merchandise, supplements, and audit stock movements.
          </p>
        </div>
        {canManage && (
          <Button
            size="sm"
            className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700 w-fit"
            onClick={() => {
              setEditingItem(null);
              setItemModalOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Item
          </Button>
        )}
      </div>

      {/* Overview Cards */}
      <InventoryOverviewCards overview={overview} currency={currency} />

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <Button
          variant={activeTab === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("all")}
          className={`text-xs gap-1.5 ${
            activeTab === "all" ? "bg-slate-900 text-white" : "text-slate-600"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          All Inventory ({items.length})
        </Button>

        <Button
          variant={activeTab === "low_stock" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("low_stock")}
          className={`text-xs gap-1.5 ${
            activeTab === "low_stock" ? "bg-slate-900 text-white" : "text-slate-600"
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          Low Stock Alerts ({overview.lowStockCount})
        </Button>
      </div>

      {/* Main card */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-3 pt-4 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold text-slate-700">
            {activeTab === "low_stock" ? "Low Stock Items" : "Stock Registry"}
          </CardTitle>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative min-w-44">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                className="pl-8 h-8 text-xs"
                placeholder="Search SKU or item…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-8 text-xs w-36">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <InventoryListTable
            items={filteredItems}
            onEdit={handleEdit}
            onAdjustStock={handleAdjustStock}
            onArchive={handleArchive}
            currency={currency}
            canManage={canManage}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <ItemFormModal
        open={itemModalOpen}
        item={editingItem}
        gymId={gymId}
        gymSlug={gymSlug}
        onClose={() => setItemModalOpen(false)}
      />

      <StockAdjustmentModal
        open={stockModalOpen}
        item={targetItem}
        gymId={gymId}
        gymSlug={gymSlug}
        onClose={() => setStockModalOpen(false)}
      />
    </div>
  );
}
