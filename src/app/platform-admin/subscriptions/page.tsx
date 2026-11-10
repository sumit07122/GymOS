import * as React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { CreditCard, ExternalLink, DollarSign, AlertCircle, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/design-system/page-header";
import { StatCard } from "@/components/design-system/stat-card";
import { StatusBadge } from "@/components/design-system/status-badge";

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

  const activeCount = subscriptions.filter((s) => s.status === "ACTIVE").length;
  const delinquentCount = subscriptions.filter((s) => s.status === "PAST_DUE" || s.status === "SUSPENDED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="SaaS Subscriptions Management"
        description="Overview of commercial tenant billing agreements, renewal cycles, active licenses, and pricing overrides."
        breadcrumbs={[
          { label: "Overview", href: "/platform-admin" },
          { label: "Subscriptions" },
        ]}
        actions={
          <Link
            href="/platform-admin/plans"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-pine bg-pine-soft hover:bg-pine/20 border border-pine/30 transition"
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>Configure SaaS Plans</span>
          </Link>
        }
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Estimated SaaS ARR"
          value={`₹${totalArr.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
          icon={DollarSign}
          trend={{ value: "Annual Run-rate", isPositive: true }}
          subtext="Contracted recurring"
        />
        <StatCard
          label="Monthly Equivalent (MRR)"
          value={`₹${Math.round(totalArr / 12).toLocaleString("en-IN")}`}
          icon={CreditCard}
          subtext="Monthly SaaS run-rate"
        />
        <StatCard
          label="Active Subscriptions"
          value={activeCount}
          icon={ShieldCheck}
          trend={{ value: `${subscriptions.length} total`, isPositive: true }}
          subtext="Operational billing"
        />
        <StatCard
          label="Past Due / Suspended"
          value={delinquentCount}
          icon={AlertCircle}
          trend={delinquentCount > 0 ? { value: "Needs collection", isPositive: false } : undefined}
          subtext="Delinquent accounts"
        />
      </div>

      {/* Subscriptions Table */}
      <div className="rounded-xl border border-line bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-canvas border-b border-line">
            <TableRow className="border-line hover:bg-transparent">
              <TableHead className="text-muted text-xs font-semibold">Gym Tenant</TableHead>
              <TableHead className="text-muted text-xs font-semibold">Tier Plan</TableHead>
              <TableHead className="text-muted text-xs font-semibold">Billing Period</TableHead>
              <TableHead className="text-muted text-xs font-semibold">Effective Price</TableHead>
              <TableHead className="text-muted text-xs font-semibold">Status</TableHead>
              <TableHead className="text-muted text-xs font-semibold">Renewal / Trial</TableHead>
              <TableHead className="text-muted text-xs font-semibold text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-xs text-muted">
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
                  <TableRow key={sub.id} className="border-line/60 hover:bg-canvas/50">
                    <TableCell className="font-medium text-xs text-ink">
                      <div className="font-bold text-ink">{sub.gym.name}</div>
                      <div className="text-[11px] text-muted font-mono">/{sub.gym.slug}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-pine-soft text-pine border-pine/30 text-[10px] font-semibold">
                        {sub.plan.name}
                      </Badge>
                      {sub.addons.length > 0 && (
                        <span className="ml-1.5 text-[10px] text-muted font-mono">
                          +{sub.addons.length} add-on{sub.addons.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-ink font-mono">
                      {sub.billingPeriod}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-ink">
                      ₹{effectivePrice.toLocaleString("en-IN")}
                      {sub.customMonthlyPrice != null && (
                        <span className="ml-1 text-[10px] text-amber-700 font-normal">
                          (Custom)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={sub.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted">
                      {sub.trialEndsAt && new Date(sub.trialEndsAt) > new Date() ? (
                        <span className="text-blue-700 font-medium">
                          Trial ends {new Date(sub.trialEndsAt).toLocaleDateString()}
                        </span>
                      ) : sub.currentPeriodEnd ? (
                        <span>Renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}</span>
                      ) : (
                        <span>Continuous License</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/platform-admin/gyms/${sub.gym.id}`}
                        className="inline-flex items-center gap-1 text-xs text-pine font-semibold hover:underline"
                      >
                        <span>Workspace</span>
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
