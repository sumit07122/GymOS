import * as React from "react";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { getRegisteredGymsList } from "@/lib/services/platform-admin.service";
import { GymsManagement } from "@/components/admin/gyms-management";

export default async function PlatformAdminGymsPage() {
  const session = await requireSuperAdmin("/platform-admin/gyms");
  const result = await getRegisteredGymsList(session.user.id, { limit: 100 });

  return (
    <GymsManagement
      initialGyms={result.gyms}
      totalCount={result.totalCount}
    />
  );
}

