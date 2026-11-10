import * as React from "react";
import { requireOwnerSession } from "@/lib/auth/guards";
import EditMemberPage from "@/app/(dashboard)/[gymSlug]/members/[memberId]/edit/page";

interface OwnerEditMemberPageProps {
  params: Promise<{ memberId: string }>;
}

export default async function OwnerEditMemberPage({ params }: OwnerEditMemberPageProps) {
  const { gym } = await requireOwnerSession("/owner/members");
  const { memberId } = await params;
  return (
    <EditMemberPage
      params={Promise.resolve({ gymSlug: gym.slug, memberId })}
    />
  );
}

