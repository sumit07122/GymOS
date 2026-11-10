"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { PageHeader } from "@/components/design-system/page-header";
import { StatCard } from "@/components/design-system/stat-card";

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

  const currency = invoices[0]?.gym?.currency || "INR";

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Primary Actions */}
      <PageHeader
        title="Financial Ledger & Billing"
        description="Tax-compliant invoices, offline payment receipts, audited adjustments, and dues recovery."
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCreateInvoiceOpen(true)}
              variant="outline"
              className="border-line bg-white hover:bg-canvas text-ink text-xs h-9 rounded-lg shadow-xs"
            >
              <Receipt className="mr-1.5 h-3.5 w-3.5 text-pine" />
              <span>Issue Invoice</span>
            </Button>

            <Button
              onClick={() => setRecordPaymentOpen(true)}
              className="bg-pine hover:bg-pine/90 text-white text-xs h-9 rounded-lg shadow-xs transition"
            >
              <CreditCard className="mr-1.5 h-3.5 w-3.5" />
              <span>Record Payment</span>
            </Button>
          </div>
        }
      />

      {/* Financial Overview KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Invoiced"
          value={formatMoney(overview.totalInvoiced)}
          icon={FileText}
          subtext="Gross billings generated"
        />
        <StatCard
          label="Payments Cleared"
          value={formatMoney(overview.grossPayments)}
          icon={TrendingUp}
          subtext="Verified cash & digital intake"
        />
        <StatCard
          label="Outstanding Dues"
          value={formatMoney(overview.totalOutstandingDues)}
          icon={AlertCircle}
          trend={
            overview.totalOutstandingDues > 0
              ? { value: `${openDuesCount} pending invoices`, isPositive: false }
              : undefined
          }
          subtext="Uncollected receivables"
        />
        <StatCard
          label="Refunds & Credits"
          value={formatMoney(overview.totalRefunds)}
          icon={Wallet}
          subtext="Audited credit reversals"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-line text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("invoices")}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "invoices"
              ? "border-pine text-pine font-bold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Invoices ({invoices.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("payments")}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "payments"
              ? "border-pine text-pine font-bold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Payment Ledger ({payments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("dues")}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "dues"
              ? "border-pine text-pine font-bold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <span>Pending Dues ({openDuesCount})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "invoices" && (
        <InvoicesTable
          gymId={gymId}
          gymSlug={gymSlug}
          isOwner={isOwner}
          invoices={invoices}
          members={members}
          onRefresh={refreshData}
        />
      )}

      {activeTab === "payments" && (
        <PaymentsTable
          gymId={gymId}
          gymSlug={gymSlug}
          isOwner={isOwner}
          payments={payments}
          onRefresh={refreshData}
        />
      )}

      {activeTab === "dues" && (
        <DuesTable
          gymId={gymId}
          gymSlug={gymSlug}
          invoices={invoices.filter(
            (inv) => inv.dueAmount > 0 && inv.status !== "VOID" && inv.status !== "PAID"
          )}
          members={members}
          onRefresh={refreshData}
        />
      )}

      {/* Modals */}
      <CreateInvoiceModal
        gymId={gymId}
        gymSlug={gymSlug}
        open={createInvoiceOpen}
        onOpenChange={setCreateInvoiceOpen}
        members={members}
        onSuccess={refreshData}
      />

      <RecordPaymentModal
        gymId={gymId}
        gymSlug={gymSlug}
        open={recordPaymentOpen}
        onOpenChange={setRecordPaymentOpen}
        members={members}
        onSuccess={refreshData}
      />
    </div>
  );
}
