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
  Search,
  AlertTriangle,
  CreditCard,
  Phone,
  Mail,
  UserCheck,
} from "lucide-react";
import { RecordPaymentModal } from "./record-payment-modal";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface DuesTableProps {
  gymId: string;
  gymSlug: string;
  invoices: any[];
  members: Array<{ id: string; fullName: string; memberNumber: string; phone?: string | null; email?: string | null }>;
  onRefresh?: () => void;
}

interface MemberDueSummary {
  memberId: string;
  fullName: string;
  memberNumber: string;
  phone?: string | null;
  email?: string | null;
  openInvoiceCount: number;
  totalDue: number;
  oldestDueDate?: Date | null;
  hasOverdue: boolean;
}

function getSnapshotNow(): number {
  return Date.now();
}

export function DuesTable({
  gymId,
  gymSlug,
  invoices,
  members,
  onRefresh,
}: DuesTableProps) {
  const [search, setSearch] = useState("");
  const [nowTime] = useState(getSnapshotNow);

  const [selectedMemberForPay, setSelectedMemberForPay] = useState<MemberDueSummary | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);

  // Aggregate outstanding dues by member
  const duesList = React.useMemo(() => {
    const memberDuesMap = new Map<string, MemberDueSummary>();

    for (const inv of invoices) {
      if (inv.dueAmount <= 0 || inv.status === "VOID" || inv.status === "PAID") {
        continue;
      }

      const mid = inv.memberId;
      const existing = memberDuesMap.get(mid);
      const invDueDate = inv.dueDate ? new Date(inv.dueDate) : null;
      const isOverdue = invDueDate ? invDueDate.getTime() < nowTime : false;

      if (!existing) {
        memberDuesMap.set(mid, {
          memberId: mid,
          fullName: inv.member.fullName,
          memberNumber: inv.member.memberNumber,
          phone: inv.member.phone,
          email: inv.member.email,
          openInvoiceCount: 1,
          totalDue: inv.dueAmount,
          oldestDueDate: invDueDate,
          hasOverdue: isOverdue,
        });
      } else {
        existing.openInvoiceCount += 1;
        existing.totalDue += inv.dueAmount;
        if (isOverdue) existing.hasOverdue = true;
        if (invDueDate && (!existing.oldestDueDate || invDueDate < existing.oldestDueDate)) {
          existing.oldestDueDate = invDueDate;
        }
      }
    }

    return Array.from(memberDuesMap.values()).sort(
      (a, b) => b.totalDue - a.totalDue
    );
  }, [invoices, nowTime]);

  const filteredDues = duesList.filter((d) => {
    return (
      d.fullName.toLowerCase().includes(search.toLowerCase()) ||
      d.memberNumber.toLowerCase().includes(search.toLowerCase()) ||
      (d.phone && d.phone.includes(search))
    );
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search member name, ID, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm"
          />
        </div>
        <p className="text-xs text-slate-500">
          Showing {filteredDues.length} members with open balances
        </p>
      </div>

      {/* Dues Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-950/50 hover:bg-transparent">
              <TableHead className="font-semibold text-xs">Member</TableHead>
              <TableHead className="font-semibold text-xs">Contact</TableHead>
              <TableHead className="font-semibold text-xs text-center">Open Invoices</TableHead>
              <TableHead className="font-semibold text-xs">Oldest Due Date</TableHead>
              <TableHead className="font-semibold text-xs text-center">Urgency</TableHead>
              <TableHead className="font-semibold text-xs text-right">Total Outstanding (₹)</TableHead>
              <TableHead className="font-semibold text-xs text-right">Quick Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <UserCheck className="h-8 w-8 text-emerald-500" />
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      All accounts in good standing!
                    </p>
                    <p className="text-xs text-slate-400">
                      There are currently no members with outstanding dues.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredDues.map((due) => (
                <TableRow key={due.memberId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                        {due.fullName}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {due.memberNumber}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    <div className="space-y-0.5">
                      {due.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{due.phone}</span>
                        </div>
                      )}
                      {due.email && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Mail className="h-3 w-3 text-slate-400" />
                          <span className="truncate max-w-[150px]">{due.email}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs font-medium">
                    <Badge variant="outline" className="text-slate-700 dark:text-slate-300">
                      {due.openInvoiceCount} invoice{due.openInvoiceCount > 1 ? "s" : ""}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {due.oldestDueDate ? due.oldestDueDate.toLocaleDateString() : "Immediate"}
                  </TableCell>
                  <TableCell className="text-center">
                    {due.hasOverdue ? (
                      <Badge variant="destructive" className="text-[10px] gap-1">
                        <AlertTriangle className="h-2.5 w-2.5" /> OVERDUE
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-300 text-[10px]">
                        PENDING
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono font-black text-sm text-rose-600 dark:text-rose-400">
                    ₹{due.totalDue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedMemberForPay(due);
                        setPayModalOpen(true);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 shadow-sm"
                    >
                      <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                      Settle Dues
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Settle Dues Modal */}
      {selectedMemberForPay && (
        <RecordPaymentModal
          gymId={gymId}
          gymSlug={gymSlug}
          members={members}
          preselectedMemberId={selectedMemberForPay.memberId}
          prefilledAmount={selectedMemberForPay.totalDue}
          open={payModalOpen}
          onOpenChange={setPayModalOpen}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}
