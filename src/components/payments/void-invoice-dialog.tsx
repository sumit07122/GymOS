"use client";

import React, { useActionState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { voidInvoiceAction, PaymentActionState } from "@/lib/actions/payment";
import { Loader2, Ban, AlertCircle, CheckCircle2 } from "lucide-react";

interface VoidInvoiceDialogProps {
  gymId: string;
  gymSlug: string;
  invoice: {
    id: string;
    invoiceNumber: string;
    paidAmount: number;
    dueAmount: number;
    member: { fullName: string; memberNumber: string };
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function VoidInvoiceDialog({
  gymId,
  gymSlug,
  invoice,
  open,
  onOpenChange,
  onSuccess,
}: VoidInvoiceDialogProps) {
  const [state, formAction, isPending] = useActionState<
    PaymentActionState,
    FormData
  >(voidInvoiceAction, { success: false });

  useEffect(() => {
    if (state.success && open) {
      const timer = setTimeout(() => {
        onOpenChange(false);
        if (onSuccess) onSuccess();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [state.success, open, onOpenChange, onSuccess]);

  const hasPayments = invoice.paidAmount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <Ban className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Void Invoice
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                Permanently cancel invoice {invoice.invoiceNumber}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {state.success ? (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
              Invoice Voided
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">
              {state.message}
            </p>
          </div>
        ) : hasPayments ? (
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-sm text-amber-800 dark:text-amber-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Action Blocked: Allocated Payments Exist</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  This invoice has ₹{invoice.paidAmount.toLocaleString()} in allocated payments. You cannot void an active ledger with paid allocations. Please issue a refund for those payments first.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form action={formAction} className="space-y-4 pt-2">
            <input type="hidden" name="gymId" value={gymId} />
            <input type="hidden" name="gymSlug" value={gymSlug} />
            <input type="hidden" name="invoiceId" value={invoice.id} />

            {state.error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5 text-sm text-rose-700 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{state.error}</p>
                </div>
              </div>
            )}

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Member:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {invoice.member.fullName} ({invoice.member.memberNumber})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Due Amount to Cancel:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  ₹{invoice.dueAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="voidReason" className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Cancellation Reason <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="voidReason"
                name="reason"
                rows={2}
                required
                placeholder="Reason for voiding (e.g., entered by mistake, plan changed before payment)..."
                disabled={isPending}
                className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-sm resize-none"
              />
              {state.fieldErrors?.reason && (
                <p className="text-xs text-rose-600">{state.fieldErrors.reason}</p>
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
                disabled={isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white min-w-[120px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Voiding...
                  </>
                ) : (
                  "Confirm Void"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
