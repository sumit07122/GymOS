"use client";

import * as React from "react";
import { useActionState, useEffect, useState } from "react";
import {
  assignMembershipAction,
  renewMembershipAction,
  extendMembershipAction,
  pauseMembershipAction,
  cancelMembershipAction,
  MembershipActionState,
} from "@/lib/actions/membership";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Pause,
  XCircle,
  Clock,
  RotateCw,
  PlusCircle,
} from "lucide-react";

// ==============================================================================
// 1. ASSIGN MEMBERSHIP MODAL
// ==============================================================================

export interface PlanOption {
  id: string;
  name: string;
  durationDays: number;
  price: number | string;
  admissionFee: number | string;
}

export interface MemberOption {
  id: string;
  fullName: string;
  memberCode: string;
}

interface AssignMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  gymId: string;
  gymSlug: string;
  currency: string;
  plans: PlanOption[];
  members?: MemberOption[];
  preselectedMemberId?: string;
  preselectedMemberName?: string;
}

export function AssignMembershipModal({
  isOpen,
  onClose,
  gymId,
  gymSlug,
  currency,
  plans,
  members = [],
  preselectedMemberId,
  preselectedMemberName,
}: AssignMembershipModalProps) {
  const [state, formAction, isPending] = useActionState<MembershipActionState | null, FormData>(
    assignMembershipAction,
    null
  );

  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    plans[0]?.id ?? ""
  );
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    preselectedMemberId ?? (members[0]?.id ?? "")
  );
  const [startDateStr, setStartDateStr] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  const effectiveMemberId = preselectedMemberId || selectedMemberId;

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const calculatedEndDate = React.useMemo(() => {
    if (!startDateStr || !selectedPlan) return null;
    const start = new Date(startDateStr);
    if (isNaN(start.getTime())) return null;
    const end = new Date(start.getTime() + selectedPlan.durationDays * 24 * 60 * 60 * 1000);
    return end.toLocaleDateString();
  }, [startDateStr, selectedPlan]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PlusCircle className="h-4 w-4 text-emerald-600" />
            Assign Membership Plan
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Enroll member into an active subscription plan with automated validity calculations.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 pt-2">
          <input type="hidden" name="gymId" value={gymId} />
          <input type="hidden" name="gymSlug" value={gymSlug} />
          <input type="hidden" name="memberId" value={effectiveMemberId} />
          <input type="hidden" name="planId" value={selectedPlanId} />

          {state?.error && (
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              {state.error}
            </div>
          )}

          {/* Member Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Member</Label>
            {preselectedMemberId ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900">
                {preselectedMemberName || "Selected Member"}
              </div>
            ) : (
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">
                      {m.fullName} ({m.memberCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Plan Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Membership Plan</Label>
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {p.name} — {currency} {Number(p.price).toFixed(2)} ({p.durationDays} days)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <Label htmlFor="assign-startDate" className="text-xs font-semibold text-slate-700">
              Contract Start Date
            </Label>
            <Input
              id="assign-startDate"
              name="startDate"
              type="date"
              value={startDateStr}
              onChange={(e) => setStartDateStr(e.target.value)}
              className="text-xs"
              required
            />
            {calculatedEndDate && (
              <p className="text-[11px] text-slate-500">
                Valid for {selectedPlan?.durationDays} days until:{" "}
                <span className="font-semibold text-slate-800">{calculatedEndDate}</span>
              </p>
            )}
          </div>

          {/* Price Snapshot & Custom Override */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="customPrice" className="text-xs font-semibold text-slate-700">
                Plan Fee ({currency})
              </Label>
              <Input
                id="customPrice"
                name="customPrice"
                type="number"
                step="0.01"
                min="0"
                defaultValue={selectedPlan ? Number(selectedPlan.price) : 0}
                className="text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customAdmissionFee" className="text-xs font-semibold text-slate-700">
                Admission Fee ({currency})
              </Label>
              <Input
                id="customAdmissionFee"
                name="customAdmissionFee"
                type="number"
                step="0.01"
                min="0"
                defaultValue={selectedPlan ? Number(selectedPlan.admissionFee) : 0}
                className="text-xs font-mono"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="assign-notes" className="text-xs font-semibold text-slate-700">
              Internal Notes / Special Instructions
            </Label>
            <Textarea
              id="assign-notes"
              name="notes"
              placeholder="e.g. Approved discount or special terms"
              rows={2}
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
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
              disabled={isPending || !selectedMemberId || !selectedPlanId}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Assigning...</span>
                </>
              ) : (
                <span>Confirm Assignment</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==============================================================================
// 2. RENEW MEMBERSHIP MODAL
// ==============================================================================

interface RenewMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  gymId: string;
  gymSlug: string;
  currency: string;
  membershipId: string;
  memberName: string;
  currentPlanName: string;
  currentEndDate: Date | string;
  isCurrentlyActive: boolean;
  plans: PlanOption[];
}

export function RenewMembershipModal({
  isOpen,
  onClose,
  gymId,
  gymSlug,
  currency,
  membershipId,
  memberName,
  currentPlanName,
  currentEndDate,
  isCurrentlyActive,
  plans,
}: RenewMembershipModalProps) {
  const [state, formAction, isPending] = useActionState<MembershipActionState | null, FormData>(
    renewMembershipAction,
    null
  );

  const matchingPlan = plans.find((p) => p.name === currentPlanName) || plans[0];
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    matchingPlan?.id ?? ""
  );

  const defaultStartDate = isCurrentlyActive
    ? new Date(currentEndDate).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  const [startDateStr, setStartDateStr] = useState<string>(defaultStartDate);

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || matchingPlan;

  const calculatedNewEndDate = React.useMemo(() => {
    if (!startDateStr || !selectedPlan) return null;
    const start = new Date(startDateStr);
    if (isNaN(start.getTime())) return null;
    const end = new Date(start.getTime() + selectedPlan.durationDays * 24 * 60 * 60 * 1000);
    return end.toLocaleDateString();
  }, [startDateStr, selectedPlan]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <RotateCw className="h-4 w-4 text-emerald-600" />
            Renew Membership
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Chain a renewal contract for <strong className="text-slate-700">{memberName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 pt-2">
          <input type="hidden" name="gymId" value={gymId} />
          <input type="hidden" name="gymSlug" value={gymSlug} />
          <input type="hidden" name="membershipId" value={membershipId} />
          <input type="hidden" name="planId" value={selectedPlanId} />

          {state?.error && (
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              {state.error}
            </div>
          )}

          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs space-y-1">
            <div className="text-slate-500">Current Plan & Expiry:</div>
            <div className="font-semibold text-slate-900 flex justify-between">
              <span>{currentPlanName}</span>
              <span>Expires {new Date(currentEndDate).toLocaleDateString()}</span>
            </div>
            {isCurrentlyActive && (
              <p className="text-[11px] text-emerald-700 pt-1 font-medium">
                ✓ Seamless renewal starts immediately upon previous contract end date.
              </p>
            )}
          </div>

          {/* Select Renewal Plan */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Renewal Plan</Label>
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {p.name} — {currency} {Number(p.price).toFixed(2)} ({p.durationDays} days)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <Label htmlFor="renew-startDate" className="text-xs font-semibold text-slate-700">
              Renewal Start Date
            </Label>
            <Input
              id="renew-startDate"
              name="startDate"
              type="date"
              value={startDateStr}
              onChange={(e) => setStartDateStr(e.target.value)}
              className="text-xs"
              required
            />
            {calculatedNewEndDate && (
              <p className="text-[11px] text-slate-500">
                New term will expire on:{" "}
                <span className="font-semibold text-slate-800">{calculatedNewEndDate}</span>
              </p>
            )}
          </div>

          {/* Renewal Price */}
          <div className="space-y-1.5">
            <Label htmlFor="renew-price" className="text-xs font-semibold text-slate-700">
              Renewal Price ({currency})
            </Label>
            <Input
              id="renew-price"
              name="customPrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={selectedPlan ? Number(selectedPlan.price) : 0}
              className="text-xs font-mono"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="renew-notes" className="text-xs font-semibold text-slate-700">
              Renewal Notes
            </Label>
            <Textarea
              id="renew-notes"
              name="notes"
              placeholder="e.g. Loyalty renewal discount applied"
              rows={2}
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
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
              disabled={isPending || !selectedPlanId}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Renewing...</span>
                </>
              ) : (
                <span>Confirm Renewal</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==============================================================================
// 3. EXTEND MEMBERSHIP MODAL
// ==============================================================================

interface ExtendMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  gymId: string;
  gymSlug: string;
  membershipId: string;
  memberName: string;
  currentEndDate: Date | string;
}

const EXTENSION_PRESETS = [7, 14, 30, 60];

export function ExtendMembershipModal({
  isOpen,
  onClose,
  gymId,
  gymSlug,
  membershipId,
  memberName,
  currentEndDate,
}: ExtendMembershipModalProps) {
  const [state, formAction, isPending] = useActionState<MembershipActionState | null, FormData>(
    extendMembershipAction,
    null
  );

  const [days, setDays] = useState<number>(14);

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  const newDate = React.useMemo(() => {
    const cur = new Date(currentEndDate);
    return new Date(cur.getTime() + days * 24 * 60 * 60 * 1000).toLocaleDateString();
  }, [currentEndDate, days]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-600" />
            Extend Membership Validity
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Grant additional days for <strong className="text-slate-700">{memberName}</strong>. All extensions require an audit log entry.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 pt-2">
          <input type="hidden" name="gymId" value={gymId} />
          <input type="hidden" name="gymSlug" value={gymSlug} />
          <input type="hidden" name="membershipId" value={membershipId} />

          {state?.error && (
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">Days to Extend</Label>
            <div className="flex gap-2">
              {EXTENSION_PRESETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition ${
                    days === d
                      ? "bg-emerald-50 border-emerald-600 text-emerald-800 font-semibold"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  +{d} days
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Input
                type="number"
                id="extensionDays"
                name="extensionDays"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                min={1}
                max={365}
                required
                className="text-xs w-28"
              />
              <span className="text-xs text-slate-500">
                New expiry date: <strong className="text-slate-800">{newDate}</strong>
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="extend-reason" className="text-xs font-semibold text-slate-700">
              Audit Reason <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="extend-reason"
              name="reason"
              placeholder="e.g. Medical compensation, holiday grace period, gym renovation"
              required
              className="text-xs"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
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
                  <span>Extending...</span>
                </>
              ) : (
                <span>Confirm Extension</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==============================================================================
// 4. PAUSE MEMBERSHIP MODAL
// ==============================================================================

interface PauseMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  gymId: string;
  gymSlug: string;
  membershipId: string;
  memberName: string;
}

export function PauseMembershipModal({
  isOpen,
  onClose,
  gymId,
  gymSlug,
  membershipId,
  memberName,
}: PauseMembershipModalProps) {
  const [state, formAction, isPending] = useActionState<MembershipActionState | null, FormData>(
    pauseMembershipAction,
    null
  );

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Pause className="h-4 w-4 text-amber-600" />
            Pause Active Membership
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Freezes check-in privileges for <strong className="text-slate-700">{memberName}</strong>. When resumed later, the end date is automatically pushed forward by the exact number of days paused.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 pt-2">
          <input type="hidden" name="gymId" value={gymId} />
          <input type="hidden" name="gymSlug" value={gymSlug} />
          <input type="hidden" name="membershipId" value={membershipId} />

          {state?.error && (
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              {state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="pause-reason" className="text-xs font-semibold text-slate-700">
              Reason for Freeze / Pause <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="pause-reason"
              name="reason"
              placeholder="e.g. Travel, medical recovery, personal freeze request"
              required
              className="text-xs"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
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
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-9 gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Freezing...</span>
                </>
              ) : (
                <span>Pause Membership</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==============================================================================
// 5. CANCEL MEMBERSHIP MODAL
// ==============================================================================

interface CancelMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  gymId: string;
  gymSlug: string;
  membershipId: string;
  memberName: string;
}

export function CancelMembershipModal({
  isOpen,
  onClose,
  gymId,
  gymSlug,
  membershipId,
  memberName,
}: CancelMembershipModalProps) {
  const [state, formAction, isPending] = useActionState<MembershipActionState | null, FormData>(
    cancelMembershipAction,
    null
  );

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-rose-700 flex items-center gap-2">
            <XCircle className="h-4 w-4 text-rose-600" />
            Cancel Membership Contract
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Terminate contract for <strong className="text-slate-700">{memberName}</strong>. This revokes gym access immediately and records an audit log.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 pt-2">
          <input type="hidden" name="gymId" value={gymId} />
          <input type="hidden" name="gymSlug" value={gymSlug} />
          <input type="hidden" name="membershipId" value={membershipId} />

          {state?.error && (
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              {state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="cancel-reason" className="text-xs font-semibold text-slate-700">
              Cancellation Reason <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="cancel-reason"
              name="cancellationReason"
              placeholder="e.g. Relocated to another city, dissatisfied with facility, refund requested"
              required
              rows={3}
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="text-xs h-9"
            >
              Keep Membership
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-9 gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Cancelling...</span>
                </>
              ) : (
                <span>Confirm Cancellation</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
