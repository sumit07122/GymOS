"use client";

import * as React from "react";
import { Users, UserPlus, RefreshCw, AlertCircle } from "lucide-react";

interface MembershipReportSectionProps {
  data: {
    totalMembers: number;
    activeMembers: number;
    inactiveMembers: number;
    expiredMemberships: number;
    newMemberships: number;
    renewals: number;
    totalJoinedInRange: number;
    planDistribution: Array<{
      planId: string;
      planName: string;
      activeCount: number;
    }>;
  };
}

export function MembershipReportSection({
  data,
}: MembershipReportSectionProps) {
  const activeRate =
    data.totalMembers > 0
      ? Math.round((data.activeMembers / data.totalMembers) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Active Membership Rate</span>
            <Users className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {activeRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {data.activeMembers} of {data.totalMembers} members active
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">New Member Joins</span>
            <UserPlus className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {data.newMemberships}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            first-time registrations in period
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Renewals</span>
            <RefreshCw className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {data.renewals}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            re-enrolled returning members
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Expired Memberships</span>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {data.expiredMemberships}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            requiring renewal follow-up
          </div>
        </div>
      </div>

      {/* Plan Distribution Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Membership Plan Enrollment Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Breakdown of active plan subscriptions across your membership tiers.
            </p>
          </div>
        </div>

        {data.planDistribution.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No active plan subscriptions found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">Membership Plan</th>
                  <th className="py-2.5 px-3">Active Members</th>
                  <th className="py-2.5 px-3">Share of Membership</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.planDistribution.map((plan) => {
                  const pct =
                    data.activeMembers > 0
                      ? Math.round((plan.activeCount / data.activeMembers) * 100)
                      : 0;

                  return (
                    <tr key={plan.planId} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {plan.planName}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 font-mono">
                        {plan.activeCount}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-slate-500 font-mono text-[11px]">
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
