/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { recordSubscriptionPaymentAction } from "@/lib/actions/platform-admin";

interface RecordSubscriptionPaymentDialogProps {
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    totalAmount: any;
    status: string;
    gymId: string;
    gym: { name: string };
  }>;
}

export function RecordSubscriptionPaymentDialog({ invoices }: RecordSubscriptionPaymentDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const pendingInvoices = invoices.filter((inv) => inv.status !== "PAID" && inv.status !== "VOID");

  const [selectedInvoiceId, setSelectedInvoiceId] = React.useState(pendingInvoices[0]?.id || "");
  const [amount, setAmount] = React.useState(
    pendingInvoices[0] ? String(pendingInvoices[0].totalAmount) : ""
  );
  const [method, setMethod] = React.useState("BANK_TRANSFER");
  const [gatewayRef, setGatewayRef] = React.useState("");
  const [notes, setNotes] = React.useState("Direct NEFT/RTGS payment verified.");

  const handleInvoiceChange = (invId: string) => {
    setSelectedInvoiceId(invId);
    const inv = invoices.find((i) => i.id === invId);
    if (inv) {
      setAmount(String(inv.totalAmount));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const inv = invoices.find((i) => i.id === selectedInvoiceId);
    if (!inv) {
      setError("Please select a valid invoice");
      setIsPending(false);
      return;
    }

    try {
      const res = await recordSubscriptionPaymentAction({
        gymId: inv.gymId,
        invoiceId: inv.id,
        amount: parseFloat(amount) || 0,
        method,
        gatewayRef: gatewayRef || undefined,
        notes: notes || undefined,
      });

      if (res && !res.success) {
        setError(res.error || "Failed to record payment");
      } else {
        setOpen(false);
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || "Failed to record payment");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs gap-1.5 shadow-md shadow-indigo-600/30"
      >
        <PlusCircle className="h-4 w-4" />
        <span>Record SaaS Payment</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-white text-base">Record Platform Payment</DialogTitle>
              <DialogDescription className="text-slate-400 text-xs">
                Log an incoming subscription fee paid by a gym owner to FIXIA.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="mt-3 rounded-lg bg-rose-950/50 border border-rose-800 p-2.5 text-xs text-rose-300">
                {error}
              </div>
            )}

            <div className="space-y-3 py-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Select Invoice *</label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md text-white text-xs h-9 px-3"
                >
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} — {inv.gym.name} (₹{Number(inv.totalAmount).toLocaleString()} &bull; {inv.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Payment Amount (₹) *</label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Payment Channel</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md text-white text-xs h-9 px-3"
                >
                  <option value="BANK_TRANSFER">Bank Wire / IMPS / NEFT</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="STRIPE">Stripe Card</option>
                  <option value="RAZORPAY">Razorpay</option>
                  <option value="CASH">Cash / Cheque</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Transaction / UTR Reference</label>
                <Input
                  placeholder="UTR number or gateway transaction ID"
                  value={gatewayRef}
                  onChange={(e) => setGatewayRef(e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Notes</label>
                <Input
                  placeholder="Payment verified by accounts team"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white text-xs h-9"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Record Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
