"use client";

import { TrendingDown, Calendar, DollarSign, Hash } from "lucide-react";
import { ExpenseOverview } from "@/lib/services/expense.service";
import { StatCard } from "@/components/design-system/stat-card";

interface ExpenseOverviewCardsProps {
  overview: ExpenseOverview;
  currency?: string;
}

function fmt(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ExpenseOverviewCards({ overview, currency = "INR" }: ExpenseOverviewCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      <StatCard
        label="This Month"
        value={fmt(overview.totalThisMonth, currency)}
        icon={Calendar}
        subtext={`${overview.countThisMonth} expense${overview.countThisMonth !== 1 ? "s" : ""}`}
      />
      <StatCard
        label="This Year (YTD)"
        value={fmt(overview.totalThisYear, currency)}
        icon={TrendingDown}
        subtext="Year to date outflow"
      />
      <StatCard
        label="All Time Total"
        value={fmt(overview.totalAllTime, currency)}
        icon={DollarSign}
        subtext="Lifetime operational expenses"
      />
      <StatCard
        label="Active Categories"
        value={String(overview.categoryBreakdown.length)}
        icon={Hash}
        subtext="Expense cost centers"
      />
    </div>
  );
}
