import * as React from "react";
import { requireOwnerSession } from "@/lib/auth/guards";
import GymInventoryPage from "@/app/(dashboard)/[gymSlug]/inventory/page";

export default async function OwnerInventoryPage() {
  const { gym } = await requireOwnerSession("/owner/inventory");
  return <GymInventoryPage params={Promise.resolve({ gymSlug: gym.slug })} />;
}
