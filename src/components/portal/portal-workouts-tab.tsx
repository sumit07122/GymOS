"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
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
  Dumbbell,
  Scale,
  Ruler,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  AlertCircle,
  TrendingDown,
} from "lucide-react";
import { logWeightAction } from "@/lib/actions/portal";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface PortalWorkoutsTabProps {
  gymSlug: string;
  workouts: {
    activePlan: {
      id: string;
      name: string;
      description?: string | null;
      difficultyLevel: string;
      entries: Array<{
        id: string;
        dayOfWeek: number;
        orderIndex: number;
        exerciseName: string;
        category: string;
        sets: number;
        reps: number;
        targetWeightKg?: number | null;
        restSeconds?: number | null;
        notes?: string | null;
      }>;
    } | null;
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

export function PortalWorkoutsTab({
  gymSlug,
  workouts,
}: PortalWorkoutsTabProps) {
  const [activeSubTab, setActiveSubTab] = React.useState<"routine" | "progress">(
    "routine"
  );
  const [isWeightModalOpen, setIsWeightModalOpen] = React.useState(false);
  const [weightInput, setWeightInput] = React.useState("");
  const [weightNotes, setWeightNotes] = React.useState("");
  const [isSubmittingWeight, setIsSubmittingWeight] = React.useState(false);
  const [weightError, setWeightError] = React.useState<string | null>(null);
  const [weightSuccess, setWeightSuccess] = React.useState<string | null>(null);

  const activePlan = workouts.activePlan;

  // Group workout plan entries by day of week
  const entriesByDay = React.useMemo(() => {
    if (!activePlan) return {};
    const map: Record<number, typeof activePlan.entries> = {};
    for (const entry of activePlan.entries) {
      if (!map[entry.dayOfWeek]) map[entry.dayOfWeek] = [];
      map[entry.dayOfWeek].push(entry);
    }
    return map;
  }, [activePlan]);

  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingWeight(true);
      setWeightError(null);
      setWeightSuccess(null);

      const formData = new FormData();
      formData.set("weightKg", weightInput);
      if (weightNotes) formData.set("notes", weightNotes);

      const res = await logWeightAction(gymSlug, formData);
      if (res.success) {
        setWeightSuccess(res.message || "Weight logged successfully!");
        setWeightInput("");
        setWeightNotes("");
        setTimeout(() => setIsWeightModalOpen(false), 1500);
      } else {
        setWeightError(res.error || "Failed to log weight.");
      }
    } catch {
      setWeightError("Network error while submitting weight.");
    } finally {
      setIsSubmittingWeight(false);
    }
  };

  const latestWeight = workouts.weightLogs[0]?.weightKg || null;
  const previousWeight = workouts.weightLogs[1]?.weightKg || null;
  const weightDelta =
    latestWeight && previousWeight ? latestWeight - previousWeight : null;

  return (
    <div className="space-y-6 pb-6">
      {/* Sub-navigation Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <Button
          size="sm"
          variant={activeSubTab === "routine" ? "default" : "outline"}
          onClick={() => setActiveSubTab("routine")}
          className="text-xs h-8 gap-1.5"
        >
          <Dumbbell className="h-3.5 w-3.5" />
          <span>My Routine</span>
        </Button>
        <Button
          size="sm"
          variant={activeSubTab === "progress" ? "default" : "outline"}
          onClick={() => setActiveSubTab("progress")}
          className="text-xs h-8 gap-1.5"
        >
          <Scale className="h-3.5 w-3.5" />
          <span>Fitness Progress</span>
        </Button>
      </div>

      {activeSubTab === "routine" ? (
        /* ================= 1. WORKOUT ROUTINE VIEW ================= */
        <div className="space-y-5">
          {activePlan ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">
                      {activePlan.name}
                    </h2>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {activePlan.difficultyLevel}
                    </Badge>
                  </div>
                  {activePlan.description && (
                    <p className="text-xs text-slate-500 mt-1">
                      {activePlan.description}
                    </p>
                  )}
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 self-start text-xs">
                  Assigned Routine
                </Badge>
              </div>

              {/* Grouped Day-by-Day Exercises */}
              <div className="mt-4 space-y-6">
                {[1, 2, 3, 4, 5, 6, 0].map((dayNum) => {
                  const dayEntries = entriesByDay[dayNum];
                  if (!dayEntries || dayEntries.length === 0) return null;

                  return (
                    <div key={dayNum} className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50/70 px-3 py-1.5 rounded-lg border border-indigo-100">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{DAY_NAMES[dayNum]}</span>
                        <span className="text-[10px] font-normal text-indigo-500">
                          ({dayEntries.length} exercises)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {dayEntries.map((entry) => (
                          <div
                            key={entry.id}
                            className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 hover:border-slate-300 transition-all"
                          >
                            <div className="flex items-start justify-between">
                              <h4 className="text-xs font-bold text-slate-900">
                                {entry.exerciseName}
                              </h4>
                              <Badge
                                variant="outline"
                                className="text-[10px] text-slate-500 py-0"
                              >
                                {entry.category}
                              </Badge>
                            </div>

                            <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-700">
                              <div className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                {entry.sets} sets × {entry.reps} reps
                              </div>
                              {entry.targetWeightKg && (
                                <div className="text-slate-600">
                                  {entry.targetWeightKg} kg
                                </div>
                              )}
                              {entry.restSeconds && (
                                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                  <Clock className="h-3 w-3" />
                                  <span>{entry.restSeconds}s rest</span>
                                </div>
                              )}
                            </div>

                            {entry.notes && (
                              <p className="mt-2 text-[11px] text-slate-500 italic border-t border-slate-200/60 pt-1.5">
                                💡 {entry.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <Dumbbell className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-2 text-sm font-bold text-slate-800">
                No Workout Plan Assigned
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Your gym trainer has not assigned an active routine to your profile yet. Speak with your instructor on your next visit to create a personalized training split!
              </p>
            </div>
          )}
        </div>
      ) : (
        /* ================= 2. FITNESS PROGRESS VIEW ================= */
        <div className="space-y-5">
          {/* Top KPI Cards & Log Weight Trigger */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Current Weight
                </span>
                <div className="mt-1 text-2xl font-bold text-slate-900">
                  {latestWeight ? `${latestWeight} kg` : "Not recorded"}
                </div>
                {weightDelta !== null && (
                  <span
                    className={`text-[11px] font-medium flex items-center gap-1 ${
                      weightDelta <= 0 ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    <TrendingDown className="h-3 w-3" />
                    <span>
                      {weightDelta > 0 ? `+${weightDelta.toFixed(1)}` : weightDelta.toFixed(1)} kg vs last log
                    </span>
                  </span>
                )}
              </div>

              <Button
                size="sm"
                onClick={() => setIsWeightModalOpen(true)}
                className="h-8 text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Log Weight</span>
              </Button>

              <Dialog open={isWeightModalOpen} onOpenChange={setIsWeightModalOpen}>
                <DialogContent className="max-w-xs p-5">
                  <DialogHeader>
                    <DialogTitle className="text-sm">Log Today&apos;s Weight</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleLogWeight} className="space-y-3 mt-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Weight in Kilograms (kg)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 74.5"
                        value={weightInput}
                        onChange={(e) => setWeightInput(e.target.value)}
                        required
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Notes (optional)</Label>
                      <Input
                        type="text"
                        placeholder="e.g. Morning fasted weigh-in"
                        value={weightNotes}
                        onChange={(e) => setWeightNotes(e.target.value)}
                        className="text-xs"
                      />
                    </div>

                    {weightError && (
                      <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2 rounded">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{weightError}</span>
                      </div>
                    )}
                    {weightSuccess && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 p-2 rounded">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{weightSuccess}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmittingWeight}
                      className="w-full text-xs h-8"
                    >
                      {isSubmittingWeight ? "Saving..." : "Save Weight"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Height & Body Stats
              </span>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {workouts.profile?.heightCm
                  ? `${workouts.profile.heightCm} cm`
                  : "—"}
              </div>
              <span className="text-[11px] text-slate-500">
                {workouts.measurements.length} tape measurements logged
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Primary Goal
              </span>
              <div className="mt-1 text-sm font-bold text-slate-900 truncate">
                {workouts.profile?.fitnessGoals || "General Fitness"}
              </div>
              <span className="text-[11px] text-slate-500 truncate block">
                {workouts.profile?.fitnessNotes || "Keep consistent!"}
              </span>
            </div>
          </div>

          {/* Weight Logs Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Scale className="h-4 w-4 text-indigo-600" />
              <span>Weight History</span>
            </h3>

            {workouts.weightLogs.length > 0 ? (
              <div className="mt-3 divide-y divide-slate-100">
                {workouts.weightLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between py-2.5"
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-900">
                        {new Date(log.logDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {log.notes && (
                        <p className="text-[11px] text-slate-500">{log.notes}</p>
                      )}
                    </div>
                    <span className="font-mono text-xs font-bold text-indigo-600">
                      {log.weightKg.toFixed(1)} kg
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                No weight logs yet. Click &quot;Log Weight&quot; above to begin tracking!
              </div>
            )}
          </div>

          {/* Measurements Table */}
          {workouts.measurements.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Ruler className="h-4 w-4 text-indigo-600" />
                <span>Body Measurements</span>
              </h3>
              <div className="mt-3 divide-y divide-slate-100">
                {workouts.measurements.map((m) => (
                  <div key={m.id} className="py-2.5 space-y-1">
                    <span className="text-xs font-semibold text-slate-800">
                      {new Date(m.measureDate).toLocaleDateString()}
                    </span>
                    <div className="flex flex-wrap gap-3 text-[11px] text-slate-600 font-mono">
                      {m.chestCm && <span>Chest: {m.chestCm}cm</span>}
                      {m.waistCm && <span>Waist: {m.waistCm}cm</span>}
                      {m.hipsCm && <span>Hips: {m.hipsCm}cm</span>}
                      {m.bicepsCm && <span>Biceps: {m.bicepsCm}cm</span>}
                      {m.bodyFatPct && <span>Body Fat: {m.bodyFatPct}%</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
