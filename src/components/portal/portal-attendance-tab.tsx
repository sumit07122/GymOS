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
    <div className="space-y-4 pb-6">
      {/* 1. Attendance Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              This Month
            </span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0F172A]">
            {attendance.monthCheckIns}
          </div>
          <span className="text-[11px] text-[#64748B]">
            Workouts logged this month
          </span>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              All-Time Visits
            </span>
            <Activity className="h-4 w-4 text-[#0B6B4F]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0F172A]">
            {attendance.totalCheckIns}
          </div>
          <span className="text-[11px] text-[#64748B]">
            Total lifetime visits
          </span>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Last Visit
            </span>
            <Clock className="h-4 w-4 text-[#0B6B4F]" />
          </div>
          <div className="mt-2 text-sm font-bold text-[#0F172A]">
            {attendance.lastCheckIn
              ? new Date(attendance.lastCheckIn).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              : "No check-ins"}
          </div>
          <span className="text-[11px] text-[#64748B]">
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
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-[#0B6B4F]" />
            <h2 className="text-sm font-bold text-[#0F172A]">
              Check-In History Ledger
            </h2>
          </div>
          <span className="text-xs text-[#64748B]">
            {attendance.records.length} recent sessions
          </span>
        </div>

        {attendance.records.length > 0 ? (
          <div className="mt-3 divide-y divide-[#F1F5F9]">
            {attendance.records.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E4F2EB] text-[#0B6B4F]">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0F172A]">
                        {new Date(rec.checkInTime).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <Badge variant="outline" className="text-[10px] border-[#E2E8F0] text-[#64748B]">
                        {rec.checkInMethod === "QR_SCAN"
                          ? "Dynamic QR"
                          : rec.checkInMethod}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-0.5">
                      <Clock className="h-3 w-3 text-[#0B6B4F]" />
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

                <Badge className="bg-[#E4F2EB] text-[#0B6B4F] border-[#A7F3D0] text-[10px]">
                  {rec.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#64748B]">
            No attendance records yet. Hold your QR pass to the scanner at the gym turnstile to record your check-in!
          </div>
        )}
      </div>
    </div>
  );
}
