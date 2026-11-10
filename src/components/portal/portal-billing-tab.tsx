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
          <span className="inline-flex items-center gap-1 rounded-full bg-[#E4F2EB] px-2 py-0.5 text-[10px] font-semibold text-[#0B6B4F] border border-[#A7F3D0]">
            Paid
          </span>
        );
      case "PARTIALLY_PAID":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
            Partially Paid
          </span>
        );
      case "VOID":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-semibold text-[#64748B] border border-[#E2E8F0]">
            Void
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-200">
            Unpaid
          </span>
        );
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* 1. Financial Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
            Total Invoiced
          </span>
          <div className="mt-1 text-2xl font-bold text-[#0F172A]">
            {gym.currency} {billing.totalInvoiced.toFixed(2)}
          </div>
          <span className="text-[11px] text-[#64748B]">
            {billing.invoices.length} invoices issued
          </span>
        </div>

        <div className="rounded-xl border border-[#A7F3D0] bg-[#E4F2EB]/50 p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0B6B4F]">
            Total Paid
          </span>
          <div className="mt-1 text-2xl font-bold text-[#0B6B4F]">
            {gym.currency} {billing.totalPaid.toFixed(2)}
          </div>
          <span className="text-[11px] text-[#064E3B]">
            {billing.payments.length} transactions completed
          </span>
        </div>

        <div
          className={`rounded-xl p-4 shadow-xs border ${
            billing.outstandingBalance > 0
              ? "border-amber-200 bg-amber-50/70"
              : "border-[#E2E8F0] bg-white"
          }`}
        >
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider ${
              billing.outstandingBalance > 0
                ? "text-amber-800"
                : "text-[#64748B]"
            }`}
          >
            Outstanding Dues
          </span>
          <div
            className={`mt-1 text-2xl font-bold ${
              billing.outstandingBalance > 0
                ? "text-amber-900"
                : "text-[#0F172A]"
            }`}
          >
            {gym.currency} {billing.outstandingBalance.toFixed(2)}
          </div>
          <span
            className={`text-[11px] ${
              billing.outstandingBalance > 0
                ? "text-amber-700 font-medium"
                : "text-[#64748B]"
            }`}
          >
            {billing.outstandingBalance > 0
              ? "Please clear at front desk"
              : "All accounts fully settled"}
          </span>
        </div>
      </div>

      {/* 2. Invoices & Receipts List */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-[#0B6B4F]" />
            <h2 className="text-sm font-bold text-[#0F172A]">
              Invoices & Official Receipts
            </h2>
          </div>
          <span className="text-xs text-[#64748B]">
            {billing.invoices.length} invoices
          </span>
        </div>

        {billing.invoices.length > 0 ? (
          <div className="mt-3 divide-y divide-[#F1F5F9]">
            {billing.invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3.5 gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#0F172A]">
                      {inv.invoiceNumber}
                    </span>
                    {getStatusBadge(inv.status)}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#64748B] mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-[#0B6B4F]" />
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
                    <div className="text-xs font-bold text-[#0F172A]">
                      {gym.currency} {inv.totalAmount.toFixed(2)}
                    </div>
                    {inv.dueAmount > 0 ? (
                      <span className="text-[10px] text-amber-600 font-medium">
                        Due: {gym.currency} {inv.dueAmount.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#0B6B4F] font-medium">
                        Settled
                      </span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedInvoice(inv)}
                    className="h-7 text-xs gap-1 border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]"
                  >
                    <FileText className="h-3.5 w-3.5 text-[#0B6B4F]" />
                    <span>View Receipt</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#64748B]">
            No invoices have been issued to your account yet.
          </div>
        )}
      </div>

      {/* 3. Payment History Ledger */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[#0B6B4F]" />
            <h2 className="text-sm font-bold text-[#0F172A]">
              Payment History
            </h2>
          </div>
          <span className="text-xs text-[#64748B]">
            {billing.payments.length} transactions
          </span>
        </div>

        {billing.payments.length > 0 ? (
          <div className="mt-3 divide-y divide-[#F1F5F9]">
            {billing.payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#0F172A]">
                      {p.paymentNumber}
                    </span>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono border-[#E2E8F0] text-[#64748B]">
                      {p.method}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-[#64748B] mt-0.5 block">
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
                  <span className="text-sm font-bold text-[#0B6B4F]">
                    +{gym.currency} {p.amount.toFixed(2)}
                  </span>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-[#0B6B4F]">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Completed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#64748B]">
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
                <span className="text-sm font-bold text-[#0F172A]">Payment Receipt</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handlePrint}
                  className="h-7 gap-1 text-xs text-[#0B6B4F]"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </Button>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-xs text-[#334155] mt-2">
              {/* Gym Header */}
              <div className="text-center border-b border-[#E2E8F0] pb-3">
                <h3 className="font-bold text-base text-[#0F172A] uppercase">
                  {gym.name}
                </h3>
                {gym.address && <p className="text-[#64748B]">{gym.address}</p>}
                {gym.phone && <p className="text-[#64748B]">Tel: {gym.phone}</p>}
              </div>

              {/* Receipt Details */}
              <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] p-3 rounded-lg font-mono border border-[#E2E8F0]">
                <div>
                  <span className="text-[#64748B] block text-[10px]">
                    INVOICE NO
                  </span>
                  <span className="font-bold text-[#0F172A]">{selectedInvoice.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px]">
                    DATE ISSUED
                  </span>
                  <span>
                    {new Date(selectedInvoice.issueDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px]">MEMBER</span>
                  <span className="font-semibold text-[#0F172A]">{member.fullName}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px]">MEMBER ID</span>
                  <span>{member.memberCode}</span>
                </div>
              </div>

              {/* Line Totals */}
              <div className="space-y-1.5 border-t border-b border-[#E2E8F0] py-3">
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
                <div className="flex justify-between font-bold text-sm text-[#0F172A] pt-1 border-t border-[#F1F5F9]">
                  <span>Total Amount:</span>
                  <span>
                    {gym.currency} {selectedInvoice.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[#0B6B4F] font-semibold">
                  <span>Amount Paid:</span>
                  <span>
                    {gym.currency} {selectedInvoice.paidAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-rose-600">
                  <span>Balance Due:</span>
                  <span>
                    {gym.currency} {selectedInvoice.dueAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Allocations Breakdown */}
              {selectedInvoice.allocations.length > 0 && (
                <div>
                  <span className="font-bold uppercase tracking-wider text-[10px] text-[#64748B] block mb-1">
                    Payments Applied
                  </span>
                  <div className="space-y-1 bg-[#F8FAFC] p-2 rounded border border-[#E2E8F0]">
                    {selectedInvoice.allocations.map((a) => (
                      <div
                        key={a.id}
                        className="flex justify-between text-[11px]"
                      >
                        <span>
                          {a.paymentNumber} ({a.paymentMethod})
                        </span>
                        <span className="font-semibold text-[#0B6B4F]">
                          {gym.currency} {a.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center text-[10px] text-[#64748B] pt-2 flex items-center justify-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-[#0B6B4F]" />
                <span>Verified System Record • FIXIA GymOS</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
