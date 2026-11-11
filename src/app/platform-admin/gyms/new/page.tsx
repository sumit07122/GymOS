/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { listSaasPlans, seedDefaultSaasPlansIfEmpty, DEFAULT_FALLBACK_PLANS } from "@/lib/services/platform-admin.service";
import { OnboardGymForm } from "@/components/admin/onboard-gym-form";
import { PageHeader } from "@/components/design-system/page-header";

export default async function OnboardNewGymPage() {
  let session;
  try {
    session = await requireSuperAdmin("/platform-admin/gyms/new");
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.warn("Auth exception in OnboardNewGymPage:", err);
    redirect("/platform-admin/login");
  }

  let plans: any = DEFAULT_FALLBACK_PLANS;
  try {
    await seedDefaultSaasPlansIfEmpty().catch(() => {});
    plans = await listSaasPlans(session.user.id, true);
  } catch (err) {
    console.warn("Could not query SaaS plans from database, using fallback plans:", err);
  }

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
