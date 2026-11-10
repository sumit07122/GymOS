import * as React from "react";
import { requireOwnerSession } from "@/lib/auth/guards";
import GymDashboardPage from "@/app/(dashboard)/[gymSlug]/dashboard/page";

interface OwnerDashboardPageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function OwnerDashboardPage({ searchParams }: OwnerDashboardPageProps) {
  const { gym } = await requireOwnerSession("/owner/dashboard");
  return <GymDashboardPage params={Promise.resolve({ gymSlug: gym.slug })} searchParams={searchParams} />;
}
