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
import { processRefundAction, PaymentActionState } from "@/lib/actions/payment";
import { Loader2, RotateCcw, AlertCircle, CheckCircle2 } from "lucide-react";

interface RefundDialogProps {
  gymId: string;
  gymSlug: string;
  payment: {
    id: string;
    paymentNumber: string;
    amount: number;
    refundableBalance: number;
    member: { fullName: string; memberNumber: string };
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function RefundDialog({
  gymId,
  gymSlug,
  payment,
  open,
  onOpenChange,
  onSuccess,
}: RefundDialogProps) {
  const [amount, setAmount] = useState<number | string>(payment.refundableBalance);

  const [state, formAction, isPending] = useActionState<
    PaymentActionState,
    FormData
  >(processRefundAction, { success: false });



  useEffect(() => {
    if (state.success && open) {
      const timer = setTimeout(() => {
        onOpenChange(false);
        if (onSuccess) onSuccess();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [state.success, open, onOpenChange, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Process Audited Refund
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                Issue a partial or full reimbursement against receipt {payment.paymentNumber}.
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
              Refund Processed
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">
              {state.message}
            </p>
          </div>
        ) : (
          <form action={formAction} className="space-y-4 pt-2">
            <input type="hidden" name="gymId" value={gymId} />
            <input type="hidden" name="gymSlug" value={gymSlug} />
            <input type="hidden" name="paymentId" value={payment.id} />

            {state.error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5 text-sm text-rose-700 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{state.error}</p>
                </div>
              </div>
            )}

            {/* Context details */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Member:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {payment.member.fullName} ({payment.member.memberNumber})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Original Payment Amount:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  ₹{payment.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Max Refundable Balance:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  ₹{payment.refundableBalance.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Refund Amount */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="refundAmount" className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Refund Amount (₹) <span className="text-rose-500">*</span>
                </Label>
                <button
                  type="button"
                  onClick={() => setAmount(payment.refundableBalance)}
                  className="text-[11px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Full balance (₹{payment.refundableBalance.toLocaleString()})
                </button>
              </div>
              <Input
                id="refundAmount"
                name="amount"
                type="number"
                step="0.01"
                min="1"
                max={payment.refundableBalance}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isPending}
                className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-semibold"
              />
              {state.fieldErrors?.amount && (
                <p className="text-xs text-rose-600">{state.fieldErrors.amount}</p>
              )}
            </div>

            {/* Mandatory Reason */}
            <div className="space-y-1.5">
              <Label htmlFor="reason" className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Audited Reason <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="reason"
                name="reason"
                rows={2}
                required
                placeholder="Reason for refund (e.g., medical leave cancellation, accidental double swipe)..."
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
                disabled={isPending || Number(amount) <= 0 || Number(amount) > payment.refundableBalance}
                className="bg-rose-600 hover:bg-rose-700 text-white min-w-[120px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refunding...
                  </>
                ) : (
                  "Confirm Refund"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
