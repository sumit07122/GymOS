"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LeadStage } from "@prisma/client";
import {
  User,
  Clock,
  Calendar,
  UserCheck,
  ChevronRight,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface LeadKanbanViewProps {
  leads: any[];
  onSelectLead: (lead: any) => void;
  onOpenConvert: (lead: any) => void;
  onOpenStatusChange: (lead: any) => void;
}

interface StageColumnDef {
  stage: LeadStage;
  title: string;
  headerBg: string;
  borderColor: string;
  badgeBg: string;
}

const STAGE_COLUMNS: StageColumnDef[] = [
  {
    stage: LeadStage.NEW,
    title: "New Enquiries",
    headerBg: "bg-blue-50/70 dark:bg-blue-950/40",
    borderColor: "border-blue-200 dark:border-blue-900",
    badgeBg: "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200",
  },
  {
    stage: LeadStage.CONTACTED,
    title: "Contacted",
    headerBg: "bg-sky-50/70 dark:bg-sky-950/40",
    borderColor: "border-sky-200 dark:border-sky-900",
    badgeBg: "bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200",
  },
  {
    stage: LeadStage.INTERESTED,
    title: "Interested",
    headerBg: "bg-indigo-50/70 dark:bg-indigo-950/40",
    borderColor: "border-indigo-200 dark:border-indigo-900",
    badgeBg: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200",
  },
  {
    stage: LeadStage.TRIAL_SCHEDULED,
    title: "Trial Scheduled",
    headerBg: "bg-purple-50/70 dark:bg-purple-950/40",
    borderColor: "border-purple-200 dark:border-purple-900",
    badgeBg: "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200",
  },
  {
    stage: LeadStage.CONVERTED,
    title: "Converted Members",
    headerBg: "bg-emerald-50/70 dark:bg-emerald-950/40",
    borderColor: "border-emerald-200 dark:border-emerald-900",
    badgeBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200",
  },
  {
    stage: LeadStage.LOST,
    title: "Lost / Dropped",
    headerBg: "bg-rose-50/70 dark:bg-rose-950/40",
    borderColor: "border-rose-200 dark:border-rose-900",
    badgeBg: "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200",
  },
];

export function LeadKanbanView({
  leads,
  onSelectLead,
  onOpenConvert,
  onOpenStatusChange,
}: LeadKanbanViewProps) {
  const getFollowUpStatus = (dateStr?: string | null, stage?: LeadStage) => {
    if (!dateStr || stage === LeadStage.CONVERTED || stage === LeadStage.LOST) {
      return null;
    }
    const target = new Date(dateStr);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (target < startOfToday) {
      return {
        label: "Overdue",
        color: "text-rose-600 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900",
      };
    }
    if (target >= startOfToday && target <= endOfToday) {
      return {
        label: "Due Today",
        color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900",
      };
    }
    return {
      label: "Upcoming",
      color: "text-slate-600 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start overflow-x-auto pb-4">
      {STAGE_COLUMNS.map((col) => {
        const columnLeads = leads.filter((l) => l.stage === col.stage);

        return (
          <div
            key={col.stage}
            className="flex flex-col min-w-[260px] bg-slate-100/70 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-2.5 max-h-[calc(100vh-250px)]"
          >
            {/* Column Header */}
            <div
              className={`flex items-center justify-between p-2 rounded-lg ${col.headerBg} border ${col.borderColor} mb-2.5`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {col.title}
                </span>
              </div>
              <Badge className={`text-[10px] font-mono px-1.5 py-0.5 ${col.badgeBg}`}>
                {columnLeads.length}
              </Badge>
            </div>

            {/* Cards Scroll Container */}
            <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
              {columnLeads.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                  <p className="text-[11px] text-slate-400">No leads</p>
                </div>
              ) : (
                columnLeads.map((lead) => {
                  const followUp = getFollowUpStatus(lead.followUpDate, lead.stage);

                  return (
                    <Card
                      key={lead.id}
                      className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-shadow cursor-pointer select-none"
                      onClick={() => onSelectLead(lead)}
                    >
                      <CardContent className="p-3 space-y-2">
                        {/* Name & Source */}
                        <div className="flex items-start justify-between gap-1.5">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {lead.firstName} {lead.lastName}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {lead.phone}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[9px] uppercase tracking-wider px-1.5 py-0 text-slate-500"
                          >
                            {lead.source?.toLowerCase().replace(/_/g, " ")}
                          </Badge>
                        </div>

                        {/* Interested Plan or Trial Date */}
                        {lead.interestedPlan && (
                          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium truncate">
                            Plan: {lead.interestedPlan.name}
                          </div>
                        )}

                        {lead.trialDate && (
                          <div className="text-[11px] text-purple-600 dark:text-purple-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span>
                              Trial:{" "}
                              {new Date(lead.trialDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>
                        )}

                        {/* Assigned Staff */}
                        {lead.assignedStaff && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{lead.assignedStaff.name || lead.assignedStaff.email}</span>
                          </div>
                        )}

                        {/* Follow-up Pill */}
                        {followUp && lead.followUpDate && (
                          <div
                            className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border font-medium ${followUp.color}`}
                          >
                            <Clock className="h-2.5 w-2.5" />
                            <span>
                              {followUp.label}:{" "}
                              {new Date(lead.followUpDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>
                        )}

                        {/* Quick Card Footer Actions */}
                        <div
                          className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] px-1.5 text-slate-500 hover:text-slate-800"
                            onClick={() => onOpenStatusChange(lead)}
                          >
                            Move Stage <ChevronRight className="h-3 w-3 ml-0.5" />
                          </Button>

                          {lead.stage !== LeadStage.CONVERTED && lead.stage !== LeadStage.LOST && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-[10px] px-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                              onClick={() => onOpenConvert(lead)}
                            >
                              <UserCheck className="h-3 w-3 mr-0.5" /> Convert
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

