"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Building2, CreditCard } from "lucide-react";

interface InvoiceAllocationItem {
  id: string;
  amount: number;
  invoice: {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    dueAmount: number;
    status: string;
  };
}

interface PaymentReceiptProps {
  payment: {
    id: string;
    paymentNumber: string;
    amount: number;
    method: string;
    gatewayRef?: string | null;
    status: string;
    notes?: string | null;
    receivedAt: Date | string;
    isGatewayVerified: boolean;
    member: {
      fullName: string;
      memberNumber: string;
      email?: string | null;
      phone?: string | null;
    };
    gym: {
      name: string;
      email?: string | null;
      phone?: string | null;
      address?: string | null;
    };
    recordedByStaff?: {
      name: string;
      email: string;
    } | null;
    allocations?: InvoiceAllocationItem[];
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentReceiptModal({
  payment,
  open,
  onOpenChange,
}: PaymentReceiptProps) {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-emerald-600 text-white">PAID / COMPLETED</Badge>;
      case "REFUNDED":
        return <Badge variant="destructive">REFUNDED</Badge>;
      case "FAILED":
        return <Badge variant="destructive">FAILED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-0 shadow-2xl">
        {/* Controls Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 print:hidden">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Payment Receipt
            </DialogTitle>
          </div>
          <Button
            onClick={handlePrint}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <Printer className="mr-1.5 h-4 w-4" />
            Print Receipt
          </Button>
        </div>

        {/* Printable Receipt Card */}
        <div className="p-8 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-emerald-600" />
                <h1 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
                  {payment.gym.name}
                </h1>
              </div>
              {payment.gym.address && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  {payment.gym.address}
                </p>
              )}
              {payment.gym.phone && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Phone: {payment.gym.phone}
                </p>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                OFFICIAL RECEIPT
              </span>
              <p className="text-lg font-bold font-mono text-slate-950 dark:text-white">
                {payment.paymentNumber}
              </p>
              <div className="mt-1 flex items-center justify-end gap-2">
                {getStatusBadge(payment.status)}
              </div>
            </div>
          </div>

          {/* Member & Receipt Meta */}
          <div className="grid grid-cols-2 gap-4 py-6 border-b border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="font-semibold uppercase tracking-wider text-slate-400 text-[10px]">
                Received From
              </span>
              <div className="mt-1 font-semibold text-sm text-slate-900 dark:text-white">
                {payment.member.fullName}
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-mono">
                ID: {payment.member.memberNumber}
              </p>
              {payment.member.phone && (
                <p className="text-slate-500 dark:text-slate-400">
                  {payment.member.phone}
                </p>
              )}
            </div>

            <div className="text-right space-y-1">
              <div>
                <span className="text-slate-400">Date Received: </span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {new Date(payment.receivedAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Payment Mode: </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {payment.method}
                </span>
              </div>
              {payment.gatewayRef && (
                <div>
                  <span className="text-slate-400">Ref / UTR: </span>
                  <span className="font-mono text-slate-900 dark:text-slate-100">
                    {payment.gatewayRef}
                  </span>
                </div>
              )}
              {payment.recordedByStaff && (
                <div>
                  <span className="text-slate-400">Cashier / Staff: </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {payment.recordedByStaff.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Amount Paid Highlight Card */}
          <div className="my-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                Amount Paid
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                {payment.isGatewayVerified
                  ? "Gateway Verified Online"
                  : "Desk Verified Offline Collection"}
              </p>
            </div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
              ₹{payment.amount.toLocaleString()}
            </div>
          </div>

          {/* Allocated Invoices Breakdown */}
          {payment.allocations && payment.allocations.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Settled Invoices
              </h4>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                    <th className="py-1.5 font-medium">Invoice #</th>
                    <th className="py-1.5 text-right font-medium">Invoice Total</th>
                    <th className="py-1.5 text-right font-medium">Settled Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {payment.allocations.map((alloc) => (
                    <tr key={alloc.id}>
                      <td className="py-1.5 font-mono text-slate-900 dark:text-slate-100">
                        {alloc.invoice.invoiceNumber}
                      </td>
                      <td className="py-1.5 text-right font-mono text-slate-500">
                        ₹{alloc.invoice.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-1.5 text-right font-mono font-semibold text-emerald-600">
                        ₹{alloc.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Memo */}
          {payment.notes && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-500">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Notes: </span>
              {payment.notes}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 text-center">
            <p>Official acknowledgement of payment receipt. Keep this copy for your records.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
