"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Users,
  ArrowRight,
  ShieldAlert,
  CreditCard,
  PlusCircle,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/design-system/page-header";
import { StatCard } from "@/components/design-system/stat-card";
import { StatusBadge } from "@/components/design-system/status-badge";

interface PlatformOverviewProps {
  data: {
    gymMetrics: {
      totalGyms: number;
      activeGyms: number;
      suspendedGyms: number;
      trialGyms: number;
      inactiveGyms: number;
      totalMembers: number;
    };
    subscriptionMetrics: {
      subscriptionCounts: {
        ACTIVE: number;
        TRIALING: number;
        PAST_DUE: number;
        SUSPENDED: number;
        CANCELLED: number;
        UNASSIGNED: number;
      };
      totalSubscriptions: number;
      monthlyRecurringRevenue: number;
    };
    recentGyms: Array<{
      id: string;
      name: string;
      slug: string;
      status: string;
      createdAt: string;
      memberCount: number;
      subscriptionPlan: string;
      subscriptionStatus: string;
    }>;
    recentAuditLogs: Array<{
      id: string;
      action: string;
      targetType: string;
      targetId: string | null;
      details: string | null;
      createdAt: string;
      adminEmail: string;
      gymName: string | null;
    }>;
  };
}

export function PlatformOverview({ data }: PlatformOverviewProps) {
  const activePct =
    data.gymMetrics.totalGyms > 0
      ? Math.round((data.gymMetrics.activeGyms / data.gymMetrics.totalGyms) * 100)
      : 100;

  return (
    <div className="space-y-6">
      {/* Top PageHeader */}
      <PageHeader
        title="FIXIA Platform Operations Center"
        description="Centralized multi-tenant supervision, SaaS subscription billing, quota monitoring, and tenant security isolation."
        actions={
          <Link href="/platform-admin/gyms/new">
            <Button className="bg-pine hover:bg-pine/90 text-white font-semibold text-xs h-9 rounded-lg shadow-xs transition">
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
              <span>Onboard Gym Workspace</span>
            </Button>
          </Link>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          label="Total Gyms"
          value={data.gymMetrics.totalGyms}
          icon={Building2}
          subtext="Registered tenants"
        />
        <StatCard
          label="Active Gyms"
          value={data.gymMetrics.activeGyms}
          icon={CheckCircle2}
          trend={{ value: `${activePct}% live`, isPositive: true }}
          subtext="Operational workspaces"
        />
        <StatCard
          label="Trial Gyms"
          value={data.gymMetrics.trialGyms}
          icon={Clock}
          subtext="In evaluation window"
        />
        <StatCard
          label="Suspended"
          value={data.gymMetrics.suspendedGyms}
          icon={AlertTriangle}
          trend={
            data.gymMetrics.suspendedGyms > 0
              ? { value: "Action required", isPositive: false }
              : undefined
          }
          subtext="Accounts restricted"
        />
        <StatCard
          label="Platform Members"
          value={data.gymMetrics.totalMembers.toLocaleString()}
          icon={Users}
          subtext="Across all tenants"
        />
        <StatCard
          label="Estimated MRR"
          value={`₹${data.subscriptionMetrics.monthlyRecurringRevenue.toLocaleString("en-IN")}`}
          icon={DollarSign}
          trend={{ value: "Recurring SaaS", isPositive: true }}
          subtext={`ARR: ₹${(data.subscriptionMetrics.monthlyRecurringRevenue * 12).toLocaleString("en-IN")}`}
        />
      </div>

      {/* Main Grid: Subscriptions breakdown & Recent Gyms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Registered Gyms */}
        <div className="lg:col-span-2 rounded-xl border border-line bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-ink flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-pine" />
                  <span>Recently Registered Gym Workspaces</span>
                </h3>
                <p className="text-xs text-muted">
                  Latest commercial tenants provisioned by FIXIA.
                </p>
              </div>

              <Link
                href="/platform-admin/gyms"
                className="text-xs font-semibold text-pine hover:underline flex items-center gap-1"
              >
                <span>View All Gyms</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {data.recentGyms.length === 0 ? (
              <div className="py-12 text-center text-muted text-xs">
                No gyms currently registered on the platform.
              </div>
            ) : (
              <div className="divide-y divide-line/60 mt-2">
                {data.recentGyms.map((g) => (
                  <div
                    key={g.id}
                    className="py-3 flex items-center justify-between hover:bg-canvas px-2.5 rounded-lg transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/platform-admin/gyms/${g.id}`}
                          className="font-bold text-xs text-ink hover:text-pine transition-colors"
                        >
                          {g.name}
                        </Link>
                        <StatusBadge status={g.status} />
                      </div>
                      <p className="text-[11px] text-muted">
                        Slug: <span className="font-mono text-ink">/{g.slug}</span> • Plan:{" "}
                        <strong className="text-ink">{g.subscriptionPlan}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-ink">
                        {g.memberCount} members
                      </div>
                      <Link
                        href={`/platform-admin/gyms/${g.id}`}
                        className="text-[11px] text-pine font-semibold hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>Workspace</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: SaaS Subscription Status Distribution */}
        <div className="rounded-xl border border-line bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-ink flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-pine" />
                  <span>SaaS Subscription Health</span>
                </h3>
                <p className="text-xs text-muted">
                  Commercial billing agreement status across tenants.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 mt-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-pine-soft/60 border border-pine/20">
                <span className="text-xs font-semibold text-pine">Active Paying</span>
                <span className="text-sm font-bold text-ink">
                  {data.subscriptionMetrics.subscriptionCounts.ACTIVE}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/60 border border-blue-200">
                <span className="text-xs font-semibold text-blue-800">In Active Trial</span>
                <span className="text-sm font-bold text-ink">
                  {data.subscriptionMetrics.subscriptionCounts.TRIALING}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50/60 border border-amber-200">
                <span className="text-xs font-semibold text-amber-800">Past Due / Grace</span>
                <span className="text-sm font-bold text-ink">
                  {data.subscriptionMetrics.subscriptionCounts.PAST_DUE}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-rose-50/60 border border-rose-200">
                <span className="text-xs font-semibold text-rose-800">Suspended / Blocked</span>
                <span className="text-sm font-bold text-ink">
                  {data.subscriptionMetrics.subscriptionCounts.SUSPENDED}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-canvas border border-line">
                <span className="text-xs font-semibold text-muted">Cancelled</span>
                <span className="text-sm font-bold text-ink">
                  {data.subscriptionMetrics.subscriptionCounts.CANCELLED}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs">
            <span className="text-muted">License Plans:</span>
            <Link
              href="/platform-admin/plans"
              className="font-semibold text-pine hover:underline flex items-center gap-1"
            >
              <span>Manage Plans</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Platform Audit Trail */}
      <div className="rounded-xl border border-line bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-ink flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-pine" />
              <span>Platform Security & Administrative Audit Trail</span>
            </h3>
            <p className="text-xs text-muted">
              Immutable logs of administrative changes, suspensions, and plan modifications.
            </p>
          </div>

          <Link
            href="/platform-admin/audit-logs"
            className="text-xs font-semibold text-pine hover:underline flex items-center gap-1"
          >
            <span>Full Audit Log</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {data.recentAuditLogs.length === 0 ? (
          <div className="py-8 text-center text-muted text-xs">
            No platform administrative actions recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-line/60 mt-2">
            {data.recentAuditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Badge variant="outline" className="font-mono text-[10px] uppercase font-bold border-line bg-canvas text-ink">
                    {log.action}
                  </Badge>
                  <span className="font-semibold text-ink">
                    {log.gymName ? `Gym: ${log.gymName}` : `Target: ${log.targetType}`}
                  </span>
                  {log.details && (
                    <span className="text-muted text-[11px] truncate max-w-xs hidden sm:inline">
                      {log.details}
                    </span>
                  )}
                </div>

                <div className="text-right text-[11px] text-muted">
                  <span>{log.adminEmail}</span> •{" "}
                  <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
