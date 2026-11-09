"use client";

import React, { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LeadStage,
  LeadSource,
  LeadActivityType,
} from "@prisma/client";
import { logLeadActivityAction } from "@/lib/actions/lead";
import {
  Phone,
  Mail,
  Clock,
  MessageSquare,
  UserCheck,
  ArrowRightLeft,
  CalendarClock,
  Edit2,
  PhoneCall,
  Loader2,
  FileText,
  Send,
  AlertCircle,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface LeadDetailModalProps {
  lead: any | null;
  isOpen: boolean;
  onClose: () => void;
  gymId: string;
  gymSlug: string;
  onOpenConvert: (lead: any) => void;
  onOpenStatusChange: (lead: any) => void;
  onOpenScheduleFollowUp: (lead: any) => void;
  onOpenEdit: (lead: any) => void;
  onSuccess: () => void;
}

export function LeadDetailModal({
  lead,
  isOpen,
  onClose,
  gymId,
  gymSlug,
  onOpenConvert,
  onOpenStatusChange,
  onOpenScheduleFollowUp,
  onOpenEdit,
  onSuccess,
}: LeadDetailModalProps) {
  const [isLogging, startLoggingTransition] = useTransition();
  const [logType, setLogType] = useState<LeadActivityType>(LeadActivityType.CALL);
  const [logNotes, setLogNotes] = useState("");
  const [logError, setLogError] = useState<string | null>(null);

  if (!lead) return null;

  const handleLogActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logNotes.trim()) return;
    setLogError(null);

    startLoggingTransition(async () => {
      const formData = new FormData();
      formData.set("gymId", gymId);
      formData.set("gymSlug", gymSlug);
      formData.set("leadId", lead.id);
      formData.set("type", logType);
      formData.set("notes", logNotes.trim());

      const res = await logLeadActivityAction(null, formData);
      if (res.success) {
        setLogNotes("");
        onSuccess();
      } else {
        setLogError(res.error || "Failed to record activity.");
      }
    });
  };

  const getStageBadge = (stage: LeadStage) => {
    switch (stage) {
      case LeadStage.NEW:
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">New Prospect</Badge>;
      case LeadStage.CONTACTED:
        return <Badge className="bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200">Contacted</Badge>;
      case LeadStage.INTERESTED:
        return <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200">Interested</Badge>;
      case LeadStage.TRIAL_SCHEDULED:
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200">Trial Scheduled</Badge>;
      case LeadStage.TRIAL_COMPLETED:
        return <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200">Trial Completed</Badge>;
      case LeadStage.CONVERTED:
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">Converted Member</Badge>;
      case LeadStage.LOST:
        return <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">Lost / Dropped</Badge>;
      default:
        return <Badge variant="outline">{stage}</Badge>;
    }
  };

  const getSourceBadge = (source: LeadSource) => {
    const formatted = source.replace(/_/g, " ");
    return (
      <Badge variant="outline" className="text-slate-600 dark:text-slate-300 font-normal capitalize">
        {formatted.toLowerCase()}
      </Badge>
    );
  };

  const getActivityIcon = (type: LeadActivityType) => {
    switch (type) {
      case LeadActivityType.CALL:
        return <PhoneCall className="h-4 w-4 text-emerald-500" />;
      case LeadActivityType.WHATSAPP:
        return <MessageSquare className="h-4 w-4 text-teal-500" />;
      case LeadActivityType.EMAIL:
        return <Mail className="h-4 w-4 text-blue-500" />;
      case LeadActivityType.STAGE_CHANGE:
        return <ArrowRightLeft className="h-4 w-4 text-indigo-500" />;
      case LeadActivityType.CONVERTED:
        return <UserCheck className="h-4 w-4 text-emerald-600" />;
      case LeadActivityType.FOLLOW_UP_SCHEDULED:
      case LeadActivityType.FOLLOW_UP_COMPLETED:
        return <Clock className="h-4 w-4 text-amber-500" />;
      case LeadActivityType.VISIT_NOTE:
      default:
        return <FileText className="h-4 w-4 text-slate-500" />;
    }
  };

  const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-black">
                  {lead.firstName} {lead.lastName}
                </DialogTitle>
                {getStageBadge(lead.stage)}
                {getSourceBadge(lead.source)}
              </div>
              <DialogDescription className="text-xs mt-1">
                Enquiry profile, interaction records, and CRM timeline.
              </DialogDescription>
            </div>

            {/* Quick Contact Buttons */}
            <div className="flex items-center gap-1.5 pt-1 sm:pt-0">
              <a
                href={`tel:${lead.phone}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                <Phone className="h-3 w-3" /> Call
              </a>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-300"
                >
                  <MessageSquare className="h-3 w-3" /> WhatsApp
                </a>
              )}
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300"
                >
                  <Mail className="h-3 w-3" /> Email
                </a>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-2 py-2 border-y border-slate-200 dark:border-slate-800">
          {lead.stage !== LeadStage.CONVERTED && (
            <Button
              size="sm"
              onClick={() => {
                onClose();
                onOpenConvert(lead);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
            >
              <UserCheck className="mr-1.5 h-3.5 w-3.5" /> Convert to Member
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onClose();
              onOpenStatusChange(lead);
            }}
            className="text-xs"
          >
            <ArrowRightLeft className="mr-1.5 h-3.5 w-3.5 text-indigo-600" /> Change Stage
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onClose();
              onOpenScheduleFollowUp(lead);
            }}
            className="text-xs"
          >
            <CalendarClock className="mr-1.5 h-3.5 w-3.5 text-amber-600" /> Schedule Follow-up
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              onClose();
              onOpenEdit(lead);
            }}
            className="text-xs ml-auto"
          >
            <Edit2 className="mr-1 h-3.5 w-3.5" /> Edit
          </Button>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs py-1">
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
              Prospect & Preferences
            </span>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  {lead.phone}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {lead.email || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Interested Plan:</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {lead.interestedPlan ? lead.interestedPlan.name : "Not specified"}
                </span>
              </div>
              {lead.trialDate && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Free Trial Date:</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {new Date(lead.trialDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
              CRM Assignment & Follow-Up
            </span>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Assigned Rep:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {lead.assignedStaff?.name || lead.assignedStaff?.email || "Unassigned"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Next Follow-Up:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {lead.followUpDate
                    ? new Date(lead.followUpDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "None scheduled"}
                </span>
              </div>
              {lead.followUpNotes && (
                <p className="text-[11px] text-amber-700 dark:text-amber-300 italic pt-0.5">
                  &ldquo;{lead.followUpNotes}&rdquo;
                </p>
              )}
              {lead.lostReason && (
                <div className="pt-1 text-[11px] text-rose-600 dark:text-rose-400">
                  <strong>Loss Reason:</strong> {lead.lostReason}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Prospect Notes */}
        {lead.notes && (
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="font-semibold text-slate-500 text-[10px] uppercase tracking-wider block mb-1">
              Discussion Notes
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {lead.notes}
            </p>
          </div>
        )}

        {/* Manual Conversation / Call Logger */}
        <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <PhoneCall className="h-4 w-4 text-indigo-600" />
              Log Conversation / Touchpoint
            </span>
            <span className="text-[11px] text-slate-500">Record calls, WhatsApp messages, or desk visits</span>
          </div>

          {logError && (
            <div className="p-2 text-xs text-rose-700 bg-rose-50 dark:bg-rose-950/40 rounded flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{logError}</span>
            </div>
          )}

          <form onSubmit={handleLogActivity} className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Select
                value={logType}
                onValueChange={(val) => setLogType(val as LeadActivityType)}
              >
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LeadActivityType.CALL}>Phone Call</SelectItem>
                  <SelectItem value={LeadActivityType.WHATSAPP}>WhatsApp Chat</SelectItem>
                  <SelectItem value={LeadActivityType.EMAIL}>Email Message</SelectItem>
                  <SelectItem value={LeadActivityType.VISIT_NOTE}>Desk / In-Person Visit</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex-1">
                <Textarea
                  placeholder="Record summary of conversation, objections, or commitment..."
                  rows={2}
                  className="text-xs resize-none"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                size="sm"
                disabled={isLogging || !logNotes.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 h-14"
              >
                {isLogging ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Chronological Activity Timeline */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              CRM Activity Timeline ({lead.activities?.length || 0})
            </span>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {!lead.activities || lead.activities.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center italic">
                No activity logs recorded yet.
              </p>
            ) : (
              lead.activities.map((act: any) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                >
                  <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                    {getActivityIcon(act.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {act.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(act.performedAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {act.notes && (
                      <p className="text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-wrap leading-relaxed">
                        {act.notes}
                      </p>
                    )}
                    {act.staffName && (
                      <span className="text-[10px] text-slate-400 mt-1 inline-block">
                        Logged by: {act.staffName}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

