"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Target,
  UserCheck,
  UserX,
  TrendingUp,
  Inbox,
  ArrowUpRight,
  Filter,
} from "lucide-react";

interface CrmReportSectionProps {
  data: {
    totalEnquiries: number;
    convertedLeads: number;
    lostLeads: number;
    activeLeads: number;
    conversionRate: number;
    enquirySources: Array<{
      source: string;
      count: number;
      converted: number;
      conversionRate: number;
    }>;
    stageDistribution: Array<{
      stage: string;
      count: number;
    }>;
  };
}

export function CrmReportSection({ data }: CrmReportSectionProps) {
  const stageLabels: Record<string, string> = {
    NEW: "New Inquiries",
    CONTACTED: "Contacted",
    TRIAL_SCHEDULED: "Trial Scheduled",
    TRIAL_COMPLETED: "Trial Completed",
    NEGOTIATING: "Negotiating",
    CONVERTED: "Converted (Won)",
    LOST: "Lost / Dropped",
  };

  const stageBadgeColor: Record<string, string> = {
    NEW: "bg-blue-50 text-blue-700 border-blue-200",
    CONTACTED: "bg-indigo-50 text-indigo-700 border-indigo-200",
    TRIAL_SCHEDULED: "bg-amber-50 text-amber-700 border-amber-200",
    TRIAL_COMPLETED: "bg-purple-50 text-purple-700 border-purple-200",
    NEGOTIATING: "bg-orange-50 text-orange-700 border-orange-200",
    CONVERTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    LOST: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Enquiries */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Enquiries
            </span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {data.totalEnquiries}
            </span>
            <span className="text-xs text-slate-500 font-medium">in range</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Prospect inquiries generated across all channels
          </p>
        </div>

        {/* Converted Leads */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Converted Members
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700 tracking-tight">
              {data.convertedLeads}
            </span>
            <span className="text-xs text-emerald-600 font-medium">signed up</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Leads successfully transitioned into active members
          </p>
        </div>

        {/* Conversion Rate */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Conversion Rate
            </span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-700 tracking-tight">
              {data.conversionRate}%
            </span>
            <span className="text-xs text-indigo-600 font-medium">efficiency</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Ratio of converted leads against period inquiries
          </p>
        </div>

        {/* Lost Leads */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Lost Enquiries
            </span>
            <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <UserX className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800 tracking-tight">
              {data.lostLeads}
            </span>
            <span className="text-xs text-rose-600 font-medium">
              {data.totalEnquiries > 0
                ? `${Math.round((data.lostLeads / data.totalEnquiries) * 100)}%`
                : "0%"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Prospects marked lost or unresponsive
          </p>
        </div>
      </div>

      {/* Main Grid: Sources and Pipeline Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enquiry Sources Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-indigo-600" />
                  <span>Enquiry Channels & Acquisition Sources</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Performance breakdown of marketing channels for this timeframe.
                </p>
              </div>
            </div>

            {data.enquirySources.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Inbox className="h-8 w-8 mx-auto text-slate-300" />
                <p className="text-xs font-medium">No lead inquiries recorded in this period.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-3">
                {data.enquirySources.map((src) => {
                  const sharePct =
                    data.totalEnquiries > 0
                      ? Math.round((src.count / data.totalEnquiries) * 100)
                      : 0;

                  return (
                    <div key={src.source} className="py-3 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 capitalize">
                            {src.source.toLowerCase().replace(/_/g, " ")}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            ({sharePct}% volume)
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-600">
                            <strong>{src.count}</strong> leads
                          </span>
                          <Badge
                            variant="secondary"
                            className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold"
                          >
                            {src.conversionRate}% converted
                          </Badge>
                        </div>
                      </div>

                      {/* Visual Bar */}
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full rounded-l-full"
                          style={{
                            width: `${Math.min(
                              100,
                              src.count > 0 ? (src.converted / src.count) * 100 : 0
                            )}%`,
                          }}
                        />
                        <div
                          className="bg-slate-300 h-full rounded-r-full"
                          style={{
                            width: `${Math.max(
                              0,
                              src.count > 0
                                ? ((src.count - src.converted) / src.count) * 100
                                : 0
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Green = Converted into Members</span>
            <span>Gray = In-Progress / Lost</span>
          </div>
        </div>

        {/* Overall Pipeline Stages */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span>Gym Sales Pipeline Distribution</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Current distribution of active prospects across CRM funnel stages.
                </p>
              </div>
            </div>

            {data.stageDistribution.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Inbox className="h-8 w-8 mx-auto text-slate-300" />
                <p className="text-xs font-medium">No sales pipeline stages active.</p>
              </div>
            ) : (
              <div className="space-y-3 mt-4">
                {data.stageDistribution.map((stage) => {
                  const label = stageLabels[stage.stage] || stage.stage;
                  const badgeStyle =
                    stageBadgeColor[stage.stage] || "bg-slate-100 text-slate-700 border-slate-200";

                  return (
                    <div
                      key={stage.stage}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`${badgeStyle} font-semibold text-xs`}
                        >
                          {label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                        <span>{stage.count}</span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          {stage.count === 1 ? "prospect" : "prospects"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-medium text-slate-700">
              Active In-Flight Leads: {data.activeLeads}
            </span>
            <div className="flex items-center gap-1 text-indigo-600 font-semibold cursor-pointer">
              <span>View CRM Board</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

