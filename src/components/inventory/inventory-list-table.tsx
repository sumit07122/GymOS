"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, ArrowUpDown, Archive, AlertTriangle } from "lucide-react";
import { InventoryItem } from "@prisma/client";

interface InventoryListTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onAdjustStock: (item: InventoryItem) => void;
  onArchive: (item: InventoryItem) => void;
  currency?: string;
  canManage: boolean;
}

function fmt(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function InventoryListTable({
  items,
  onEdit,
  onAdjustStock,
  onArchive,
  currency = "INR",
  canManage,
}: InventoryListTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-xs">
        No inventory items found matching your filter criteria.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="text-xs">SKU</TableHead>
            <TableHead className="text-xs">Item Name</TableHead>
            <TableHead className="text-xs">Category</TableHead>
            <TableHead className="text-xs text-right">Cost</TableHead>
            <TableHead className="text-xs text-right">Retail</TableHead>
            <TableHead className="text-xs text-center">Stock Level</TableHead>
            <TableHead className="text-xs text-center">Status</TableHead>
            {canManage && <TableHead className="text-xs w-32 text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const isLowStock = item.currentStock <= item.reorderPoint;
            return (
              <TableRow key={item.id} className="hover:bg-slate-50 text-xs">
                <TableCell className="font-mono font-medium text-slate-700">
                  {item.sku}
                </TableCell>
                <TableCell className="font-semibold text-slate-900">
                  {item.name}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[10px] font-normal">
                    {item.category || "General"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-slate-600">
                  {fmt(Number(item.costPrice), currency)}
                </TableCell>
                <TableCell className="text-right font-medium text-slate-800">
                  {fmt(Number(item.retailPrice), currency)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span
                      className={`font-semibold ${
                        isLowStock ? "text-amber-600 font-bold" : "text-slate-800"
                      }`}
                    >
                      {item.currentStock}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      (min: {item.reorderPoint})
                    </span>
                    {isLowStock && (
                      <span title="Low stock threshold reached">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {isLowStock ? (
                    <Badge variant="destructive" className="text-[9px] px-1.5 py-0 bg-amber-100 text-amber-800 hover:bg-amber-100 border border-amber-200">
                      Low Stock
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-emerald-700 bg-emerald-50 border-emerald-200">
                      In Stock
                    </Badge>
                  )}
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2"
                        onClick={() => onAdjustStock(item)}
                        title="Add/reduce stock"
                      >
                        <ArrowUpDown className="h-3 w-3 mr-1" />
                        Stock
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-slate-500"
                        onClick={() => onEdit(item)}
                        title="Edit Item"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => onArchive(item)}
                        title="Archive Item"
                      >
                        <Archive className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

