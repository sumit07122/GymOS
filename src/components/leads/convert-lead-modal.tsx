"use client";

import React, { useState, useTransition } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentMethod } from "@prisma/client";
import { convertLeadAction } from "@/lib/actions/lead";
import { Loader2, UserCheck, ShieldCheck, AlertCircle } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ConvertLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  gymId: string;
  gymSlug: string;
  lead: any | null;
  plansList: Array<{ id: string; name: string; price: number; durationDays: number }>;
  onSuccess?: () => void;
}

interface ConvertLeadInnerProps {
  onClose: () => void;
  gymId: string;
  gymSlug: string;
  lead: any;
  plansList: Array<{ id: string; name: string; price: number; durationDays: number }>;
  onSuccess?: () => void;
}

function ConvertLeadInner({
  onClose,
  gymId,
  gymSlug,
  lead,
  plansList,
  onSuccess,
}: ConvertLeadInnerProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [createMembership, setCreateMembership] = useState(false);

  // Initialize initial plan & amount
  const initialPlanId =
    lead.interestedPlanId || (plansList.length > 0 ? plansList[0].id : "");
  const initialMatch = plansList.find((p) => p.id === initialPlanId);
  const initialAmount = initialMatch ? initialMatch.price : 0;

  const [planId, setPlanId] = useState(initialPlanId);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [amountPaid, setAmountPaid] = useState<number>(initialAmount);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.UPI);
  const [notes, setNotes] = useState("");

  const handlePlanChange = (selectedPlanId: string) => {
    setPlanId(selectedPlanId);
    const match = plansList.find((p) => p.id === selectedPlanId);
    if (match) {
      setAmountPaid(match.price);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("gymId", gymId);
      formData.set("gymSlug", gymSlug);
      formData.set("leadId", lead.id);
      formData.set("createMembership", createMembership ? "true" : "false");
      if (createMembership && planId) {
        formData.set("planId", planId);
        formData.set("startDate", startDate);
        formData.set("amountPaid", amountPaid.toString());
        formData.set("paymentMethod", paymentMethod);
      }
      if (notes.trim()) {
        formData.set("notes", notes.trim());
      }

      const res = await convertLeadAction(null, formData);
      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || "Failed to convert lead to member.");
      }
    });
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold">Convert Prospect to Member</DialogTitle>
            <DialogDescription className="text-xs">
              Activate {lead.firstName} {lead.lastName} into your official gym membership roster.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        {/* Prospect Summary Card */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {lead.firstName} {lead.lastName}
            </span>
            <span className="text-slate-500 font-mono">{lead.phone}</span>
          </div>
          {lead.email && (
            <p className="text-[11px] text-slate-500">{lead.email}</p>
          )}
        </div>

        {/* Anti-Duplicate Notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900 text-sky-800 dark:text-sky-300 text-xs">
          <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-sky-600 dark:text-sky-400" />
          <p className="leading-relaxed">
            <strong>Anti-Duplicate Safe:</strong> If a member with this phone or email already exists in this gym workspace, FIXIA GymOS links the lead history directly without creating duplicate accounts.
          </p>
        </div>

        {/* Membership Creation Toggle */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="createMembership"
            checked={createMembership}
            onChange={(e) => setCreateMembership(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label
            htmlFor="createMembership"
            className="text-xs font-semibold text-slate-900 dark:text-slate-100 cursor-pointer"
          >
            Assign initial membership plan immediately
          </label>
        </div>

        {/* Optional Membership Fields */}
        {createMembership && (
          <div className="space-y-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Membership Plan</Label>
              <Select value={planId} onValueChange={handlePlanChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  {plansList.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} — ₹{plan.price.toLocaleString("en-IN")} ({plan.durationDays} days)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="startDate" className="text-xs font-semibold">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="amountPaid" className="text-xs font-semibold">
                  Amount Paid (₹)
                </Label>
                <Input
                  id="amountPaid"
                  type="number"
                  min={0}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymentMethod.UPI}>UPI (GPay / PhonePe / Paytm)</SelectItem>
                  <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                  <SelectItem value={PaymentMethod.CARD}>Credit / Debit Card</SelectItem>
                  <SelectItem value={PaymentMethod.BANK_TRANSFER}>Bank Transfer (NEFT/IMPS)</SelectItem>
                  <SelectItem value={PaymentMethod.ONLINE_GATEWAY}>Online Payment Gateway</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="convertNotes" className="text-xs font-semibold">
            Conversion Notes / Welcome Remarks
          </Label>
          <Textarea
            id="convertNotes"
            rows={2}
            placeholder="e.g. Enrolled on promotional new member discount."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Conversion
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function ConvertLeadModal({
  isOpen,
  onClose,
  gymId,
  gymSlug,
  lead,
  plansList,
  onSuccess,
}: ConvertLeadModalProps) {
  if (!isOpen || !lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <ConvertLeadInner
          key={lead.id}
          onClose={onClose}
          gymId={gymId}
          gymSlug={gymSlug}
          lead={lead}
          plansList={plansList}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
