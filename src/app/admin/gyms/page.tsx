import * as React from "react";
import { getDatabaseSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { SystemRole } from "@prisma/client";
import { getRegisteredGymsList } from "@/lib/services/platform-admin.service";
import { GymsManagement } from "@/components/admin/gyms-management";

export default async function GymsManagementPage() {
  const session = await getDatabaseSession();
  if (!session || session.user.role !== SystemRole.SUPER_ADMIN) {
    redirect("/login?returnUrl=/admin/gyms");
  }

  const result = await getRegisteredGymsList(session.user.id, { limit: 100 });

  return (
    <GymsManagement
      initialGyms={result.gyms}
      totalCount={result.totalCount}
    />
  );
}
