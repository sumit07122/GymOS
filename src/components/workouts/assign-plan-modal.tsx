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
import { assignWorkoutPlanAction, WorkoutActionState } from "@/lib/actions/workout";
import { PlanWithEntries } from "@/lib/services/workout.service";

interface AssignPlanModalProps {
  open: boolean;
  plan: PlanWithEntries | null;
  members: Array<{ id: string; firstName: string; lastName: string; memberCode: string }>;
  gymId: string;
  gymSlug: string;
  onClose: () => void;
}

function AssignPlanInner({
  plan,
  members,
  gymId,
  gymSlug,
  onClose,
}: {
  plan: PlanWithEntries | null;
  members: Array<{ id: string; firstName: string; lastName: string; memberCode: string }>;
  gymId: string;
  gymSlug: string;
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState<WorkoutActionState | null, FormData>(
    assignWorkoutPlanAction,
    null
  );

  const [memberId, setMemberId] = useState("");

  if (state?.success) {
    onClose();
    return null;
  }

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="gymId" value={gymId} />
      <input type="hidden" name="gymSlug" value={gymSlug} />
      <input type="hidden" name="planId" value={plan?.id ?? ""} />
      <input type="hidden" name="memberId" value={memberId} />

      {state?.error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-xs text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {plan && (
        <div className="rounded-md bg-slate-50 p-3 space-y-1 border border-slate-100">
          <p className="text-sm font-semibold text-slate-800">{plan.name}</p>
          <p className="text-xs text-slate-500">
            {plan.entries.length} exercises configured
          </p>
        </div>
      )}

      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Select Member *</Label>
          <Select value={memberId} onValueChange={setMemberId}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Search member" />
            </SelectTrigger>
            <SelectContent className="max-h-56">
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.firstName} {m.lastName} ({m.memberCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="assign-start" className="text-xs">Start Date</Label>
            <Input
              id="assign-start"
              name="startDate"
              type="date"
              defaultValue={todayStr}
              className="text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="assign-end" className="text-xs">Target End Date</Label>
            <Input
              id="assign-end"
              name="endDate"
              type="date"
              className="text-xs"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="assign-notes" className="text-xs">Trainer Notes for Member</Label>
          <Textarea
            id="assign-notes"
            name="notes"
            placeholder="Focus on progressive overload, keep RPE under 8…"
            className="text-sm h-16 resize-none"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} className="text-xs h-8">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending || !memberId}
          className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700"
        >
          {isPending && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
          Assign to Member
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AssignPlanModal({
  open,
  plan,
  members,
  gymId,
  gymSlug,
  onClose,
}: AssignPlanModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Assign Workout Routine</DialogTitle>
        </DialogHeader>
        <AssignPlanInner
          key={plan?.id ?? "none"}
          plan={plan}
          members={members}
          gymId={gymId}
          gymSlug={gymSlug}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
