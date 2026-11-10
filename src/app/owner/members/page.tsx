/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { requireOwnerSession } from "@/lib/auth/guards";
import GymMembersPage from "@/app/(dashboard)/[gymSlug]/members/page";

interface OwnerMembersPageProps {
  searchParams: Promise<any>;
}

export default async function OwnerMembersPage({ searchParams }: OwnerMembersPageProps) {
  const { gym } = await requireOwnerSession("/owner/members");
  return <GymMembersPage params={Promise.resolve({ gymSlug: gym.slug })} searchParams={searchParams} />;
}

