"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { PageHeader } from "@/components/design-system/page-header";

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
      <PageHeader
        title="Leads & CRM Pipeline"
        description="Capture prospective walk-ins, track trials, log touchpoints, and convert enquiries to paid members."
        actions={
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-pine hover:bg-pine/90 text-white font-semibold text-xs h-9 rounded-lg shadow-xs transition"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            <span>Add Enquiry</span>
          </Button>
        }
      />

      {/* KPI Overview Cards */}
      <LeadOverviewCards metrics={metrics} />

      {/* Tabs Switcher */}
      <div className="flex border-b border-line text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("kanban")}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "kanban"
              ? "border-pine text-pine font-bold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <Kanban className="h-4 w-4" />
          <span>Pipeline Board</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("directory")}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "directory"
              ? "border-pine text-pine font-bold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <TableIcon className="h-4 w-4" />
          <span>All Leads Table ({leads.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("agenda")}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "agenda"
              ? "border-pine text-pine font-bold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <CalendarClock className="h-4 w-4" />
          <span>Follow-up Agenda</span>
        </button>
      </div>

      {/* Main Views */}
      {activeTab === "kanban" && (
        <LeadKanbanView
          leads={leads}
          onSelectLead={handleLeadSelect}
          onOpenStatusChange={(lead) => setStatusChangeLead(lead)}
          onOpenConvert={(lead) => setConvertingLead(lead)}
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

      {/* Add / Edit Lead Modal */}
      <LeadFormModal
        isOpen={isAddModalOpen || !!editingLead}
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

      {/* Detailed Lead Drawer Modal */}
      <LeadDetailModal
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        gymId={gymId}
        gymSlug={gymSlug}
        onOpenConvert={(lead) => {
          setSelectedLead(null);
          setConvertingLead(lead);
        }}
        onOpenStatusChange={(lead) => {
          setSelectedLead(null);
          setStatusChangeLead(lead);
        }}
        onOpenScheduleFollowUp={(lead) => {
          setSelectedLead(null);
          setScheduleFollowUpLead(lead);
        }}
        onOpenEdit={(lead) => {
          setSelectedLead(null);
          setEditingLead(lead);
        }}
        onSuccess={refreshData}
      />

      {/* Convert Lead to Member Modal */}
      <ConvertLeadModal
        isOpen={!!convertingLead}
        onClose={() => setConvertingLead(null)}
        gymId={gymId}
        gymSlug={gymSlug}
        lead={convertingLead}
        plansList={plansList}
        onSuccess={refreshData}
      />

      {/* Change Lead Stage Modal */}
      <LeadStageChangeModal
        isOpen={!!statusChangeLead}
        onClose={() => setStatusChangeLead(null)}
        gymId={gymId}
        gymSlug={gymSlug}
        lead={statusChangeLead}
        onSuccess={refreshData}
      />

      {/* Follow-up Touchpoint Logger Modal */}
      <LeadFollowupModal
        isOpen={!!scheduleFollowUpLead}
        onClose={() => setScheduleFollowUpLead(null)}
        gymId={gymId}
        gymSlug={gymSlug}
        lead={scheduleFollowUpLead}
        onSuccess={refreshData}
      />
    </div>
  );
}
