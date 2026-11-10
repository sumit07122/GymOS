"use server";

import { resolveTenantContext } from "@/lib/tenant/resolver";
import {
  getComprehensiveBusinessReport,
  generateReportCsv,
} from "@/lib/services/report.service";
import {
  reportFilterSchema,
  ReportFilterInput,
} from "@/lib/validations/report";

// ==============================================================================
// FIXIA GymOS — Reports & Business Analytics Server Actions (M18)
// ==============================================================================

export async function getReportDataAction(
  gymSlug: string,
  filterInput: ReportFilterInput
) {
  try {
    const ctx = await resolveTenantContext(gymSlug);
    const parsed = reportFilterSchema.parse(filterInput);
    const data = await getComprehensiveBusinessReport(ctx, parsed);

    return {
      success: true,
      data,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load report data.";
    return {
      success: false,
      error: message,
    };
  }
}

export async function exportReportCsvAction(
  gymSlug: string,
  filterInput: ReportFilterInput,
  section = "ALL"
) {
  try {
    const ctx = await resolveTenantContext(gymSlug);
    const parsed = reportFilterSchema.parse(filterInput);
    const result = await generateReportCsv(ctx, parsed, section);

    return {
      success: true,
      filename: result.filename,
      content: result.content,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to export report CSV.";
    return {
      success: false,
      error: message,
    };
  }
}
