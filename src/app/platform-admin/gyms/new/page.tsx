import * as React from "react";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { listSaasPlans, seedDefaultSaasPlansIfEmpty } from "@/lib/services/platform-admin.service";
import { OnboardGymForm } from "@/components/admin/onboard-gym-form";
import { PageHeader } from "@/components/design-system/page-header";

export default async function OnboardNewGymPage() {
  const session = await requireSuperAdmin("/platform-admin/gyms/new");
  await seedDefaultSaasPlansIfEmpty();
  const plans = await listSaasPlans(session.user.id, true);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboard New Gym Workspace"
        description="Provision an isolated multi-tenant database boundary, assign gym owner credentials, configure SaaS commercial pricing, and grant module entitlements."
        breadcrumbs={[
          { label: "Overview", href: "/platform-admin" },
          { label: "Gyms", href: "/platform-admin/gyms" },
          { label: "Onboard Workspace" },
        ]}
      />

      <OnboardGymForm plans={plans} />
    </div>
  );
}
