import * as React from "react";
import { requireOwnerSession } from "@/lib/auth/guards";
import GymSettingsPage from "@/app/(dashboard)/[gymSlug]/settings/page";

export default async function OwnerSettingsPage() {
  const { gym } = await requireOwnerSession("/owner/settings");
  return <GymSettingsPage params={Promise.resolve({ gymSlug: gym.slug })} />;
}
