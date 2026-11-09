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
import { LeadSource, LeadStage } from "@prisma/client";
import { createLeadAction, updateLeadAction } from "@/lib/actions/lead";
import { Loader2, Plus, Edit2, AlertCircle } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  gymId: string;
  gymSlug: string;
  initialData?: any | null;
  staffList: Array<{ id: string; name: string | null; email: string }>;
  plansList: Array<{ id: string; name: string; price: number; durationDays: number }>;
  onSuccess?: () => void;
}

interface LeadFormInnerProps {
  onClose: () => void;
  gymId: string;
  gymSlug: string;
  initialData?: any | null;
  staffList: Array<{ id: string; name: string | null; email: string }>;
  plansList: Array<{ id: string; name: string; price: number; durationDays: number }>;
  onSuccess?: () => void;
}

function LeadFormInner({
  onClose,
  gymId,
  gymSlug,
  initialData,
  staffList,
  plansList,
  onSuccess,
}: LeadFormInnerProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isEditMode = Boolean(initialData);

  // Form field states initialized directly from props
  const [firstName, setFirstName] = useState(initialData?.firstName || "");
  const [lastName, setLastName] = useState(initialData?.lastName || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [source, setSource] = useState<string>(initialData?.source || LeadSource.WALK_IN);
  const [stage, setStage] = useState<string>(initialData?.stage || LeadStage.NEW);
  const [interestedPlanId, setInterestedPlanId] = useState<string>(
    initialData?.interestedPlanId || "none"
  );
  const [assignedStaffId, setAssignedStaffId] = useState<string>(
    initialData?.assignedStaffId || "none"
  );
  const [trialDate, setTrialDate] = useState(
    initialData?.trialDate
      ? new Date(initialData.trialDate).toISOString().slice(0, 10)
      : ""
  );
  const [followUpDate, setFollowUpDate] = useState(
    initialData?.followUpDate
      ? new Date(initialData.followUpDate).toISOString().slice(0, 10)
      : ""
  );
  const [followUpNotes, setFollowUpNotes] = useState(
    initialData?.followUpNotes || ""
  );
  const [notes, setNotes] = useState(initialData?.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const formData = new FormData();
      formData.set("gymId", gymId);
      formData.set("gymSlug", gymSlug);
      formData.set("firstName", firstName);
      formData.set("lastName", lastName);
      formData.set("phone", phone);
      if (email.trim()) formData.set("email", email.trim());
      formData.set("source", source);
      if (interestedPlanId !== "none") formData.set("interestedPlanId", interestedPlanId);
      if (assignedStaffId !== "none") formData.set("assignedStaffId", assignedStaffId);
      if (trialDate) formData.set("trialDate", trialDate);
      if (followUpDate) formData.set("followUpDate", followUpDate);
      if (followUpNotes.trim()) formData.set("followUpNotes", followUpNotes.trim());
      if (notes.trim()) formData.set("notes", notes.trim());

      let result;
      if (isEditMode) {
        formData.set("leadId", initialData.id);
        result = await updateLeadAction(null, formData);
      } else {
        formData.set("stage", stage);
        result = await createLeadAction(null, formData);
      }

      if (result.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(result.error || "An unexpected error occurred.");
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      }
    });
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            {isEditMode ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </div>
          <div>
            <DialogTitle className="text-lg font-bold">
              {isEditMode ? "Edit Enquiry / Lead" : "New Prospect Enquiry"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isEditMode
                ? "Update prospect contact details, preferences, and assigned staff."
                : "Capture incoming enquiry, walk-in, or trial session inquiry."}
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
        {/* First & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-xs font-semibold">
              First Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="firstName"
              placeholder="e.g. Alex"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className={fieldErrors.firstName ? "border-rose-500" : ""}
            />
            {fieldErrors.firstName && (
              <p className="text-[11px] text-rose-500">{fieldErrors.firstName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-xs font-semibold">
              Last Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="lastName"
              placeholder="e.g. Sharma"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className={fieldErrors.lastName ? "border-rose-500" : ""}
            />
            {fieldErrors.lastName && (
              <p className="text-[11px] text-rose-500">{fieldErrors.lastName}</p>
            )}
          </div>
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-semibold">
              Phone Number <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className={fieldErrors.phone ? "border-rose-500" : ""}
            />
            {fieldErrors.phone && (
              <p className="text-[11px] text-rose-500">{fieldErrors.phone}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">
              Email Address <span className="text-slate-400 font-normal">(Optional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldErrors.email ? "border-rose-500" : ""}
            />
            {fieldErrors.email && (
              <p className="text-[11px] text-rose-500">{fieldErrors.email}</p>
            )}
          </div>
        </div>

        {/* Source & Stage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Enquiry Source</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger>
                <SelectValue placeholder="Select Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={LeadSource.WALK_IN}>Walk-In</SelectItem>
                <SelectItem value={LeadSource.WEBSITE}>Website / Landing Page</SelectItem>
                <SelectItem value={LeadSource.REFERRAL}>Member Referral</SelectItem>
                <SelectItem value={LeadSource.PHONE}>Phone Call Inquiry</SelectItem>
                <SelectItem value={LeadSource.SOCIAL_MEDIA}>Social Media (Instagram/FB)</SelectItem>
                <SelectItem value={LeadSource.OTHER}>Other Channels</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isEditMode && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Initial Pipeline Stage</Label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LeadStage.NEW}>New Prospect</SelectItem>
                  <SelectItem value={LeadStage.CONTACTED}>Contacted</SelectItem>
                  <SelectItem value={LeadStage.INTERESTED}>Interested / In Review</SelectItem>
                  <SelectItem value={LeadStage.TRIAL_SCHEDULED}>Trial Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Interested Plan & Staff Assignment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Interested Membership Plan</Label>
            <Select value={interestedPlanId} onValueChange={setInterestedPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific plan selected</SelectItem>
                {plansList.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} (₹{plan.price.toLocaleString("en-IN")})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Assigned Staff Rep</Label>
            <Select value={assignedStaffId} onValueChange={setAssignedStaffId}>
              <SelectTrigger>
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {staffList.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.name || staff.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Trial Date & Follow-up Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="trialDate" className="text-xs font-semibold">
              Free Trial Date <span className="text-slate-400 font-normal">(Optional)</span>
            </Label>
            <Input
              id="trialDate"
              type="date"
              value={trialDate}
              onChange={(e) => setTrialDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="followUpDate" className="text-xs font-semibold">
              Next Follow-Up Date <span className="text-slate-400 font-normal">(Optional)</span>
            </Label>
            <Input
              id="followUpDate"
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
            />
          </div>
        </div>

        {/* Follow-up Notes */}
        {followUpDate && (
          <div className="space-y-1.5">
            <Label htmlFor="followUpNotes" className="text-xs font-semibold">
              Follow-Up Reminder Agenda
            </Label>
            <Input
              id="followUpNotes"
              placeholder="e.g. Call to ask about trial session feedback & discount offer"
              value={followUpNotes}
              onChange={(e) => setFollowUpNotes(e.target.value)}
            />
          </div>
        )}

        {/* General Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="notes" className="text-xs font-semibold">
            Prospect Requirements & Discussion Notes
          </Label>
          <Textarea
            id="notes"
            rows={3}
            placeholder="e.g. Interested in weight training and morning personal trainer slots. Prefers weekend trials."
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
            {isEditMode ? "Save Changes" : "Create Enquiry"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function LeadFormModal({
  isOpen,
  onClose,
  gymId,
  gymSlug,
  initialData,
  staffList,
  plansList,
  onSuccess,
}: LeadFormModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <LeadFormInner
          key={initialData?.id || "create-lead"}
          onClose={onClose}
          gymId={gymId}
          gymSlug={gymSlug}
          initialData={initialData}
          staffList={staffList}
          plansList={plansList}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
