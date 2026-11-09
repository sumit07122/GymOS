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
  TrendingUp,
  Receipt,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
}

function DashboardSkeleton() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        <span>Loading gym dashboard...</span>
      </div>
    </div>
  );
}

async function DashboardContent({ params, searchParams }: DashboardPageProps) {
  const { gymSlug } = await params;
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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: metrics.currency || "USD",
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Gym Overview
          </h1>
          <p className="text-xs text-slate-500">
            Real-time operational metrics and attendance intelligence for this workspace.
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-200/70 p-1 text-xs">
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
                href={`/${gymSlug}/dashboard?range=${tab.value}`}
                className={`rounded-lg px-2.5 py-1.5 font-medium transition ${
                  isSelected
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Brand-New Gym Zero-Data Setup Guidance */}
      {isBrandNewGym && (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-slate-50 p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  New Gym Workspace Ready
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Welcome to your FIXIA GymOS command center!
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your database tables and tenant security sandbox are provisioned.
                This dashboard displays 100% verified database metrics with no synthetic
                or mock data. Follow the staged rollout to prepare your gym for launch.
              </p>
            </div>
            <Link
              href={`/${gymSlug}/settings`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-700/20 hover:bg-emerald-700 transition shrink-0"
            >
              <span>Configure Settings & Hours</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <div className="text-[10px] font-bold text-emerald-600 uppercase">
                Step 1: Active
              </div>
              <div className="mt-1 text-xs font-bold text-slate-900">
                Operating Profile
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Opening hours, tax rates, contact info and location.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase">
                Step 2: Milestone M06
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-700">
                Membership Plans
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Monthly, quarterly, and annual billing tiers.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase">
                Step 3: Milestone M07
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-700">
                Member Directory
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Add members, assign plans, and issue digital passes.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase">
                Step 4: Milestone M10
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-700">
                QR Attendance Kiosk
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">
                HMAC-signed contactless mobile check-ins.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-600">
              Total Members
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {metrics.totalMembers.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Registered in this gym workspace
            </p>
          </CardContent>
        </Card>

        {/* Active Members */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-600">
              Active Members
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <UserCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-emerald-700">
              {metrics.activeMembers.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {metrics.totalMembers > 0
                ? `${Math.round((metrics.activeMembers / metrics.totalMembers) * 100)}% of total roster`
                : "No active memberships"}
            </p>
          </CardContent>
        </Card>

        {/* Today's Attendance */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-600">
              Today&apos;s Attendance
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <QrCode className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {metrics.todayAttendance.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Verified check-ins since midnight
            </p>
          </CardContent>
        </Card>

        {/* Expiring Memberships */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-600">
              Expiring Soon
            </CardTitle>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                metrics.expiringMemberships > 0
                  ? "bg-amber-50 text-amber-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold tracking-tight ${
                metrics.expiringMemberships > 0
                  ? "text-amber-700"
                  : "text-slate-900"
              }`}
            >
              {metrics.expiringMemberships.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Ending within next 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview & Attendance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Cards (1 col) */}
        <div className="space-y-4">
          {/* Revenue */}
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-600">
                Period Collected Revenue
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <DollarSign className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-slate-900">
                {formatMoney(metrics.periodRevenue)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-600" />
                <span>Verified payments ({range})</span>
              </p>
            </CardContent>
          </Card>

          {/* Pending Dues */}
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-600">
                Outstanding Dues
              </CardTitle>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  metrics.pendingDues > 0
                    ? "bg-rose-50 text-rose-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold tracking-tight ${
                  metrics.pendingDues > 0 ? "text-rose-700" : "text-slate-900"
                }`}
              >
                {formatMoney(metrics.pendingDues)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Uncollected across open & overdue invoices
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 7-Day Attendance Trend Chart (2 cols) */}
        <Card className="lg:col-span-2 border-slate-200 shadow-xs flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-900">
                7-Day Attendance Flow
              </CardTitle>
              <p className="text-xs text-slate-500">
                Daily member check-in counts across the past week
              </p>
            </div>
            <Badge variant="outline" className="text-[11px]">
              <Calendar className="h-3 w-3 mr-1 text-slate-500" />
              Daily Log
            </Badge>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="flex h-44 items-end justify-between gap-2 sm:gap-4 px-2">
              {metrics.attendanceTrends.map((trend) => {
                const heightPercent =
                  trend.count > 0 ? Math.max((trend.count / maxTrend) * 100, 12) : 6;

                return (
                  <div
                    key={trend.date}
                    className="flex flex-1 flex-col items-center gap-2 group"
                  >
                    <div className="text-[10px] font-semibold text-slate-600 transition group-hover:text-emerald-700">
                      {trend.count}
                    </div>
                    <div className="relative w-full max-w-[42px] flex-1 flex items-end">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          trend.count > 0
                            ? "bg-emerald-600 group-hover:bg-emerald-700 shadow-xs"
                            : "bg-slate-200/80"
                        }`}
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] font-medium text-slate-600">
                        {trend.dayLabel}
                      </div>
                      <div className="text-[9px] text-slate-400 hidden sm:block">
                        {trend.date.slice(5)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity: Payments & Members Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-900">
                Recent Payment Records
              </CardTitle>
              <p className="text-xs text-slate-500">
                Latest transactions received in this workspace
              </p>
            </div>
            <Receipt className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            {metrics.recentPayments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No payments recorded yet. Financial tracking begins with invoices in M08.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Member</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Method</TableHead>
                    <TableHead className="text-xs text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.recentPayments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="py-2.5">
                        <div className="text-xs font-medium text-slate-900">
                          {p.memberName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {p.memberEmail}
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5 text-xs font-semibold text-slate-900">
                        {formatMoney(p.amount)}
                      </TableCell>
                      <TableCell className="py-2.5 text-[11px] text-slate-600 capitalize">
                        {p.paymentMethod.toLowerCase().replace("_", " ")}
                      </TableCell>
                      <TableCell className="py-2.5 text-right">
                        <Badge
                          variant="outline"
                          className={
                            p.status === "COMPLETED"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800 text-[10px]"
                              : "border-slate-200 text-slate-600 text-[10px]"
                          }
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Members */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-900">
                Recent Member Registrations
              </CardTitle>
              <p className="text-xs text-slate-500">
                Latest member profiles added to your gym roster
              </p>
            </div>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            {metrics.recentMembers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No members registered yet. Member onboarding launches in Milestone M07.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {metrics.recentMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-semibold text-xs text-slate-700">
                        {m.firstName.charAt(0)}
                        {m.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900">
                          {m.firstName} {m.lastName}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {m.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          m.status === "ACTIVE"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800 text-[10px]"
                            : "border-slate-200 text-slate-600 text-[10px]"
                        }
                      >
                        {m.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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
