"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Dumbbell, ClipboardList, TrendingUp } from "lucide-react";
import { WorkoutOverviewCards } from "./workout-overview-cards";
import { ExerciseLibraryTable } from "./exercise-library-table";
import { WorkoutPlanList } from "./workout-plan-list";
import { ExerciseModal } from "./exercise-modal";
import { WorkoutPlanModal } from "./workout-plan-modal";
import { AssignPlanModal } from "./assign-plan-modal";
import { MemberFitnessModal } from "./member-fitness-modal";
import { PlanWithEntries } from "@/lib/services/workout.service";
import { Exercise } from "@prisma/client";

interface WorkoutsHubProps {
  exercises: Exercise[];
  plans: PlanWithEntries[];
  members: Array<{ id: string; firstName: string; lastName: string; memberCode: string }>;
  activeAssignmentsCount: number;
  totalLogsCount: number;
  gymId: string;
  gymSlug: string;
  canManage: boolean;
}

export function WorkoutsHub({
  exercises,
  plans,
  members,
  activeAssignmentsCount,
  totalLogsCount,
  gymId,
  gymSlug,
  canManage,
}: WorkoutsHubProps) {
  const [activeTab, setActiveTab] = useState<"plans" | "library">("plans");

  // Modals
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedPlanToAssign, setSelectedPlanToAssign] = useState<PlanWithEntries | null>(null);
  const [fitnessModalOpen, setFitnessModalOpen] = useState(false);

  const handleAssign = (plan: PlanWithEntries) => {
    setSelectedPlanToAssign(plan);
    setAssignModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Workouts & Fitness</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain custom training routines, exercise movements, and track member body progress.
          </p>
        </div>
        {canManage && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => setFitnessModalOpen(true)}
            >
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              Log Member Progress
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => setExerciseModalOpen(true)}
            >
              <Dumbbell className="h-3.5 w-3.5 mr-1" />
              New Movement
            </Button>
            <Button
              size="sm"
              className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setPlanModalOpen(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Build Routine
            </Button>
          </div>
        )}
      </div>

      {/* Overview Cards */}
      <WorkoutOverviewCards
        totalExercises={exercises.length}
        totalPlans={plans.length}
        activeAssignments={activeAssignmentsCount}
        totalLogs={totalLogsCount}
      />

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <Button
          variant={activeTab === "plans" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("plans")}
          className={`text-xs gap-1.5 ${
            activeTab === "plans" ? "bg-slate-900 text-white" : "text-slate-600"
          }`}
        >
          <ClipboardList className="h-3.5 w-3.5" />
          Training Routines ({plans.length})
        </Button>

        <Button
          variant={activeTab === "library" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("library")}
          className={`text-xs gap-1.5 ${
            activeTab === "library" ? "bg-slate-900 text-white" : "text-slate-600"
          }`}
        >
          <Dumbbell className="h-3.5 w-3.5" />
          Exercise Library ({exercises.length})
        </Button>
      </div>

      {/* Tab content */}
      {activeTab === "plans" && (
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Configured Workout Routines
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <WorkoutPlanList
              plans={plans}
              onAssign={handleAssign}
              canManage={canManage}
            />
          </CardContent>
        </Card>
      )}

      {activeTab === "library" && (
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Exercise Library
            </CardTitle>
            {canManage && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7"
                onClick={() => setExerciseModalOpen(true)}
              >
                + Add Movement
              </Button>
            )}
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ExerciseLibraryTable exercises={exercises} />
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <ExerciseModal
        open={exerciseModalOpen}
        gymId={gymId}
        gymSlug={gymSlug}
        onClose={() => setExerciseModalOpen(false)}
      />

      <WorkoutPlanModal
        open={planModalOpen}
        exercises={exercises}
        gymId={gymId}
        gymSlug={gymSlug}
        onClose={() => setPlanModalOpen(false)}
      />

      <AssignPlanModal
        open={assignModalOpen}
        plan={selectedPlanToAssign}
        members={members}
        gymId={gymId}
        gymSlug={gymSlug}
        onClose={() => setAssignModalOpen(false)}
      />

      <MemberFitnessModal
        open={fitnessModalOpen}
        members={members}
        gymId={gymId}
        gymSlug={gymSlug}
        onClose={() => setFitnessModalOpen(false)}
      />
    </div>
  );
}
