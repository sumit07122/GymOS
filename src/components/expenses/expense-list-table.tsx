"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, FileText, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { ExpenseWithDetails } from "@/lib/services/expense.service";
import { ExpenseCategory, PaymentMethod } from "@prisma/client";

interface ExpenseListTableProps {
  expenses: ExpenseWithDetails[];
  categories: ExpenseCategory[];
  onEdit: (expense: ExpenseWithDetails) => void;
  onDelete: (expense: ExpenseWithDetails) => void;
  currency?: string;
}

function fmt(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash",
  UPI: "UPI",
  CARD: "Card",
  BANK_TRANSFER: "Bank Transfer",
  ONLINE_GATEWAY: "Online",
};

const PAGE_SIZE = 20;

export function ExpenseListTable({
  expenses,
  categories,
  onEdit,
  onDelete,
  currency = "INR",
}: ExpenseListTableProps) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("ALL");
  const [methodFilter, setMethodFilter] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (catFilter !== "ALL" && e.categoryId !== catFilter) return false;
      if (methodFilter !== "ALL" && e.paymentMethod !== methodFilter) return false;
      if (dateFrom) {
        const df = new Date(dateFrom);
        if (e.expenseDate < df) return false;
      }
      if (dateTo) {
        const dt = new Date(dateTo);
        dt.setDate(dt.getDate() + 1);
        if (e.expenseDate > dt) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          (e.vendorName?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [expenses, search, catFilter, methodFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const grandTotal = filtered.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input
            className="pl-8 h-8 text-xs"
            placeholder="Search title or vendor…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={catFilter} onValueChange={(v) => { setCatFilter(v); setPage(1); }}>
          <SelectTrigger className="h-8 text-xs w-36">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={methodFilter} onValueChange={(v) => { setMethodFilter(v); setPage(1); }}>
          <SelectTrigger className="h-8 text-xs w-36">
            <SelectValue placeholder="Payment Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Methods</SelectItem>
            {Object.entries(METHOD_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          className="h-8 text-xs w-36"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          placeholder="From"
        />
        <Input
          type="date"
          className="h-8 text-xs w-36"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          placeholder="To"
        />
      </div>

      {/* Summary row */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{filtered.length} expense{filtered.length !== 1 ? "s" : ""}</span>
        <span className="font-semibold text-slate-700">Total: {fmt(grandTotal, currency)}</span>
      </div>

      {/* Table */}
      <div className="rounded-md border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Title</TableHead>
              <TableHead className="text-xs">Category</TableHead>
              <TableHead className="text-xs">Vendor</TableHead>
              <TableHead className="text-xs">Method</TableHead>
              <TableHead className="text-xs text-right">Amount</TableHead>
              <TableHead className="text-xs">By</TableHead>
              <TableHead className="text-xs w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-xs text-slate-400 py-10">
                  No expenses found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((e) => (
                <TableRow key={e.id} className="hover:bg-slate-50 text-xs">
                  <TableCell className="whitespace-nowrap">
                    {new Date(e.expenseDate).toLocaleDateString("en-IN")}
                  </TableCell>
                  <TableCell className="font-medium max-w-40 truncate">
                    <div className="flex items-center gap-1">
                      {e.receiptUrl && (
                        <span title="Receipt attached">
                          <FileText className="h-3 w-3 text-slate-400 shrink-0" />
                        </span>
                      )}
                      <span className="truncate">{e.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {e.category.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 max-w-28 truncate">
                    {e.vendorName || "—"}
                  </TableCell>
                  <TableCell>{METHOD_LABELS[e.paymentMethod]}</TableCell>
                  <TableCell className="text-right font-semibold text-slate-800">
                    {fmt(Number(e.amount), currency)}
                  </TableCell>
                  <TableCell className="text-slate-500 max-w-24 truncate">
                    {e.recordedByUser.name || "Staff"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => onEdit(e)}
                        title="Edit"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDelete(e)}
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-1">
            <Button size="icon" variant="outline" className="h-6 w-6" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="outline" className="h-6 w-6" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

