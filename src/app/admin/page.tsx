import * as React from "react";
import { getDatabaseSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { SystemRole } from "@prisma/client";
import { getPlatformOverviewMetrics } from "@/lib/services/platform-admin.service";
import { PlatformOverview } from "@/components/admin/platform-overview";

export default async function PlatformAdminDashboardPage() {
  const session = await getDatabaseSession();
  if (!session || session.user.role !== SystemRole.SUPER_ADMIN) {
    redirect("/login?returnUrl=/admin");
  }

  const metrics = await getPlatformOverviewMetrics(session.user.id);

  return <PlatformOverview data={metrics} />;
}

