"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { createPlanAction, updatePlanAction, MembershipActionState } from "@/lib/actions/membership";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Sparkles } from "lucide-react";

export interface PlanData {
  id?: string;
  name: string;
  description?: string | null;
  durationDays: number;
  price: number | string;
  admissionFee: number | string;
  maxSessions?: number | null;
  benefits?: string | null;
  accessRestrictions?: string | null;
  isActive: boolean;
}

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  gymId: string;
  gymSlug: string;
  currency: string;
  plan?: PlanData | null;
}

const DURATION_PRESETS = [
  { label: "1 Month (30d)", days: 30 },
  { label: "3 Months (90d)", days: 90 },
  { label: "6 Months (180d)", days: 180 },
  { label: "1 Year (365d)", days: 365 },
];

export function PlanModal({
  isOpen,
  onClose,
  gymId,
  gymSlug,
  currency,
  plan,
}: PlanModalProps) {
  const isEditing = Boolean(plan?.id);
  const action = isEditing ? updatePlanAction : createPlanAction;
  const [state, formAction, isPending] = useActionState<MembershipActionState | null, FormData>(
    action,
    null
  );

  const [selectedDays, setSelectedDays] = React.useState<number>(
    plan?.durationDays ?? 30
  );

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            {isEditing ? `Edit Plan: ${plan?.name}` : "Create Membership Plan"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {isEditing
              ? "Modify plan parameters. Crucial: Existing active memberships maintain their original snapshot pricing."
              : "Define a subscription tier, duration, pricing structure, and access benefits for your members."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 pt-2">
          <input type="hidden" name="gymId" value={gymId} />
          <input type="hidden" name="gymSlug" value={gymSlug} />
          {isEditing && plan?.id && <input type="hidden" name="id" value={plan.id} />}

          {state?.error && (
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              {state.error}
            </div>
          )}

          {/* Plan Name */}
          <div className="space-y-1.5">
            <Label htmlFor="plan-name" className="text-xs font-semibold text-slate-700">
              Plan Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="plan-name"
              name="name"
              defaultValue={plan?.name ?? ""}
              placeholder="e.g. Annual Unlimited Black Card"
              required
              className="text-xs"
            />
            {state?.fieldErrors?.name && (
              <p className="text-[11px] text-rose-600">{state.fieldErrors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="plan-description" className="text-xs font-semibold text-slate-700">
              Description / Summary
            </Label>
            <Textarea
              id="plan-description"
              name="description"
              defaultValue={plan?.description ?? ""}
              placeholder="e.g. Full 24/7 facility access with complimentary towel service and guest passes."
              rows={2}
              className="text-xs resize-none"
            />
          </div>

          {/* Duration in Days & Presets */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Duration Period <span className="text-rose-500">*</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {DURATION_PRESETS.map((p) => (
                <button
                  key={p.days}
                  type="button"
                  onClick={() => setSelectedDays(p.days)}
                  className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition ${
                    selectedDays === p.days
                      ? "bg-emerald-50 border-emerald-600 text-emerald-800 font-semibold"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Input
                type="number"
                id="durationDays"
                name="durationDays"
                value={selectedDays}
                onChange={(e) => setSelectedDays(Number(e.target.value))}
                min={1}
                max={3650}
                required
                className="text-xs w-32"
              />
              <span className="text-xs text-slate-500">days total</span>
            </div>
            {state?.fieldErrors?.durationDays && (
              <p className="text-[11px] text-rose-600">{state.fieldErrors.durationDays}</p>
            )}
          </div>

          {/* Pricing & Admission Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-xs font-semibold text-slate-700">
                Plan Price ({currency}) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={plan?.price ? Number(plan.price) : 0}
                required
                className="text-xs"
              />
              {state?.fieldErrors?.price && (
                <p className="text-[11px] text-rose-600">{state.fieldErrors.price}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admissionFee" className="text-xs font-semibold text-slate-700">
                One-Time Registration / Admission Fee ({currency})
              </Label>
              <Input
                id="admissionFee"
                name="admissionFee"
                type="number"
                step="0.01"
                min="0"
                defaultValue={plan?.admissionFee ? Number(plan.admissionFee) : 0}
                className="text-xs"
              />
              {state?.fieldErrors?.admissionFee && (
                <p className="text-[11px] text-rose-600">{state.fieldErrors.admissionFee}</p>
              )}
            </div>
          </div>

          {/* Max Sessions */}
          <div className="space-y-1.5">
            <Label htmlFor="maxSessions" className="text-xs font-semibold text-slate-700">
              Max Sessions Limit (Optional)
            </Label>
            <Input
              id="maxSessions"
              name="maxSessions"
              type="number"
              min="1"
              defaultValue={plan?.maxSessions ?? ""}
              placeholder="Leave blank for unlimited access"
              className="text-xs"
            />
            <p className="text-[11px] text-slate-400">
              Leave empty for unlimited access. Set a count for class packs (e.g. 10 sessions).
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-1.5">
            <Label htmlFor="benefits" className="text-xs font-semibold text-slate-700">
              Included Benefits & Perks (One per line or comma-separated)
            </Label>
            <Textarea
              id="benefits"
              name="benefits"
              defaultValue={plan?.benefits ?? ""}
              placeholder="• Full Gym Floor Access&#10;• Steam & Sauna&#10;• 1 Free Personal Training Session&#10;• Locker Access"
              rows={3}
              className="text-xs"
            />
          </div>

          {/* Access Restrictions */}
          <div className="space-y-1.5">
            <Label htmlFor="accessRestrictions" className="text-xs font-semibold text-slate-700">
              Access Schedule Restrictions
            </Label>
            <Input
              id="accessRestrictions"
              name="accessRestrictions"
              defaultValue={plan?.accessRestrictions ?? ""}
              placeholder="e.g. Off-Peak Only (10:00 - 16:00), or 24/7 Unlimited"
              className="text-xs"
            />
          </div>

          {/* Active status */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              value="true"
              defaultChecked={plan?.isActive ?? true}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <Label htmlFor="isActive" className="text-xs text-slate-700 font-medium cursor-pointer">
              Active plan available for new member assignment
            </Label>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving Plan...</span>
                </>
              ) : isEditing ? (
                <span>Update Plan</span>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Plan</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
