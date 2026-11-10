import * as React from "react";
import { requireOwnerSession } from "@/lib/auth/guards";
import GymMembershipsPage from "@/app/(dashboard)/[gymSlug]/memberships/page";

export default async function OwnerMembershipsPage() {
  const { gym } = await requireOwnerSession("/owner/memberships");
  return <GymMembershipsPage params={Promise.resolve({ gymSlug: gym.slug })} />;
}
