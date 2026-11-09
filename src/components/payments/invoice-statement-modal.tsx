"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Building2, Receipt } from "lucide-react";

interface PaymentAllocationItem {
  id: string;
  amount: number;
  allocatedAt: Date | string;
  payment: {
    id: string;
    paymentNumber: string;
    method: string;
    gatewayRef?: string | null;
    receivedAt: Date | string;
  };
}

interface InvoiceStatementProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
    status: string;
    notes?: string | null;
    createdAt: Date | string;
    dueDate?: Date | string | null;
    member: {
      fullName: string;
      memberNumber: string;
      email?: string | null;
      phone?: string | null;
      address?: string | null;
    };
    gym: {
      name: string;
      email?: string | null;
      phone?: string | null;
      address?: string | null;
      currency?: string | null;
    };
    paymentAllocations?: PaymentAllocationItem[];
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceStatementModal({
  invoice,
  open,
  onOpenChange,
}: InvoiceStatementProps) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">PAID</Badge>;
      case "PARTIALLY_PAID":
        return <Badge className="bg-amber-500 text-white hover:bg-amber-500">PARTIAL</Badge>;
      case "OVERDUE":
        return <Badge variant="destructive">OVERDUE</Badge>;
      case "VOID":
        return <Badge variant="outline" className="text-slate-400 border-slate-300">VOID</Badge>;
      default:
        return <Badge variant="outline" className="text-blue-600 border-blue-300">ISSUED</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-0 shadow-2xl">
        {/* Modal Controls Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-indigo-600" />
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Tax Invoice Statement
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            >
              <Printer className="mr-1.5 h-4 w-4" />
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="p-8 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-indigo-600" />
                <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                  {invoice.gym.name}
                </h1>
              </div>
              {invoice.gym.address && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  {invoice.gym.address}
                </p>
              )}
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 space-y-0.5">
                {invoice.gym.phone && <p>Phone: {invoice.gym.phone}</p>}
                {invoice.gym.email && <p>Email: {invoice.gym.email}</p>}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
                TAX INVOICE
              </span>
              <p className="text-xl font-bold font-mono text-slate-950 dark:text-white">
                {invoice.invoiceNumber}
              </p>
              <div className="mt-2 flex items-center justify-end gap-2">
                {getStatusBadge(invoice.status)}
              </div>
            </div>
          </div>

          {/* Meta & Bill-To */}
          <div className="grid grid-cols-2 gap-6 py-6 border-b border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="font-semibold uppercase tracking-wider text-slate-400 text-[10px]">
                Billed To
              </span>
              <div className="mt-1 font-semibold text-sm text-slate-900 dark:text-white">
                {invoice.member.fullName}
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-mono">
                ID: {invoice.member.memberNumber}
              </p>
              {invoice.member.phone && (
                <p className="text-slate-500 dark:text-slate-400">
                  Phone: {invoice.member.phone}
                </p>
              )}
              {invoice.member.email && (
                <p className="text-slate-500 dark:text-slate-400">
                  Email: {invoice.member.email}
                </p>
              )}
            </div>

            <div className="text-right space-y-1">
              <div>
                <span className="text-slate-400">Invoice Date: </span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </span>
              </div>
              {invoice.dueDate && (
                <div>
                  <span className="text-slate-400">Due Date: </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="py-6">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-2 font-semibold">Description</th>
                  <th className="py-2 text-right font-semibold">Subtotal</th>
                  <th className="py-2 text-right font-semibold">Tax / GST</th>
                  <th className="py-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                <tr>
                  <td className="py-3">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      Gym Subscription / Membership Services
                    </p>
                    {invoice.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {invoice.notes}
                      </p>
                    )}
                  </td>
                  <td className="py-3 text-right font-mono">
                    ₹{invoice.subtotal.toLocaleString()}
                  </td>
                  <td className="py-3 text-right font-mono">
                    ₹{invoice.taxAmount.toLocaleString()}
                  </td>
                  <td className="py-3 text-right font-mono font-semibold">
                    ₹{invoice.totalAmount.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span className="font-mono">₹{invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax:</span>
                <span className="font-mono">₹{invoice.taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold text-sm border-t border-slate-200 dark:border-slate-800 pt-2 text-slate-900 dark:text-white">
                <span>Total Invoiced:</span>
                <span className="font-mono">₹{invoice.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Total Paid:</span>
                <span className="font-mono">- ₹{invoice.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-slate-300 dark:border-slate-700 pt-2 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 p-2 rounded">
                <span>Balance Due:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  ₹{invoice.dueAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Allocations Ledger */}
          {invoice.paymentAllocations && invoice.paymentAllocations.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Payments Applied To This Invoice
              </h4>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                    <th className="py-1.5 font-medium">Date</th>
                    <th className="py-1.5 font-medium">Receipt #</th>
                    <th className="py-1.5 font-medium">Method</th>
                    <th className="py-1.5 font-medium">Reference</th>
                    <th className="py-1.5 text-right font-medium">Allocated Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {invoice.paymentAllocations.map((alloc) => (
                    <tr key={alloc.id}>
                      <td className="py-1.5 text-slate-600 dark:text-slate-400">
                        {new Date(alloc.payment.receivedAt).toLocaleDateString()}
                      </td>
                      <td className="py-1.5 font-mono text-slate-900 dark:text-slate-100">
                        {alloc.payment.paymentNumber}
                      </td>
                      <td className="py-1.5 text-slate-600 dark:text-slate-400">
                        {alloc.payment.method}
                      </td>
                      <td className="py-1.5 font-mono text-slate-500">
                        {alloc.payment.gatewayRef || "—"}
                      </td>
                      <td className="py-1.5 text-right font-mono font-medium text-emerald-600">
                        ₹{alloc.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Terms */}
          <div className="mt-10 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 text-center">
            <p>Thank you for choosing {invoice.gym.name}. This is a computer-generated tax invoice.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
