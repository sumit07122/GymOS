"use client";

import { ExpenseOverview } from "@/lib/services/expense.service";
import { PaymentMethod } from "@prisma/client";

interface CategoryBreakdownProps {
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

const METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash",
  UPI: "UPI",
  CARD: "Card",
  BANK_TRANSFER: "Bank Transfer",
  ONLINE_GATEWAY: "Online Gateway",
};

export function ExpenseCategoryBreakdown({ overview, currency = "INR" }: CategoryBreakdownProps) {
  if (overview.categoryBreakdown.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-8">
        No expense data to display yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">By Category</h3>
        <div className="space-y-2">
          {overview.categoryBreakdown.map((cat) => (
            <div key={cat.categoryId} className="flex items-center gap-3">
              <div className="w-28 shrink-0 text-xs text-slate-600 truncate">{cat.categoryName}</div>
              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
              <div className="w-24 shrink-0 text-right text-xs font-medium text-slate-700">
                {fmt(cat.total, currency)}
              </div>
              <div className="w-12 shrink-0 text-right text-xs text-slate-400">
                {cat.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment method breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">By Payment Method</h3>
        <div className="space-y-1">
          {overview.paymentMethodBreakdown.map((pm) => (
            <div
              key={pm.method}
              className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0"
            >
              <span className="text-xs text-slate-600">{METHOD_LABELS[pm.method]}</span>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-400">{pm.count} transactions</span>
                <span className="text-xs font-semibold text-slate-700">
                  {fmt(pm.total, currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly totals */}
      {overview.monthlyTotals.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Monthly Totals (Last 12 Months)</h3>
          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {[...overview.monthlyTotals].reverse().map((m) => (
              <div
                key={m.month}
                className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0"
              >
                <span className="text-xs text-slate-600">{m.month}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400">{m.count} expenses</span>
                  <span className="text-xs font-semibold text-slate-700">
                    {fmt(m.total, currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

