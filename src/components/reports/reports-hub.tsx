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
import { BarChart3, RefreshCw, AlertCircle } from "lucide-react";

interface MasterReportData {
  gym: {
    name: string;
    currency: string;
    timezone: string;
  };
  filter: {
    preset: ReportPreset;
    label: string;
    startDate: string;
    endDate: string;
  };
  membership: {
    totalMembers: number;
    activeMembers: number;
    inactiveMembers: number;
    expiredMemberships: number;
    newMemberships: number;
    renewals: number;
    totalJoinedInRange: number;
    planDistribution: Array<{
      planId: string;
      planName: string;
      activeCount: number;
    }>;
  };
  attendance: {
    totalCheckIns: number;
    uniqueAttendees: number;
    averageDailyAttendance: number;
    attendanceTrends: Array<{
      date: string;
      checkIns: number;
      uniqueMembers: number;
    }>;
    hourlyDistribution: Array<{
      hour: number;
      label: string;
      checkIns: number;
    }>;
    peakHours: Array<{
      hour: number;
      count: number;
      label: string;
    }>;
    frequencyBreakdown: {
      visits1to2: number;
      visits3to5: number;
      visits6Plus: number;
    };
  };
  financial: {
    invoicedAmount: number;
    paymentsCollected: number;
    totalRefunds: number;
    totalAdjustments: number;
    netRevenue: number;
    totalExpenses: number;
    netOperatingIncome: number;
    totalOutstandingDues: number;
    paymentMethodBreakdown: Array<{
      method: string;
      total: number;
      count: number;
    }>;
    expenseCategoryBreakdown: Array<{
      category: string;
      amount: number;
    }>;
  };
  crm: {
    totalEnquiries: number;
    convertedLeads: number;
    lostLeads: number;
    activeLeads: number;
    conversionRate: number;
    enquirySources: Array<{
      source: string;
      count: number;
      converted: number;
      conversionRate: number;
    }>;
    stageDistribution: Array<{
      stage: string;
      count: number;
    }>;
  };
  operations: {
    totalBookings: number;
    attendedBookings: number;
    cancelledBookings: number;
    totalClassCapacity: number;
    totalClassBooked: number;
    bookingUtilization: number;
    stockMovements: Array<{
      type: string;
      quantity: number;
      transactions: number;
    }>;
    lowStockCount: number;
    lowStockItems: Array<{
      id: string;
      name: string;
      sku: string;
      currentStock: number;
      reorderPoint: number | null;
    }>;
  };
}

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
      <div className="hidden print:block pb-4 mb-4 border-b border-slate-300">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          {data.gym.name} — Business & Operational Report
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Period: <strong>{data.filter.label}</strong> ({data.filter.startDate.split("T")[0]} to{" "}
          {data.filter.endDate.split("T")[0]}) • Currency: {data.gym.currency} • Generated:{" "}
          {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span className="p-1.5 rounded-xl bg-slate-900 text-white">
                <BarChart3 className="h-5 w-5" />
              </span>
              <span>Reports & Business Analytics</span>
            </h1>
            {isPending && (
              <RefreshCw className="h-4 w-4 text-slate-400 animate-spin" />
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real database analytics for financial performance, membership retention, member attendance, and gym operations.
          </p>
        </div>
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

      {/* Content View Based on Active Tab */}
      <div className={`space-y-8 ${isPending ? "opacity-60 transition-opacity" : ""}`}>
        {activeSection === "ALL" && (
          <div className="space-y-10">
            {/* Financial P&L Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="text-base font-bold text-slate-900">
                  1. Financial Performance & Operating P&L
                </h2>
                <span className="text-xs text-slate-400">Accrual vs Cash Accounting</span>
              </div>
              <FinancialReportSection
                currency={data.gym.currency}
                data={data.financial}
              />
            </div>

            {/* Membership Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="text-base font-bold text-slate-900">
                  2. Membership Growth & Plan Distribution
                </h2>
                <span className="text-xs text-slate-400">Member Retention & Acquisition</span>
              </div>
              <MembershipReportSection data={data.membership} />
            </div>

            {/* Attendance Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="text-base font-bold text-slate-900">
                  3. Facility Attendance & Peak Hours
                </h2>
                <span className="text-xs text-slate-400">Traffic Patterns & Visit Frequency</span>
              </div>
              <AttendanceReportSection data={data.attendance} />
            </div>

            {/* CRM & Leads Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="text-base font-bold text-slate-900">
                  4. Lead Acquisition & CRM Funnel
                </h2>
                <span className="text-xs text-slate-400">Channel Attribution & Conversion</span>
              </div>
              <CrmReportSection data={data.crm} />
            </div>

            {/* Operations Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="text-base font-bold text-slate-900">
                  5. Class Schedules & Inventory Operations
                </h2>
                <span className="text-xs text-slate-400">Capacity Utilization & Stock Alert</span>
              </div>
              <OperationsReportSection data={data.operations} />
            </div>
          </div>
        )}

        {activeSection === "FINANCIAL" && (
          <FinancialReportSection
            currency={data.gym.currency}
            data={data.financial}
          />
        )}

        {activeSection === "MEMBERSHIP" && (
          <MembershipReportSection data={data.membership} />
        )}

        {activeSection === "ATTENDANCE" && (
          <AttendanceReportSection data={data.attendance} />
        )}

        {activeSection === "CRM" && (
          <CrmReportSection data={data.crm} />
        )}

        {activeSection === "OPERATIONS" && (
          <OperationsReportSection data={data.operations} />
        )}
      </div>
    </div>
  );
}
