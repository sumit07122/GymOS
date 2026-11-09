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
  FileText,
  Search,
  CreditCard,
  Sliders,
  Ban,
  Eye,
} from "lucide-react";
import { InvoiceStatementModal } from "./invoice-statement-modal";
import { RecordPaymentModal } from "./record-payment-modal";
import { AdjustmentDialog } from "./adjustment-dialog";
import { VoidInvoiceDialog } from "./void-invoice-dialog";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface InvoicesTableProps {
  gymId: string;
  gymSlug: string;
  invoices: any[];
  members: Array<{ id: string; fullName: string; memberNumber: string }>;
  isOwner: boolean;
  onRefresh?: () => void;
}

export function InvoicesTable({
  gymId,
  gymSlug,
  invoices,
  members,
  isOwner,
  onRefresh,
}: InvoicesTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Dialog states
  const [selectedInvoiceForStatement, setSelectedInvoiceForStatement] = useState<any>(null);
  const [statementOpen, setStatementOpen] = useState(false);

  const [selectedInvoiceForPay, setSelectedInvoiceForPay] = useState<any>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);

  const [selectedInvoiceForAdj, setSelectedInvoiceForAdj] = useState<any>(null);
  const [adjOpen, setAdjOpen] = useState(false);

  const [selectedInvoiceForVoid, setSelectedInvoiceForVoid] = useState<any>(null);
  const [voidOpen, setVoidOpen] = useState(false);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.member.fullName.toLowerCase().includes(search.toLowerCase()) ||
      inv.member.memberNumber.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ? true : inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 text-[11px]">PAID</Badge>;
      case "PARTIALLY_PAID":
        return <Badge className="bg-amber-500 text-white hover:bg-amber-500 text-[11px]">PARTIAL</Badge>;
      case "OVERDUE":
        return <Badge variant="destructive" className="text-[11px]">OVERDUE</Badge>;
      case "VOID":
        return <Badge variant="outline" className="text-slate-400 border-slate-300 text-[11px]">VOID</Badge>;
      default:
        return <Badge variant="outline" className="text-blue-600 border-blue-300 text-[11px]">ISSUED</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search invoice #, member name, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm"
          />
        </div>

        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ISSUED">Issued / Open</SelectItem>
              <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
              <SelectItem value="PAID">Fully Paid</SelectItem>
              <SelectItem value="OVERDUE">Overdue</SelectItem>
              <SelectItem value="VOID">Voided</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-950/50 hover:bg-transparent">
              <TableHead className="font-semibold text-xs">Invoice #</TableHead>
              <TableHead className="font-semibold text-xs">Member</TableHead>
              <TableHead className="font-semibold text-xs">Date</TableHead>
              <TableHead className="font-semibold text-xs">Due Date</TableHead>
              <TableHead className="font-semibold text-xs text-right">Total (₹)</TableHead>
              <TableHead className="font-semibold text-xs text-right">Paid (₹)</TableHead>
              <TableHead className="font-semibold text-xs text-right">Due (₹)</TableHead>
              <TableHead className="font-semibold text-xs text-center">Status</TableHead>
              <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FileText className="h-8 w-8 text-slate-300" />
                    <p className="font-medium text-slate-600 dark:text-slate-400">
                      No invoices found
                    </p>
                    <p className="text-xs text-slate-400">
                      Create an invoice or adjust your filter query.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <TableCell className="font-mono font-medium text-xs text-slate-900 dark:text-slate-100">
                    {inv.invoiceNumber}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                        {inv.member.fullName}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {inv.member.memberNumber}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-xs font-mono font-medium text-right text-slate-900 dark:text-slate-100">
                    ₹{inv.totalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-right text-emerald-600 font-medium">
                    ₹{inv.paidAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs font-mono font-bold text-right text-rose-600 dark:text-rose-400">
                    ₹{inv.dueAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(inv.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* View Statement */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedInvoiceForStatement(inv);
                          setStatementOpen(true);
                        }}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                        title="View / Print Statement"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {/* Pay invoice shortcut if balance due */}
                      {inv.dueAmount > 0 && inv.status !== "VOID" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedInvoiceForPay(inv);
                            setPayModalOpen(true);
                          }}
                          className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                          title="Record Payment for Invoice"
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Adjustment (Owner only) */}
                      {isOwner && inv.dueAmount > 0 && inv.status !== "VOID" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedInvoiceForAdj(inv);
                            setAdjOpen(true);
                          }}
                          className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                          title="Apply Discount / Credit / Write-Off"
                        >
                          <Sliders className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Void (Owner only, if unpaid) */}
                      {isOwner && inv.paidAmount === 0 && inv.status !== "VOID" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedInvoiceForVoid(inv);
                            setVoidOpen(true);
                          }}
                          className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                          title="Void Unpaid Invoice"
                        >
                          <Ban className="h-4 w-4" />
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

      {/* Statement Modal */}
      {selectedInvoiceForStatement && (
        <InvoiceStatementModal
          invoice={selectedInvoiceForStatement}
          open={statementOpen}
          onOpenChange={setStatementOpen}
        />
      )}

      {/* Record Payment Modal */}
      {selectedInvoiceForPay && (
        <RecordPaymentModal
          gymId={gymId}
          gymSlug={gymSlug}
          members={members}
          preselectedMemberId={selectedInvoiceForPay.memberId}
          preselectedInvoiceId={selectedInvoiceForPay.id}
          prefilledAmount={selectedInvoiceForPay.dueAmount}
          open={payModalOpen}
          onOpenChange={setPayModalOpen}
          onSuccess={onRefresh}
        />
      )}

      {/* Adjustment Dialog */}
      {selectedInvoiceForAdj && (
        <AdjustmentDialog
          gymId={gymId}
          gymSlug={gymSlug}
          invoice={selectedInvoiceForAdj}
          open={adjOpen}
          onOpenChange={setAdjOpen}
          onSuccess={onRefresh}
        />
      )}

      {/* Void Dialog */}
      {selectedInvoiceForVoid && (
        <VoidInvoiceDialog
          gymId={gymId}
          gymSlug={gymSlug}
          invoice={selectedInvoiceForVoid}
          open={voidOpen}
          onOpenChange={setVoidOpen}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}
