import * as React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { CreditCard, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-950 text-emerald-300 border-emerald-800",
  TRIALING: "bg-amber-950 text-amber-300 border-amber-800",
  PAST_DUE: "bg-rose-950 text-rose-300 border-rose-800",
  SUSPENDED: "bg-red-950 text-red-300 border-red-800",
  CANCELLED: "bg-slate-800 text-slate-400 border-slate-700",
};

export default async function PlatformAdminSubscriptionsPage() {
  await requireSuperAdmin("/platform-admin/subscriptions");

  const subscriptions = await db.gymSubscription.findMany({
    include: {
      gym: {
        select: { id: true, name: true, slug: true, status: true, currency: true },
      },
      plan: true,
      addons: {
        include: {
          addon: true,
        },
      },
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalArr = subscriptions.reduce((acc, sub) => {
    if (sub.status !== "ACTIVE" && sub.status !== "TRIALING") return acc;
    const planMonthly = Number(sub.plan.monthlyPrice);
    const planYearly = Number(sub.plan.yearlyPrice);
    const planQuarterly = sub.plan.quarterlyPrice ? Number(sub.plan.quarterlyPrice) : planMonthly * 3;

    const price =
      sub.customMonthlyPrice != null
        ? Number(sub.customMonthlyPrice)
        : sub.customYearlyPrice != null
        ? Number(sub.customYearlyPrice)
        : sub.billingPeriod === "YEARLY"
        ? planYearly
        : sub.billingPeriod === "QUARTERLY"
        ? planQuarterly
        : planMonthly;

    const monthlyEquivalent =
      sub.billingPeriod === "YEARLY"
        ? price / 12
        : sub.billingPeriod === "QUARTERLY"
        ? price / 3
        : price;
    return acc + monthlyEquivalent * 12;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <CreditCard className="h-6 w-6 text-indigo-400" />
            <span>SaaS Subscriptions Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Overview of tenant billing agreements, renewal cycles, and pricing overrides.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400">Estimated SaaS ARR</span>
            <div className="text-base font-extrabold text-emerald-400">
              ₹{totalArr.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 shadow-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900/80 border-b border-slate-800">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400 text-xs font-semibold">Gym Tenant</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">Tier Plan</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">Billing Period</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">Effective Price</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">Status</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">Renewal / Trial</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-xs text-slate-500">
                  No subscriptions found on the platform.
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((sub) => {
                const planMonthly = Number(sub.plan.monthlyPrice);
                const planYearly = Number(sub.plan.yearlyPrice);
                const planQuarterly = sub.plan.quarterlyPrice ? Number(sub.plan.quarterlyPrice) : planMonthly * 3;

                const effectivePrice =
                  sub.customMonthlyPrice != null
                    ? Number(sub.customMonthlyPrice)
                    : sub.customYearlyPrice != null
                    ? Number(sub.customYearlyPrice)
                    : sub.billingPeriod === "YEARLY"
                    ? planYearly
                    : sub.billingPeriod === "QUARTERLY"
                    ? planQuarterly
                    : planMonthly;

                return (
                  <TableRow key={sub.id} className="border-slate-800/60 hover:bg-slate-900/40">
                    <TableCell className="font-medium text-xs text-white">
                      <div className="font-bold">{sub.gym.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">/{sub.gym.slug}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-indigo-950 text-indigo-300 border-indigo-800 text-[10px]">
                        {sub.plan.name}
                      </Badge>
                      {sub.addons.length > 0 && (
                        <span className="ml-1.5 text-[10px] text-slate-400 font-mono">
                          +{sub.addons.length} add-on{sub.addons.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-300 font-mono">
                      {sub.billingPeriod}
                    </TableCell>
                    <TableCell className="text-xs text-slate-200 font-bold">
                      {sub.gym.currency} {effectivePrice.toLocaleString("en-IN")}
                      {sub.customMonthlyPrice || sub.customYearlyPrice ? (
                        <Badge variant="outline" className="ml-1 text-[9px] bg-amber-950 text-amber-300 border-amber-800">
                          Custom
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusColors[sub.status] || "bg-slate-800"} text-[10px]`}>
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">
                      {sub.status === "TRIALING" && sub.trialEndsAt ? (
                        <span className="text-amber-400">
                          Trial ends {new Date(sub.trialEndsAt).toLocaleDateString()}
                        </span>
                      ) : sub.currentPeriodEnd ? (
                        <span>Renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}</span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/platform-admin/gyms/${sub.gym.id}`}
                        className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        <span>Manage</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
