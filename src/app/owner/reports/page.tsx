/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { requireOwnerSession } from "@/lib/auth/guards";
import GymReportsPage from "@/app/(dashboard)/[gymSlug]/reports/page";

interface OwnerReportsPageProps {
  searchParams: Promise<any>;
}

export default async function OwnerReportsPage({ searchParams }: OwnerReportsPageProps) {
  const { gym } = await requireOwnerSession("/owner/reports");
  return <GymReportsPage params={Promise.resolve({ gymSlug: gym.slug })} searchParams={searchParams} />;
}

