"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, Calendar, DollarSign, Hash } from "lucide-react";
import { ExpenseOverview } from "@/lib/services/expense.service";

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
  const cards = [
    {
      label: "This Month",
      value: fmt(overview.totalThisMonth, currency),
      sub: `${overview.countThisMonth} expense${overview.countThisMonth !== 1 ? "s" : ""}`,
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "This Year",
      value: fmt(overview.totalThisYear, currency),
      sub: "Year to date",
      icon: TrendingDown,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "All Time Total",
      value: fmt(overview.totalAllTime, currency),
      sub: "Lifetime expenses",
      icon: DollarSign,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Categories",
      value: String(overview.categoryBreakdown.length),
      sub: "Active categories",
      icon: Hash,
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

