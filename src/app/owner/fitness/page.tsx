import * as React from "react";
import { requireOwnerSession } from "@/lib/auth/guards";
import GymWorkoutsPage from "@/app/(dashboard)/[gymSlug]/workouts/page";

export default async function OwnerFitnessPage() {
  const { gym } = await requireOwnerSession("/owner/fitness");
  return <GymWorkoutsPage params={Promise.resolve({ gymSlug: gym.slug })} />;
}

