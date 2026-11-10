import * as React from "react";
import { Suspense } from "react";
import { Metadata } from "next";
import { resolveTenantContext } from "@/lib/tenant/resolver";
import { assertPermission } from "@/lib/tenant/context";
import { getComprehensiveBusinessReport } from "@/lib/services/report.service";
import { ReportPreset } from "@/lib/validations/report";
import { ReportsHub } from "@/components/reports/reports-hub";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Reports & Business Analytics | FIXIA GymOS",
  description: "Live operational, attendance, and financial performance reports.",
};

interface ReportsPageProps {
  params: Promise<{ gymSlug: string }>;
  searchParams?: Promise<{
    preset?: string;
    startDate?: string;
    endDate?: string;
    section?: string;
  }>;
}

function ReportsSkeleton() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-slate-800" />
        <span>Aggregating real database business records and calculating metrics…</span>
      </div>
    </div>
  );
}

async function ReportsContent({ params, searchParams }: ReportsPageProps) {
  const { gymSlug } = await params;
  const ctx = await resolveTenantContext(gymSlug);
  assertPermission(ctx, "REPORT_READ");

  const query = searchParams ? await searchParams : {};
  const preset = (query.preset as ReportPreset) || "LAST_30_DAYS";

  const initialReport = await getComprehensiveBusinessReport(ctx, {
    preset,
    startDate: query.startDate,
    endDate: query.endDate,
    section: (query.section as "ALL") || "ALL",
  });

  return <ReportsHub gymSlug={gymSlug} initialData={initialReport} />;
}

export default async function ReportsPage(props: ReportsPageProps) {
  return (
    <Suspense fallback={<ReportsSkeleton />}>
      <ReportsContent {...props} />
    </Suspense>
  );
}
