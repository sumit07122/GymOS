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
import { Loader2, AlertCircle } from "lucide-react";
import { createExpenseAction, updateExpenseAction, ExpenseActionState } from "@/lib/actions/expense";
import { ExpenseWithDetails } from "@/lib/services/expense.service";
import { ExpenseCategory, PaymentMethod } from "@prisma/client";

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "CARD", label: "Card" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "ONLINE_GATEWAY", label: "Online Gateway" },
];

interface ExpenseFormInnerProps {
  expense: ExpenseWithDetails | null;
  categories: ExpenseCategory[];
  gymId: string;
  gymSlug: string;
  onClose: () => void;
}

function ExpenseFormInner({ expense, categories, gymId, gymSlug, onClose }: ExpenseFormInnerProps) {
  const isEdit = !!expense;
  const action = isEdit ? updateExpenseAction : createExpenseAction;

  const [state, formAction, isPending] = useActionState<ExpenseActionState | null, FormData>(
    action,
    null
  );

  const [categoryId, setCategoryId] = useState(expense?.categoryId ?? "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    expense?.paymentMethod ?? "CASH"
  );

  if (state?.success) {
    onClose();
    return null;
  }

  const expenseDateStr = expense?.expenseDate
    ? new Date(expense.expenseDate).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="gymId" value={gymId} />
      <input type="hidden" name="gymSlug" value={gymSlug} />
      {isEdit && <input type="hidden" name="expenseId" value={expense.id} />}
      <input type="hidden" name="categoryId" value={categoryId} />
      <input type="hidden" name="paymentMethod" value={paymentMethod} />

      {state?.error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-xs text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* Title */}
        <div className="col-span-2 space-y-1">
          <Label htmlFor="exp-title" className="text-xs">Title *</Label>
          <Input
            id="exp-title"
            name="title"
            defaultValue={expense?.title ?? ""}
            placeholder="e.g. Monthly electricity bill"
            className="text-sm"
            required
          />
          {state?.fieldErrors?.title && (
            <p className="text-xs text-red-500">{state.fieldErrors.title}</p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-1">
          <Label className="text-xs">Category *</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state?.fieldErrors?.categoryId && (
            <p className="text-xs text-red-500">{state.fieldErrors.categoryId}</p>
          )}
        </div>

        {/* Amount */}
        <div className="space-y-1">
          <Label htmlFor="exp-amount" className="text-xs">Amount *</Label>
          <Input
            id="exp-amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={expense ? Number(expense.amount).toFixed(2) : ""}
            placeholder="0.00"
            className="text-sm"
            required
          />
          {state?.fieldErrors?.amount && (
            <p className="text-xs text-red-500">{state.fieldErrors.amount}</p>
          )}
        </div>

        {/* Date */}
        <div className="space-y-1">
          <Label htmlFor="exp-date" className="text-xs">Expense Date *</Label>
          <Input
            id="exp-date"
            name="expenseDate"
            type="date"
            defaultValue={expenseDateStr}
            className="text-sm"
            required
          />
          {state?.fieldErrors?.expenseDate && (
            <p className="text-xs text-red-500">{state.fieldErrors.expenseDate}</p>
          )}
        </div>

        {/* Payment Method */}
        <div className="space-y-1">
          <Label className="text-xs">Payment Method</Label>
          <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Vendor */}
        <div className="col-span-2 space-y-1">
          <Label htmlFor="exp-vendor" className="text-xs">Vendor / Supplier</Label>
          <Input
            id="exp-vendor"
            name="vendorName"
            defaultValue={expense?.vendorName ?? ""}
            placeholder="e.g. City Power Corporation"
            className="text-sm"
          />
        </div>

        {/* Receipt URL */}
        <div className="col-span-2 space-y-1">
          <Label htmlFor="exp-receipt" className="text-xs">Receipt URL</Label>
          <Input
            id="exp-receipt"
            name="receiptUrl"
            defaultValue={expense?.receiptUrl ?? ""}
            placeholder="Paste receipt URL or file path"
            className="text-sm"
          />
          <p className="text-xs text-slate-400">
            Paste a URL to a securely uploaded receipt image or PDF.
          </p>
        </div>

        {/* Notes */}
        <div className="col-span-2 space-y-1">
          <Label htmlFor="exp-notes" className="text-xs">Notes</Label>
          <Textarea
            id="exp-notes"
            name="notes"
            defaultValue={expense?.notes ?? ""}
            placeholder="Additional notes…"
            className="text-sm h-20 resize-none"
          />
        </div>

        {/* Edit reason (only on update) */}
        {isEdit && (
          <div className="col-span-2 space-y-1">
            <Label htmlFor="exp-reason" className="text-xs">Reason for Edit</Label>
            <Input
              id="exp-reason"
              name="reason"
              placeholder="Why is this expense being updated?"
              className="text-sm"
            />
          </div>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} className="text-xs h-8">
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700">
          {isPending && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
          {isEdit ? "Save Changes" : "Add Expense"}
        </Button>
      </DialogFooter>
    </form>
  );
}

interface ExpenseFormModalProps {
  open: boolean;
  expense: ExpenseWithDetails | null;
  categories: ExpenseCategory[];
  gymId: string;
  gymSlug: string;
  onClose: () => void;
}

export function ExpenseFormModal({
  open,
  expense,
  categories,
  gymId,
  gymSlug,
  onClose,
}: ExpenseFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">
            {expense ? "Edit Expense" : "Add Expense"}
          </DialogTitle>
        </DialogHeader>
        {/* Key on expense id to remount inner form on each open, resetting action state */}
        <ExpenseFormInner
          key={expense?.id ?? "new"}
          expense={expense}
          categories={categories}
          gymId={gymId}
          gymSlug={gymSlug}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}

