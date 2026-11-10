import * as React from "react";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { listSubscriptionInvoices } from "@/lib/services/platform-admin.service";
import { Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RecordSubscriptionPaymentDialog } from "@/components/admin/record-subscription-payment-dialog";

const invoiceStatusBadge: Record<string, string> = {
  PAID: "bg-emerald-950 text-emerald-300 border-emerald-800",
  ISSUED: "bg-amber-950 text-amber-300 border-amber-800",
  OVERDUE: "bg-rose-950 text-rose-300 border-rose-800",
  VOID: "bg-slate-800 text-slate-400 border-slate-700",
};

export default async function PlatformAdminPaymentsPage() {
  const session = await requireSuperAdmin("/platform-admin/payments");
  const invoices = await listSubscriptionInvoices(session.user.id);

  const totalCollected = invoices.reduce((acc, inv) => {
    const paid = inv.payments.reduce((pAcc, p) => pAcc + Number(p.amount), 0);
    return acc + paid;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Receipt className="h-6 w-6 text-indigo-400" />
            <span>SaaS Payments & Billing Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track subscription invoices issued to gym owners and log verified payments.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Collected</span>
            <div className="text-base font-extrabold text-emerald-400">
              ₹{totalCollected.toLocaleString("en-IN")}
            </div>
          </div>
          <RecordSubscriptionPaymentDialog invoices={invoices} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 shadow-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900/80 border-b border-slate-800">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400 text-xs font-semibold">Invoice No</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">Gym Client</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">Billing Cycle</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">Amount</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">Status</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">Due Date</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">Paid History</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-xs text-slate-500">
                  No subscription invoices issued yet.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv) => (
                <TableRow key={inv.id} className="border-slate-800/60 hover:bg-slate-900/40">
                  <TableCell className="font-mono text-xs font-bold text-white">
                    {inv.invoiceNumber}
                  </TableCell>
                  <TableCell className="text-xs text-slate-200">
                    <div className="font-semibold">{inv.gym.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">/{inv.gym.slug}</div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-400">
                    {inv.billingPeriod}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-white">
                    ₹{Number(inv.totalAmount).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${invoiceStatusBadge[inv.status] || "bg-slate-800"} text-[10px]`}>
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-400">
                    {new Date(inv.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-xs text-slate-300">
                    {inv.payments.length === 0 ? (
                      <span className="text-slate-500 italic">None</span>
                    ) : (
                      <div className="space-y-0.5">
                        {inv.payments.map((p) => (
                          <div key={p.id} className="text-[11px] font-mono text-emerald-400">
                            ₹{Number(p.amount).toLocaleString()} via {p.method}
                          </div>
                        ))}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
