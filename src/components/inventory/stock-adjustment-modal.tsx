"use client";

import { useActionState, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle, Package } from "lucide-react";
import { recordStockMovementAction, InventoryActionState } from "@/lib/actions/inventory";
import { InventoryItem, StockMovementType } from "@prisma/client";

interface StockAdjustmentModalProps {
  open: boolean;
  item: InventoryItem | null;
  gymId: string;
  gymSlug: string;
  onClose: () => void;
}

const MOVEMENT_TYPES: Array<{ value: StockMovementType; label: string; impact: string }> = [
  { value: "PURCHASE_RECEIPT", label: "Purchase Receipt (Stock In)", impact: "+ Increase" },
  { value: "SALE", label: "Sale / Dispensed (Stock Out)", impact: "- Decrease" },
  { value: "ADJUSTMENT_LOSS", label: "Inventory Loss / Damage (Stock Out)", impact: "- Decrease" },
  { value: "ADJUSTMENT_FOUND", label: "Inventory Count Correction (Stock In)", impact: "+ Increase" },
  { value: "RETURN", label: "Customer Return (Stock In)", impact: "+ Increase" },
];

function StockAdjustmentInner({
  item,
  gymId,
  gymSlug,
  onClose,
}: {
  item: InventoryItem | null;
  gymId: string;
  gymSlug: string;
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState<InventoryActionState | null, FormData>(
    recordStockMovementAction,
    null
  );

  const [type, setType] = useState<StockMovementType>("PURCHASE_RECEIPT");

  if (state?.success) {
    onClose();
    return null;
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="gymId" value={gymId} />
      <input type="hidden" name="gymSlug" value={gymSlug} />
      <input type="hidden" name="itemId" value={item?.id ?? ""} />
      <input type="hidden" name="type" value={type} />

      {state?.error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-xs text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {item && (
        <div className="rounded-md bg-slate-50 p-3 space-y-1 border border-slate-100">
          <p className="text-sm font-semibold text-slate-800">{item.name}</p>
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-mono">{item.sku}</span>
            <div className="flex items-center gap-1 font-semibold text-slate-700">
              <Package className="h-3.5 w-3.5" />
              <span>Current Stock: {item.currentStock} units</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {/* Movement Type */}
        <div className="space-y-1">
          <Label className="text-xs">Adjustment Type *</Label>
          <Select value={type} onValueChange={(v) => setType(v as StockMovementType)}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MOVEMENT_TYPES.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label} ({m.impact})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quantity */}
        <div className="space-y-1">
          <Label htmlFor="stock-qty" className="text-xs">Quantity *</Label>
          <Input
            id="stock-qty"
            name="quantity"
            type="number"
            min={1}
            max={99999}
            defaultValue="1"
            className="text-sm"
            required
          />
          {state?.fieldErrors?.quantity && (
            <p className="text-xs text-red-500">{state.fieldErrors.quantity}</p>
          )}
        </div>

        {/* Reference Number */}
        <div className="space-y-1">
          <Label htmlFor="stock-ref" className="text-xs">Reference # / PO / Invoice</Label>
          <Input
            id="stock-ref"
            name="referenceNumber"
            placeholder="e.g. PO-84920, INV-2026-11"
            className="text-sm"
          />
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <Label htmlFor="stock-notes" className="text-xs">Audit Notes / Reason</Label>
          <Textarea
            id="stock-notes"
            name="notes"
            placeholder="Reason for adjustment, supplier name, or discrepancy notes…"
            className="text-sm h-16 resize-none"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} className="text-xs h-8">
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700">
          {isPending && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
          Record Adjustment
        </Button>
      </DialogFooter>
    </form>
  );
}

export function StockAdjustmentModal({
  open,
  item,
  gymId,
  gymSlug,
  onClose,
}: StockAdjustmentModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Stock Adjustment Ledger</DialogTitle>
        </DialogHeader>
        <StockAdjustmentInner
          key={item?.id ?? "none"}
          item={item}
          gymId={gymId}
          gymSlug={gymSlug}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}

