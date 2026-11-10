import * as React from "react";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { getPlatformAuditLogs } from "@/lib/services/platform-admin.service";
import { PlatformAuditTable } from "@/components/admin/platform-audit-table";

export default async function PlatformAdminAuditLogsPage() {
  const session = await requireSuperAdmin("/platform-admin/audit-logs");
  const logs = await getPlatformAuditLogs(session.user.id, { limit: 100 });

  return <PlatformAuditTable initialLogs={logs} />;
}
