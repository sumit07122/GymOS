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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import { createItemAction, updateItemAction, InventoryActionState } from "@/lib/actions/inventory";
import { INVENTORY_DEFAULT_CATEGORIES } from "@/lib/validations/inventory";
import { InventoryItem } from "@prisma/client";

interface ItemFormModalProps {
  open: boolean;
  item: InventoryItem | null;
  gymId: string;
  gymSlug: string;
  onClose: () => void;
}

function ItemFormInner({
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
  const isEdit = !!item;
  const action = isEdit ? updateItemAction : createItemAction;

  const [state, formAction, isPending] = useActionState<InventoryActionState | null, FormData>(
    action,
    null
  );

  const [category, setCategory] = useState(item?.category ?? "Supplements");

  if (state?.success) {
    onClose();
    return null;
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="gymId" value={gymId} />
      <input type="hidden" name="gymSlug" value={gymSlug} />
      {isEdit && <input type="hidden" name="itemId" value={item.id} />}
      <input type="hidden" name="category" value={category} />

      {state?.error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-xs text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="space-y-3">
        {/* Name */}
        <div className="space-y-1">
          <Label htmlFor="item-name" className="text-xs">Product Name *</Label>
          <Input
            id="item-name"
            name="name"
            defaultValue={item?.name ?? ""}
            placeholder="e.g. Whey Protein Isolate 1kg (Chocolate)"
            className="text-sm"
            required
          />
          {state?.fieldErrors?.name && (
            <p className="text-xs text-red-500">{state.fieldErrors.name}</p>
          )}
        </div>

        {/* SKU & Category */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="item-sku" className="text-xs">SKU Code *</Label>
            <Input
              id="item-sku"
              name="sku"
              defaultValue={item?.sku ?? ""}
              disabled={isEdit}
              placeholder="e.g. PROT-WHEY-01"
              className="text-sm font-mono uppercase"
              required
            />
            {state?.fieldErrors?.sku && (
              <p className="text-xs text-red-500">{state.fieldErrors.sku}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {INVENTORY_DEFAULT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="item-cost" className="text-xs">Cost Price *</Label>
            <Input
              id="item-cost"
              name="costPrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={item ? Number(item.costPrice).toFixed(2) : "0.00"}
              className="text-sm"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="item-retail" className="text-xs">Selling Price *</Label>
            <Input
              id="item-retail"
              name="retailPrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={item ? Number(item.retailPrice).toFixed(2) : "0.00"}
              className="text-sm"
              required
            />
          </div>
        </div>

        {/* Stock Levels */}
        <div className="grid grid-cols-2 gap-3">
          {!isEdit && (
            <div className="space-y-1">
              <Label htmlFor="item-init-stock" className="text-xs">Initial Stock</Label>
              <Input
                id="item-init-stock"
                name="initialStock"
                type="number"
                min="0"
                defaultValue="0"
                className="text-sm"
              />
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="item-reorder" className="text-xs">Low Stock Threshold *</Label>
            <Input
              id="item-reorder"
              name="reorderPoint"
              type="number"
              min="0"
              defaultValue={item?.reorderPoint ?? 5}
              className="text-sm"
              required
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} className="text-xs h-8">
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700">
          {isPending && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
          {isEdit ? "Save Changes" : "Create Item"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ItemFormModal({
  open,
  item,
  gymId,
  gymSlug,
  onClose,
}: ItemFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            {item ? "Edit Inventory Item" : "New Inventory Item"}
          </DialogTitle>
        </DialogHeader>
        <ItemFormInner
          key={item?.id ?? "new"}
          item={item}
          gymId={gymId}
          gymSlug={gymSlug}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
