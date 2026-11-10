import * as React from "react";
import { requireOwnerSession } from "@/lib/auth/guards";
import GymLeadsPage from "@/app/(dashboard)/[gymSlug]/leads/page";

export default async function OwnerLeadsPage() {
  const { gym } = await requireOwnerSession("/owner/leads");
  return <GymLeadsPage params={Promise.resolve({ gymSlug: gym.slug })} />;
}
