import * as React from "react";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { resolveTenantContext } from "@/lib/tenant/resolver";
import { db } from "@/lib/db";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { GymRole, SystemRole } from "@prisma/client";
import { Loader2 } from "lucide-react";

interface SettingsPageProps {
  params: Promise<{ gymSlug: string }>;
}

function SettingsSkeleton() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        <span>Loading settings...</span>
      </div>
    </div>
  );
}

async function SettingsContent({ params }: SettingsPageProps) {
  const { gymSlug } = await params;
  const ctx = await resolveTenantContext(gymSlug);

  // Security gate: Only Gym OWNER or SUPER_ADMIN can configure settings
  const isAuthorized =
    ctx.role === GymRole.OWNER || ctx.role === SystemRole.SUPER_ADMIN;

  if (!isAuthorized) {
    redirect(`/${gymSlug}/dashboard`);
  }

  const gym = await db.gym.findUnique({
    where: { id: ctx.gymId },
  });

  if (!gym) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Gym Business Settings
        </h1>
        <p className="text-xs text-slate-500">
          Manage your gym profile, contact details, operating schedule, and billing rules.
        </p>
      </div>

      <SettingsForm
        gym={{
          id: gym.id,
          name: gym.name,
          slug: gym.slug,
          phone: gym.phone,
          email: gym.email,
          addressLine1: gym.addressLine1,
          addressLine2: gym.addressLine2,
          city: gym.city,
          state: gym.state,
          postalCode: gym.postalCode,
          country: gym.country,
          currency: gym.currency,
          timezone: gym.timezone,
          openingHours: gym.openingHours,
          taxRate: Number(gym.taxRate),
          taxNumber: gym.taxNumber,
          logoUrl: gym.logoUrl,
        }}
      />
    </div>
  );
}

export default function SettingsPage(props: SettingsPageProps) {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsContent {...props} />
    </Suspense>
  );
}
