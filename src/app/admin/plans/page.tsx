import * as React from "react";
import { getDatabaseSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { SystemRole } from "@prisma/client";
import { listSaasPlans } from "@/lib/services/platform-admin.service";
import { SaasPlansManager } from "@/components/admin/saas-plans-manager";

export default async function SaasPlansPage() {
  const session = await getDatabaseSession();
  if (!session || session.user.role !== SystemRole.SUPER_ADMIN) {
    redirect("/login?returnUrl=/admin/plans");
  }

  const plans = await listSaasPlans(session.user.id, true);

  return <SaasPlansManager initialPlans={plans} />;
}

