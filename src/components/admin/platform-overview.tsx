"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

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
  const statusBadgeStyle: Record<string, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    TRIAL: "bg-blue-50 text-blue-700 border-blue-200",
    SUSPENDED: "bg-rose-50 text-rose-700 border-rose-200",
    INACTIVE: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            FIXIA Platform Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time multi-tenant health, SaaS subscriptions, and tenant security status.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Total Gyms */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Gyms
            </span>
            <Building2 className="h-4 w-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {data.gymMetrics.totalGyms}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Registered on FIXIA Cloud
          </div>
        </div>

        {/* 2. Active Gyms */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Active Gyms
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            {data.gymMetrics.activeGyms}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
            Operational tenants
          </div>
        </div>

        {/* 3. Trial Gyms */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Trial Gyms
            </span>
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2">
            {data.gymMetrics.trialGyms}
          </div>
          <div className="text-[10px] text-blue-600 font-medium mt-0.5">
            In evaluation window
          </div>
        </div>

        {/* 4. Suspended Gyms */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Suspended Gyms
            </span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 mt-2">
            {data.gymMetrics.suspendedGyms}
          </div>
          <div className="text-[10px] text-rose-600 font-medium mt-0.5">
            Account access blocked
          </div>
        </div>

        {/* 5. Total Platform Members */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Platform Members
            </span>
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {data.gymMetrics.totalMembers}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Across all gyms
          </div>
        </div>

        {/* 6. Estimated MRR */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Platform MRR
            </span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ${data.subscriptionMetrics.monthlyRecurringRevenue}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            SaaS subscription revenue
          </div>
        </div>
      </div>

      {/* Main Grid: Subscriptions breakdown & Recent Gyms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Registered Gyms */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-700" />
                  <span>Recently Registered Gym Workspaces</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Latest tenants registered on the FIXIA platform.
                </p>
              </div>

              <Link
                href="/admin/gyms"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View All Gyms</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {data.recentGyms.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No gyms currently registered on the platform.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {data.recentGyms.map((g) => {
                  const badgeClass =
                    statusBadgeStyle[g.status] || "bg-slate-100 text-slate-700 border-slate-200";

                  return (
                    <div
                      key={g.id}
                      className="py-3 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded-xl transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/gyms/${g.id}`}
                            className="font-bold text-xs text-slate-900 hover:text-indigo-600 transition-colors"
                          >
                            {g.name}
                          </Link>
                          <Badge variant="outline" className={`${badgeClass} text-[10px]`}>
                            {g.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Slug: <span className="font-mono text-slate-600">/{g.slug}</span> • Plan:{" "}
                          <strong className="text-slate-700">{g.subscriptionPlan}</strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-800">
                          {g.memberCount} members
                        </div>
                        <Link
                          href={`/admin/gyms/${g.id}`}
                          className="text-[11px] text-indigo-600 font-semibold hover:underline"
                        >
                          Manage Gym →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: SaaS Subscription Status Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <span>SaaS Subscription Health</span>
                </h3>
                <p className="text-xs text-slate-500">
                  FIXIA billing status across tenants.
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-xs font-semibold text-emerald-800">Active Paying</span>
                <span className="text-sm font-black text-emerald-900">
                  {data.subscriptionMetrics.subscriptionCounts.ACTIVE}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                <span className="text-xs font-semibold text-blue-800">In Active Trial</span>
                <span className="text-sm font-black text-blue-900">
                  {data.subscriptionMetrics.subscriptionCounts.TRIALING}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                <span className="text-xs font-semibold text-amber-800">Past Due / Grace</span>
                <span className="text-sm font-black text-amber-900">
                  {data.subscriptionMetrics.subscriptionCounts.PAST_DUE}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/60 border border-rose-100">
                <span className="text-xs font-semibold text-rose-800">Suspended / Blocked</span>
                <span className="text-sm font-black text-rose-900">
                  {data.subscriptionMetrics.subscriptionCounts.SUSPENDED}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Cancelled</span>
                <span className="text-sm font-black text-slate-900">
                  {data.subscriptionMetrics.subscriptionCounts.CANCELLED}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Tier Management:</span>
            <Link
              href="/admin/plans"
              className="font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Configure SaaS Plans →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Platform Audit Trail */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-indigo-600" />
              <span>Platform Security & Administrative Audit Trail</span>
            </h3>
            <p className="text-xs text-slate-500">
              Immutable logs of administrative changes, suspensions, and plan modifications.
            </p>
          </div>

          <Link
            href="/admin/audit"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Full Audit Log</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {data.recentAuditLogs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No platform administrative actions recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 mt-2">
            {data.recentAuditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Badge variant="outline" className="font-mono text-[10px] uppercase font-bold">
                    {log.action}
                  </Badge>
                  <span className="font-semibold text-slate-800">
                    {log.gymName ? `Gym: ${log.gymName}` : `Target: ${log.targetType}`}
                  </span>
                  {log.details && (
                    <span className="text-slate-400 text-[11px] truncate max-w-xs">
                      {log.details}
                    </span>
                  )}
                </div>

                <div className="text-right text-[11px] text-slate-400">
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
