"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReportPreset } from "@/lib/validations/report";
import {
  Calendar,
  Download,
  Printer,
  Filter,
} from "lucide-react";

interface ReportsFilterBarProps {
  preset: ReportPreset;
  onPresetChange: (preset: ReportPreset) => void;
  startDate: string;
  endDate: string;
  onCustomDateChange: (start: string, end: string) => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onExportCsv: () => void;
  isExporting?: boolean;
}

const PRESETS: Array<{ id: ReportPreset; label: string }> = [
  { id: "TODAY", label: "Today" },
  { id: "LAST_7_DAYS", label: "Last 7 Days" },
  { id: "LAST_30_DAYS", label: "Last 30 Days" },
  { id: "CURRENT_MONTH", label: "This Month" },
  { id: "PREVIOUS_MONTH", label: "Last Month" },
  { id: "CUSTOM", label: "Custom Range" },
];

const SECTIONS = [
  { id: "ALL", label: "Overview & KPI" },
  { id: "FINANCIAL", label: "Financial P&L" },
  { id: "MEMBERSHIP", label: "Memberships" },
  { id: "ATTENDANCE", label: "Attendance" },
  { id: "CRM", label: "Leads & CRM" },
  { id: "OPERATIONS", label: "Operations" },
];

export function ReportsFilterBar({
  preset,
  onPresetChange,
  startDate,
  endDate,
  onCustomDateChange,
  activeSection,
  onSectionChange,
  onExportCsv,
  isExporting,
}: ReportsFilterBarProps) {
  const [customStart, setCustomStart] = React.useState(startDate.split("T")[0] || "");
  const [customEnd, setCustomEnd] = React.useState(endDate.split("T")[0] || "");

  const handleApplyCustom = () => {
    if (customStart && customEnd) {
      onCustomDateChange(customStart, customEnd);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 print:hidden">
      {/* Top Bar: Preset Pills and Export Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => onPresetChange(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                preset === p.id
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs border-slate-300 text-slate-700 hover:bg-slate-50 gap-1.5 h-8"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </Button>

          <Button
            size="sm"
            onClick={onExportCsv}
            disabled={isExporting}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-8 shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isExporting ? "Generating CSV..." : "Export CSV"}</span>
          </Button>
        </div>
      </div>

      {/* Custom Date Range Selector (Visible when CUSTOM selected) */}
      {preset === "CUSTOM" && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50">
          <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Custom Date Range:</span>
          </span>
          <Input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="h-8 w-36 text-xs bg-white"
          />
          <span className="text-xs text-slate-400">to</span>
          <Input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="h-8 w-36 text-xs bg-white"
          />
          <Button
            size="sm"
            onClick={handleApplyCustom}
            className="h-8 text-xs bg-slate-900 text-white hover:bg-slate-800"
          >
            Apply
          </Button>
        </div>
      )}

      {/* Section View Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-1">
        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            onClick={() => onSectionChange(sec.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeSection === sec.id
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/40 rounded-t-lg"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Filter className="h-3 w-3" />
            <span>{sec.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

