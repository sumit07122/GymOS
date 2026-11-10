"use client";

import { useActionState } from "react";
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
import { Loader2, AlertCircle } from "lucide-react";
import { createClassAction, updateClassAction, ClassActionState } from "@/lib/actions/class";
import { Class } from "@prisma/client";

interface ClassFormModalProps {
  open: boolean;
  classDef: Class | null;
  gymId: string;
  gymSlug: string;
  onClose: () => void;
}

function ClassFormInner({
  classDef,
  gymId,
  gymSlug,
  onClose,
}: {
  classDef: Class | null;
  gymId: string;
  gymSlug: string;
  onClose: () => void;
}) {
  const isEdit = !!classDef;
  const action = isEdit ? updateClassAction : createClassAction;

  const [state, formAction, isPending] = useActionState<ClassActionState | null, FormData>(
    action,
    null
  );

  if (state?.success) {
    onClose();
    return null;
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="gymId" value={gymId} />
      <input type="hidden" name="gymSlug" value={gymSlug} />
      {isEdit && <input type="hidden" name="classId" value={classDef.id} />}

      {state?.error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-xs text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="class-name" className="text-xs">Class Name *</Label>
          <Input
            id="class-name"
            name="name"
            defaultValue={classDef?.name ?? ""}
            placeholder="e.g. HIIT Power Blast, Morning Yoga"
            className="text-sm"
            required
          />
          {state?.fieldErrors?.name && (
            <p className="text-xs text-red-500">{state.fieldErrors.name}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="class-duration" className="text-xs">Duration (minutes) *</Label>
            <Input
              id="class-duration"
              name="durationMinutes"
              type="number"
              min={15}
              max={240}
              defaultValue={classDef?.durationMinutes ?? 60}
              className="text-sm"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="class-capacity" className="text-xs">Default Capacity *</Label>
            <Input
              id="class-capacity"
              name="defaultCapacity"
              type="number"
              min={1}
              max={200}
              defaultValue={classDef?.defaultCapacity ?? 20}
              className="text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="class-desc" className="text-xs">Description</Label>
          <Textarea
            id="class-desc"
            name="description"
            defaultValue={classDef?.description ?? ""}
            placeholder="Brief overview of class format, target audience, and equipment needed…"
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
          {isEdit ? "Save Changes" : "Create Class"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ClassFormModal({
  open,
  classDef,
  gymId,
  gymSlug,
  onClose,
}: ClassFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            {classDef ? "Edit Class Definition" : "New Class Definition"}
          </DialogTitle>
        </DialogHeader>
        <ClassFormInner
          key={classDef?.id ?? "new"}
          classDef={classDef}
          gymId={gymId}
          gymSlug={gymSlug}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}

