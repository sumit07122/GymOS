import * as React from "react";
import { requireOwnerSession } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import {
  ShieldCheck,
  Mail,
  Receipt,
  Users,
  CreditCard,
  Calendar,
  CheckCircle2,
  Sparkles,
  HelpCircle,
} from "lucide-react";
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
import { PageHeader } from "@/components/design-system/page-header";
import { StatCard } from "@/components/design-system/stat-card";

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

  const planName = subscription?.plan.name || "Commercial Pro";
  const planDescription =
    subscription?.plan.description ||
    "Enterprise multi-tenant gym operating license provisioned and managed by FIXIA Platform.";

  const effectivePrice = subscription?.customMonthlyPrice
    ? Number(subscription.customMonthlyPrice)
    : subscription?.plan
    ? Number(subscription.plan.monthlyPrice)
    : 0;

  const renewalDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Continuous License";

  const includedModules = [
    "Members & Document KYC",
    "HMAC-SHA256 QR Attendance",
    "Billing & Invoice Generation",
    "Operating Expense Tracking",
    "Lead CRM & Conversion Pipeline",
    "Workout Routines & Exercise Library",
    "Retail & Supplement Inventory",
    "WhatsApp Business Notifications",
    "Multi-Period Financial Analytics",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="FIXIA SaaS Subscription & Billing"
        description="Your commercial operating license, active tier entitlements, member capacity quotas, and FIXIA platform invoices."
        badge={
          <Badge
            variant="outline"
            className={
              subscription?.status === "ACTIVE"
                ? "bg-pine-soft text-pine border-pine/30 font-semibold px-3 py-1 text-xs"
                : "bg-amber-50 text-amber-700 border-amber-200 font-semibold px-3 py-1 text-xs"
            }
          >
            {subscription?.status === "ACTIVE" ? "LICENSE ACTIVE" : "COMMERCIAL TRIAL"}
          </Badge>
        }
      />

      {/* KPI Overview Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Current Tier"
          value={planName}
          icon={ShieldCheck}
          subtext="Managed by FIXIA"
        />
        <StatCard
          label="Effective Monthly Fee"
          value={`₹${effectivePrice.toLocaleString("en-IN")}`}
          icon={CreditCard}
          subtext={`${subscription?.billingPeriod || "MONTHLY"} Billing`}
        />
        <StatCard
          label="Active Member Quota"
          value={`${activeMembersCount} / ${maxMembers ?? "∞"}`}
          icon={Users}
          subtext={maxMembers ? `${pctUsed}% capacity utilized` : "Unlimited tier"}
        />
        <StatCard
          label="Next Renewal Date"
          value={renewalDate}
          icon={Calendar}
          subtext="Auto-invoiced by FIXIA"
        />
      </div>

      {/* Main License Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier & Entitlements Details (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-line bg-white p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-pine bg-pine-soft px-2.5 py-0.5 rounded-md">
                <Sparkles className="h-3 w-3" /> Commercial License Tier
              </span>
              <h2 className="text-xl font-bold text-ink mt-2">{planName}</h2>
              <p className="text-xs text-muted mt-1 leading-relaxed">{planDescription}</p>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="text-[11px] text-muted">Billing Cycle</span>
              <div className="font-mono text-sm font-bold text-ink uppercase">
                {subscription?.billingPeriod || "MONTHLY"}
              </div>
            </div>
          </div>

          {/* Included Features Checklist */}
          <div className="pt-4 border-t border-line">
            <h3 className="text-xs font-bold text-ink mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-pine" />
              <span>Platform Feature Entitlements</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {includedModules.map((module) => (
                <div
                  key={module}
                  className="flex items-center gap-2 text-xs text-ink bg-canvas px-3 py-2 rounded-lg border border-line/60"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-pine shrink-0" />
                  <span className="truncate">{module}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Add-ons if configured */}
          {subscription?.addons && subscription.addons.length > 0 && (
            <div className="pt-4 border-t border-line">
              <h3 className="text-xs font-bold text-ink mb-2">Connected Platform Add-ons</h3>
              <div className="flex flex-wrap gap-2">
                {subscription.addons.map((a) => (
                  <Badge
                    key={a.id}
                    variant="outline"
                    className="bg-pine-soft text-pine border-pine/30 text-xs px-2.5 py-1"
                  >
                    {a.addon.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Member Capacity & Support Card (1 col) */}
        <div className="rounded-xl border border-line bg-white p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">Member Capacity Usage</span>
              <span className="text-xs font-mono text-muted">
                {maxMembers ? `${Math.max(0, maxMembers - activeMembersCount)} slots left` : "Unlimited"}
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-ink">{activeMembersCount}</span>
              <span className="text-xs text-muted">
                / {maxMembers ? `${maxMembers} active members allowed` : "Unlimited"}
              </span>
            </div>

            {maxMembers && (
              <div className="mt-4 space-y-1.5">
                <div className="w-full bg-canvas h-2.5 rounded-full overflow-hidden border border-line">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      pctUsed >= 95 ? "bg-rose-500" : pctUsed >= 80 ? "bg-amber-500" : "bg-pine"
                    }`}
                    style={{ width: `${Math.min(pctUsed, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-muted font-medium">
                  <span>{pctUsed}% utilized</span>
                  <span>{maxMembers} max capacity</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-line space-y-3">
            <div className="flex items-start gap-2.5">
              <HelpCircle className="h-4 w-4 text-pine shrink-0 mt-0.5" />
              <p className="text-xs text-muted leading-relaxed">
                Need to increase quota limits, add custom hardware integration, or request new modules?
              </p>
            </div>
            <a
              href="mailto:support@fixia.in?subject=Subscription%20Upgrade%20Request"
              className="block"
            >
              <Button
                variant="outline"
                className="w-full border-line hover:border-pine/40 hover:bg-canvas text-ink text-xs h-9 gap-2 rounded-lg transition"
              >
                <Mail className="h-3.5 w-3.5 text-pine" />
                <span>Contact FIXIA Support</span>
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* FIXIA Invoices Ledger */}
      <div className="rounded-xl border border-line bg-white shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <Receipt className="h-4 w-4 text-pine" />
              <span>Platform Billing Invoices</span>
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Commercial SaaS licensing invoices issued directly by FIXIA Platform.
            </p>
          </div>
          <span className="text-xs text-muted font-mono">{invoices.length} Invoices</span>
        </div>

        <Table>
          <TableHeader className="bg-canvas border-b border-line">
            <TableRow className="border-line hover:bg-transparent">
              <TableHead className="text-muted text-xs font-semibold">Invoice No</TableHead>
              <TableHead className="text-muted text-xs font-semibold">Billing Period</TableHead>
              <TableHead className="text-muted text-xs font-semibold">Amount</TableHead>
              <TableHead className="text-muted text-xs font-semibold">Status</TableHead>
              <TableHead className="text-muted text-xs font-semibold">Due Date</TableHead>
              <TableHead className="text-muted text-xs font-semibold text-right">Settlement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-xs text-muted">
                  No platform invoices issued yet.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv) => (
                <TableRow key={inv.id} className="border-line/60 hover:bg-canvas/60 transition">
                  <TableCell className="font-mono text-xs font-bold text-ink">
                    {inv.invoiceNumber}
                  </TableCell>
                  <TableCell className="text-xs text-ink">
                    {new Date(inv.periodStart).toLocaleDateString("en-IN")} &ndash;{" "}
                    {new Date(inv.periodEnd).toLocaleDateString("en-IN")}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-ink">
                    ₹{Number(inv.totalAmount).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        inv.status === "PAID"
                          ? "bg-pine-soft text-pine border-pine/30 text-[10px] font-semibold"
                          : "bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-semibold"
                      }
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted">
                    {new Date(inv.dueDate).toLocaleDateString("en-IN")}
                  </TableCell>
                  <TableCell className="text-xs text-right font-mono">
                    {inv.payments.length > 0 ? (
                      <span className="text-pine font-semibold">
                        Paid via {inv.payments[0].method}
                      </span>
                    ) : (
                      <span className="text-muted">Pending</span>
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
