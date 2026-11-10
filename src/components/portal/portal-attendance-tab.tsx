"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  Clock,
  CheckCircle2,
  Activity,
  Flame,
} from "lucide-react";

interface PortalAttendanceTabProps {
  attendance: {
    totalCheckIns: number;
    monthCheckIns: number;
    lastCheckIn: string | null;
    records: Array<{
      id: string;
      checkInTime: string;
      checkOutTime: string | null;
      status: string;
      checkInMethod: string;
    }>;
  };
}

export function PortalAttendanceTab({ attendance }: PortalAttendanceTabProps) {
  return (
    <div className="space-y-6 pb-6">
      {/* 1. Attendance Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              This Month
            </span>
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {attendance.monthCheckIns}
          </div>
          <span className="text-[11px] text-slate-500">
            Workouts logged this month
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              All-Time Visits
            </span>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {attendance.totalCheckIns}
          </div>
          <span className="text-[11px] text-slate-500">
            Total lifetime visits
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Last Visit
            </span>
            <Clock className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-sm font-bold text-slate-900">
            {attendance.lastCheckIn
              ? new Date(attendance.lastCheckIn).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              : "No check-ins"}
          </div>
          <span className="text-[11px] text-slate-500">
            {attendance.lastCheckIn
              ? new Date(attendance.lastCheckIn).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Check in today"}
          </span>
        </div>
      </div>

      {/* 2. Attendance Timeline List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Check-In History Ledger
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            {attendance.records.length} recent sessions
          </span>
        </div>

        {attendance.records.length > 0 ? (
          <div className="mt-3 divide-y divide-slate-100">
            {attendance.records.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {new Date(rec.checkInTime).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {rec.checkInMethod === "QR_SCAN"
                          ? "Dynamic QR"
                          : rec.checkInMethod}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <Clock className="h-3 w-3" />
                      <span>
                        In:{" "}
                        {new Date(rec.checkInTime).toLocaleTimeString(
                          undefined,
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                      {rec.checkOutTime && (
                        <span>
                          • Out:{" "}
                          {new Date(rec.checkOutTime).toLocaleTimeString(
                            undefined,
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                  {rec.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            No attendance records yet. Hold your QR pass to the scanner at the gym turnstile to record your check-in!
          </div>
        )}
      </div>
    </div>
  );
}
