"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Dumbbell,
  Calendar,
  Clock,
  TrendingUp,
} from "lucide-react";

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
  workouts,
}: PortalWorkoutsTabProps) {
  const [selectedDay, setSelectedDay] = React.useState<number | "all">("all");
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

  const activeDays = Object.keys(entriesByDay).map(Number);

  return (
    <div className="space-y-4 pb-6">
      {/* 1. Header Banner & Plan Tier */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#E2E8F0] pb-4 gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E4F2EB] text-[#0B6B4F]">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#0F172A]">
                  {activePlan ? activePlan.name : "Workout Plans"}
                </h2>
                {activePlan && (
                  <Badge variant="outline" className="text-[10px] uppercase border-[#E2E8F0] text-[#64748B]">
                    {activePlan.difficultyLevel}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                {activePlan?.description || "Structured daily routine customized by your gym trainers."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/member/progress"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-[#0F172A] hover:border-[#0B6B4F] transition-colors"
            >
              <TrendingUp className="h-3.5 w-3.5 text-[#0B6B4F]" />
              <span>View Progress & Weight</span>
            </Link>
          </div>
        </div>

        {/* Day Selector Pills */}
        {activePlan && activeDays.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedDay("all")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                selectedDay === "all"
                  ? "bg-[#0B6B4F] text-white"
                  : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:text-[#0F172A]"
              }`}
            >
              All Days ({activePlan.entries.length})
            </button>
            {activeDays.map((dayNum) => (
              <button
                key={dayNum}
                type="button"
                onClick={() => setSelectedDay(dayNum)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                  selectedDay === dayNum
                    ? "bg-[#0B6B4F] text-white"
                    : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:text-[#0F172A]"
                }`}
              >
                {DAY_NAMES[dayNum]} ({entriesByDay[dayNum]?.length || 0})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Grouped Exercise Cards */}
      {activePlan ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 0].map((dayNum) => {
            if (selectedDay !== "all" && selectedDay !== dayNum) return null;
            const dayEntries = entriesByDay[dayNum];
            if (!dayEntries || dayEntries.length === 0) return null;

            return (
              <div key={dayNum} className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B6B4F] bg-[#E4F2EB] px-3.5 py-1.5 rounded-lg border border-[#A7F3D0]">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{DAY_NAMES[dayNum]}</span>
                  <span className="text-[10px] font-normal text-[#064E3B]">
                    • {dayEntries.length} exercises
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dayEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs hover:border-[#0B6B4F] transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="text-xs font-bold text-[#0F172A]">
                          {entry.exerciseName}
                        </h4>
                        <span className="inline-flex items-center rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-semibold text-[#64748B] border border-[#E2E8F0]">
                          {entry.category}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-3 text-xs text-[#0F172A]">
                        <div className="font-semibold text-[#0B6B4F] bg-[#E4F2EB] px-2.5 py-1 rounded-md border border-[#A7F3D0]">
                          {entry.sets} sets × {entry.reps} reps
                        </div>
                        {entry.targetWeightKg && (
                          <div className="text-[#475569] font-medium text-xs">
                            🎯 {entry.targetWeightKg} kg
                          </div>
                        )}
                        {entry.restSeconds && (
                          <div className="flex items-center gap-1 text-[11px] text-[#64748B]">
                            <Clock className="h-3 w-3 text-[#0B6B4F]" />
                            <span>{entry.restSeconds}s rest</span>
                          </div>
                        )}
                      </div>

                      {entry.notes && (
                        <p className="mt-2.5 text-[11px] text-[#64748B] italic border-t border-[#F1F5F9] pt-2">
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
      ) : (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 text-center shadow-xs">
          <Dumbbell className="mx-auto h-10 w-10 text-[#94A3B8]" />
          <h3 className="mt-2 text-sm font-bold text-[#0F172A]">
            No Workout Plan Assigned
          </h3>
          <p className="mt-1 text-xs text-[#64748B] max-w-sm mx-auto">
            Your gym trainer has not assigned an active routine to your profile yet. Speak with your instructor on your next visit to create a personalized training split!
          </p>
        </div>
      )}
    </div>
  );
}
