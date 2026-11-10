import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { listSaasPlans, seedDefaultSaasPlansIfEmpty } from "@/lib/services/platform-admin.service";
import { OnboardGymForm } from "@/components/admin/onboard-gym-form";

export default async function OnboardNewGymPage() {
  const session = await requireSuperAdmin("/platform-admin/gyms/new");
  await seedDefaultSaasPlansIfEmpty();
  const plans = await listSaasPlans(session.user.id, true);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/platform-admin/gyms"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Gyms Directory</span>
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-indigo-400" />
            <span>Onboard New Gym Workspace</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manually provision tenant database context, assign owner credentials, and configure SaaS subscription limits.
          </p>
        </div>
      </div>

      <OnboardGymForm plans={plans} />
    </div>
  );
}

