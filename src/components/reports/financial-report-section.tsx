"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  TrendingUp,
  Receipt,
  HelpCircle,
} from "lucide-react";

interface FinancialReportSectionProps {
  currency: string;
  data: {
    invoicedAmount: number;
    paymentsCollected: number;
    totalRefunds: number;
    totalAdjustments: number;
    netRevenue: number;
    totalExpenses: number;
    netOperatingIncome: number;
    totalOutstandingDues: number;
    paymentMethodBreakdown: Array<{
      method: string;
      total: number;
      count: number;
    }>;
    expenseCategoryBreakdown: Array<{
      category: string;
      amount: number;
    }>;
  };
}

export function FinancialReportSection({
  currency,
  data,
}: FinancialReportSectionProps) {
  const isProfit = data.netOperatingIncome >= 0;

  return (
    <div className="space-y-6">
      {/* Financial Accounting Standard Note */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 text-slate-700 text-xs flex items-start gap-3">
        <HelpCircle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-900 block">
            Financial Accounting Principles & Integrity
          </span>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            <strong>Invoiced Billings</strong> represents total fee agreements issued to members. <strong>Payments Collected</strong> reflects verified funds received via Cash, UPI, Card, or Bank Transfer. <strong>Net Revenue</strong> subtracts approved refunds from gross receipts. <strong>Net Operating Income</strong> deducts operational expenses from Net Revenue to establish true profitability.
          </p>
        </div>
      </div>

      {/* P&L Statement Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span>Profit & Loss (P&L) Statement</span>
            </h3>
            <p className="text-xs text-slate-500">
              Operating income, expenses, and cash collections for the selected timeframe.
            </p>
          </div>

          <Badge
            className={
              isProfit
                ? "bg-emerald-50 text-emerald-700 border-emerald-300 text-xs"
                : "bg-rose-50 text-rose-700 border-rose-300 text-xs"
            }
          >
            {isProfit ? "Profitable Period" : "Loss-Making Period"}
          </Badge>
        </div>

        {/* Financial Flow Line-Items */}
        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-600">Total Invoiced Billings (Gross Accrual)</span>
            <span className="font-semibold text-slate-900 font-mono">
              {currency} {data.invoicedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between text-emerald-700">
            <span className="font-medium">(+) Gross Payments Collected (Cash Flow In)</span>
            <span className="font-bold font-mono">
              {currency} {data.paymentsCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between text-rose-600">
            <span>(-) Approved Member Refunds</span>
            <span className="font-semibold font-mono">
              - {currency} {data.totalRefunds.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between text-slate-500">
            <span>(±) Fee Adjustments & Credit Notes</span>
            <span className="font-mono">
              {currency} {data.totalAdjustments.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between font-bold text-slate-900 bg-slate-50/60 px-3 rounded-lg">
            <span>(=) Net Operating Revenue</span>
            <span className="font-mono text-emerald-700 text-sm">
              {currency} {data.netRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between text-rose-600">
            <span>(-) Operating Expenses Incurred</span>
            <span className="font-semibold font-mono">
              - {currency} {data.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div
            className={`py-3.5 flex items-center justify-between font-bold px-3 rounded-xl border ${
              isProfit
                ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                : "bg-rose-50/60 border-rose-200 text-rose-900"
            }`}
          >
            <div>
              <span className="text-sm">(=) Net Operating Income (P&L)</span>
              <span className="block text-[10px] font-normal text-slate-500">
                Net Revenue minus Total Operating Expenses
              </span>
            </div>
            <span className="text-base font-mono">
              {currency} {data.netOperatingIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between text-amber-800 bg-amber-50/40 px-3 rounded-lg">
            <div>
              <span className="font-bold">Total Outstanding Member Dues</span>
              <span className="block text-[10px] text-amber-700">
                Uncollected balances across all issued/overdue invoices
              </span>
            </div>
            <span className="font-bold font-mono text-amber-900 text-sm">
              {currency} {data.totalOutstandingDues.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Payment Methods */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <span>Payments Collected by Payment Method</span>
          </h4>

          {data.paymentMethodBreakdown.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No payments collected during this period.
            </div>
          ) : (
            <div className="space-y-3">
              {data.paymentMethodBreakdown.map((pm) => {
                const pct =
                  data.paymentsCollected > 0
                    ? Math.round((pm.total / data.paymentsCollected) * 100)
                    : 0;

                return (
                  <div key={pm.method} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800">
                        {pm.method.replace(/_/g, " ")}
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 font-mono">
                          {currency} {pm.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-slate-400 text-[10px] ml-1.5">
                          ({pct}% • {pm.count} txns)
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Expense Category Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Receipt className="h-4 w-4 text-rose-600" />
            <span>Operating Expenses by Category</span>
          </h4>

          {data.expenseCategoryBreakdown.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No expenses recorded during this period.
            </div>
          ) : (
            <div className="space-y-3">
              {data.expenseCategoryBreakdown.map((ec) => {
                const pct =
                  data.totalExpenses > 0
                    ? Math.round((ec.amount / data.totalExpenses) * 100)
                    : 0;

                return (
                  <div key={ec.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800">
                        {ec.category}
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 font-mono">
                          {currency} {ec.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-slate-400 text-[10px] ml-1.5">
                          ({pct}%)
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
