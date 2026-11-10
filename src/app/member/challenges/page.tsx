import * as React from "react";
import { requireMemberSession } from "@/lib/auth/guards";
import { getPortalDashboardData } from "@/lib/services/portal.service";
import { PortalHub } from "@/components/portal/portal-hub";

export default async function MemberChallengesPage() {
  const { session, gym } = await requireMemberSession("/member/challenges");
  const initialData = await getPortalDashboardData(
    session.user.id,
    session.user.email,
    gym.slug
  );

  return (
    <PortalHub
      initialData={{ ...initialData, userEmail: session.user.email }}
      initialTab="challenges"
    />
  );
}
