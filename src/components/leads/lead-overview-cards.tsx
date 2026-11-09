"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  TrendingUp,
  UserCheck,
  Clock,
} from "lucide-react";
import { LeadCrmMetrics } from "@/lib/services/lead.service";

interface LeadOverviewCardsProps {
  metrics: LeadCrmMetrics;
}

export function LeadOverviewCards({ metrics }: LeadOverviewCardsProps) {
  const { totalLeads, activePipelineLeads, conversionRate, followUps } = metrics;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Leads */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Enquiries
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {totalLeads}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              All time prospective inquiries
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Active Pipeline */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Pipeline
            </span>
            <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono">
              {activePipelineLeads}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              New, contacted, or trials in progress
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Rate */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Conversion Rate
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {conversionRate}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {metrics.stageCounts["CONVERTED"] || 0} successfully converted to members
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Follow-up Reminders */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Follow-Up Agenda
            </span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div>
              <span className={`text-xl font-bold font-mono ${followUps.overdue > 0 ? "text-rose-600" : "text-slate-700"}`}>
                {followUps.overdue}
              </span>
              <p className="text-[10px] text-rose-500 uppercase font-semibold">Overdue</p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="text-xl font-bold font-mono text-amber-600">
                {followUps.today}
              </span>
              <p className="text-[10px] text-amber-600 uppercase font-semibold">Today</p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="text-xl font-bold font-mono text-sky-600">
                {followUps.upcoming}
              </span>
              <p className="text-[10px] text-sky-600 uppercase font-semibold">Upcoming</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

