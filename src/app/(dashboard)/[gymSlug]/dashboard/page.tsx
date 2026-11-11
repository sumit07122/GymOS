import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { resolveTenantContext } from "@/lib/tenant/resolver";
import { getDashboardMetrics, DateRange } from "@/lib/services/dashboard.service";
import {
  Users,
  UserCheck,
  Clock,
  QrCode,
  DollarSign,
  AlertTriangle,
  Calendar,
  Sparkles,
  ArrowRight,
  Receipt,
  UserPlus,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/design-system/page-header";
import { StatCard } from "@/components/design-system/stat-card";
import { ChartCard } from "@/components/design-system/chart-card";
import { StatusBadge } from "@/components/design-system/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DashboardPageProps {
  params: Promise<{ gymSlug: string }>;
  searchParams: Promise<{ range?: string }>;
  basePath?: string;
}

function DashboardSkeleton() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-pine" />
        <span>Loading gym dashboard...</span>
      </div>
    </div>
  );
}

async function DashboardContent({ params, searchParams, basePath }: DashboardPageProps) {
  const { gymSlug } = await params;
  const rootPath = basePath || `/${gymSlug}`;
  const resolvedSearchParams = await searchParams;
  const range: DateRange =
    resolvedSearchParams.range === "today" ||
    resolvedSearchParams.range === "7d" ||
    resolvedSearchParams.range === "month" ||
    resolvedSearchParams.range === "year"
      ? (resolvedSearchParams.range as DateRange)
      : "30d";

  // Resolve trusted TenantContext strictly on server
  const ctx = await resolveTenantContext(gymSlug);
  const metrics = await getDashboardMetrics(ctx, range);

  // Currency Formatter
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: metrics.currency || "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const isBrandNewGym =
    metrics.totalMembers === 0 &&
    metrics.todayAttendance === 0 &&
    metrics.recentPayments.length === 0;

  const maxTrend = Math.max(...metrics.attendanceTrends.map((t) => t.count), 5);

  return (
    <div className="space-y-6">
      {/* Top Header & Range Filters */}
      <PageHeader
        title="Gym Command Center"
        description="Real-time operational metrics, member consistency trends, and financial performance."
        actions={
          <div className="flex items-center gap-1 rounded-[10px] bg-canvas border border-line p-1 text-xs">
            {[
              { label: "Today", value: "today" },
              { label: "7 Days", value: "7d" },
              { label: "30 Days", value: "30d" },
              { label: "This Month", value: "month" },
              { label: "This Year", value: "year" },
            ].map((tab) => {
              const isSelected = range === tab.value;
              return (
                <Link
                  key={tab.value}
                  href={`${rootPath}/dashboard?range=${tab.value}`}
                  className={`rounded-[8px] px-2.5 py-1.5 font-medium transition ${
                    isSelected
                      ? "bg-white text-ink shadow-xs font-semibold"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        }
      />

      {/* Quick Action Ribbon */}
      <div className="flex flex-wrap items-center gap-2.5 bg-white p-3 rounded-[16px] border border-line shadow-xs">
        <span className="text-xs font-medium text-muted px-2">
          Quick actions:
        </span>
        <Link
          href={`${rootPath}/members/new`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold bg-pine text-white hover:bg-pine/90 shadow-xs transition"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>New Member</span>
        </Link>

        <Link
          href={`${rootPath}/attendance`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold bg-canvas text-ink hover:bg-line/40 border border-line transition"
        >
          <QrCode className="h-3.5 w-3.5 text-pine" />
          <span>Scan QR Attendance</span>
        </Link>

        <Link
          href={`${rootPath}/payments`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold bg-canvas text-ink hover:bg-line/40 border border-line transition"
        >
          <Receipt className="h-3.5 w-3.5 text-pine" />
          <span>Record Payment</span>
        </Link>

        <Link
          href={`${rootPath}/leads`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold bg-canvas text-ink hover:bg-line/40 border border-line transition"
        >
          <Sparkles className="h-3.5 w-3.5 text-pine" />
          <span>Pipeline & Leads</span>
        </Link>
      </div>

      {/* Brand-New Gym Zero-Data Setup Guidance */}
      {isBrandNewGym && (
        <div className="relative overflow-hidden rounded-[16px] border border-pine/30 bg-pine-soft/40 p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pine text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-semibold text-pine">
                  New gym workspace ready
                </span>
              </div>
              <h2 className="font-display text-lg font-bold text-ink">
                Welcome to your FIXIA GymOS command center!
              </h2>
              <p className="text-xs text-muted leading-relaxed">
                Your database tables and multi-tenant security sandbox are provisioned.
                This dashboard displays 100% verified database records with zero synthetic or mock data.
              </p>
            </div>
            <Link
              href={`${rootPath}/settings`}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-pine px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-pine/90 transition shrink-0"
            >
              <span>Configure Settings & Hours</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-[10px] border border-line bg-white p-3.5 shadow-xs">
              <div className="text-[11px] font-semibold text-pine">
                Step 1: Active
              </div>
              <div className="mt-1 text-xs font-bold text-ink">
                Operating Profile
              </div>
              <p className="mt-0.5 text-[11px] text-muted">
                Opening hours, tax rates, contact info and location.
              </p>
            </div>
            <div className="rounded-[10px] border border-line bg-canvas p-3.5">
              <div className="text-[11px] font-semibold text-muted">
                Step 2
              </div>
              <div className="mt-1 text-xs font-semibold text-ink">
                Membership Plans
              </div>
              <p className="mt-0.5 text-[11px] text-muted">
                Monthly, quarterly, and annual billing tiers.
              </p>
            </div>
            <div className="rounded-[10px] border border-line bg-canvas p-3.5">
              <div className="text-[11px] font-semibold text-muted">
                Step 3
              </div>
              <div className="mt-1 text-xs font-semibold text-ink">
                Member Directory
              </div>
              <p className="mt-0.5 text-[11px] text-muted">
                Add members, assign plans, and issue digital passes.
              </p>
            </div>
            <div className="rounded-[10px] border border-line bg-canvas p-3.5">
              <div className="text-[11px] font-semibold text-muted">
                Step 4
              </div>
              <div className="mt-1 text-xs font-semibold text-ink">
                QR Attendance Kiosk
              </div>
              <p className="mt-0.5 text-[11px] text-muted">
                HMAC-signed contactless mobile check-ins.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Members"
          value={metrics.totalMembers.toLocaleString()}
          icon={Users}
          subtext="Registered gym members"
        />
        <StatCard
          label="Active Members"
          value={metrics.activeMembers.toLocaleString()}
          icon={UserCheck}
          subtext={
            metrics.totalMembers > 0
              ? `${Math.round((metrics.activeMembers / metrics.totalMembers) * 100)}% of total roster`
              : "No active memberships"
          }
        />
        <StatCard
          label="Today's Attendance"
          value={metrics.todayAttendance.toLocaleString()}
          icon={QrCode}
          subtext="Verified check-ins today"
        />
        <StatCard
          label="Expiring Soon"
          value={metrics.expiringMemberships.toLocaleString()}
          icon={Clock}
          subtext="Ending within 7 days"
        />
      </div>

      {/* Financial Overview & Attendance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Cards (1 col) */}
        <div className="space-y-4">
          <StatCard
            label="Period Revenue Collected"
            value={formatMoney(metrics.periodRevenue)}
            icon={DollarSign}
            trend={{
              value: `${range} verified`,
              isPositive: true,
            }}
            subtext="Total receipts cleared"
          />

          <StatCard
            label="Outstanding Dues"
            value={formatMoney(metrics.pendingDues)}
            icon={AlertTriangle}
            trend={
              metrics.pendingDues > 0
                ? { value: "Pending collection", isPositive: false }
                : undefined
            }
            subtext="Uncollected across open invoices"
          />
        </div>

        {/* 7-Day Attendance Trend Chart (2 cols) */}
        <div className="lg:col-span-2">
          <ChartCard
            title="7-Day Attendance Flow"
            description="Daily member check-in counts across the past week"
            actions={
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-pine bg-pine-soft px-2.5 py-1 rounded-md">
                <Calendar className="h-3 w-3" /> Daily Log
              </span>
            }
          >
            <div className="flex h-48 items-end justify-between gap-2 sm:gap-4 px-2 pt-4">
              {metrics.attendanceTrends.map((trend) => {
                const heightPercent =
                  trend.count > 0 ? Math.max((trend.count / maxTrend) * 100, 14) : 8;

                return (
                  <div
                    key={trend.date}
                    className="flex flex-1 flex-col items-center gap-2 group"
                  >
                    <div className="text-[10px] font-semibold text-muted transition group-hover:text-pine">
                      {trend.count}
                    </div>
                    <div className="relative w-full max-w-[42px] flex-1 flex items-end">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          trend.count > 0
                            ? "bg-pine group-hover:bg-pine/80 shadow-xs"
                            : "bg-line/70"
                        }`}
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] font-semibold text-ink">
                        {trend.dayLabel}
                      </div>
                      <div className="text-[9px] text-muted hidden sm:block">
                        {trend.date.slice(5)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Recent Activity: Payments & Members Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="rounded-[16px] border border-line bg-white shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between">
            <div>
              <h3 className="font-display text-sm font-bold text-ink">Recent Payment Records</h3>
              <p className="text-xs text-muted">Latest transactions processed in this workspace</p>
            </div>
            <Receipt className="h-4 w-4 text-muted" />
          </div>

          <div className="p-0">
            {metrics.recentPayments.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted">
                No payments recorded yet. Financial tracking begins with your first invoice.
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-canvas border-b border-line">
                  <TableRow className="border-line hover:bg-transparent">
                    <TableHead className="text-xs text-muted font-semibold">Member</TableHead>
                    <TableHead className="text-xs text-muted font-semibold">Amount</TableHead>
                    <TableHead className="text-xs text-muted font-semibold">Method</TableHead>
                    <TableHead className="text-xs text-muted font-semibold text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.recentPayments.map((p) => (
                    <TableRow key={p.id} className="border-line/60 hover:bg-canvas/60 transition">
                      <TableCell className="py-2.5">
                        <div className="text-xs font-semibold text-ink">
                          {p.memberName}
                        </div>
                        <div className="text-[10px] text-muted">
                          {p.memberEmail}
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5 text-xs font-bold text-ink tabular-nums">
                        {formatMoney(p.amount)}
                      </TableCell>
                      <TableCell className="py-2.5 text-[11px] text-muted capitalize">
                        {p.paymentMethod.toLowerCase().replace("_", " ")}
                      </TableCell>
                      <TableCell className="py-2.5 text-right">
                        <StatusBadge
                          status={p.status === "COMPLETED" ? "ACTIVE" : "PENDING"}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Recent Members */}
        <div className="rounded-[16px] border border-line bg-white shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between">
            <div>
              <h3 className="font-display text-sm font-bold text-ink">Recent Member Registrations</h3>
              <p className="text-xs text-muted">Latest member profiles added to your gym roster</p>
            </div>
            <Users className="h-4 w-4 text-muted" />
          </div>

          <div className="p-4">
            {metrics.recentMembers.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted">
                No members registered yet. Add your first member to launch your directory.
              </div>
            ) : (
              <div className="divide-y divide-line">
                {metrics.recentMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pine-soft font-bold text-xs text-pine">
                        {m.firstName.charAt(0)}
                        {m.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-ink">
                          {m.firstName} {m.lastName}
                        </div>
                        <div className="text-[10px] text-muted">
                          {m.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={m.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage(props: DashboardPageProps) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent {...props} />
    </Suspense>
  );
}
