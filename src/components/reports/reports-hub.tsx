"use client";

import * as React from "react";
import { ReportFilterInput, ReportPreset } from "@/lib/validations/report";
import { getReportDataAction, exportReportCsvAction } from "@/lib/actions/report";
import { ReportsFilterBar } from "@/components/reports/reports-filter-bar";
import { ReportsSummaryBanner } from "@/components/reports/reports-summary-banner";
import { FinancialReportSection } from "@/components/reports/financial-report-section";
import { MembershipReportSection } from "@/components/reports/membership-report-section";
import { AttendanceReportSection } from "@/components/reports/attendance-report-section";
import { CrmReportSection } from "@/components/reports/crm-report-section";
import { OperationsReportSection } from "@/components/reports/operations-report-section";
import { RefreshCw, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/design-system/page-header";
import type { getComprehensiveBusinessReport } from "@/lib/services/report.service";

export type MasterReportData = Awaited<ReturnType<typeof getComprehensiveBusinessReport>>;

interface ReportsHubProps {
  gymSlug: string;
  initialData: MasterReportData;
}

export function ReportsHub({ gymSlug, initialData }: ReportsHubProps) {
  const [data, setData] = React.useState<MasterReportData>(initialData);
  const [activeSection, setActiveSection] = React.useState<string>("ALL");
  const [preset, setPreset] = React.useState<ReportPreset>(initialData.filter.preset);
  const [customRange, setCustomRange] = React.useState<{ start: string; end: string }>({
    start: initialData.filter.startDate,
    end: initialData.filter.endDate,
  });
  const [isPending, startTransition] = React.useTransition();
  const [isExporting, setIsExporting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const fetchReport = (filterParams: ReportFilterInput) => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await getReportDataAction(gymSlug, filterParams);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setErrorMessage(res.error || "Failed to load report data.");
      }
    });
  };

  const handlePresetChange = (newPreset: ReportPreset) => {
    setPreset(newPreset);
    fetchReport({
      preset: newPreset,
      startDate: newPreset === "CUSTOM" ? customRange.start : undefined,
      endDate: newPreset === "CUSTOM" ? customRange.end : undefined,
      section: activeSection as ReportFilterInput["section"],
    });
  };

  const handleCustomDateChange = (start: string, end: string) => {
    setPreset("CUSTOM");
    setCustomRange({ start, end });
    fetchReport({
      preset: "CUSTOM",
      startDate: start,
      endDate: end,
      section: activeSection as ReportFilterInput["section"],
    });
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const res = await exportReportCsvAction(
        gymSlug,
        {
          preset,
          startDate: preset === "CUSTOM" ? customRange.start : undefined,
          endDate: preset === "CUSTOM" ? customRange.end : undefined,
          section: activeSection as ReportFilterInput["section"],
        },
        activeSection
      );

      if (res.success && res.content && res.filename) {
        const blob = new Blob([res.content], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", res.filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        alert(res.error || "Failed to export report CSV.");
      }
    } catch {
      alert("Failed to initiate CSV download.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Print-Only Header */}
      <div className="hidden print:block pb-4 mb-4 border-b border-line">
        <h1 className="text-xl font-black text-ink tracking-tight">
          {data.gym.name} — Business & Operational Report
        </h1>
        <p className="text-xs text-muted mt-1">
          Period: <strong>{data.filter.label}</strong> ({data.filter.startDate.split("T")[0]} to{" "}
          {data.filter.endDate.split("T")[0]}) &bull; Currency: {data.gym.currency} &bull; Generated:{" "}
          {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Screen Header */}
      <div className="print:hidden">
        <PageHeader
          title="Business Analytics & Reports"
          description="Verified database analytics for financial performance, membership retention, member attendance, and operations."
          actions={
            isPending ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-pine bg-pine-soft px-3 py-1.5 rounded-lg">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Computing Metrics...</span>
              </div>
            ) : undefined
          }
        />
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 print:hidden">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter Bar */}
      <ReportsFilterBar
        preset={preset}
        onPresetChange={handlePresetChange}
        startDate={data.filter.startDate}
        endDate={data.filter.endDate}
        onCustomDateChange={handleCustomDateChange}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onExportCsv={handleExportCsv}
        isExporting={isExporting}
      />

      {/* Executive Summary Banner */}
      <ReportsSummaryBanner
        currency={data.gym.currency}
        periodLabel={data.filter.label}
        data={{
          membership: data.membership,
          attendance: data.attendance,
          financial: data.financial,
          crm: data.crm,
        }}
      />

      {/* Tab Sections */}
      <div className="space-y-8">
        {(activeSection === "ALL" || activeSection === "FINANCIAL") && (
          <FinancialReportSection
            data={data.financial}
            currency={data.gym.currency}
          />
        )}

        {(activeSection === "ALL" || activeSection === "MEMBERSHIP") && (
          <MembershipReportSection
            data={data.membership}
          />
        )}

        {(activeSection === "ALL" || activeSection === "ATTENDANCE") && (
          <AttendanceReportSection
            data={data.attendance}
          />
        )}

        {(activeSection === "ALL" || activeSection === "CRM") && (
          <CrmReportSection
            data={data.crm}
          />
        )}

        {(activeSection === "ALL" || activeSection === "OPERATIONS") && (
          <OperationsReportSection
            data={data.operations}
          />
        )}
      </div>
    </div>
  );
}
