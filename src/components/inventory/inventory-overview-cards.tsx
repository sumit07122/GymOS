"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Package, AlertTriangle, Layers, DollarSign } from "lucide-react";
import { InventoryOverview } from "@/lib/services/inventory.service";

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
  const cards = [
    {
      label: "Total Items (SKUs)",
      value: overview.totalItems.toString(),
      sub: `${overview.categories.length} categories`,
      icon: Package,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Total Units in Stock",
      value: overview.totalUnitsInStock.toLocaleString("en-IN"),
      sub: "Active inventory units",
      icon: Layers,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Low Stock Alerts",
      value: overview.lowStockCount.toString(),
      sub: overview.lowStockCount > 0 ? "Requires reordering" : "All stock healthy",
      icon: AlertTriangle,
      color: overview.lowStockCount > 0 ? "text-amber-600" : "text-emerald-600",
      bg: overview.lowStockCount > 0 ? "bg-amber-50" : "bg-emerald-50",
    },
    {
      label: "Inventory Value (Cost)",
      value: fmt(overview.totalCostValuation, currency),
      sub: `Retail value: ${fmt(overview.totalRetailValuation, currency)}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="border border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-md ${card.bg}`}>
                <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-900 truncate">{card.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
