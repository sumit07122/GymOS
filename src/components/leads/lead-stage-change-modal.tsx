"use client";

import React, { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadStage } from "@prisma/client";
import { changeLeadStatusAction } from "@/lib/actions/lead";
import { Loader2, ArrowRightLeft, AlertCircle } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface LeadStageChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  gymId: string;
  gymSlug: string;
  lead: any | null;
  onSuccess?: () => void;
}

interface LeadStageChangeInnerProps {
  onClose: () => void;
  gymId: string;
  gymSlug: string;
  lead: any;
  onSuccess?: () => void;
}

function LeadStageChangeInner({
  onClose,
  gymId,
  gymSlug,
  lead,
  onSuccess,
}: LeadStageChangeInnerProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [stage, setStage] = useState<string>(lead.stage || LeadStage.CONTACTED);
  const [lostReason, setLostReason] = useState(lead.lostReason || "");
  const [notes, setNotes] = useState("");

  const isLostStage = stage === LeadStage.LOST;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("gymId", gymId);
      formData.set("gymSlug", gymSlug);
      formData.set("leadId", lead.id);
      formData.set("stage", stage);
      if (isLostStage && lostReason.trim()) {
        formData.set("lostReason", lostReason.trim());
      }
      if (notes.trim()) {
        formData.set("notes", notes.trim());
      }

      const res = await changeLeadStatusAction(null, formData);
      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || "Failed to update pipeline stage.");
      }
    });
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold">Update Pipeline Stage</DialogTitle>
            <DialogDescription className="text-xs">
              Move {lead.firstName} {lead.lastName} across CRM lifecycle stages.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Current vs New Stage</Label>
          <Select value={stage} onValueChange={setStage}>
            <SelectTrigger>
              <SelectValue placeholder="Select Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={LeadStage.NEW}>1. New Enquiry</SelectItem>
              <SelectItem value={LeadStage.CONTACTED}>2. Contacted</SelectItem>
              <SelectItem value={LeadStage.INTERESTED}>3. Interested / In Review</SelectItem>
              <SelectItem value={LeadStage.TRIAL_SCHEDULED}>4. Trial Scheduled</SelectItem>
              <SelectItem value={LeadStage.TRIAL_COMPLETED}>5. Trial Completed</SelectItem>
              <SelectItem value={LeadStage.CONVERTED}>6. Converted to Member</SelectItem>
              <SelectItem value={LeadStage.LOST}>7. Lost / Disqualified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLostStage && (
          <div className="space-y-1.5">
            <Label htmlFor="lostReason" className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              Reason for Drop / Loss <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={lostReason || "Price concern"}
              onValueChange={setLostReason}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select drop reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Price / Budget too high">Price / Budget too high</SelectItem>
                <SelectItem value="Joined competing fitness center">Joined competing fitness center</SelectItem>
                <SelectItem value="Location / Distance too far">Location / Distance too far</SelectItem>
                <SelectItem value="Timings do not match schedule">Timings do not match schedule</SelectItem>
                <SelectItem value="Relocating to another city">Relocating to another city</SelectItem>
                <SelectItem value="Unresponsive to follow-ups">Unresponsive to follow-ups</SelectItem>
                <SelectItem value="Personal / Medical reasons">Personal / Medical reasons</SelectItem>
                <SelectItem value="Other">Other reason</SelectItem>
              </SelectContent>
            </Select>
            {lostReason === "Other" && (
              <Input
                className="mt-2"
                placeholder="Specify reason..."
                onChange={(e) => setLostReason(e.target.value)}
              />
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="stageNotes" className="text-xs font-semibold">
            Activity Memo / Reason Notes
          </Label>
          <Textarea
            id="stageNotes"
            rows={2}
            placeholder="e.g. Completed 1-day guest pass. Prospect will confirm membership over weekend."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Stage
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function LeadStageChangeModal({
  isOpen,
  onClose,
  gymId,
  gymSlug,
  lead,
  onSuccess,
}: LeadStageChangeModalProps) {
  if (!isOpen || !lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <LeadStageChangeInner
          key={lead.id}
          onClose={onClose}
          gymId={gymId}
          gymSlug={gymSlug}
          lead={lead}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
