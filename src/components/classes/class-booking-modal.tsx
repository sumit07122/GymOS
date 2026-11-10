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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle, Users } from "lucide-react";
import { bookClassAction, ClassActionState } from "@/lib/actions/class";
import { ScheduleWithDetails } from "@/lib/services/class.service";

interface ClassBookingModalProps {
  open: boolean;
  schedule: ScheduleWithDetails | null;
  members: Array<{ id: string; firstName: string; lastName: string; memberCode: string }>;
  gymId: string;
  gymSlug: string;
  onClose: () => void;
}

function ClassBookingInner({
  schedule,
  members,
  gymId,
  gymSlug,
  onClose,
}: {
  schedule: ScheduleWithDetails | null;
  members: Array<{ id: string; firstName: string; lastName: string; memberCode: string }>;
  gymId: string;
  gymSlug: string;
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState<ClassActionState | null, FormData>(
    bookClassAction,
    null
  );

  const [memberId, setMemberId] = useState("");

  if (state?.success) {
    onClose();
    return null;
  }

  const spotsLeft = schedule ? schedule.capacity - schedule.bookedCount : 0;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="gymId" value={gymId} />
      <input type="hidden" name="gymSlug" value={gymSlug} />
      <input type="hidden" name="scheduleId" value={schedule?.id ?? ""} />
      <input type="hidden" name="memberId" value={memberId} />

      {state?.error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-xs text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {schedule && (
        <div className="rounded-md bg-slate-50 p-3 space-y-1.5 border border-slate-100">
          <p className="text-sm font-semibold text-slate-800">{schedule.class.name}</p>
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>
              {new Date(schedule.startTime).toLocaleString("en-IN", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <div className="flex items-center gap-1 text-slate-700 font-medium">
              <Users className="h-3 w-3" />
              <span>{spotsLeft} spots available</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-1">
        <Label className="text-xs">Select Member *</Label>
        <Select value={memberId} onValueChange={setMemberId}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Search or select member" />
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

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} className="text-xs h-8">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending || !memberId || spotsLeft <= 0}
          className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700"
        >
          {isPending && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
          Confirm Booking
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ClassBookingModal({
  open,
  schedule,
  members,
  gymId,
  gymSlug,
  onClose,
}: ClassBookingModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Book Member into Session</DialogTitle>
        </DialogHeader>
        <ClassBookingInner
          key={schedule?.id ?? "none"}
          schedule={schedule}
          members={members}
          gymId={gymId}
          gymSlug={gymSlug}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}

