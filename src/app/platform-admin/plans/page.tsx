import * as React from "react";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { listSaasPlans, seedDefaultSaasPlansIfEmpty } from "@/lib/services/platform-admin.service";
import { SaasPlansManager } from "@/components/admin/saas-plans-manager";

export default async function PlatformAdminPlansPage() {
  const session = await requireSuperAdmin("/platform-admin/plans");
  await seedDefaultSaasPlansIfEmpty();
  const plans = await listSaasPlans(session.user.id, true);

  return <SaasPlansManager initialPlans={plans} />;
}

