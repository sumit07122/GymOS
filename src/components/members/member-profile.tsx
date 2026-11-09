/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import Link from "next/link";
import {
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  QrCode,
  Dumbbell,
  HeartPulse,
  Edit,
  Archive,
  RotateCcw,
  Plus,
  Activity,
  Receipt,
  ArrowLeft,
  Clock,
  RotateCw,
  Pause,
  Play,
  XCircle,
  History,
  PlusCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  archiveMemberAction,
  unarchiveMemberAction,
  addWorkoutRecordAction,
} from "@/lib/actions/member";
import {
  AssignMembershipModal,
  RenewMembershipModal,
  ExtendMembershipModal,
  PauseMembershipModal,
  CancelMembershipModal,
  PlanOption,
} from "@/components/memberships/membership-lifecycle-modals";
import { MemberQrPassModal } from "@/components/attendance/member-qr-pass-modal";
import { resumeMembershipAction } from "@/lib/actions/membership";

interface MemberProfileProps {
  gymId: string;
  gymSlug: string;
  currency: string;
  member: any; // Full member record with relations
  availablePlans?: PlanOption[];
}

export function MemberProfile({
  gymId,
  gymSlug,
  currency,
  member,
  availablePlans = [],
}: MemberProfileProps) {
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "memberships" | "financial" | "attendance" | "workouts" | "timeline"
  >("overview");

  // Membership lifecycle modal states
  const [isAssignOpen, setIsAssignOpen] = React.useState(false);
  const [renewTarget, setRenewTarget] = React.useState<any | null>(null);
  const [extendTarget, setExtendTarget] = React.useState<any | null>(null);
  const [pauseTarget, setPauseTarget] = React.useState<any | null>(null);
  const [cancelTarget, setCancelTarget] = React.useState<any | null>(null);
  const [expandedAuditId, setExpandedAuditId] = React.useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = React.useState(false);
  const [isResumePending, startResumeTransition] = React.useTransition();

  const handleResume = (membershipId: string) => {
    startResumeTransition(async () => {
      await resumeMembershipAction(gymId, membershipId, gymSlug, member.id);
    });
  };

  // Modal dialog states
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = React.useState(false);
  const [workoutTitle, setWorkoutTitle] = React.useState("");
  const [workoutNotes, setWorkoutNotes] = React.useState("");
  const [isWorkoutPending, setIsWorkoutPending] = React.useState(false);

  const [isArchivePending, setIsArchivePending] = React.useState(false);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleArchiveToggle = async () => {
    setIsArchivePending(true);
    const fd = new FormData();
    fd.set("gymId", gymId);
    fd.set("gymSlug", gymSlug);
    fd.set("memberId", member.id);

    if (member.status === "ARCHIVED") {
      await unarchiveMemberAction(null, fd);
    } else {
      fd.set("reason", "Archived from member profile");
      await archiveMemberAction(null, fd);
    }
    setIsArchivePending(false);
    window.location.reload();
  };

  const handleAddWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutTitle.trim()) return;

    setIsWorkoutPending(true);
    const fd = new FormData();
    fd.set("gymId", gymId);
    fd.set("gymSlug", gymSlug);
    fd.set("memberId", member.id);
    fd.set("title", workoutTitle);
    fd.set("notes", workoutNotes);

    const res = await addWorkoutRecordAction(null, fd);
    setIsWorkoutPending(false);

    if (res.success) {
      setIsWorkoutModalOpen(false);
      setWorkoutTitle("");
      setWorkoutNotes("");
      window.location.reload();
    } else {
      alert(res.error || "Failed to log workout.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/${gymSlug}/members`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Member Directory</span>
        </Link>
      </div>

      {/* Header Profile Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-900 font-bold text-xl text-white shadow-md">
              {member.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.photoUrl}
                  alt=""
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                <span>
                  {member.firstName.charAt(0)}
                  {member.lastName.charAt(0)}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  {member.firstName} {member.lastName}
                </h1>
                <Badge variant="outline" className="font-mono text-xs text-slate-700">
                  {member.memberCode}
                </Badge>
                <Badge
                  className={
                    member.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 text-xs"
                      : member.status === "ARCHIVED"
                      ? "bg-rose-50 text-rose-800 border-rose-200 text-xs"
                      : "bg-slate-100 text-slate-700 text-xs"
                  }
                >
                  {member.status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                {member.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{member.phone}</span>
                  </span>
                )}
                {member.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>{member.email}</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>Joined {new Date(member.joiningDate).toLocaleDateString()}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsQrModalOpen(true)}
              className="text-xs h-9 gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            >
              <QrCode className="h-3.5 w-3.5 text-emerald-700" />
              <span>Attendance QR Pass</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsWorkoutModalOpen(true)}
              className="text-xs h-9 gap-1.5"
            >
              <Dumbbell className="h-3.5 w-3.5 text-slate-500" />
              <span>Log Workout</span>
            </Button>

            <Link
              href={`/${gymSlug}/members/${member.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <Edit className="h-3.5 w-3.5 text-slate-500" />
              <span>Edit Profile</span>
            </Link>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isArchivePending}
              onClick={handleArchiveToggle}
              className={`text-xs h-9 gap-1.5 ${
                member.status === "ARCHIVED"
                  ? "text-emerald-700 hover:bg-emerald-50"
                  : "text-amber-700 hover:bg-amber-50"
              }`}
            >
              {member.status === "ARCHIVED" ? (
                <>
                  <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Restore Active</span>
                </>
              ) : (
                <>
                  <Archive className="h-3.5 w-3.5 text-amber-600" />
                  <span>Archive</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Highlight KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="text-[10px] font-semibold text-slate-400 uppercase">
              Active Plan
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900 truncate">
              {member.activeMembership ? member.activeMembership.plan.name : "None"}
            </div>
            <div className="text-[10px] text-slate-500">
              {member.activeMembership
                ? `Expires ${new Date(member.activeMembership.endDate).toLocaleDateString()}`
                : "No active membership"}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3">
            <div className="text-[10px] font-semibold text-slate-400 uppercase">
              Outstanding Dues
            </div>
            <div
              className={`mt-1 text-sm font-bold ${
                member.outstandingDues > 0 ? "text-rose-600" : "text-emerald-700"
              }`}
            >
              {formatMoney(member.outstandingDues)}
            </div>
            <div className="text-[10px] text-slate-500">
              {member.outstandingDues > 0 ? "Pending payment" : "Fully settled"}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3">
            <div className="text-[10px] font-semibold text-slate-400 uppercase">
              Total Check-Ins
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900">
              {member.attendanceRecords.length}
            </div>
            <div className="text-[10px] text-slate-500">Verified visits</div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3">
            <div className="text-[10px] font-semibold text-slate-400 uppercase">
              Workout Sessions
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900">
              {member.workoutRecords.length}
            </div>
            <div className="text-[10px] text-slate-500">Logged benchmarks</div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto text-xs font-semibold">
        {[
          { key: "overview", label: "Overview & Personal" },
          { key: "memberships", label: `Memberships (${member.memberships.length})` },
          { key: "financial", label: `Invoices & Payments (${member.invoices.length + member.payments.length})` },
          { key: "attendance", label: `Attendance Log (${member.attendanceRecords.length})` },
          { key: "workouts", label: `Workouts (${member.workoutRecords.length})` },
          { key: "timeline", label: `Activity Timeline (${member.activities.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 whitespace-nowrap border-b-2 transition ${
              activeTab === tab.key
                ? "border-emerald-600 text-emerald-700 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Overview & Personal Details */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-200 shadow-xs">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-600" />
                Contact & Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Full Name</span>
                <span className="font-semibold text-slate-900">
                  {member.firstName} {member.lastName}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Member ID</span>
                <span className="font-mono text-slate-900">{member.memberCode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Phone</span>
                <span className="text-slate-900">{member.phone || "Not recorded"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Email</span>
                <span className="text-slate-900">{member.email || "Not recorded"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Gender</span>
                <span className="text-slate-900">{member.gender || "Unspecified"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Date of Birth</span>
                <span className="text-slate-900">
                  {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : "Not provided"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Address</span>
                <span className="text-slate-900 text-right">{member.address || "Not provided"}</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* Emergency Contact */}
            <Card className="border-slate-200 shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-emerald-600" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Contact Name</span>
                  <span className="font-semibold text-slate-900">
                    {member.emergencyContactName || "None provided"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Contact Phone</span>
                  <span className="font-semibold text-slate-900">
                    {member.emergencyContactPhone || "None provided"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Medical & Internal Notes */}
            <Card className="border-slate-200 shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-rose-600" />
                  Medical & Internal Staff Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div>
                  <div className="font-semibold text-slate-700 mb-1">Medical Conditions:</div>
                  <div className="rounded-lg bg-slate-50 p-2.5 text-slate-600">
                    {member.medicalNotes || "No medical conditions or physical limitations noted."}
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-slate-700 mb-1">Staff Internal Notes:</div>
                  <div className="rounded-lg bg-slate-50 p-2.5 text-slate-600">
                    {member.internalNotes || "No confidential internal notes."}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: Memberships */}
      {activeTab === "memberships" && (
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-900">
                Membership Contracts & History
              </CardTitle>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Contract lifecycles, historical pricing snapshots, extensions, and audit trails.
              </p>
            </div>
            {availablePlans.length > 0 && (
              <Button
                type="button"
                size="sm"
                onClick={() => setIsAssignOpen(true)}
                className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Assign Plan</span>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {member.memberships.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500">
                <p>No memberships assigned to this member yet.</p>
                {availablePlans.length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsAssignOpen(true)}
                    className="mt-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Assign First Membership Plan</span>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader className="bg-slate-50/70">
                    <TableRow>
                      <TableHead className="text-xs font-semibold text-slate-700">Contract Plan</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700">Price Paid</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700">Start Date</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700">End Date</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {member.memberships.map((m: any) => {
                      const isExpanded = expandedAuditId === m.id;
                      const hasAudit = m.auditLogs && m.auditLogs.length > 0;

                      return (
                        <React.Fragment key={m.id}>
                          <TableRow className="hover:bg-slate-50/50">
                            <TableCell className="text-xs font-semibold text-slate-900">
                              <div>{m.planNameSnapshot || m.plan.name}</div>
                              {Number(m.admissionFeePaid) > 0 && (
                                <span className="text-[10px] text-slate-400 font-normal">
                                  + {formatMoney(Number(m.admissionFeePaid))} admission
                                </span>
                              )}
                            </TableCell>

                            <TableCell className="text-xs font-mono font-medium text-slate-900">
                              {formatMoney(Number(m.pricePaid))}
                            </TableCell>

                            <TableCell className="text-xs text-slate-600">
                              {new Date(m.startDate).toLocaleDateString()}
                            </TableCell>

                            <TableCell className="text-xs text-slate-600">
                              <div className="flex items-center gap-1.5">
                                <span>{new Date(m.endDate).toLocaleDateString()}</span>
                                {m.extendedDays > 0 && (
                                  <Badge
                                    variant="outline"
                                    className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] py-0 px-1"
                                    title={`Extended by ${m.extendedDays} days: ${m.extensionReason || "No reason recorded"}`}
                                  >
                                    +{m.extendedDays}d
                                  </Badge>
                                )}
                              </div>
                            </TableCell>

                            <TableCell className="text-xs">
                              <div className="space-y-0.5">
                                <Badge
                                  variant="outline"
                                  className={
                                    m.status === "ACTIVE"
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]"
                                      : m.status === "PAUSED"
                                      ? "bg-amber-50 text-amber-800 border-amber-200 text-[10px]"
                                      : m.status === "CANCELLED"
                                      ? "bg-rose-50 text-rose-800 border-rose-200 text-[10px]"
                                      : "bg-slate-100 text-slate-700 text-[10px]"
                                  }
                                >
                                  {m.status}
                                </Badge>
                                {m.status === "PAUSED" && m.pauseReason && (
                                  <div className="text-[10px] text-amber-700 italic">
                                    {m.pauseReason}
                                  </div>
                                )}
                                {m.status === "CANCELLED" && m.cancellationReason && (
                                  <div className="text-[10px] text-rose-700 italic">
                                    {m.cancellationReason}
                                  </div>
                                )}
                              </div>
                            </TableCell>

                            <TableCell className="text-xs text-right">
                              <div className="flex items-center justify-end gap-1">
                                {/* Renew Button */}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setRenewTarget(m)}
                                  className="h-7 px-2 text-xs text-emerald-700 hover:bg-emerald-50"
                                  title="Renew contract"
                                >
                                  <RotateCw className="h-3 w-3 mr-1" />
                                  <span>Renew</span>
                                </Button>

                                {/* Extend Button */}
                                {m.status !== "CANCELLED" && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setExtendTarget(m)}
                                    className="h-7 px-2 text-xs text-slate-700 hover:bg-slate-100"
                                    title="Extend days"
                                  >
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>Extend</span>
                                  </Button>
                                )}

                                {/* Pause or Resume */}
                                {m.status === "ACTIVE" && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPauseTarget(m)}
                                    className="h-7 px-2 text-xs text-amber-700 hover:bg-amber-50"
                                    title="Pause membership"
                                  >
                                    <Pause className="h-3 w-3 mr-1" />
                                    <span>Pause</span>
                                  </Button>
                                )}

                                {m.status === "PAUSED" && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={isResumePending}
                                    onClick={() => handleResume(m.id)}
                                    className="h-7 px-2 text-xs text-emerald-700 hover:bg-emerald-50 font-semibold"
                                    title="Resume membership"
                                  >
                                    <Play className="h-3 w-3 mr-1" />
                                    <span>Resume</span>
                                  </Button>
                                )}

                                {/* Cancel */}
                                {(m.status === "ACTIVE" || m.status === "PAUSED") && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCancelTarget(m)}
                                    className="h-7 px-2 text-xs text-rose-700 hover:bg-rose-50"
                                    title="Cancel contract"
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    <span>Cancel</span>
                                  </Button>
                                )}

                                {/* Audit Log Toggle */}
                                {hasAudit && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setExpandedAuditId(isExpanded ? null : m.id)
                                    }
                                    className={`h-7 px-1.5 text-xs ${
                                      isExpanded ? "text-emerald-700 bg-emerald-50" : "text-slate-500 hover:text-slate-800"
                                    }`}
                                    title="View contract audit log"
                                  >
                                    <History className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* Expanded Audit Log Panel */}
                          {isExpanded && hasAudit && (
                            <TableRow className="bg-slate-50/80">
                              <TableCell colSpan={6} className="py-2.5 px-4">
                                <div className="space-y-1.5">
                                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <History className="h-3 w-3 text-emerald-600" />
                                    <span>Contract Audit Trail (#{m.id.slice(0, 8)})</span>
                                  </div>
                                  <div className="space-y-1 pl-4 border-l-2 border-slate-200">
                                    {m.auditLogs.map((log: any) => (
                                      <div key={log.id} className="text-xs text-slate-600 flex items-baseline gap-2">
                                        <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono uppercase bg-white">
                                          {log.action}
                                        </Badge>
                                        <span className="font-mono text-[10px] text-slate-400">
                                          {new Date(log.createdAt).toLocaleString()}
                                        </span>
                                        <span className="text-slate-700">{log.details}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: Financial (Invoices & Payments) */}
      {activeTab === "financial" && (
        <div className="space-y-6">
          {/* Invoices */}
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-slate-900">
                Invoices & Billing Statements
              </CardTitle>
              <Receipt className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              {member.invoices.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No billing invoices issued yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Invoice #</TableHead>
                      <TableHead className="text-xs">Issued Date</TableHead>
                      <TableHead className="text-xs">Total Amount</TableHead>
                      <TableHead className="text-xs">Balance Due</TableHead>
                      <TableHead className="text-xs text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {member.invoices.map((inv: any) => (
                      <TableRow key={inv.id}>
                        <TableCell className="text-xs font-mono font-semibold text-slate-900">
                          {inv.invoiceNumber}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {new Date(inv.issueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {formatMoney(Number(inv.totalAmount))}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-rose-600">
                          {formatMoney(Number(inv.dueAmount))}
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          <Badge variant="outline" className="text-[10px]">
                            {inv.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Payments */}
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-slate-900">
                Payment Receipts
              </CardTitle>
              <CreditCard className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              {member.payments.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No payment transactions recorded yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Receipt #</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Amount</TableHead>
                      <TableHead className="text-xs">Method</TableHead>
                      <TableHead className="text-xs text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {member.payments.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell className="text-xs font-mono text-slate-900">
                          {p.paymentNumber}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {new Date(p.receivedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-emerald-700">
                          {formatMoney(Number(p.amount))}
                        </TableCell>
                        <TableCell className="text-xs capitalize text-slate-600">
                          {p.method.toLowerCase().replace("_", " ")}
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          <Badge variant="outline" className="text-[10px] text-emerald-800 bg-emerald-50">
                            {p.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: Attendance History */}
      {activeTab === "attendance" && (
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-900">
                Attendance Check-In History
              </CardTitle>
              <p className="text-xs text-slate-500">
                Log of member physical entries recorded via QR code or front-desk override.
              </p>
            </div>
            <QrCode className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            {member.attendanceRecords.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No check-in history recorded for this member yet. Scan the member&apos;s dynamic QR code at the turnstile or front desk to register check-in.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Check-In Time</TableHead>
                    <TableHead className="text-xs">Method</TableHead>
                    <TableHead className="text-xs text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {member.attendanceRecords.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell className="text-xs font-medium text-slate-900">
                        {new Date(a.checkInTime).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 capitalize">
                        {a.checkInMethod.toLowerCase().replace("_", " ")}
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        <Badge
                          variant="outline"
                          className={
                            a.status === "VERIFIED"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]"
                              : "bg-slate-100 text-slate-700 text-[10px]"
                          }
                        >
                          {a.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 5: Workout Records */}
      {activeTab === "workouts" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Workout Benchmarks & Training Notes
              </h3>
              <p className="text-xs text-slate-500">
                Track personal fitness achievements and trainer session summaries.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => setIsWorkoutModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 h-8"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Log Session</span>
            </Button>
          </div>

          {member.workoutRecords.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="py-8 text-center text-xs text-slate-500">
                No workouts logged yet. Use &ldquo;Log Session&rdquo; to add exercise benchmarks.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {member.workoutRecords.map((w: any) => (
                <Card key={w.id} className="border-slate-200 shadow-xs">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                        <Dumbbell className="h-3.5 w-3.5" />
                      </div>
                      <CardTitle className="text-xs font-bold text-slate-900">
                        {w.title}
                      </CardTitle>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(w.date).toLocaleDateString()}
                    </span>
                  </CardHeader>
                  <CardContent className="text-xs text-slate-600">
                    <p className="leading-relaxed">{w.notes || "No session details recorded."}</p>
                    {w.recordedBy && (
                      <div className="mt-2 text-[10px] text-slate-400">
                        Logged by {w.recordedBy}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: Activity Timeline */}
      {activeTab === "timeline" && (
        <Card className="border-slate-200 shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600" />
              Member Activity Audit Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            {member.activities.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No audit activity recorded yet.
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:bottom-0 before:top-2 before:left-2 before:w-0.5 before:bg-slate-200">
                {member.activities.map((act: any) => (
                  <div key={act.id} className="relative">
                    <div className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-600 shadow-xs" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">
                          {act.action}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(act.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {act.details && (
                        <p className="text-xs text-slate-600 mt-0.5">{act.details}</p>
                      )}
                      {act.performedBy && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          By: {act.performedBy}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Log Workout Dialog */}
      <Dialog open={isWorkoutModalOpen} onOpenChange={setIsWorkoutModalOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200 shadow-2xl p-6">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Dumbbell className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Log Workout Session
              </DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleAddWorkout} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label htmlFor="w-title" className="text-xs font-semibold text-slate-700">
                Workout Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="w-title"
                value={workoutTitle}
                onChange={(e) => setWorkoutTitle(e.target.value)}
                placeholder="e.g. Upper Body Strength / 5k Run / Deadlift 140kg"
                required
                className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="w-notes" className="text-xs font-semibold text-slate-700">
                Session Notes & Metrics
              </label>
              <textarea
                id="w-notes"
                rows={4}
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                placeholder="Sets, reps, weights, heart rate or trainer feedback..."
                className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsWorkoutModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isWorkoutPending || !workoutTitle.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4"
              >
                {isWorkoutPending ? "Saving..." : "Save Workout"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* MEMBERSHIP LIFECYCLE MODALS */}
      {isAssignOpen && (
        <AssignMembershipModal
          isOpen={isAssignOpen}
          onClose={() => setIsAssignOpen(false)}
          gymId={gymId}
          gymSlug={gymSlug}
          currency={currency}
          plans={availablePlans}
          preselectedMemberId={member.id}
          preselectedMemberName={`${member.firstName} ${member.lastName}`}
        />
      )}

      {renewTarget && (
        <RenewMembershipModal
          isOpen={Boolean(renewTarget)}
          onClose={() => setRenewTarget(null)}
          gymId={gymId}
          gymSlug={gymSlug}
          currency={currency}
          membershipId={renewTarget.id}
          memberName={`${member.firstName} ${member.lastName}`}
          currentPlanName={renewTarget.planNameSnapshot || renewTarget.plan.name}
          currentEndDate={renewTarget.endDate}
          isCurrentlyActive={renewTarget.status === "ACTIVE"}
          plans={availablePlans}
        />
      )}

      {extendTarget && (
        <ExtendMembershipModal
          isOpen={Boolean(extendTarget)}
          onClose={() => setExtendTarget(null)}
          gymId={gymId}
          gymSlug={gymSlug}
          membershipId={extendTarget.id}
          memberName={`${member.firstName} ${member.lastName}`}
          currentEndDate={extendTarget.endDate}
        />
      )}

      {pauseTarget && (
        <PauseMembershipModal
          isOpen={Boolean(pauseTarget)}
          onClose={() => setPauseTarget(null)}
          gymId={gymId}
          gymSlug={gymSlug}
          membershipId={pauseTarget.id}
          memberName={`${member.firstName} ${member.lastName}`}
        />
      )}

      {cancelTarget && (
        <CancelMembershipModal
          isOpen={Boolean(cancelTarget)}
          onClose={() => setCancelTarget(null)}
          gymId={gymId}
          gymSlug={gymSlug}
          membershipId={cancelTarget.id}
          memberName={`${member.firstName} ${member.lastName}`}
        />
      )}

      {isQrModalOpen && (
        <MemberQrPassModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          gymId={gymId}
          memberId={member.id}
          memberName={`${member.firstName} ${member.lastName}`}
          memberCode={member.memberCode}
        />
      )}
    </div>
  );
}
