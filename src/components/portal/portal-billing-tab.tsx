"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Receipt,
  CreditCard,
  Calendar,
  CheckCircle2,
  Printer,
  ShieldCheck,
  FileText,
} from "lucide-react";

interface PortalBillingTabProps {
  gym: {
    name: string;
    currency: string;
    address?: string | null;
    phone?: string | null;
  };
  member: {
    fullName: string;
    memberCode: string;
    email?: string | null;
  };
  billing: {
    totalInvoiced: number;
    totalPaid: number;
    outstandingBalance: number;
    invoices: Array<{
      id: string;
      invoiceNumber: string;
      issueDate: string;
      dueDate: string;
      subtotal: number;
      taxAmount: number;
      totalAmount: number;
      paidAmount: number;
      dueAmount: number;
      status: string;
      notes?: string | null;
      allocations: Array<{
        id: string;
        amount: number;
        paymentNumber: string;
        paymentMethod: string;
        receivedAt: string;
      }>;
    }>;
    payments: Array<{
      id: string;
      paymentNumber: string;
      amount: number;
      method: string;
      status: string;
      receivedAt: string;
      isGatewayVerified: boolean;
      notes?: string | null;
    }>;
  };
}

export function PortalBillingTab({
  gym,
  member,
  billing,
}: PortalBillingTabProps) {
  const [selectedInvoice, setSelectedInvoice] = React.useState<
    (typeof billing.invoices)[0] | null
  >(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 text-[10px]">
            Paid
          </Badge>
        );
      case "PARTIALLY_PAID":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30 text-[10px]">
            Partially Paid
          </Badge>
        );
      case "VOID":
        return (
          <Badge className="bg-slate-100 text-slate-500 text-[10px]">
            Void
          </Badge>
        );
      default:
        return (
          <Badge className="bg-rose-500/15 text-rose-700 border-rose-500/30 text-[10px]">
            Unpaid
          </Badge>
        );
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* 1. Financial Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Total Invoiced
          </span>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {gym.currency} {billing.totalInvoiced.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500">
            {billing.invoices.length} invoices issued
          </span>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
            Total Paid
          </span>
          <div className="mt-1 text-2xl font-bold text-emerald-900">
            {gym.currency} {billing.totalPaid.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-600">
            {billing.payments.length} transactions completed
          </span>
        </div>

        <div
          className={`rounded-2xl p-4 shadow-sm border ${
            billing.outstandingBalance > 0
              ? "border-amber-200 bg-amber-50/60"
              : "border-slate-200 bg-white"
          }`}
        >
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider ${
              billing.outstandingBalance > 0
                ? "text-amber-800"
                : "text-slate-400"
            }`}
          >
            Outstanding Dues
          </span>
          <div
            className={`mt-1 text-2xl font-bold ${
              billing.outstandingBalance > 0
                ? "text-amber-900"
                : "text-slate-900"
            }`}
          >
            {gym.currency} {billing.outstandingBalance.toFixed(2)}
          </div>
          <span
            className={`text-[11px] ${
              billing.outstandingBalance > 0
                ? "text-amber-700 font-medium"
                : "text-slate-500"
            }`}
          >
            {billing.outstandingBalance > 0
              ? "Please clear at front desk"
              : "All accounts fully settled"}
          </span>
        </div>
      </div>

      {/* 2. Invoices & Receipts List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Invoices & Official Receipts
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            {billing.invoices.length} invoices
          </span>
        </div>

        {billing.invoices.length > 0 ? (
          <div className="mt-3 divide-y divide-slate-100">
            {billing.invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3.5 gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </span>
                    {getStatusBadge(inv.status)}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Issued: {new Date(inv.issueDate).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>
                      Due: {new Date(inv.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">
                      {gym.currency} {inv.totalAmount.toFixed(2)}
                    </div>
                    {inv.dueAmount > 0 ? (
                      <span className="text-[10px] text-amber-600 font-medium">
                        Due: {gym.currency} {inv.dueAmount.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-600 font-medium">
                        Settled
                      </span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedInvoice(inv)}
                    className="h-8 text-xs gap-1 border-slate-200"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>View Receipt</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            No invoices have been issued to your account yet.
          </div>
        )}
      </div>

      {/* 3. Payment History Ledger */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Payment History
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            {billing.payments.length} transactions
          </span>
        </div>

        {billing.payments.length > 0 ? (
          <div className="mt-3 divide-y divide-slate-100">
            {billing.payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {p.paymentNumber}
                    </span>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {p.method}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    {new Date(p.receivedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-700">
                    +{gym.currency} {p.amount.toFixed(2)}
                  </span>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Completed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            No payments recorded yet.
          </div>
        )}
      </div>

      {/* Printable Receipt Modal */}
      {selectedInvoice && (
        <Dialog
          open={!!selectedInvoice}
          onOpenChange={(open) => !open && setSelectedInvoice(null)}
        >
          <DialogContent className="max-w-md p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Payment Receipt</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handlePrint}
                  className="h-8 gap-1 text-xs"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </Button>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-xs text-slate-700 mt-2">
              {/* Gym Header */}
              <div className="text-center border-b border-slate-200 pb-3">
                <h3 className="font-bold text-base text-slate-900 uppercase">
                  {gym.name}
                </h3>
                {gym.address && <p className="text-slate-500">{gym.address}</p>}
                {gym.phone && <p className="text-slate-500">Tel: {gym.phone}</p>}
              </div>

              {/* Receipt Details */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">
                    INVOICE NO
                  </span>
                  <span className="font-bold">{selectedInvoice.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">
                    DATE ISSUED
                  </span>
                  <span>
                    {new Date(selectedInvoice.issueDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">MEMBER</span>
                  <span className="font-semibold">{member.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">MEMBER ID</span>
                  <span>{member.memberCode}</span>
                </div>
              </div>

              {/* Line Totals */}
              <div className="space-y-1.5 border-t border-b border-slate-200 py-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>
                    {gym.currency} {selectedInvoice.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>
                    {gym.currency} {selectedInvoice.taxAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-100">
                  <span>Total Amount:</span>
                  <span>
                    {gym.currency} {selectedInvoice.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Amount Paid:</span>
                  <span>
                    {gym.currency} {selectedInvoice.paidAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-rose-700">
                  <span>Balance Due:</span>
                  <span>
                    {gym.currency} {selectedInvoice.dueAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Allocations Breakdown */}
              {selectedInvoice.allocations.length > 0 && (
                <div>
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block mb-1">
                    Payments Applied
                  </span>
                  <div className="space-y-1 bg-slate-50 p-2 rounded">
                    {selectedInvoice.allocations.map((a) => (
                      <div
                        key={a.id}
                        className="flex justify-between text-[11px]"
                      >
                        <span>
                          {a.paymentNumber} ({a.paymentMethod})
                        </span>
                        <span className="font-semibold">
                          {gym.currency} {a.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center text-[10px] text-slate-400 pt-2 flex items-center justify-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                <span>Verified System Record • FIXIA GymOS</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
