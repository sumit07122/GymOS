import * as React from "react";
import { getDatabaseSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { SystemRole } from "@prisma/client";
import { getPlatformAuditLogs } from "@/lib/services/platform-admin.service";
import { PlatformAuditTable } from "@/components/admin/platform-audit-table";

export default async function PlatformAuditLogsPage() {
  const session = await getDatabaseSession();
  if (!session || session.user.role !== SystemRole.SUPER_ADMIN) {
    redirect("/login?returnUrl=/admin/audit");
  }

  const logs = await getPlatformAuditLogs(session.user.id, { limit: 100 });

  return <PlatformAuditTable initialLogs={logs} />;
}
