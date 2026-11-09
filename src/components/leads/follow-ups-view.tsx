"use client";

import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LeadStage } from "@prisma/client";
import {
  AlertCircle,
  CalendarClock,
  Clock,
  Phone,
  MessageSquare,
  UserCheck,
  User,
  CheckCircle,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface FollowUpsViewProps {
  leads: any[];
  onSelectLead: (lead: any) => void;
  onOpenScheduleFollowUp: (lead: any) => void;
  onOpenConvert: (lead: any) => void;
}

export function FollowUpsView({
  leads,
  onSelectLead,
  onOpenScheduleFollowUp,
  onOpenConvert,
}: FollowUpsViewProps) {
  const groups = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const activeLeadsWithFollowUp = leads.filter(
      (l) =>
        l.followUpDate &&
        l.stage !== LeadStage.CONVERTED &&
        l.stage !== LeadStage.LOST
    );

    const overdue: any[] = [];
    const today: any[] = [];
    const upcoming: any[] = [];

    activeLeadsWithFollowUp.forEach((lead) => {
      const d = new Date(lead.followUpDate);
      if (d < startOfToday) {
        overdue.push(lead);
      } else if (d >= startOfToday && d <= endOfToday) {
        today.push(lead);
      } else {
        upcoming.push(lead);
      }
    });

    // Sort overdue by oldest first
    overdue.sort(
      (a, b) =>
        new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime()
    );
    // Sort today by followUpDate
    today.sort(
      (a, b) =>
        new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime()
    );
    // Sort upcoming by earliest first
    upcoming.sort(
      (a, b) =>
        new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime()
    );

    return { overdue, today, upcoming };
  }, [leads]);

  const renderFollowUpCard = (
    lead: any,
    urgency: "overdue" | "today" | "upcoming"
  ) => {
    const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
    const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

    let borderClass = "border-slate-200 dark:border-slate-800";
    let badgeClass = "bg-slate-100 text-slate-700";

    if (urgency === "overdue") {
      borderClass = "border-rose-200 dark:border-rose-900 bg-rose-50/20";
      badgeClass = "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200";
    } else if (urgency === "today") {
      borderClass = "border-amber-200 dark:border-amber-900 bg-amber-50/20";
      badgeClass = "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200";
    }

    return (
      <Card
        key={lead.id}
        className={`${borderClass} shadow-xs hover:shadow-md transition-shadow cursor-pointer`}
        onClick={() => onSelectLead(lead)}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {lead.firstName} {lead.lastName}
                </h4>
                <Badge className={`text-[10px] font-semibold ${badgeClass}`}>
                  {new Date(lead.followUpDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{lead.phone}</p>
            </div>

            {/* Quick Contact Links */}
            <div
              className="flex items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
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
            </div>
          </div>

          {/* Follow-up notes */}
          {lead.followUpNotes && (
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 italic border border-slate-100 dark:border-slate-800">
              &ldquo;{lead.followUpNotes}&rdquo;
            </div>
          )}

          {/* Details & Actions Footer */}
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-slate-500 text-[11px]">
              {lead.assignedStaff && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {lead.assignedStaff.name || lead.assignedStaff.email}
                </span>
              )}
              {lead.interestedPlan && (
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                  {lead.interestedPlan.name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => onOpenScheduleFollowUp(lead)}
              >
                <CalendarClock className="h-3 w-3 mr-1 text-amber-600" /> Reschedule
              </Button>

              <Button
                size="sm"
                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                onClick={() => onOpenConvert(lead)}
              >
                <UserCheck className="h-3 w-3 mr-1" /> Convert
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Overdue Follow-ups */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
              <AlertCircle className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Overdue Follow-Ups ({groups.overdue.length})
            </h3>
          </div>
          {groups.overdue.length > 0 && (
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              Requires immediate callback
            </span>
          )}
        </div>

        {groups.overdue.length === 0 ? (
          <div className="flex items-center gap-2 p-4 rounded-xl border border-dashed border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/20 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Zero overdue follow-ups! All previous touchpoints are up to date.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {groups.overdue.map((l) => renderFollowUpCard(l, "overdue"))}
          </div>
        )}
      </div>

      {/* 2. Due Today */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            <Clock className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Scheduled for Today ({groups.today.length})
          </h3>
        </div>

        {groups.today.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            No callbacks or trials scheduled for today.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {groups.today.map((l) => renderFollowUpCard(l, "today"))}
          </div>
        )}
      </div>

      {/* 3. Upcoming */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
            <CalendarClock className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Upcoming Enquiries & Appointments ({groups.upcoming.length})
          </h3>
        </div>

        {groups.upcoming.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            No future follow-ups scheduled yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {groups.upcoming.map((l) => renderFollowUpCard(l, "upcoming"))}
          </div>
        )}
      </div>
    </div>
  );
}

