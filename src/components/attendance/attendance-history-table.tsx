"use client";

import * as React from "react";
import Link from "next/link";
import { AttendanceStatus, CheckInMethod } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  UserCheck,
  Search,
  Clock,
} from "lucide-react";

export interface AttendanceRecordItem {
  id: string;
  checkInTime: Date | string;
  checkOutTime: Date | string | null;
  status: AttendanceStatus;
  checkInMethod: CheckInMethod;
  rejectionReason: string | null;
  deviceInfo: string | null;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    memberCode: string;
    photoUrl: string | null;
    phone: string | null;
  };
}

interface AttendanceHistoryProps {
  gymSlug: string;
  records: AttendanceRecordItem[];
}

export function AttendanceHistoryTable({
  gymSlug,
  records,
}: AttendanceHistoryProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [methodFilter, setMethodFilter] = React.useState<string>("ALL");

  const filtered = React.useMemo(() => {
    return records.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      if (methodFilter !== "ALL" && r.checkInMethod !== methodFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const fullName = `${r.member.firstName} ${r.member.lastName}`.toLowerCase();
        const code = r.member.memberCode.toLowerCase();
        if (!fullName.includes(q) && !code.includes(q)) return false;
      }
      return true;
    });
  }, [records, search, statusFilter, methodFilter]);

  const formatTime = (dateStr: Date | string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: Date | string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search attendee by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none"
          >
            <option value="ALL">All Outcomes</option>
            <option value="VERIFIED">Verified Only</option>
            <option value="MANUAL_OVERRIDE">Manual Overrides</option>
            <option value="REJECTED">Rejected Only</option>
          </select>

          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none"
          >
            <option value="ALL">All Methods</option>
            <option value="QR_SCAN">QR Scan</option>
            <option value="MANUAL_DESK">Manual Desk</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-xs text-slate-400">
          No attendance records matching the current filters.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-slate-50/70">
              <TableRow>
                <TableHead className="text-xs font-semibold text-slate-700">Member</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Date & Check-In</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Check-Out</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Method</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Status</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Audit / Device Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50">
                  {/* Member */}
                  <TableCell className="py-2.5">
                    <Link
                      href={`/${gymSlug}/members/${item.member.id}`}
                      className="font-semibold text-xs text-slate-900 hover:text-emerald-700 transition"
                    >
                      {item.member.firstName} {item.member.lastName}
                    </Link>
                    <div className="font-mono text-[11px] text-slate-400">
                      {item.member.memberCode}
                    </div>
                  </TableCell>

                  {/* Check-In */}
                  <TableCell className="py-2.5 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span>{formatTime(item.checkInTime)}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(item.checkInTime)}
                    </span>
                  </TableCell>

                  {/* Check-Out */}
                  <TableCell className="py-2.5 text-xs">
                    {item.checkOutTime ? (
                      <span className="text-slate-700 font-medium">
                        {formatTime(item.checkOutTime)}
                      </span>
                    ) : item.status === "REJECTED" ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] py-0"
                      >
                        In Gym
                      </Badge>
                    )}
                  </TableCell>

                  {/* Method */}
                  <TableCell className="py-2.5">
                    {item.checkInMethod === "QR_SCAN" ? (
                      <Badge
                        variant="outline"
                        className="bg-slate-50 text-slate-700 border-slate-200 text-[10px] gap-1 font-mono"
                      >
                        <QrCode className="h-2.5 w-2.5" />
                        <span>QR</span>
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-slate-50 text-slate-700 border-slate-200 text-[10px] gap-1 font-mono"
                      >
                        <UserCheck className="h-2.5 w-2.5" />
                        <span>Desk</span>
                      </Badge>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-2.5">
                    {item.status === "VERIFIED" ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] gap-1 font-semibold"
                      >
                        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                        <span>Verified</span>
                      </Badge>
                    ) : item.status === "MANUAL_OVERRIDE" ? (
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] gap-1 font-semibold"
                      >
                        <AlertTriangle className="h-2.5 w-2.5 text-amber-600" />
                        <span>Manual Override</span>
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-rose-50 text-rose-800 border-rose-200 text-[10px] gap-1 font-semibold"
                      >
                        <XCircle className="h-2.5 w-2.5 text-rose-600" />
                        <span>Rejected</span>
                      </Badge>
                    )}
                  </TableCell>

                  {/* Audit / Reason */}
                  <TableCell className="py-2.5 max-w-xs text-xs text-slate-500">
                    {item.rejectionReason ? (
                      <span className="text-rose-700 font-medium">
                        {item.rejectionReason}
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        {item.deviceInfo || "Standard turnstile kiosk"}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
