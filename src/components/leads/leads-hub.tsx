"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Kanban,
  Table as TableIcon,
  CalendarClock,
  Plus,
} from "lucide-react";
import { LeadOverviewCards } from "./lead-overview-cards";
import { LeadKanbanView } from "./lead-kanban-view";
import { LeadListTable } from "./lead-list-table";
import { FollowUpsView } from "./follow-ups-view";
import { LeadFormModal } from "./lead-form-modal";
import { LeadDetailModal } from "./lead-detail-modal";
import { LeadStageChangeModal } from "./lead-stage-change-modal";
import { LeadFollowupModal } from "./lead-followup-modal";
import { ConvertLeadModal } from "./convert-lead-modal";
import { LeadCrmMetrics } from "@/lib/services/lead.service";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface LeadsHubProps {
  gymId: string;
  gymSlug: string;
  metrics: LeadCrmMetrics;
  leads: any[];
  staffList: Array<{ id: string; name: string | null; email: string }>;
  plansList: Array<{ id: string; name: string; price: number; durationDays: number }>;
}

export function LeadsHub({
  gymId,
  gymSlug,
  metrics,
  leads,
  staffList,
  plansList,
}: LeadsHubProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"kanban" | "directory" | "agenda">("kanban");

  // Dialog States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any | null>(null);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [convertingLead, setConvertingLead] = useState<any | null>(null);
  const [statusChangeLead, setStatusChangeLead] = useState<any | null>(null);
  const [scheduleFollowUpLead, setScheduleFollowUpLead] = useState<any | null>(null);

  const refreshData = () => {
    router.refresh();
  };

  const handleLeadSelect = (lead: any) => {
    setSelectedLead(lead);
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Leads & CRM Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Capture prospective walk-ins, track trials, log touchpoints, and convert enquiries to members.
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shrink-0 shadow-xs"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add Enquiry
        </Button>
      </div>

      {/* KPI Overview Cards */}
      <LeadOverviewCards metrics={metrics} />

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <Button
          variant={activeTab === "kanban" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("kanban")}
          className={`text-xs gap-1.5 ${
            activeTab === "kanban"
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          <Kanban className="h-3.5 w-3.5" />
          Pipeline Board
        </Button>

        <Button
          variant={activeTab === "directory" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("directory")}
          className={`text-xs gap-1.5 ${
            activeTab === "directory"
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          <TableIcon className="h-3.5 w-3.5" />
          Enquiries Directory
          <Badge
            variant="outline"
            className="ml-1 text-[10px] font-mono border-slate-300 dark:border-slate-700"
          >
            {leads.length}
          </Badge>
        </Button>

        <Button
          variant={activeTab === "agenda" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("agenda")}
          className={`text-xs gap-1.5 ${
            activeTab === "agenda"
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          <CalendarClock className="h-3.5 w-3.5" />
          Follow-Up Agenda
          {metrics.followUps.overdue > 0 && (
            <Badge className="ml-1 text-[10px] bg-rose-500 text-white font-mono px-1 py-0">
              {metrics.followUps.overdue}
            </Badge>
          )}
        </Button>
      </div>

      {/* Main Tab Content */}
      {activeTab === "kanban" && (
        <LeadKanbanView
          leads={leads}
          onSelectLead={handleLeadSelect}
          onOpenConvert={(lead) => setConvertingLead(lead)}
          onOpenStatusChange={(lead) => setStatusChangeLead(lead)}
        />
      )}

      {activeTab === "directory" && (
        <LeadListTable
          leads={leads}
          staffList={staffList}
          onSelectLead={handleLeadSelect}
          onOpenConvert={(lead) => setConvertingLead(lead)}
          onOpenStatusChange={(lead) => setStatusChangeLead(lead)}
          onOpenScheduleFollowUp={(lead) => setScheduleFollowUpLead(lead)}
          onOpenEdit={(lead) => setEditingLead(lead)}
        />
      )}

      {activeTab === "agenda" && (
        <FollowUpsView
          leads={leads}
          onSelectLead={handleLeadSelect}
          onOpenScheduleFollowUp={(lead) => setScheduleFollowUpLead(lead)}
          onOpenConvert={(lead) => setConvertingLead(lead)}
        />
      )}

      {/* Modals & Dialogs */}
      {/* 1. Add / Edit Modal */}
      <LeadFormModal
        isOpen={isAddModalOpen || Boolean(editingLead)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingLead(null);
        }}
        gymId={gymId}
        gymSlug={gymSlug}
        initialData={editingLead}
        staffList={staffList}
        plansList={plansList}
        onSuccess={refreshData}
      />

      {/* 2. Lead Detail Modal */}
      <LeadDetailModal
        lead={selectedLead}
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        gymId={gymId}
        gymSlug={gymSlug}
        onOpenConvert={(lead) => setConvertingLead(lead)}
        onOpenStatusChange={(lead) => setStatusChangeLead(lead)}
        onOpenScheduleFollowUp={(lead) => setScheduleFollowUpLead(lead)}
        onOpenEdit={(lead) => setEditingLead(lead)}
        onSuccess={refreshData}
      />

      {/* 3. Stage Change Modal */}
      <LeadStageChangeModal
        lead={statusChangeLead}
        isOpen={Boolean(statusChangeLead)}
        onClose={() => setStatusChangeLead(null)}
        gymId={gymId}
        gymSlug={gymSlug}
        onSuccess={refreshData}
      />

      {/* 4. Follow-Up Reschedule Modal */}
      <LeadFollowupModal
        lead={scheduleFollowUpLead}
        isOpen={Boolean(scheduleFollowUpLead)}
        onClose={() => setScheduleFollowUpLead(null)}
        gymId={gymId}
        gymSlug={gymSlug}
        onSuccess={refreshData}
      />

      {/* 5. Convert Lead to Member Modal */}
      <ConvertLeadModal
        lead={convertingLead}
        isOpen={Boolean(convertingLead)}
        onClose={() => setConvertingLead(null)}
        gymId={gymId}
        gymSlug={gymSlug}
        plansList={plansList}
        onSuccess={refreshData}
      />
    </div>
  );
}

