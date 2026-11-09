"use client";

import React, { useActionState, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { createInvoiceAction, PaymentActionState } from "@/lib/actions/payment";
import { Loader2, Receipt, AlertCircle, CheckCircle2 } from "lucide-react";

interface MemberOption {
  id: string;
  fullName: string;
  memberNumber: string;
  email?: string | null;
  phone?: string | null;
}

interface CreateInvoiceModalProps {
  gymId: string;
  gymSlug: string;
  members: MemberOption[];
  preselectedMemberId?: string;
  preselectedMembershipId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function getDefaultDueDate(): string {
  return new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
}

export function CreateInvoiceModal({
  gymId,
  gymSlug,
  members,
  preselectedMemberId,
  preselectedMembershipId,
  open,
  onOpenChange,
  onSuccess,
}: CreateInvoiceModalProps) {
  const [selectedMember, setSelectedMember] = useState(preselectedMemberId || "");
  const [subtotal, setSubtotal] = useState<number | string>(0);
  const [taxAmount, setTaxAmount] = useState<number | string>(0);
  const [defaultDueDate] = useState(getDefaultDueDate);

  const [state, formAction, isPending] = useActionState<
    PaymentActionState,
    FormData
  >(createInvoiceAction, { success: false });

  useEffect(() => {
    if (state.success && open) {
      const timer = setTimeout(() => {
        onOpenChange(false);
        if (onSuccess) onSuccess();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [state.success, open, onOpenChange, onSuccess]);

  const numSubtotal = Number(subtotal) || 0;
  const numTax = Number(taxAmount) || 0;
  const totalAmount = numSubtotal + numTax;

  // Auto calculate GST 18% shortcut
  const applyGst = (rate: number) => {
    const calc = Math.round((numSubtotal * rate) / 100);
    setTaxAmount(calc);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Issue Tax Invoice
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                Generate a numbered billing invoice with optional tax attribution.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {state.success ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
              Invoice Issued
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">
              {state.message}
            </p>
          </div>
        ) : (
          <form action={formAction} className="space-y-4 pt-2">
            <input type="hidden" name="gymId" value={gymId} />
            <input type="hidden" name="gymSlug" value={gymSlug} />
            {preselectedMembershipId && (
              <input
                type="hidden"
                name="membershipId"
                value={preselectedMembershipId}
              />
            )}

            {state.error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5 text-sm text-rose-700 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{state.error}</p>
                </div>
              </div>
            )}

            {/* Member Selection */}
            <div className="space-y-1.5">
              <Label htmlFor="memberSelect" className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Member <span className="text-rose-500">*</span>
              </Label>
              <input type="hidden" name="memberId" value={selectedMember} />
              <Select
                value={selectedMember}
                onValueChange={setSelectedMember}
              >
                <SelectTrigger
                  id="memberSelect"
                  disabled={isPending || !!preselectedMemberId}
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                >
                  <SelectValue placeholder="Select member to invoice" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <span className="font-medium">{m.fullName}</span>
                      <span className="ml-2 text-xs text-slate-400">
                        ({m.memberNumber})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.fieldErrors?.memberId && (
                <p className="text-xs text-rose-600">
                  {state.fieldErrors.memberId}
                </p>
              )}
            </div>

            {/* Subtotal & Tax */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="subtotal" className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Subtotal (₹) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="subtotal"
                  name="subtotal"
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="2500"
                  value={subtotal}
                  onChange={(e) => setSubtotal(e.target.value)}
                  disabled={isPending}
                  className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
                {state.fieldErrors?.subtotal && (
                  <p className="text-xs text-rose-600">
                    {state.fieldErrors.subtotal}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="taxAmount" className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Tax / GST (₹)
                  </Label>
                  <button
                    type="button"
                    onClick={() => applyGst(18)}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    +18% GST
                  </button>
                </div>
                <Input
                  id="taxAmount"
                  name="taxAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  value={taxAmount}
                  onChange={(e) => setTaxAmount(e.target.value)}
                  disabled={isPending}
                  className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
                {state.fieldErrors?.taxAmount && (
                  <p className="text-xs text-rose-600">
                    {state.fieldErrors.taxAmount}
                  </p>
                )}
              </div>
            </div>

            {/* Calculated Invoice Total Summary Card */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Total Payable
                </p>
                <p className="text-xs text-slate-400">
                  Subtotal (₹{numSubtotal.toLocaleString()}) + Tax (₹{numTax.toLocaleString()})
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  ₹{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <Label htmlFor="dueDate" className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Payment Due Date
              </Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={defaultDueDate}
                disabled={isPending}
                className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              />
              {state.fieldErrors?.dueDate && (
                <p className="text-xs text-rose-600">
                  {state.fieldErrors.dueDate}
                </p>
              )}
            </div>

            {/* Notes / Line Item description */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Invoice Notes & Description
              </Label>
              <Textarea
                id="notes"
                name="notes"
                rows={2}
                placeholder="Monthly membership fee, personal training add-on, etc."
                disabled={isPending}
                className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-sm resize-none"
              />
              {state.fieldErrors?.notes && (
                <p className="text-xs text-rose-600">
                  {state.fieldErrors.notes}
                </p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || !selectedMember || totalAmount <= 0}
                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Create Invoice"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
