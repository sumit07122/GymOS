"use client";

import * as React from "react";
import { useState } from "react";
import { QrScannerCard } from "./qr-scanner-card";
import {
  ManualCheckinModal,
  SimpleMemberOption,
} from "./manual-checkin-modal";
import {
  AttendanceHistoryTable,
  AttendanceRecordItem,
} from "./attendance-history-table";
import { ScanResult } from "@/lib/services/attendance.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  UserCheck,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
} from "lucide-react";

interface AttendanceHubProps {
  gymId: string;
  gymSlug: string;
  metrics: {
    totalCheckIns: number;
    currentlyInGym: number;
    manualOverrides: number;
    rejectedScans: number;
  };
  initialRecords: AttendanceRecordItem[];
  recentScans: AttendanceRecordItem[];
  membersList: SimpleMemberOption[];
}

export function AttendanceHub({
  gymId,
  gymSlug,
  metrics,
  initialRecords,
  recentScans: initialRecentScans,
  membersList,
}: AttendanceHubProps) {
  const [activeTab, setActiveTab] = useState<"kiosk" | "ledger">("kiosk");
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [recentScans, setRecentScans] = useState<AttendanceRecordItem[]>(initialRecentScans);

  const handleScanSuccess = (scanResult: ScanResult) => {
    if (scanResult.attendanceRecord) {
      const newRecord: AttendanceRecordItem = {
        id: scanResult.attendanceRecord.id,
        checkInTime: scanResult.attendanceRecord.checkInTime,
        checkOutTime: scanResult.attendanceRecord.checkOutTime,
        status: scanResult.attendanceRecord.status,
        checkInMethod: scanResult.attendanceRecord.checkInMethod,
        rejectionReason: scanResult.attendanceRecord.rejectionReason,
        deviceInfo: scanResult.attendanceRecord.deviceInfo,
        member: {
          id: scanResult.member.id,
          firstName: scanResult.member.fullName.split(" ")[0] || "",
          lastName: scanResult.member.fullName.split(" ").slice(1).join(" ") || "",
          memberCode: scanResult.member.memberCode,
          photoUrl: scanResult.member.photoUrl || null,
          phone: null,
        },
      };

      setRecentScans((prev) => [newRecord, ...prev.slice(0, 9)]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <QrCode className="h-6 w-6 text-emerald-600" />
            Attendance & Access Control
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic HMAC-SHA256 QR scanner, front desk verification, live headcount, and security audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => setIsManualModalOpen(true)}
            className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
          >
            <UserCheck className="h-4 w-4" />
            <span>Manual Desk Entry</span>
          </Button>
        </div>
      </div>

      {/* Headline KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Total Check-Ins Today
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {metrics.totalCheckIns}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Verified daily attendance
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Currently In Gym
              </span>
              <Users className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-700">
              {metrics.currentlyInGym}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live facility occupancy
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Manual Overrides
              </span>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {metrics.manualOverrides}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Staff audited exceptions
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Rejected Scans Today
              </span>
              <XCircle className="h-4 w-4 text-rose-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-rose-700">
              {metrics.rejectedScans}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Expired or invalid attempts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("kiosk")}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "kiosk"
              ? "border-emerald-600 text-emerald-700 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <QrCode className="h-4 w-4" />
          <span>Live Scanner & Kiosk</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ledger")}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "ledger"
              ? "border-emerald-600 text-emerald-700 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Attendance Ledger & Reports ({initialRecords.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "kiosk" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Camera Scanner Viewport */}
          <div className="lg:col-span-7">
            <QrScannerCard
              gymId={gymId}
              gymSlug={gymSlug}
              onScanSuccess={handleScanSuccess}
            />
          </div>

          {/* Live Recent Feed */}
          <div className="lg:col-span-5 space-y-3">
            <Card className="border-slate-200 shadow-xs">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-emerald-600" />
                  <span>Recent Scans Live Feed</span>
                </span>
                <span className="text-[10px] text-slate-400">Latest 10 scans</span>
              </div>
              <CardContent className="p-0 divide-y divide-slate-100">
                {recentScans.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No attendance activity recorded yet today.
                  </div>
                ) : (
                  recentScans.map((scan) => (
                    <div key={scan.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-900">
                          {scan.member.firstName} {scan.member.lastName}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span>{scan.member.memberCode}</span>
                          <span>•</span>
                          <span>{new Date(scan.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </div>

                      <div>
                        {scan.status === "VERIFIED" ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                            Verified
                          </Badge>
                        ) : scan.status === "MANUAL_OVERRIDE" ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-[10px]">
                            Override
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-rose-50 text-rose-800 border-rose-200 text-[10px]">
                            Rejected
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "ledger" && (
        <AttendanceHistoryTable
          gymSlug={gymSlug}
          records={initialRecords}
        />
      )}

      {/* Manual Checkin Modal */}
      {isManualModalOpen && (
        <ManualCheckinModal
          isOpen={isManualModalOpen}
          onClose={() => setIsManualModalOpen(false)}
          gymId={gymId}
          gymSlug={gymSlug}
          members={membersList}
        />
      )}
    </div>
  );
}
