import * as React from "react";
import { requireOwnerSession } from "@/lib/auth/guards";
import MemberDetailPage from "@/app/(dashboard)/[gymSlug]/members/[memberId]/page";

interface OwnerMemberDetailPageProps {
  params: Promise<{ memberId: string }>;
}

export default async function OwnerMemberDetailPage({ params }: OwnerMemberDetailPageProps) {
  const { gym } = await requireOwnerSession("/owner/members");
  const { memberId } = await params;
  return (
    <MemberDetailPage
      params={Promise.resolve({ gymSlug: gym.slug, memberId })}
    />
  );
}

