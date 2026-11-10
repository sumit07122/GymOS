/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useActionState, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle, Plus, Trash2 } from "lucide-react";
import { createWorkoutPlanAction, WorkoutActionState } from "@/lib/actions/workout";
import { Exercise } from "@prisma/client";

interface WorkoutPlanModalProps {
  open: boolean;
  exercises: Exercise[];
  gymId: string;
  gymSlug: string;
  onClose: () => void;
}

interface DraftEntry {
  exerciseId: string;
  sets: number;
  reps: number;
  restSecs: number;
}

function WorkoutPlanInner({
  exercises,
  gymId,
  gymSlug,
  onClose,
}: Omit<WorkoutPlanModalProps, "open">) {
  const [state, formAction, isPending] = useActionState<WorkoutActionState | null, FormData>(
    createWorkoutPlanAction,
    null
  );

  const [entries, setEntries] = useState<DraftEntry[]>(
    exercises[0]
      ? [{ exerciseId: exercises[0].id, sets: 3, reps: 10, restSecs: 60 }]
      : []
  );

  const addEntry = () => {
    if (exercises[0]) {
      setEntries([
        ...entries,
        { exerciseId: exercises[0].id, sets: 3, reps: 10, restSecs: 60 },
      ]);
    }
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof DraftEntry, val: string | number) => {
    const next = [...entries];
    (next[index] as any)[field] = val;
    setEntries(next);
  };

  if (state?.success) {
    onClose();
    return null;
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="gymId" value={gymId} />
      <input type="hidden" name="gymSlug" value={gymSlug} />
      <input type="hidden" name="entries" value={JSON.stringify(entries)} />

      {state?.error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-xs text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="plan-name" className="text-xs">Routine Name *</Label>
          <Input
            id="plan-name"
            name="name"
            placeholder="e.g. Upper Body Hypertrophy, 3-Day Beginner Split"
            className="text-sm"
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="plan-desc" className="text-xs">Description</Label>
          <Textarea
            id="plan-desc"
            name="description"
            placeholder="Training split schedule, intended fitness level, progression goals…"
            className="text-sm h-16 resize-none"
          />
        </div>

        {/* Exercises in Routine */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-slate-700">
              Exercises in Routine ({entries.length})
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addEntry}
              className="h-6 text-[11px] px-2"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Movement
            </Button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {entries.map((entry, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 rounded-md bg-slate-50 border border-slate-200 text-xs"
              >
                <div className="flex-1">
                  <Select
                    value={entry.exerciseId}
                    onValueChange={(val) => updateEntry(idx, "exerciseId", val)}
                  >
                    <SelectTrigger className="h-7 text-xs bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      {exercises.map((ex) => (
                        <SelectItem key={ex.id} value={ex.id}>
                          {ex.name} ({ex.muscleGroup || "General"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-16">
                  <Input
                    type="number"
                    min="1"
                    value={entry.sets}
                    onChange={(e) => updateEntry(idx, "sets", Number(e.target.value))}
                    className="h-7 text-xs text-center"
                    placeholder="Sets"
                    title="Sets"
                  />
                </div>

                <div className="w-16">
                  <Input
                    type="number"
                    min="1"
                    value={entry.reps}
                    onChange={(e) => updateEntry(idx, "reps", Number(e.target.value))}
                    className="h-7 text-xs text-center"
                    placeholder="Reps"
                    title="Reps"
                  />
                </div>

                <div className="w-20">
                  <Input
                    type="number"
                    min="0"
                    step="5"
                    value={entry.restSecs}
                    onChange={(e) => updateEntry(idx, "restSecs", Number(e.target.value))}
                    className="h-7 text-xs text-center"
                    placeholder="Rest(s)"
                    title="Rest seconds"
                  />
                </div>

                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                  onClick={() => removeEntry(idx)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} className="text-xs h-8">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending || entries.length === 0}
          className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700"
        >
          {isPending && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
          Save Workout Plan
        </Button>
      </DialogFooter>
    </form>
  );
}

export function WorkoutPlanModal({
  open,
  exercises,
  gymId,
  gymSlug,
  onClose,
}: WorkoutPlanModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">Build Custom Workout Plan</DialogTitle>
        </DialogHeader>
        <WorkoutPlanInner
          key={open ? "open" : "closed"}
          exercises={exercises}
          gymId={gymId}
          gymSlug={gymSlug}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
