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
import { Loader2, AlertCircle, Scale, Ruler, Target } from "lucide-react";
import {
  updateFitnessProfileAction,
  logWeightAction,
  logMeasurementAction,
  WorkoutActionState,
} from "@/lib/actions/workout";

interface MemberFitnessModalProps {
  open: boolean;
  members: Array<{ id: string; firstName: string; lastName: string; memberCode: string }>;
  gymId: string;
  gymSlug: string;
  onClose: () => void;
}

function MemberFitnessInner({
  members,
  gymId,
  gymSlug,
  onClose,
}: Omit<MemberFitnessModalProps, "open">) {
  const [activeForm, setActiveForm] = useState<"weight" | "measurements" | "profile">("weight");
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id ?? "");

  // Weight Action State
  const [weightState, weightAction, isWeightPending] = useActionState<WorkoutActionState | null, FormData>(
    logWeightAction,
    null
  );

  // Measurement Action State
  const [measureState, measureAction, isMeasurePending] = useActionState<WorkoutActionState | null, FormData>(
    logMeasurementAction,
    null
  );

  // Profile Action State
  const [profileState, profileAction, isProfilePending] = useActionState<WorkoutActionState | null, FormData>(
    updateFitnessProfileAction,
    null
  );

  return (
    <div className="space-y-4">
      {/* Member selector */}
      <div className="space-y-1">
        <Label className="text-xs font-semibold text-slate-700">Select Member</Label>
        <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Select member" />
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

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-2">
        <Button
          type="button"
          size="sm"
          variant={activeForm === "weight" ? "default" : "ghost"}
          className={`h-7 text-xs gap-1 ${
            activeForm === "weight" ? "bg-slate-900 text-white" : "text-slate-600"
          }`}
          onClick={() => setActiveForm("weight")}
        >
          <Scale className="h-3 w-3" />
          Log Weight
        </Button>
        <Button
          type="button"
          size="sm"
          variant={activeForm === "measurements" ? "default" : "ghost"}
          className={`h-7 text-xs gap-1 ${
            activeForm === "measurements" ? "bg-slate-900 text-white" : "text-slate-600"
          }`}
          onClick={() => setActiveForm("measurements")}
        >
          <Ruler className="h-3 w-3" />
          Measurements
        </Button>
        <Button
          type="button"
          size="sm"
          variant={activeForm === "profile" ? "default" : "ghost"}
          className={`h-7 text-xs gap-1 ${
            activeForm === "profile" ? "bg-slate-900 text-white" : "text-slate-600"
          }`}
          onClick={() => setActiveForm("profile")}
        >
          <Target className="h-3 w-3" />
          Fitness Goals
        </Button>
      </div>

      {/* 1. Weight Form */}
      {activeForm === "weight" && (
        <form action={weightAction} className="space-y-3">
          <input type="hidden" name="gymId" value={gymId} />
          <input type="hidden" name="gymSlug" value={gymSlug} />
          <input type="hidden" name="memberId" value={selectedMemberId} />

          {weightState?.error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-xs text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{weightState.error}</span>
            </div>
          )}
          {weightState?.success && (
            <p className="text-xs text-emerald-600 font-medium">✓ {weightState.message}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="weight-kg" className="text-xs">Weight (kg) *</Label>
              <Input
                id="weight-kg"
                name="weightKg"
                type="number"
                step="0.1"
                min="20"
                max="400"
                placeholder="75.5"
                className="text-sm"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="weight-date" className="text-xs">Log Date</Label>
              <Input
                id="weight-date"
                name="logDate"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="weight-notes" className="text-xs">Notes</Label>
            <Input
              id="weight-notes"
              name="notes"
              placeholder="e.g. Fasted morning weigh-in"
              className="text-sm"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs h-8">
              Close
            </Button>
            <Button type="submit" disabled={isWeightPending} className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700">
              {isWeightPending && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
              Save Weight
            </Button>
          </DialogFooter>
        </form>
      )}

      {/* 2. Measurements Form */}
      {activeForm === "measurements" && (
        <form action={measureAction} className="space-y-3">
          <input type="hidden" name="gymId" value={gymId} />
          <input type="hidden" name="gymSlug" value={gymSlug} />
          <input type="hidden" name="memberId" value={selectedMemberId} />

          {measureState?.error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-xs text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{measureState.error}</span>
            </div>
          )}
          {measureState?.success && (
            <p className="text-xs text-emerald-600 font-medium">✓ {measureState.message}</p>
          )}

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label htmlFor="m-chest" className="text-xs">Chest (cm)</Label>
              <Input id="m-chest" name="chestCm" type="number" step="0.5" placeholder="100" className="text-xs" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="m-waist" className="text-xs">Waist (cm)</Label>
              <Input id="m-waist" name="waistCm" type="number" step="0.5" placeholder="82" className="text-xs" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="m-hips" className="text-xs">Hips (cm)</Label>
              <Input id="m-hips" name="hipsCm" type="number" step="0.5" placeholder="95" className="text-xs" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="m-arm" className="text-xs">Arm (cm)</Label>
              <Input id="m-arm" name="armCm" type="number" step="0.5" placeholder="38" className="text-xs" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="m-thigh" className="text-xs">Thigh (cm)</Label>
              <Input id="m-thigh" name="thighCm" type="number" step="0.5" placeholder="58" className="text-xs" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="m-date" className="text-xs">Date</Label>
              <Input
                id="m-date"
                name="measureDate"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs h-8">
              Close
            </Button>
            <Button type="submit" disabled={isMeasurePending} className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700">
              {isMeasurePending && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
              Save Measurements
            </Button>
          </DialogFooter>
        </form>
      )}

      {/* 3. Profile Form */}
      {activeForm === "profile" && (
        <form action={profileAction} className="space-y-3">
          <input type="hidden" name="gymId" value={gymId} />
          <input type="hidden" name="gymSlug" value={gymSlug} />
          <input type="hidden" name="memberId" value={selectedMemberId} />

          {profileState?.error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-xs text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{profileState.error}</span>
            </div>
          )}
          {profileState?.success && (
            <p className="text-xs text-emerald-600 font-medium">✓ {profileState.message}</p>
          )}

          <div className="space-y-1">
            <Label htmlFor="p-height" className="text-xs">Height (cm)</Label>
            <Input id="p-height" name="heightCm" type="number" step="0.5" placeholder="178.5" className="text-sm" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="p-goals" className="text-xs">Fitness Goals</Label>
            <Textarea
              id="p-goals"
              name="fitnessGoals"
              placeholder="e.g. Lose 5kg fat, run 5k under 25 mins, bench 100kg…"
              className="text-sm h-16 resize-none"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="p-notes" className="text-xs">Trainer Notes</Label>
            <Textarea
              id="p-notes"
              name="fitnessNotes"
              placeholder="Operational coaching notes, previous injuries, movement limitations…"
              className="text-sm h-16 resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs h-8">
              Close
            </Button>
            <Button type="submit" disabled={isProfilePending} className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700">
              {isProfilePending && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
              Update Goals
            </Button>
          </DialogFooter>
        </form>
      )}
    </div>
  );
}

export function MemberFitnessModal({
  open,
  members,
  gymId,
  gymSlug,
  onClose,
}: MemberFitnessModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Member Fitness Tracking</DialogTitle>
        </DialogHeader>
        <MemberFitnessInner
          key={open ? "open" : "closed"}
          members={members}
          gymId={gymId}
          gymSlug={gymSlug}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
