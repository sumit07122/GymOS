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
import { scheduleFollowUpAction } from "@/lib/actions/lead";
import { Loader2, CalendarClock, AlertCircle } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface LeadFollowupModalProps {
  isOpen: boolean;
  onClose: () => void;
  gymId: string;
  gymSlug: string;
  lead: any | null;
  onSuccess?: () => void;
}

interface LeadFollowupInnerProps {
  onClose: () => void;
  gymId: string;
  gymSlug: string;
  lead: any;
  onSuccess?: () => void;
}

function LeadFollowupInner({
  onClose,
  gymId,
  gymSlug,
  lead,
  onSuccess,
}: LeadFollowupInnerProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [followUpDate, setFollowUpDate] = useState(() => {
    if (lead.followUpDate) {
      return new Date(lead.followUpDate).toISOString().slice(0, 10);
    }
    return new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  });
  const [followUpNotes, setFollowUpNotes] = useState(lead.followUpNotes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("gymId", gymId);
      formData.set("gymSlug", gymSlug);
      formData.set("leadId", lead.id);
      formData.set("followUpDate", followUpDate);
      if (followUpNotes.trim()) {
        formData.set("followUpNotes", followUpNotes.trim());
      }

      const res = await scheduleFollowUpAction(null, formData);
      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || "Failed to schedule follow-up.");
      }
    });
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold">Schedule Follow-Up Reminder</DialogTitle>
            <DialogDescription className="text-xs">
              Set next contact date for {lead.firstName} {lead.lastName}.
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
          <Label htmlFor="followUpDate" className="text-xs font-semibold">
            Follow-Up Target Date <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="followUpDate"
            type="date"
            required
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="followUpNotes" className="text-xs font-semibold">
            Reminder Memo / Objective
          </Label>
          <Input
            id="followUpNotes"
            placeholder="e.g. Call regarding corporate discount rate and timing preferences"
            value={followUpNotes}
            onChange={(e) => setFollowUpNotes(e.target.value)}
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
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Set Follow-Up
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function LeadFollowupModal({
  isOpen,
  onClose,
  gymId,
  gymSlug,
  lead,
  onSuccess,
}: LeadFollowupModalProps) {
  if (!isOpen || !lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <LeadFollowupInner
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
