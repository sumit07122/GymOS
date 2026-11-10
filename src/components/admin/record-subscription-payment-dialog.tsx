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
        className="bg-pine hover:bg-pine/90 text-white font-semibold text-xs h-9 rounded-lg gap-1.5 shadow-xs transition"
      >
        <PlusCircle className="h-3.5 w-3.5" />
        <span>Record SaaS Payment</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white border-line text-ink sm:max-w-md rounded-xl shadow-xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-ink text-base font-bold">Record Platform Payment</DialogTitle>
              <DialogDescription className="text-muted text-xs">
                Log an incoming commercial subscription fee paid by a gym owner to FIXIA.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
                {error}
              </div>
            )}

            <div className="space-y-3 py-4 text-xs">
              <div className="space-y-1">
                <label className="text-ink font-semibold">Select Invoice *</label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  className="w-full bg-white border border-line rounded-lg text-ink text-xs h-9 px-3 focus:ring-pine/30 focus:border-pine"
                >
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} — {inv.gym.name} (₹{Number(inv.totalAmount).toLocaleString()} &bull; {inv.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-ink font-semibold">Payment Amount (₹) *</label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-white border-line text-ink text-xs h-9 focus:ring-pine/30 focus:border-pine"
                />
              </div>

              <div className="space-y-1">
                <label className="text-ink font-semibold">Payment Channel</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-white border border-line rounded-lg text-ink text-xs h-9 px-3 focus:ring-pine/30 focus:border-pine"
                >
                  <option value="BANK_TRANSFER">Bank Wire / IMPS / NEFT</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="STRIPE">Stripe Card</option>
                  <option value="RAZORPAY">Razorpay</option>
                  <option value="CASH">Cash / Cheque</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-ink font-semibold">Transaction / UTR Reference</label>
                <Input
                  placeholder="UTR number or gateway transaction ID"
                  value={gatewayRef}
                  onChange={(e) => setGatewayRef(e.target.value)}
                  className="bg-white border-line text-ink text-xs h-9 font-mono focus:ring-pine/30 focus:border-pine"
                />
              </div>

              <div className="space-y-1">
                <label className="text-ink font-semibold">Notes</label>
                <Input
                  placeholder="Payment verified by accounts team"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-white border-line text-ink text-xs h-9 focus:ring-pine/30 focus:border-pine"
                />
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-line">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="text-muted hover:text-ink text-xs h-9 border-line"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-pine hover:bg-pine/90 text-white text-xs font-semibold h-9"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : "Record Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
