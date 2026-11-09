"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  RotateCcw,
  Eye,
  CreditCard,
} from "lucide-react";
import { PaymentReceiptModal } from "./payment-receipt-modal";
import { RefundDialog } from "./refund-dialog";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface PaymentsTableProps {
  gymId: string;
  gymSlug: string;
  payments: any[];
  isOwner: boolean;
  onRefresh?: () => void;
}

export function PaymentsTable({
  gymId,
  gymSlug,
  payments,
  isOwner,
  onRefresh,
}: PaymentsTableProps) {
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("ALL");

  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<any>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const [selectedPaymentForRefund, setSelectedPaymentForRefund] = useState<any>(null);
  const [refundOpen, setRefundOpen] = useState(false);

  const filteredPayments = payments.filter((pay) => {
    const matchesSearch =
      pay.paymentNumber.toLowerCase().includes(search.toLowerCase()) ||
      pay.member.fullName.toLowerCase().includes(search.toLowerCase()) ||
      pay.member.memberNumber.toLowerCase().includes(search.toLowerCase()) ||
      (pay.gatewayRef && pay.gatewayRef.toLowerCase().includes(search.toLowerCase()));

    const matchesMethod =
      methodFilter === "ALL" ? true : pay.method === methodFilter;

    return matchesSearch && matchesMethod;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-emerald-600 text-white text-[11px]">COMPLETED</Badge>;
      case "REFUNDED":
        return <Badge variant="destructive" className="text-[11px]">REFUNDED</Badge>;
      default:
        return <Badge variant="outline" className="text-[11px]">{status}</Badge>;
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "UPI":
        return <Badge variant="outline" className="bg-indigo-50/50 text-indigo-700 border-indigo-200 text-[11px]">UPI</Badge>;
      case "CASH":
        return <Badge variant="outline" className="bg-emerald-50/50 text-emerald-700 border-emerald-200 text-[11px]">CASH</Badge>;
      case "CARD":
        return <Badge variant="outline" className="bg-sky-50/50 text-sky-700 border-sky-200 text-[11px]">CARD</Badge>;
      case "BANK_TRANSFER":
        return <Badge variant="outline" className="bg-amber-50/50 text-amber-700 border-amber-200 text-[11px]">BANK</Badge>;
      default:
        return <Badge variant="outline" className="text-[11px]">{method}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Method Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search receipt #, member, UTR / Ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm"
          />
        </div>

        <div className="w-full sm:w-48">
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm">
              <SelectValue placeholder="All Payment Modes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Modes</SelectItem>
              <SelectItem value="UPI">UPI Transfer</SelectItem>
              <SelectItem value="CASH">Cash Desk</SelectItem>
              <SelectItem value="CARD">POS Card</SelectItem>
              <SelectItem value="BANK_TRANSFER">Bank NEFT/IMPS</SelectItem>
              <SelectItem value="CHEQUE">Cheque</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-950/50 hover:bg-transparent">
              <TableHead className="font-semibold text-xs">Receipt #</TableHead>
              <TableHead className="font-semibold text-xs">Member</TableHead>
              <TableHead className="font-semibold text-xs">Date</TableHead>
              <TableHead className="font-semibold text-xs">Mode</TableHead>
              <TableHead className="font-semibold text-xs">Reference / UTR</TableHead>
              <TableHead className="font-semibold text-xs text-right">Amount (₹)</TableHead>
              <TableHead className="font-semibold text-xs text-center">Status</TableHead>
              <TableHead className="font-semibold text-xs">Cashier / Staff</TableHead>
              <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <CreditCard className="h-8 w-8 text-slate-300" />
                    <p className="font-medium text-slate-600 dark:text-slate-400">
                      No payments found
                    </p>
                    <p className="text-xs text-slate-400">
                      Record a payment receipt or broaden your filter.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((pay) => (
                <TableRow key={pay.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <TableCell className="font-mono font-medium text-xs text-slate-900 dark:text-slate-100">
                    {pay.paymentNumber}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                        {pay.member.fullName}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {pay.member.memberNumber}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {new Date(pay.receivedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {getMethodBadge(pay.method)}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-slate-600 dark:text-slate-400">
                    {pay.gatewayRef ? (
                      <span className="truncate max-w-[120px] inline-block" title={pay.gatewayRef}>
                        {pay.gatewayRef}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-mono font-bold text-right text-emerald-600 dark:text-emerald-400">
                    ₹{pay.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(pay.status)}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {pay.recordedByStaff?.name || "System"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* View Receipt */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPaymentForReceipt(pay);
                          setReceiptOpen(true);
                        }}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                        title="View / Print Official Receipt"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {/* Refund (Owner only, if COMPLETED and refundable) */}
                      {isOwner && pay.status === "COMPLETED" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Compute refundable balance
                            const totalRefunded = pay.adjustments?.reduce(
                              (sum: number, adj: any) => sum + adj.amount,
                              0
                            ) || 0;
                            const refundableBalance = Math.max(0, pay.amount - totalRefunded);

                            setSelectedPaymentForRefund({
                              ...pay,
                              refundableBalance,
                            });
                            setRefundOpen(true);
                          }}
                          className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                          title="Process Audited Refund"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Receipt Dialog */}
      {selectedPaymentForReceipt && (
        <PaymentReceiptModal
          payment={selectedPaymentForReceipt}
          open={receiptOpen}
          onOpenChange={setReceiptOpen}
        />
      )}

      {/* Refund Dialog */}
      {selectedPaymentForRefund && (
        <RefundDialog
          gymId={gymId}
          gymSlug={gymSlug}
          payment={selectedPaymentForRefund}
          open={refundOpen}
          onOpenChange={setRefundOpen}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}
