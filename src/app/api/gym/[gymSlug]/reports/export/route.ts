import { NextRequest, NextResponse } from "next/server";
import { resolveTenantContext } from "@/lib/tenant/resolver";
import { generateReportCsv } from "@/lib/services/report.service";
import { ReportPreset } from "@/lib/validations/report";

const VALID_SECTIONS = [
  "ALL",
  "MEMBERSHIP",
  "ATTENDANCE",
  "FINANCIAL",
  "CRM",
  "OPERATIONS",
] as const;
type ReportSection = (typeof VALID_SECTIONS)[number];

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ gymSlug: string }> }
) {
  try {
    const { gymSlug } = await props.params;
    const ctx = await resolveTenantContext(gymSlug);

    const searchParams = request.nextUrl.searchParams;
    const preset = (searchParams.get("preset") as ReportPreset) || "LAST_30_DAYS";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const rawSection = searchParams.get("section") as ReportSection;
    const section: ReportSection = VALID_SECTIONS.includes(rawSection) ? rawSection : "ALL";

    const { filename, content } = await generateReportCsv(
      ctx,
      {
        preset,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        section,
      },
      section
    );

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate report export.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
