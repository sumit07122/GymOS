import * as React from "react";
import { notFound } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { getGymAdminDetails } from "@/lib/services/platform-admin.service";
import { GymDetailView } from "@/components/admin/gym-detail-view";

interface PlatformAdminGymDetailPageProps {
  params: Promise<{ gymId: string }>;
}

export default async function PlatformAdminGymDetailPage(props: PlatformAdminGymDetailPageProps) {
  const session = await requireSuperAdmin("/platform-admin/gyms");
  const { gymId } = await props.params;

  let details;
  try {
    details = await getGymAdminDetails(session.user.id, gymId);
  } catch {
    notFound();
  }

  return <GymDetailView data={details} />;
}
