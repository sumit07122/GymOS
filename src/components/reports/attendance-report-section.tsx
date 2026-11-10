"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { QrCode, Clock, Flame, Users } from "lucide-react";

interface AttendanceReportSectionProps {
  data: {
    totalCheckIns: number;
    uniqueAttendees: number;
    averageDailyAttendance: number;
    attendanceTrends: Array<{
      date: string;
      checkIns: number;
      uniqueMembers: number;
    }>;
    hourlyDistribution: Array<{
      hour: number;
      label: string;
      checkIns: number;
    }>;
    peakHours: Array<{
      hour: number;
      count: number;
      label: string;
    }>;
    frequencyBreakdown: {
      visits1to2: number;
      visits3to5: number;
      visits6Plus: number;
    };
  };
}

export function AttendanceReportSection({
  data,
}: AttendanceReportSectionProps) {
  // Find highest daily check-ins for relative bar scaling
  const maxDaily = Math.max(...data.attendanceTrends.map((t) => t.checkIns), 1);
  const maxHourly = Math.max(...data.hourlyDistribution.map((h) => h.checkIns), 1);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Total Check-Ins</span>
            <QrCode className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {data.totalCheckIns.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            verified front desk scans
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Unique Attendees</span>
            <Users className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {data.uniqueAttendees.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            distinct gym members visited
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Avg. Daily Attendance</span>
            <Clock className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {data.averageDailyAttendance}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            check-ins per operational day
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Top Peak Window</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 mt-2">
            {data.peakHours[0] ? data.peakHours[0].label : "N/A"}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {data.peakHours[0] ? `${data.peakHours[0].count} visits recorded` : "No visits recorded"}
          </div>
        </div>
      </div>

      {/* Daily Attendance Trend Bar Visualization */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Daily Attendance Volume Trends
            </h3>
            <p className="text-xs text-slate-500">
              Day-by-day check-in traffic across the selected period.
            </p>
          </div>
        </div>

        {data.attendanceTrends.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No check-in records found for this period.
          </div>
        ) : (
          <div className="space-y-2">
            {/* Horizontal Bar Chart for recent dates */}
            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-2">
              {data.attendanceTrends.map((t) => {
                const pct = Math.round((t.checkIns / maxDaily) * 100);
                return (
                  <div key={t.date} className="flex items-center gap-3 text-xs">
                    <span className="w-24 text-slate-500 font-mono text-[11px] shrink-0">
                      {t.date}
                    </span>
                    <div className="h-5 flex-1 bg-slate-100 rounded-md overflow-hidden relative flex items-center">
                      <div
                        className="h-full bg-blue-500/80 rounded-md transition-all"
                        style={{ width: `${Math.max(pct, t.checkIns > 0 ? 3 : 0)}%` }}
                      />
                      {t.checkIns > 0 && (
                        <span className="absolute left-2 text-[10px] font-bold text-slate-700 font-mono">
                          {t.checkIns} visits ({t.uniqueMembers} members)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Hourly Heatmap & Member Frequency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Hourly Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Hourly Attendance Distribution (00:00 - 23:00)</span>
            </h4>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 text-center">
            {data.hourlyDistribution.map((h) => {
              const intensity =
                maxHourly > 0 ? Math.round((h.checkIns / maxHourly) * 100) : 0;
              return (
                <div
                  key={h.hour}
                  className={`p-2 rounded-lg border text-[10px] font-mono transition-all ${
                    h.checkIns === 0
                      ? "bg-slate-50 border-slate-100 text-slate-400"
                      : intensity > 60
                      ? "bg-blue-600 text-white border-blue-700 font-bold"
                      : "bg-blue-50 border-blue-200 text-blue-900"
                  }`}
                  title={`${h.label}: ${h.checkIns} check-ins`}
                >
                  <div className="text-[9px] opacity-80">{h.hour}:00</div>
                  <div className="text-xs font-bold mt-0.5">{h.checkIns}</div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Peak hours:</span>
            <div className="flex gap-1.5">
              {data.peakHours.map((ph, idx) => (
                <Badge
                  key={ph.hour}
                  variant="outline"
                  className="bg-amber-50 text-amber-800 border-amber-300 text-[10px]"
                >
                  #{idx + 1} {ph.label} ({ph.count})
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Member Visit Frequency */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Users className="h-4 w-4 text-emerald-600" />
            <span>Member Attendance Frequency</span>
          </h4>

          <div className="space-y-3 pt-2 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Casual Attendees (1 - 2 visits)</span>
                <span className="font-bold text-slate-900 font-mono">
                  {data.frequencyBreakdown.visits1to2} members
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400"
                  style={{
                    width: `${data.uniqueAttendees > 0 ? (data.frequencyBreakdown.visits1to2 / data.uniqueAttendees) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Regular Attendees (3 - 5 visits)</span>
                <span className="font-bold text-slate-900 font-mono">
                  {data.frequencyBreakdown.visits3to5} members
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{
                    width: `${data.uniqueAttendees > 0 ? (data.frequencyBreakdown.visits3to5 / data.uniqueAttendees) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">High-Frequency Athletes (6+ visits)</span>
                <span className="font-bold text-slate-900 font-mono">
                  {data.frequencyBreakdown.visits6Plus} members
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600"
                  style={{
                    width: `${data.uniqueAttendees > 0 ? (data.frequencyBreakdown.visits6Plus / data.uniqueAttendees) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
