import * as React from "react";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { getPlatformOverviewMetrics } from "@/lib/services/platform-admin.service";
import { PlatformOverview } from "@/components/admin/platform-overview";

export default async function PlatformAdminDashboardPage() {
  const session = await requireSuperAdmin("/platform-admin");
  const metrics = await getPlatformOverviewMetrics(session.user.id);

  return <PlatformOverview data={metrics} />;
}

