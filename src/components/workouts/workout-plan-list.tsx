"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Dumbbell } from "lucide-react";
import { PlanWithEntries } from "@/lib/services/workout.service";

interface WorkoutPlanListProps {
  plans: PlanWithEntries[];
  onAssign: (plan: PlanWithEntries) => void;
  canManage: boolean;
}

export function WorkoutPlanList({ plans, onAssign, canManage }: WorkoutPlanListProps) {
  if (plans.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-xs">
        No workout routines created yet. Click &quot;Build Routine&quot; to design your first training plan.
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      {plans.map((plan) => (
        <Card key={plan.id} className="border border-slate-200 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">{plan.name}</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                  {plan.description || "No description provided."}
                </p>
              </div>
              {canManage && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-2 shrink-0"
                  onClick={() => onAssign(plan)}
                >
                  <UserCheck className="h-3 w-3 mr-1" />
                  Assign
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-1">
            <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
              <Dumbbell className="h-3.5 w-3.5 text-indigo-500" />
              <span>Routine ({plan.entries.length} exercises)</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {plan.entries.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between py-1 px-2 rounded bg-slate-50 text-xs border border-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 text-[10px]">{idx + 1}.</span>
                    <span className="font-medium text-slate-700">{entry.exercise.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    {entry.sets && <span>{entry.sets} sets</span>}
                    {entry.reps && <span>× {entry.reps} reps</span>}
                    {entry.durationSecs && <span>({entry.durationSecs}s)</span>}
                    {entry.restSecs && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                        {entry.restSecs}s rest
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

