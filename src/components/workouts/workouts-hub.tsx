"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { PageHeader } from "@/components/design-system/page-header";

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
      <PageHeader
        title="Workouts & Fitness"
        description="Maintain custom training routines, exercise movements, and track member body progress."
        actions={
          canManage && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9 border-line bg-white hover:bg-canvas text-ink rounded-lg shadow-xs"
                onClick={() => setFitnessModalOpen(true)}
              >
                <TrendingUp className="h-3.5 w-3.5 text-pine mr-1" />
                <span>Log Member Progress</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9 border-line bg-white hover:bg-canvas text-ink rounded-lg shadow-xs"
                onClick={() => setExerciseModalOpen(true)}
              >
                <Dumbbell className="h-3.5 w-3.5 text-pine mr-1" />
                <span>New Movement</span>
              </Button>

              <Button
                size="sm"
                className="text-xs h-9 bg-pine hover:bg-pine/90 text-white rounded-lg shadow-xs transition"
                onClick={() => setPlanModalOpen(true)}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                <span>Build Routine</span>
              </Button>
            </div>
          )
        }
      />

      {/* Overview Cards */}
      <WorkoutOverviewCards
        totalExercises={exercises.length}
        totalPlans={plans.length}
        activeAssignments={activeAssignmentsCount}
        totalLogs={totalLogsCount}
      />

      {/* Tabs navigation */}
      <div className="flex border-b border-line text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("plans")}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "plans"
              ? "border-pine text-pine font-bold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          <span>Training Routines ({plans.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("library")}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "library"
              ? "border-pine text-pine font-bold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <Dumbbell className="h-4 w-4" />
          <span>Exercise Library ({exercises.length})</span>
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "plans" && (
        <div className="rounded-xl border border-line bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-line">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
              Configured Workout Routines
            </h3>
          </div>
          <div className="p-4">
            <WorkoutPlanList
              plans={plans}
              onAssign={handleAssign}
              canManage={canManage}
            />
          </div>
        </div>
      )}

      {activeTab === "library" && (
        <div className="rounded-xl border border-line bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-line flex flex-row items-center justify-between">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
              Exercise Library
            </h3>
            {canManage && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-8 border-line hover:bg-canvas rounded-lg"
                onClick={() => setExerciseModalOpen(true)}
              >
                + Add Movement
              </Button>
            )}
          </div>
          <div className="p-0">
            <ExerciseLibraryTable
              exercises={exercises}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <ExerciseModal
        open={exerciseModalOpen}
        onClose={() => setExerciseModalOpen(false)}
        gymId={gymId}
        gymSlug={gymSlug}
      />

      <WorkoutPlanModal
        open={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        exercises={exercises}
        gymId={gymId}
        gymSlug={gymSlug}
      />

      {selectedPlanToAssign && (
        <AssignPlanModal
          open={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedPlanToAssign(null);
          }}
          plan={selectedPlanToAssign}
          members={members}
          gymId={gymId}
          gymSlug={gymSlug}
        />
      )}

      <MemberFitnessModal
        open={fitnessModalOpen}
        onClose={() => setFitnessModalOpen(false)}
        members={members}
        gymId={gymId}
        gymSlug={gymSlug}
      />
    </div>
  );
}
