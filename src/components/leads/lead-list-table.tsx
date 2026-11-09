"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadStage, LeadSource } from "@prisma/client";
import {
  Search,
  UserCheck,
  ArrowRightLeft,
  CalendarClock,
  Eye,
  Edit2,
  Phone,
  Mail,
  X,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface LeadListTableProps {
  leads: any[];
  staffList: Array<{ id: string; name: string | null; email: string }>;
  onSelectLead: (lead: any) => void;
  onOpenConvert: (lead: any) => void;
  onOpenStatusChange: (lead: any) => void;
  onOpenScheduleFollowUp: (lead: any) => void;
  onOpenEdit: (lead: any) => void;
}

export function LeadListTable({
  leads,
  staffList,
  onSelectLead,
  onOpenConvert,
  onOpenStatusChange,
  onOpenScheduleFollowUp,
  onOpenEdit,
}: LeadListTableProps) {
  const [search, setSearch] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("ALL");
  const [selectedSource, setSelectedSource] = useState<string>("ALL");
  const [selectedStaff, setSelectedStaff] = useState<string>("ALL");
  const [selectedFollowUp, setSelectedFollowUp] = useState<string>("ALL");

  const filteredLeads = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    return leads.filter((lead) => {
      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const fullName = `${lead.firstName} ${lead.lastName}`.toLowerCase();
        const phone = (lead.phone || "").toLowerCase();
        const email = (lead.email || "").toLowerCase();
        const notes = (lead.notes || "").toLowerCase();
        if (
          !fullName.includes(q) &&
          !phone.includes(q) &&
          !email.includes(q) &&
          !notes.includes(q)
        ) {
          return false;
        }
      }

      // Stage filter
      if (selectedStage !== "ALL" && lead.stage !== selectedStage) {
        return false;
      }

      // Source filter
      if (selectedSource !== "ALL" && lead.source !== selectedSource) {
        return false;
      }

      // Staff filter
      if (selectedStaff !== "ALL") {
        if (selectedStaff === "unassigned" && lead.assignedStaffId) return false;
        if (selectedStaff !== "unassigned" && lead.assignedStaffId !== selectedStaff)
          return false;
      }

      // Follow-up urgency filter
      if (selectedFollowUp !== "ALL") {
        if (!lead.followUpDate) return false;
        if (lead.stage === LeadStage.CONVERTED || lead.stage === LeadStage.LOST) return false;

        const target = new Date(lead.followUpDate);
        if (selectedFollowUp === "OVERDUE" && target >= startOfToday) return false;
        if (
          selectedFollowUp === "TODAY" &&
          (target < startOfToday || target > endOfToday)
        )
          return false;
        if (selectedFollowUp === "UPCOMING" && target <= endOfToday) return false;
      }

      return true;
    });
  }, [leads, search, selectedStage, selectedSource, selectedStaff, selectedFollowUp]);

  const hasActiveFilters =
    search ||
    selectedStage !== "ALL" ||
    selectedSource !== "ALL" ||
    selectedStaff !== "ALL" ||
    selectedFollowUp !== "ALL";

  const resetFilters = () => {
    setSearch("");
    setSelectedStage("ALL");
    setSelectedSource("ALL");
    setSelectedStaff("ALL");
    setSelectedFollowUp("ALL");
  };

  const getStageBadge = (stage: LeadStage) => {
    switch (stage) {
      case LeadStage.NEW:
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">New</Badge>;
      case LeadStage.CONTACTED:
        return <Badge className="bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200">Contacted</Badge>;
      case LeadStage.INTERESTED:
        return <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200">Interested</Badge>;
      case LeadStage.TRIAL_SCHEDULED:
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200">Trial</Badge>;
      case LeadStage.TRIAL_COMPLETED:
        return <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200">Trial Done</Badge>;
      case LeadStage.CONVERTED:
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">Converted</Badge>;
      case LeadStage.LOST:
        return <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">Lost</Badge>;
      default:
        return <Badge variant="outline">{stage}</Badge>;
    }
  };

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
        label: "Today",
        color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900",
      };
    }
    return {
      label: "Upcoming",
      color: "text-slate-600 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
    };
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search prospect by name, phone, email, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Filter Selects */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Stage */}
          <Select value={selectedStage} onValueChange={setSelectedStage}>
            <SelectTrigger className="h-9 w-32 text-xs">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Stages</SelectItem>
              <SelectItem value={LeadStage.NEW}>New</SelectItem>
              <SelectItem value={LeadStage.CONTACTED}>Contacted</SelectItem>
              <SelectItem value={LeadStage.INTERESTED}>Interested</SelectItem>
              <SelectItem value={LeadStage.TRIAL_SCHEDULED}>Trial</SelectItem>
              <SelectItem value={LeadStage.CONVERTED}>Converted</SelectItem>
              <SelectItem value={LeadStage.LOST}>Lost</SelectItem>
            </SelectContent>
          </Select>

          {/* Source */}
          <Select value={selectedSource} onValueChange={setSelectedSource}>
            <SelectTrigger className="h-9 w-32 text-xs">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Sources</SelectItem>
              <SelectItem value={LeadSource.WALK_IN}>Walk-In</SelectItem>
              <SelectItem value={LeadSource.WEBSITE}>Website</SelectItem>
              <SelectItem value={LeadSource.REFERRAL}>Referral</SelectItem>
              <SelectItem value={LeadSource.PHONE}>Phone</SelectItem>
              <SelectItem value={LeadSource.SOCIAL_MEDIA}>Social</SelectItem>
              <SelectItem value={LeadSource.OTHER}>Other</SelectItem>
            </SelectContent>
          </Select>

          {/* Follow-up Urgency */}
          <Select value={selectedFollowUp} onValueChange={setSelectedFollowUp}>
            <SelectTrigger className="h-9 w-32 text-xs">
              <SelectValue placeholder="Follow-Up" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Follow-ups</SelectItem>
              <SelectItem value="OVERDUE">Overdue</SelectItem>
              <SelectItem value="TODAY">Due Today</SelectItem>
              <SelectItem value="UPCOMING">Upcoming</SelectItem>
            </SelectContent>
          </Select>

          {/* Assigned Staff Filter */}
          <Select value={selectedStaff} onValueChange={setSelectedStaff}>
            <SelectTrigger className="h-9 w-32 text-xs">
              <SelectValue placeholder="Staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Staff</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {staffList.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name || s.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-9 text-xs text-slate-500 hover:text-slate-800"
            >
              <X className="h-3.5 w-3.5 mr-1" /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-50/60">
              <TableHead className="text-xs font-semibold">Prospect Details</TableHead>
              <TableHead className="text-xs font-semibold">Source</TableHead>
              <TableHead className="text-xs font-semibold">Stage</TableHead>
              <TableHead className="text-xs font-semibold">Interested Plan</TableHead>
              <TableHead className="text-xs font-semibold">Assigned Rep</TableHead>
              <TableHead className="text-xs font-semibold">Follow-Up Target</TableHead>
              <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-500 text-xs">
                  {hasActiveFilters
                    ? "No enquiries match your search and filter criteria."
                    : "No prospect enquiries recorded yet. Click '+ Add Enquiry' to begin."}
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => {
                const followUp = getFollowUpStatus(lead.followUpDate, lead.stage);

                return (
                  <TableRow
                    key={lead.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 cursor-pointer"
                    onClick={() => onSelectLead(lead)}
                  >
                    {/* Prospect Name, Phone, Email */}
                    <TableCell className="py-3">
                      <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        {lead.firstName} {lead.lastName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3 shrink-0" /> {lead.phone}
                      </div>
                      {lead.email && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Mail className="h-3 w-3 shrink-0" /> {lead.email}
                        </div>
                      )}
                    </TableCell>

                    {/* Source */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-normal capitalize text-slate-600 dark:text-slate-300"
                      >
                        {lead.source?.toLowerCase().replace(/_/g, " ")}
                      </Badge>
                    </TableCell>

                    {/* Stage */}
                    <TableCell>{getStageBadge(lead.stage)}</TableCell>

                    {/* Interested Plan */}
                    <TableCell className="text-xs">
                      {lead.interestedPlan ? (
                        <div>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {lead.interestedPlan.name}
                          </span>
                          <span className="text-[11px] text-slate-400 block font-mono">
                            ₹{Number(lead.interestedPlan.price).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </TableCell>

                    {/* Assigned Rep */}
                    <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                      {lead.assignedStaff?.name || lead.assignedStaff?.email || (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </TableCell>

                    {/* Follow-up */}
                    <TableCell>
                      {lead.followUpDate ? (
                        <div className="space-y-0.5">
                          <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                            {new Date(lead.followUpDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          {followUp && (
                            <div>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${followUp.color}`}
                              >
                                {followUp.label}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">—</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-500 hover:text-slate-800"
                          title="View Details"
                          onClick={() => onSelectLead(lead)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-indigo-600 hover:text-indigo-700"
                          title="Change Stage"
                          onClick={() => onOpenStatusChange(lead)}
                        >
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700"
                          title="Schedule Follow-Up"
                          onClick={() => onOpenScheduleFollowUp(lead)}
                        >
                          <CalendarClock className="h-3.5 w-3.5" />
                        </Button>

                        {lead.stage !== LeadStage.CONVERTED && lead.stage !== LeadStage.LOST && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            title="Convert to Member"
                            onClick={() => onOpenConvert(lead)}
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600"
                          title="Edit"
                          onClick={() => onOpenEdit(lead)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing {filteredLeads.length} of {leads.length} enquiries</span>
      </div>
    </div>
  );
}

