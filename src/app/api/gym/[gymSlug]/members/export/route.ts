import { NextRequest, NextResponse } from "next/server";
import { resolveTenantContext } from "@/lib/tenant/resolver";
import { exportMembersToCsv } from "@/lib/services/member.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gymSlug: string }> }
) {
  try {
    const { gymSlug } = await params;
    const ctx = await resolveTenantContext(gymSlug);

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const planId = searchParams.get("planId") || undefined;

    const csvData = await exportMembersToCsv(ctx, {
      search,
      status,
      planId,
    });

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `members-${gymSlug}-${dateStr}.csv`;

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to export members" },
      { status: 403 }
    );
  }
}
