"use client";

import * as React from "react";
import { useState, useActionState, useEffect } from "react";
import { manualAttendanceAction, AttendanceActionState } from "@/lib/actions/attendance";
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
  UserCheck,
  Loader2,
  Search,
  CheckCircle2,
} from "lucide-react";

export interface SimpleMemberOption {
  id: string;
  fullName: string;
  memberCode: string;
  phone?: string | null;
  activePlan?: string | null;
}

interface ManualCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  gymId: string;
  gymSlug: string;
  members: SimpleMemberOption[];
  preselectedMemberId?: string;
  defaultMode?: "CHECK_IN" | "CHECK_OUT";
  onSuccess?: () => void;
}

const REASON_PRESETS = [
  "Member forgot phone",
  "Physical keycard scan",
  "Front desk identification override",
  "Temporary mobile app login issue",
];

export function ManualCheckinModal({
  isOpen,
  onClose,
  gymId,
  gymSlug,
  members,
  preselectedMemberId,
  defaultMode = "CHECK_IN",
  onSuccess,
}: ManualCheckinModalProps) {
  const [state, formAction, isPending] = useActionState<AttendanceActionState | null, FormData>(
    manualAttendanceAction,
    null
  );

  const [mode, setMode] = useState<"CHECK_IN" | "CHECK_OUT">(defaultMode);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    preselectedMemberId || (members[0]?.id ?? "")
  );
  const [reason, setReason] = useState("");

  const filteredMembers = React.useMemo(() => {
    if (!searchQuery.trim()) return members.slice(0, 8);
    const q = searchQuery.toLowerCase();
    return members
      .filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.memberCode.toLowerCase().includes(q) ||
          (m.phone && m.phone.includes(q))
      )
      .slice(0, 10);
  }, [members, searchQuery]);

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  useEffect(() => {
    if (state?.success) {
      onSuccess?.();
      onClose();
    }
  }, [state, onClose, onSuccess]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-emerald-600" />
            Manual Attendance Entry
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Log front desk check-in or check-out with mandatory staff audit reason.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 pt-2">
          <input type="hidden" name="gymId" value={gymId} />
          <input type="hidden" name="gymSlug" value={gymSlug} />
          <input type="hidden" name="memberId" value={selectedMemberId} />
          <input type="hidden" name="mode" value={mode} />

          {state?.error && (
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              {state.error}
            </div>
          )}

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setMode("CHECK_IN")}
              className={`py-1.5 text-xs font-semibold rounded-md transition ${
                mode === "CHECK_IN"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Check-In Mode
            </button>
            <button
              type="button"
              onClick={() => setMode("CHECK_OUT")}
              className={`py-1.5 text-xs font-semibold rounded-md transition ${
                mode === "CHECK_OUT"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Check-Out Mode
            </button>
          </div>

          {/* Member Search / Selector */}
          {!preselectedMemberId && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Find Member</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by member name, code or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs"
                />
              </div>

              {/* Members List */}
              <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100 bg-white">
                {filteredMembers.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400">
                    No members matching search query
                  </div>
                ) : (
                  filteredMembers.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMemberId(m.id)}
                      className={`flex items-center justify-between p-2 text-xs cursor-pointer transition ${
                        selectedMemberId === m.id
                          ? "bg-emerald-50 text-emerald-900 font-semibold"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div>
                        <div>{m.fullName}</div>
                        <span className="font-mono text-[10px] text-slate-400">
                          {m.memberCode}
                        </span>
                      </div>
                      {selectedMemberId === m.id && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Selected Member Preview */}
          {selectedMember && (
            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-xs">
              <span className="text-slate-500">Selected Member: </span>
              <strong className="text-slate-900">{selectedMember.fullName}</strong>{" "}
              <span className="font-mono text-slate-600">({selectedMember.memberCode})</span>
            </div>
          )}

          {/* Mandatory Reason */}
          <div className="space-y-1.5">
            <Label htmlFor="manual-reason" className="text-xs font-semibold text-slate-700">
              Audit Rationale / Reason <span className="text-rose-500">*</span>
            </Label>
            <div className="flex flex-wrap gap-1.5 pb-1">
              {REASON_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setReason(p)}
                  className="px-2 py-1 text-[11px] rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
                >
                  {p}
                </button>
              ))}
            </div>
            <Textarea
              id="manual-reason"
              name="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this attendance entry is being entered manually..."
              required
              rows={2}
              className="text-xs resize-none"
            />
            {state?.fieldErrors?.reason && (
              <p className="text-[11px] text-rose-600">{state.fieldErrors.reason}</p>
            )}
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
              disabled={isPending || !selectedMemberId || !reason.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Recording...</span>
                </>
              ) : (
                <span>Confirm {mode === "CHECK_IN" ? "Check-In" : "Check-Out"}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

