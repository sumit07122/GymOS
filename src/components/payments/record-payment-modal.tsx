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
import { recordPaymentAction, PaymentActionState } from "@/lib/actions/payment";
import { Loader2, CreditCard, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { PaymentMethod } from "@prisma/client";

interface MemberOption {
  id: string;
  fullName: string;
  memberNumber: string;
}

interface RecordPaymentModalProps {
  gymId: string;
  gymSlug: string;
  members: MemberOption[];
  preselectedMemberId?: string;
  preselectedInvoiceId?: string;
  prefilledAmount?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function getDefaultToday(): string {
  return new Date().toISOString().split("T")[0];
}

export function RecordPaymentModal({
  gymId,
  gymSlug,
  members,
  preselectedMemberId,
  preselectedInvoiceId,
  prefilledAmount,
  open,
  onOpenChange,
  onSuccess,
}: RecordPaymentModalProps) {
  const [selectedMember, setSelectedMember] = useState(preselectedMemberId || "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.UPI);
  const [amount, setAmount] = useState<number | string>(prefilledAmount || "");
  const [today] = useState(getDefaultToday);

  const [state, formAction, isPending] = useActionState<
    PaymentActionState,
    FormData
  >(recordPaymentAction, { success: false });

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
      <DialogContent className="sm:max-w-[540px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Record Member Payment
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                Log offline cash, UPI transfer, or card transaction.
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
              Payment Logged
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">
              {state.message}
            </p>
          </div>
        ) : (
          <form action={formAction} className="space-y-4 pt-2">
            <input type="hidden" name="gymId" value={gymId} />
            <input type="hidden" name="gymSlug" value={gymSlug} />
            {preselectedInvoiceId && (
              <input type="hidden" name="invoiceId" value={preselectedInvoiceId} />
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
              <Label htmlFor="payMemberSelect" className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Member <span className="text-rose-500">*</span>
              </Label>
              <input type="hidden" name="memberId" value={selectedMember} />
              <Select
                value={selectedMember}
                onValueChange={setSelectedMember}
              >
                <SelectTrigger
                  id="payMemberSelect"
                  disabled={isPending || !!preselectedMemberId}
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                >
                  <SelectValue placeholder="Select paying member" />
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

            {/* Amount & Method */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Amount Received (₹) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="2500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isPending}
                  className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-semibold"
                />
                {state.fieldErrors?.amount && (
                  <p className="text-xs text-rose-600">
                    {state.fieldErrors.amount}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="method" className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Payment Method <span className="text-rose-500">*</span>
                </Label>
                <input type="hidden" name="method" value={paymentMethod} />
                <Select
                  value={paymentMethod}
                  onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
                >
                  <SelectTrigger
                    id="method"
                    disabled={isPending}
                    className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PaymentMethod.UPI}>UPI (GPay, PhonePe, Paytm)</SelectItem>
                    <SelectItem value={PaymentMethod.CASH}>Cash (In-Hand Desk)</SelectItem>
                    <SelectItem value={PaymentMethod.CARD}>Credit / Debit POS Card</SelectItem>
                    <SelectItem value={PaymentMethod.BANK_TRANSFER}>NEFT / IMPS Bank Transfer</SelectItem>
                    <SelectItem value={PaymentMethod.ONLINE_GATEWAY}>Online Payment Gateway</SelectItem>
                  </SelectContent>
                </Select>
                {state.fieldErrors?.method && (
                  <p className="text-xs text-rose-600">
                    {state.fieldErrors.method}
                  </p>
                )}
              </div>
            </div>

            {/* Reference Number & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="gatewayRef" className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  UTR / Reference #
                </Label>
                <Input
                  id="gatewayRef"
                  name="gatewayRef"
                  type="text"
                  placeholder="e.g. 408229819212"
                  disabled={isPending}
                  className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
                {state.fieldErrors?.gatewayRef && (
                  <p className="text-xs text-rose-600">
                    {state.fieldErrors.gatewayRef}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="receivedAt" className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Received Date
                </Label>
                <Input
                  id="receivedAt"
                  name="receivedAt"
                  type="date"
                  defaultValue={today}
                  disabled={isPending}
                  className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            {/* Allocation policy */}
            {!preselectedInvoiceId && (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    FIFO Auto-Allocation Active
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Will settle oldest open dues first, retaining any excess balance on account.
                  </p>
                </div>
                <input type="hidden" name="autoAllocate" value="true" />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="payNotes" className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Payment Memo
              </Label>
              <Textarea
                id="payNotes"
                name="notes"
                rows={2}
                placeholder="Desk collection notes..."
                disabled={isPending}
                className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-sm resize-none"
              />
            </div>

            {/* Financial integrity banner */}
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>
                Manual offline entry: tagged as unverified gateway ledger. Attributed to your current authenticated staff session.
              </span>
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
                disabled={isPending || !selectedMember || !amount}
                className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  "Log Receipt"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
