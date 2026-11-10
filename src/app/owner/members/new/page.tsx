import * as React from "react";
import { requireOwnerSession } from "@/lib/auth/guards";
import NewMemberPage from "@/app/(dashboard)/[gymSlug]/members/new/page";

export default async function OwnerNewMemberPage() {
  const { gym } = await requireOwnerSession("/owner/members/new");
  return <NewMemberPage params={Promise.resolve({ gymSlug: gym.slug })} />;
}

