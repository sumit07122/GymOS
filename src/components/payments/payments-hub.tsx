"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Receipt,
  CreditCard,
  TrendingUp,
  AlertCircle,
  FileText,
  Wallet,
} from "lucide-react";
import { InvoicesTable } from "./invoices-table";
import { PaymentsTable } from "./payments-table";
import { DuesTable } from "./dues-table";
import { CreateInvoiceModal } from "./create-invoice-modal";
import { RecordPaymentModal } from "./record-payment-modal";
import { FinancialOverview } from "@/lib/services/payment.service";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface PaymentsHubProps {
  gymId: string;
  gymSlug: string;
  isOwner: boolean;
  overview: FinancialOverview;
  invoices: any[];
  payments: any[];
  members: Array<{
    id: string;
    fullName: string;
    memberNumber: string;
    phone?: string | null;
    email?: string | null;
  }>;
}

export function PaymentsHub({
  gymId,
  gymSlug,
  isOwner,
  overview,
  invoices,
  payments,
  members,
}: PaymentsHubProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"invoices" | "payments" | "dues">("invoices");

  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);

  const refreshData = () => {
    router.refresh();
  };

  // Count open dues
  const openDuesCount = invoices.filter(
    (inv) => inv.dueAmount > 0 && inv.status !== "VOID" && inv.status !== "PAID"
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Primary Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Financial Ledger & Billing
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tax-compliant invoices, offline payment receipts, audited refunds, and dues recovery.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setCreateInvoiceOpen(true)}
            variant="outline"
            className="border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
          >
            <Receipt className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Issue Invoice
          </Button>

          <Button
            onClick={() => setRecordPaymentOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Financial Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoiced */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Invoiced
              </span>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                ₹{overview.totalInvoiced.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Subtotal + Taxes across all active invoices
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Net Revenue Collected */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Net Revenue Collected
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                ₹{overview.netRevenue.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Gross ₹{overview.grossPayments.toLocaleString()} - Refunds ₹{overview.totalRefunds.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Outstanding Dues */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Outstanding Dues
              </span>
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                ₹{overview.outstandingDues.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Uncollected accounts receivable balance
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Overdue Invoices */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Overdue Invoices
              </span>
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {overview.overdueInvoicesCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Invoices with elapsed payment due dates
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Breakdown Strip */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-600 dark:text-slate-300">
          Payment Modes Recorded:
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="bg-indigo-50/60 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
              UPI
            </Badge>
            <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
              ₹{(overview.paymentMethodBreakdown["UPI"] || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="bg-emerald-50/60 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
              CASH
            </Badge>
            <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
              ₹{(overview.paymentMethodBreakdown["CASH"] || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="bg-sky-50/60 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800">
              CARD
            </Badge>
            <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
              ₹{(overview.paymentMethodBreakdown["CARD"] || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="bg-amber-50/60 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
              BANK TRANSFER
            </Badge>
            <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
              ₹{(overview.paymentMethodBreakdown["BANK_TRANSFER"] || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("invoices")}
            className={`py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === "invoices"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Receipt className="h-4 w-4" />
            <span>Invoices & Billing</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {invoices.length}
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === "payments"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Payments & Receipts</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {payments.length}
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab("dues")}
            className={`py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === "dues"
                ? "border-rose-600 text-rose-600 dark:text-rose-400"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Wallet className="h-4 w-4" />
            <span>Outstanding Dues</span>
            {openDuesCount > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {openDuesCount}
              </Badge>
            )}
          </button>
        </nav>
      </div>

      {/* Tab Panels */}
      {activeTab === "invoices" && (
        <InvoicesTable
          gymId={gymId}
          gymSlug={gymSlug}
          invoices={invoices}
          members={members}
          isOwner={isOwner}
          onRefresh={refreshData}
        />
      )}

      {activeTab === "payments" && (
        <PaymentsTable
          gymId={gymId}
          gymSlug={gymSlug}
          payments={payments}
          isOwner={isOwner}
          onRefresh={refreshData}
        />
      )}

      {activeTab === "dues" && (
        <DuesTable
          gymId={gymId}
          gymSlug={gymSlug}
          invoices={invoices}
          members={members}
          onRefresh={refreshData}
        />
      )}

      {/* Issue Invoice Modal */}
      <CreateInvoiceModal
        gymId={gymId}
        gymSlug={gymSlug}
        members={members}
        open={createInvoiceOpen}
        onOpenChange={setCreateInvoiceOpen}
        onSuccess={refreshData}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        gymId={gymId}
        gymSlug={gymSlug}
        members={members}
        open={recordPaymentOpen}
        onOpenChange={setRecordPaymentOpen}
        onSuccess={refreshData}
      />
    </div>
  );
}
