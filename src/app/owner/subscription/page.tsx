import * as React from "react";
import { requireOwnerSession } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { ShieldCheck, Mail, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function OwnerSubscriptionPage() {
  const { gym } = await requireOwnerSession("/owner/subscription");

  const [subscription, activeMembersCount, invoices] = await Promise.all([
    db.gymSubscription.findUnique({
      where: { gymId: gym.id },
      include: {
        plan: true,
        addons: {
          include: {
            addon: true,
          },
        },
      },
    }),
    db.member.count({
      where: { gymId: gym.id, status: "ACTIVE" },
    }),
    db.subscriptionInvoice.findMany({
      where: { gymId: gym.id },
      include: {
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const maxMembers = subscription?.maxMembersOverride ?? subscription?.plan.maxMembers ?? null;
  const pctUsed = maxMembers ? Math.round((activeMembersCount / maxMembers) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-indigo-400" />
            <span>FIXIA SaaS Subscription & Billing</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Your gym operating software tier, license entitlements, and FIXIA platform invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={
              subscription?.status === "ACTIVE"
                ? "bg-emerald-950 text-emerald-300 border-emerald-800 text-xs px-2.5 py-1"
                : "bg-amber-950 text-amber-300 border-amber-800 text-xs px-2.5 py-1"
            }
          >
            {subscription?.status || "TRIAL"}
          </Badge>
        </div>
      </div>

      {/* Subscription Card & Quota Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-indigo-400 tracking-wider">
                Current Software Plan
              </span>
              <h2 className="text-2xl font-black text-white mt-0.5">
                {subscription?.plan.name || "Custom Studio"}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {subscription?.plan.description || "Enterprise gym operating tier provisioned by FIXIA."}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Billing Frequency</div>
              <div className="font-mono text-sm font-bold text-white uppercase">
                {subscription?.billingPeriod || "MONTHLY"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-500">Effective Fee:</span>
              <div className="font-bold text-white text-sm mt-0.5">
                ₹
                {subscription?.customMonthlyPrice
                  ? Number(subscription.customMonthlyPrice).toLocaleString()
                  : subscription?.plan
                  ? Number(subscription.plan.monthlyPrice).toLocaleString()
                  : "0"}
                <span className="text-[10px] font-normal text-slate-400"> /mo</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500">Renewal Date:</span>
              <div className="font-bold text-white text-sm mt-0.5">
                {subscription?.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                  : "Continuous"}
              </div>
            </div>

            <div>
              <span className="text-slate-500">Active Add-ons:</span>
              <div className="font-bold text-indigo-400 text-sm mt-0.5">
                {subscription?.addons.length || 0} active
              </div>
            </div>
          </div>

          {/* Active Add-ons List if any */}
          {subscription?.addons && subscription.addons.length > 0 && (
            <div className="pt-3 border-t border-slate-800/80">
              <div className="text-[11px] font-semibold text-slate-400 mb-2">Connected Add-ons:</div>
              <div className="flex flex-wrap gap-2">
                {subscription.addons.map((a) => (
                  <Badge key={a.id} variant="outline" className="bg-indigo-950/60 text-indigo-300 border-indigo-800 text-xs">
                    {a.addon.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quota Progress */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Member Quota Usage</div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{activeMembersCount}</span>
              <span className="text-xs text-slate-400">
                / {maxMembers ? `${maxMembers} allowed` : "Unlimited"}
              </span>
            </div>

            {maxMembers && (
              <div className="mt-4 space-y-1.5">
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      pctUsed >= 95 ? "bg-rose-500" : pctUsed >= 80 ? "bg-amber-400" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(pctUsed, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{pctUsed}% utilized</span>
                  <span>{Math.max(0, maxMembers - activeMembersCount)} slots left</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4">
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              Need to raise quota limits, configure custom hardware, or add new modules?
            </p>
            <a href="mailto:support@fixia.in?subject=Subscription%20Upgrade%20Request">
              <Button variant="outline" className="w-full border-slate-700 bg-slate-900 text-white hover:bg-slate-800 text-xs gap-2">
                <Mail className="h-3.5 w-3.5 text-indigo-400" />
                <span>Contact FIXIA Support</span>
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* FIXIA Invoices Ledger */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Receipt className="h-4 w-4 text-indigo-400" />
            <span>Platform Billing Invoices</span>
          </h3>
          <span className="text-xs text-slate-400">Invoices issued by FIXIA Platform</span>
        </div>

        <Table>
          <TableHeader className="bg-slate-900/80 border-b border-slate-800">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400 text-xs font-semibold">Invoice No</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">Period</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">Amount</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">Status</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">Due Date</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold text-right">Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-xs text-slate-500">
                  No billing invoices issued yet.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv) => (
                <TableRow key={inv.id} className="border-slate-800/60 hover:bg-slate-900/40">
                  <TableCell className="font-mono text-xs font-bold text-white">
                    {inv.invoiceNumber}
                  </TableCell>
                  <TableCell className="text-xs text-slate-300">
                    {new Date(inv.periodStart).toLocaleDateString()} &ndash; {new Date(inv.periodEnd).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-white">
                    ₹{Number(inv.totalAmount).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        inv.status === "PAID"
                          ? "bg-emerald-950 text-emerald-300 border-emerald-800 text-[10px]"
                          : "bg-amber-950 text-amber-300 border-amber-800 text-[10px]"
                      }
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-400">
                    {new Date(inv.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-xs text-right font-mono text-slate-300">
                    {inv.payments.length > 0 ? (
                      <span className="text-emerald-400 font-bold">Paid via {inv.payments[0].method}</span>
                    ) : (
                      <span className="text-slate-500">Pending</span>
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
