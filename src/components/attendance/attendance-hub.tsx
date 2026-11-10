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
import { Button } from "@/components/ui/button";
import {
  QrCode,
  UserCheck,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
} from "lucide-react";
import { PageHeader } from "@/components/design-system/page-header";
import { StatCard } from "@/components/design-system/stat-card";

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
      <PageHeader
        title="Attendance & Access Control"
        description="Dynamic HMAC-SHA256 QR scanner, front desk verification, live headcount, and security audit logs."
        actions={
          <Button
            type="button"
            size="sm"
            onClick={() => setIsManualModalOpen(true)}
            className="text-xs h-9 bg-pine hover:bg-pine/90 text-white gap-1.5 rounded-lg shadow-xs transition"
          >
            <UserCheck className="h-4 w-4" />
            <span>Manual Desk Entry</span>
          </Button>
        }
      />

      {/* Headline KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Check-Ins Today"
          value={metrics.totalCheckIns}
          icon={CheckCircle2}
          subtext="Verified daily attendance"
        />
        <StatCard
          label="Currently In Facility"
          value={metrics.currentlyInGym}
          icon={Users}
          subtext="Live facility occupancy"
        />
        <StatCard
          label="Manual Overrides"
          value={metrics.manualOverrides}
          icon={AlertTriangle}
          subtext="Staff audited exceptions"
        />
        <StatCard
          label="Rejected Scans"
          value={metrics.rejectedScans}
          icon={XCircle}
          subtext="Expired or invalid passes"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("kiosk")}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "kiosk"
              ? "border-pine text-pine font-bold"
              : "border-transparent text-muted hover:text-ink"
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
              ? "border-pine text-pine font-bold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Full History Ledger</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "kiosk" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Scanner Card on Left */}
          <div className="lg:col-span-7">
            <QrScannerCard
              gymId={gymId}
              gymSlug={gymSlug}
              onScanSuccess={handleScanSuccess}
            />
          </div>

          {/* Live Recent Scans Feed on Right */}
          <div className="lg:col-span-5 rounded-xl border border-line bg-white shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 border-b border-line flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <h3 className="font-bold text-ink text-xs uppercase tracking-wider">
                  Live Check-in Feed
                </h3>
              </div>
              <span className="text-[10px] text-muted font-mono">Real-Time</span>
            </div>

            <div className="p-3 flex-1 overflow-y-auto max-h-[500px] divide-y divide-line/60">
              {recentScans.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted">
                  No attendance scans recorded today yet.
                </div>
              ) : (
                recentScans.map((r) => (
                  <div key={r.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pine-soft font-bold text-xs text-pine shrink-0">
                        {r.member.firstName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-ink truncate">
                          {r.member.firstName} {r.member.lastName}
                        </div>
                        <div className="text-[10px] font-mono text-muted">
                          {r.member.memberCode} &bull; {new Date(r.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded ${
                          r.status === "VERIFIED"
                            ? "bg-pine-soft text-pine"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <AttendanceHistoryTable
          gymSlug={gymSlug}
          records={initialRecords}
        />
      )}

      {/* Manual Checkin Modal */}
      <ManualCheckinModal
        gymId={gymId}
        gymSlug={gymSlug}
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        members={membersList}
        onSuccess={() => {
          setIsManualModalOpen(false);
        }}
      />
    </div>
  );
}
