"use client";

import { Package, AlertTriangle, Layers, DollarSign } from "lucide-react";
import { InventoryOverview } from "@/lib/services/inventory.service";
import { StatCard } from "@/components/design-system/stat-card";

interface InventoryOverviewCardsProps {
  overview: InventoryOverview;
  currency?: string;
}

function fmt(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function InventoryOverviewCards({
  overview,
  currency = "INR",
}: InventoryOverviewCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      <StatCard
        label="Total Active SKUs"
        value={overview.totalItems}
        icon={Package}
        subtext={`${overview.categories.length} product categories`}
      />
      <StatCard
        label="Units In Stock"
        value={overview.totalUnitsInStock.toLocaleString("en-IN")}
        icon={Layers}
        subtext="Verified shelf count"
      />
      <StatCard
        label="Low Stock Alerts"
        value={overview.lowStockCount}
        icon={AlertTriangle}
        trend={
          overview.lowStockCount > 0
            ? { value: "Reorder required", isPositive: false }
            : undefined
        }
        subtext={overview.lowStockCount > 0 ? "Under reorder threshold" : "All SKUs stocked"}
      />
      <StatCard
        label="Inventory Valuation"
        value={fmt(overview.totalCostValuation, currency)}
        icon={DollarSign}
        subtext={`Retail value: ${fmt(overview.totalRetailValuation, currency)}`}
      />
    </div>
  );
}
