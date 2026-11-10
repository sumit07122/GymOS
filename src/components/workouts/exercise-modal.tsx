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
import { Loader2, AlertCircle } from "lucide-react";
import { createExerciseAction, WorkoutActionState } from "@/lib/actions/workout";
import { MUSCLE_GROUPS } from "@/lib/validations/workout";

interface ExerciseModalProps {
  open: boolean;
  gymId: string;
  gymSlug: string;
  onClose: () => void;
}

function ExerciseModalInner({
  gymId,
  gymSlug,
  onClose,
}: Omit<ExerciseModalProps, "open">) {
  const [state, formAction, isPending] = useActionState<WorkoutActionState | null, FormData>(
    createExerciseAction,
    null
  );

  const [muscleGroup, setMuscleGroup] = useState<string>("Chest");

  if (state?.success) {
    onClose();
    return null;
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="gymId" value={gymId} />
      <input type="hidden" name="gymSlug" value={gymSlug} />
      <input type="hidden" name="muscleGroup" value={muscleGroup} />

      {state?.error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-xs text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="ex-name" className="text-xs">Exercise Name *</Label>
          <Input
            id="ex-name"
            name="name"
            placeholder="e.g. Incline Dumbbell Curl"
            className="text-sm"
            required
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Primary Muscle Group</Label>
          <Select value={muscleGroup} onValueChange={setMuscleGroup}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Muscle group" />
            </SelectTrigger>
            <SelectContent>
              {MUSCLE_GROUPS.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="ex-desc" className="text-xs">Description / Form Cues</Label>
          <Textarea
            id="ex-desc"
            name="description"
            placeholder="Execution cues, setup tips, posture guidelines…"
            className="text-sm h-20 resize-none"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} className="text-xs h-8">
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700">
          {isPending && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
          Add to Library
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ExerciseModal({
  open,
  gymId,
  gymSlug,
  onClose,
}: ExerciseModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Add New Exercise</DialogTitle>
        </DialogHeader>
        <ExerciseModalInner
          key={open ? "open" : "closed"}
          gymId={gymId}
          gymSlug={gymSlug}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
