"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  QrCode,
  Clock,
  CheckCircle2,
  Activity,
  Flame,
  Scale,
  Ruler,
  Plus,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Dumbbell,
} from "lucide-react";
import { logWeightAction } from "@/lib/actions/portal";

interface PortalProgressTabProps {
  gymSlug: string;
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
  workouts: {
    profile: {
      id: string;
      heightCm?: number | null;
      fitnessGoals?: string | null;
      fitnessNotes?: string | null;
    } | null;
    weightLogs: Array<{
      id: string;
      weightKg: number;
      logDate: string;
      notes?: string | null;
    }>;
    measurements: Array<{
      id: string;
      measureDate: string;
      chestCm?: number | null;
      waistCm?: number | null;
      hipsCm?: number | null;
      bicepsCm?: number | null;
      thighsCm?: number | null;
      calvesCm?: number | null;
      bodyFatPct?: number | null;
      notes?: string | null;
    }>;
    workoutRecords: Array<{
      id: string;
      planName: string;
      durationMinutes?: number | null;
      completedAt: string;
      notes?: string | null;
    }>;
  };
}

export function PortalProgressTab({
  gymSlug,
  attendance,
  workouts,
}: PortalProgressTabProps) {
  const [isWeightModalOpen, setIsWeightModalOpen] = React.useState(false);
  const [weightInput, setWeightInput] = React.useState("");
  const [weightNotes, setWeightNotes] = React.useState("");
  const [isLoggingWeight, setIsLoggingWeight] = React.useState(false);
  const [weightError, setWeightError] = React.useState<string | null>(null);

  const latestWeight = workouts.weightLogs[0]?.weightKg ?? null;
  const previousWeight = workouts.weightLogs[1]?.weightKg ?? null;
  const weightChange =
    latestWeight && previousWeight
      ? Number((latestWeight - previousWeight).toFixed(1))
      : null;

  // Calculate BMI if height and weight exist
  const heightM = workouts.profile?.heightCm
    ? workouts.profile.heightCm / 100
    : null;
  const bmi =
    latestWeight && heightM
      ? Number((latestWeight / (heightM * heightM)).toFixed(1))
      : null;

  const getBmiCategory = (val: number) => {
    if (val < 18.5) return { label: "Underweight", color: "text-blue-600 bg-blue-50" };
    if (val < 25) return { label: "Normal Weight", color: "text-[#0B6B4F] bg-[#E4F2EB]" };
    if (val < 30) return { label: "Overweight", color: "text-amber-700 bg-amber-50" };
    return { label: "Obese", color: "text-rose-700 bg-rose-50" };
  };

  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (isNaN(val) || val <= 20 || val >= 350) {
      setWeightError("Please enter a valid weight between 20kg and 350kg.");
      return;
    }

    try {
      setIsLoggingWeight(true);
      setWeightError(null);
      const formData = new FormData();
      formData.set("weightKg", val.toString());
      if (weightNotes) {
        formData.set("notes", weightNotes);
      }
      const res = await logWeightAction(gymSlug, formData);
      if (res.success) {
        setIsWeightModalOpen(false);
        setWeightInput("");
        setWeightNotes("");
      } else {
        setWeightError(res.error || "Failed to log weight.");
      }
    } catch {
      setWeightError("Failed to connect to server. Please try again.");
    } finally {
      setIsLoggingWeight(false);
    }
  };

  const latestMeasurement = workouts.measurements[0] ?? null;

  return (
    <div className="space-y-4 pb-6">
      {/* 1. Attendance & Consistency Stat Cards */}
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
              Total Lifetime Visits
            </span>
            <Activity className="h-4 w-4 text-[#0B6B4F]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0F172A]">
            {attendance.totalCheckIns}
          </div>
          <span className="text-[11px] text-[#64748B]">
            All-time gym check-ins
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

      {/* 2. Weight Tracking & Body Metrics */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-[#0B6B4F]" />
            <h2 className="text-sm font-bold text-[#0F172A]">
              Weight & Body Composition
            </h2>
          </div>
          <Button
            size="sm"
            onClick={() => setIsWeightModalOpen(true)}
            className="text-xs h-7 gap-1 bg-[#0B6B4F] hover:bg-[#047857] text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Log Weight</span>
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg bg-[#F8FAFC] p-3 border border-[#E2E8F0]">
            <span className="text-[10px] font-medium text-[#64748B] uppercase">Current Weight</span>
            <div className="text-xl font-bold text-[#0F172A] mt-1">
              {latestWeight ? `${latestWeight} kg` : "—"}
            </div>
            {weightChange !== null && (
              <span
                className={`text-[10px] font-medium flex items-center gap-0.5 mt-0.5 ${
                  weightChange <= 0 ? "text-[#0B6B4F]" : "text-amber-600"
                }`}
              >
                {weightChange <= 0 ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <TrendingUp className="h-3 w-3" />
                )}
                {weightChange > 0 ? `+${weightChange}` : weightChange} kg vs last log
              </span>
            )}
          </div>

          <div className="rounded-lg bg-[#F8FAFC] p-3 border border-[#E2E8F0]">
            <span className="text-[10px] font-medium text-[#64748B] uppercase">Height</span>
            <div className="text-xl font-bold text-[#0F172A] mt-1">
              {workouts.profile?.heightCm ? `${workouts.profile.heightCm} cm` : "—"}
            </div>
            <span className="text-[10px] text-[#64748B]">Member profile</span>
          </div>

          <div className="rounded-lg bg-[#F8FAFC] p-3 border border-[#E2E8F0]">
            <span className="text-[10px] font-medium text-[#64748B] uppercase">Body Mass Index</span>
            <div className="text-xl font-bold text-[#0F172A] mt-1">
              {bmi ?? "—"}
            </div>
            {bmi && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${getBmiCategory(bmi).color}`}>
                {getBmiCategory(bmi).label}
              </span>
            )}
          </div>

          <div className="rounded-lg bg-[#F8FAFC] p-3 border border-[#E2E8F0]">
            <span className="text-[10px] font-medium text-[#64748B] uppercase">Goals</span>
            <div className="text-xs font-semibold text-[#0F172A] mt-1 truncate">
              {workouts.profile?.fitnessGoals || "General Fitness"}
            </div>
            <span className="text-[10px] text-[#64748B] truncate block">
              {workouts.profile?.fitnessNotes || "Consistency first"}
            </span>
          </div>
        </div>

        {/* Recent Weight Logs */}
        {workouts.weightLogs.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
            <span className="text-xs font-semibold text-[#0F172A]">Recent Weigh-Ins</span>
            <div className="mt-2 divide-y divide-[#F1F5F9]">
              {workouts.weightLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between py-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-[#0F172A]">{log.weightKg} kg</span>
                    {log.notes && <span className="text-[#64748B] text-[11px]">({log.notes})</span>}
                  </div>
                  <span className="text-[10px] text-[#94A3B8] font-mono">
                    {new Date(log.logDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Body Measurements Card */}
      {latestMeasurement && (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-[#0B6B4F]" />
              <h2 className="text-sm font-bold text-[#0F172A]">
                Latest Circumference Measurements
              </h2>
            </div>
            <span className="text-[11px] text-[#64748B]">
              Measured on {new Date(latestMeasurement.measureDate).toLocaleDateString()}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            {latestMeasurement.chestCm && (
              <div className="rounded-lg bg-[#F8FAFC] p-2.5 border border-[#E2E8F0]">
                <span className="text-[10px] text-[#64748B] uppercase">Chest</span>
                <div className="text-sm font-bold text-[#0F172A]">{latestMeasurement.chestCm} cm</div>
              </div>
            )}
            {latestMeasurement.waistCm && (
              <div className="rounded-lg bg-[#F8FAFC] p-2.5 border border-[#E2E8F0]">
                <span className="text-[10px] text-[#64748B] uppercase">Waist</span>
                <div className="text-sm font-bold text-[#0F172A]">{latestMeasurement.waistCm} cm</div>
              </div>
            )}
            {latestMeasurement.hipsCm && (
              <div className="rounded-lg bg-[#F8FAFC] p-2.5 border border-[#E2E8F0]">
                <span className="text-[10px] text-[#64748B] uppercase">Hips</span>
                <div className="text-sm font-bold text-[#0F172A]">{latestMeasurement.hipsCm} cm</div>
              </div>
            )}
            {latestMeasurement.bicepsCm && (
              <div className="rounded-lg bg-[#F8FAFC] p-2.5 border border-[#E2E8F0]">
                <span className="text-[10px] text-[#64748B] uppercase">Biceps</span>
                <div className="text-sm font-bold text-[#0F172A]">{latestMeasurement.bicepsCm} cm</div>
              </div>
            )}
            {latestMeasurement.thighsCm && (
              <div className="rounded-lg bg-[#F8FAFC] p-2.5 border border-[#E2E8F0]">
                <span className="text-[10px] text-[#64748B] uppercase">Thighs</span>
                <div className="text-sm font-bold text-[#0F172A]">{latestMeasurement.thighsCm} cm</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Attendance Timeline List */}
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
            {attendance.records.map((rec) => {
              const inDate = new Date(rec.checkInTime);
              return (
                <div key={rec.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E4F2EB] text-[#0B6B4F]">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0F172A]">
                          {inDate.toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="text-[10px] font-mono text-[#64748B] bg-[#F1F5F9] px-1.5 py-0.2 rounded border border-[#E2E8F0]">
                          {rec.checkInMethod === "QR_SCAN"
                            ? "Dynamic QR"
                            : "Front Desk"}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#64748B]">
                        Entered at{" "}
                        {inDate.toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {rec.checkOutTime &&
                          ` • Left at ${new Date(rec.checkOutTime).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-[#E4F2EB] px-2 py-0.5 text-[10px] font-semibold text-[#0B6B4F] border border-[#A7F3D0]">
                    Verified
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#64748B]">
            No attendance records logged yet. Your check-ins will appear here automatically.
          </div>
        )}
      </div>

      {/* 5. Workout Records History */}
      {workouts.workoutRecords.length > 0 && (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-[#0B6B4F]" />
              <h2 className="text-sm font-bold text-[#0F172A]">
                Completed Workout History
              </h2>
            </div>
            <span className="text-xs text-[#64748B]">
              {workouts.workoutRecords.length} sessions
            </span>
          </div>

          <div className="mt-3 divide-y divide-[#F1F5F9]">
            {workouts.workoutRecords.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2.5">
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">{r.planName}</h4>
                  {r.notes && <span className="text-[11px] text-[#64748B]">{r.notes}</span>}
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#94A3B8] font-mono block">
                    {new Date(r.completedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-[10px] font-semibold text-[#0B6B4F]">Completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Weight Modal */}
      <Dialog open={isWeightModalOpen} onOpenChange={setIsWeightModalOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Scale className="h-4 w-4 text-[#0B6B4F]" />
              <span>Log Weight</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleLogWeight} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs text-[#64748B]">Weight (kg)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="74.5"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="mt-1 h-9 text-sm"
                required
              />
            </div>

            <div>
              <Label className="text-xs text-[#64748B]">Notes (optional)</Label>
              <Input
                type="text"
                placeholder="Morning weigh-in before meal"
                value={weightNotes}
                onChange={(e) => setWeightNotes(e.target.value)}
                className="mt-1 h-9 text-sm"
              />
            </div>

            {weightError && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{weightError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsWeightModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isLoggingWeight}
                className="text-xs bg-[#0B6B4F] hover:bg-[#047857] text-white"
              >
                {isLoggingWeight ? "Saving..." : "Save Record"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
