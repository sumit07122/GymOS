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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import { createScheduleAction, ClassActionState } from "@/lib/actions/class";
import { Class } from "@prisma/client";

interface ClassScheduleModalProps {
  open: boolean;
  preselectedClass: Class | null;
  classes: Class[];
  instructors: Array<{ id: string; name: string | null; email: string }>;
  gymId: string;
  gymSlug: string;
  onClose: () => void;
}

function ClassScheduleInner({
  preselectedClass,
  classes,
  instructors,
  gymId,
  gymSlug,
  onClose,
}: Omit<ClassScheduleModalProps, "open">) {
  const [state, formAction, isPending] = useActionState<ClassActionState | null, FormData>(
    createScheduleAction,
    null
  );

  const [classId, setClassId] = useState(preselectedClass?.id ?? classes[0]?.id ?? "");
  const [instructorUserId, setInstructorUserId] = useState("");

  const selectedClassDef = classes.find((c) => c.id === classId) ?? preselectedClass;

  if (state?.success) {
    onClose();
    return null;
  }

  // Default times: today at next hour
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);
  const startStr = now.toISOString().slice(0, 16);

  const end = new Date(now);
  end.setMinutes(end.getMinutes() + (selectedClassDef?.durationMinutes ?? 60));
  const endStr = end.toISOString().slice(0, 16);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="gymId" value={gymId} />
      <input type="hidden" name="gymSlug" value={gymSlug} />
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="instructorUserId" value={instructorUserId} />

      {state?.error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-xs text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="space-y-3">
        {/* Class Selection */}
        <div className="space-y-1">
          <Label className="text-xs">Class Format *</Label>
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} ({c.durationMinutes} min)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Instructor Selection */}
        <div className="space-y-1">
          <Label className="text-xs">Trainer / Instructor</Label>
          <Select value={instructorUserId} onValueChange={setInstructorUserId}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Assign trainer (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UNASSIGNED">No Trainer Assigned</SelectItem>
              {instructors.map((ins) => (
                <SelectItem key={ins.id} value={ins.id}>
                  {ins.name || ins.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Start & End Times */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="sched-start" className="text-xs">Start Time *</Label>
            <Input
              id="sched-start"
              name="startTime"
              type="datetime-local"
              defaultValue={startStr}
              className="text-xs"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sched-end" className="text-xs">End Time *</Label>
            <Input
              id="sched-end"
              name="endTime"
              type="datetime-local"
              defaultValue={endStr}
              className="text-xs"
              required
            />
          </div>
        </div>

        {/* Capacity and Room */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="sched-capacity" className="text-xs">Capacity *</Label>
            <Input
              id="sched-capacity"
              name="capacity"
              type="number"
              min={1}
              max={200}
              defaultValue={selectedClassDef?.defaultCapacity ?? 20}
              className="text-sm"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sched-room" className="text-xs">Room / Studio</Label>
            <Input
              id="sched-room"
              name="roomLocation"
              placeholder="e.g. Studio A, Turf Area"
              className="text-sm"
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} className="text-xs h-8">
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700">
          {isPending && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
          Schedule Session
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ClassScheduleModal({
  open,
  preselectedClass,
  classes,
  instructors,
  gymId,
  gymSlug,
  onClose,
}: ClassScheduleModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Schedule Class Session</DialogTitle>
        </DialogHeader>
        <ClassScheduleInner
          key={open ? "open" : "closed"}
          preselectedClass={preselectedClass}
          classes={classes}
          instructors={instructors}
          gymId={gymId}
          gymSlug={gymSlug}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}

