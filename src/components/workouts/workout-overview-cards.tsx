"use client";

import { Dumbbell, ClipboardList, Users, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/design-system/stat-card";

interface WorkoutOverviewCardsProps {
  totalExercises: number;
  totalPlans: number;
  activeAssignments: number;
  totalLogs: number;
}

export function WorkoutOverviewCards({
  totalExercises,
  totalPlans,
  activeAssignments,
  totalLogs,
}: WorkoutOverviewCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      <StatCard
        label="Exercise Library"
        value={totalExercises}
        icon={Dumbbell}
        subtext="Catalogued movements"
      />
      <StatCard
        label="Workout Plans"
        value={totalPlans}
        icon={ClipboardList}
        subtext="Custom training templates"
      />
      <StatCard
        label="Active Assignments"
        value={activeAssignments}
        icon={Users}
        subtext="Members on active routine"
      />
      <StatCard
        label="Body Metric Logs"
        value={totalLogs}
        icon={TrendingUp}
        subtext="Weight & progression logs"
      />
    </div>
  );
}
