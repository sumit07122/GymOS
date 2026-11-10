import * as React from "react";
import { getDatabaseSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { SystemRole } from "@prisma/client";
import { getGymAdminDetails } from "@/lib/services/platform-admin.service";
import { GymDetailView } from "@/components/admin/gym-detail-view";

interface GymAdminDetailPageProps {
  params: Promise<{ gymId: string }>;
}

export default async function GymAdminDetailPage(props: GymAdminDetailPageProps) {
  const session = await getDatabaseSession();
  if (!session || session.user.role !== SystemRole.SUPER_ADMIN) {
    redirect("/login?returnUrl=/admin/gyms");
  }

  const { gymId } = await props.params;

  let details;
  try {
    details = await getGymAdminDetails(session.user.id, gymId);
  } catch {
    notFound();
  }

  return <GymDetailView data={details} />;
}
