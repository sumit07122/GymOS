"use client";

import * as React from "react";
import {
  Users,
  QrCode,
  DollarSign,
  TrendingUp,
  UserCheck,
  Receipt,
} from "lucide-react";

interface ReportsSummaryBannerProps {
  currency: string;
  periodLabel: string;
  data: {
    membership: {
      activeMembers: number;
      totalMembers: number;
      newMemberships: number;
      renewals: number;
    };
    attendance: {
      totalCheckIns: number;
      uniqueAttendees: number;
    };
    financial: {
      netRevenue: number;
      totalExpenses: number;
      netOperatingIncome: number;
      totalOutstandingDues: number;
    };
    crm: {
      totalEnquiries: number;
      conversionRate: number;
    };
  };
}

export function ReportsSummaryBanner({
  currency,
  periodLabel,
  data,
}: ReportsSummaryBannerProps) {
  const isNetProfit = data.financial.netOperatingIncome >= 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Executive Performance Summary — {periodLabel}
        </h2>
        <span className="text-[11px] text-slate-400">
          Real Database Aggregations
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Active Members */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium text-slate-500">Active Members</span>
            <Users className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2">
            {data.membership.activeMembers.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            of {data.membership.totalMembers.toLocaleString()} total members
          </div>
        </div>

        {/* 2. Attendance Check-Ins */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium text-slate-500">Attendance Visits</span>
            <QrCode className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2">
            {data.attendance.totalCheckIns.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {data.attendance.uniqueAttendees.toLocaleString()} unique members
          </div>
        </div>

        {/* 3. Net Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium text-slate-500">Net Revenue</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 mt-2">
            {currency} {data.financial.netRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            after approved refunds
          </div>
        </div>

        {/* 4. Operating Expenses */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium text-slate-500">Operating Expenses</span>
            <Receipt className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-600 mt-2">
            {currency} {data.financial.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            rent, utilities, equipment
          </div>
        </div>

        {/* 5. Net Operating Income (P&L) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium text-slate-500">Net Income (P&L)</span>
            <TrendingUp className={`h-4 w-4 ${isNetProfit ? "text-emerald-600" : "text-rose-600"}`} />
          </div>
          <div className={`text-xl font-bold mt-2 ${isNetProfit ? "text-emerald-700" : "text-rose-700"}`}>
            {currency} {data.financial.netOperatingIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {isNetProfit ? "Operating profit" : "Operating loss"}
          </div>
        </div>

        {/* 6. Lead Conversion */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium text-slate-500">Lead Conversion</span>
            <UserCheck className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-purple-600 mt-2">
            {data.crm.conversionRate}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {data.crm.totalEnquiries.toLocaleString()} enquiries in period
          </div>
        </div>
      </div>
    </div>
  );
}

