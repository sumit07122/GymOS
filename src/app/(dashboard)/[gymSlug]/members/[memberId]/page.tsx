import * as React from "react";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { resolveTenantContext } from "@/lib/tenant/resolver";
import { getMemberById, MemberNotFoundError } from "@/lib/services/member.service";
import { MemberProfile } from "@/components/members/member-profile";
import { Loader2 } from "lucide-react";

interface MemberDetailPageProps {
  params: Promise<{ gymSlug: string; memberId: string }>;
}

function MemberDetailSkeleton() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        <span>Loading member profile & operational history...</span>
      </div>
    </div>
  );
}

async function MemberDetailContent({ params }: MemberDetailPageProps) {
  const { gymSlug, memberId } = await params;
  const ctx = await resolveTenantContext(gymSlug);

  let member;
  try {
    member = await getMemberById(ctx, memberId);
  } catch (err: unknown) {
    if (err instanceof MemberNotFoundError) {
      notFound();
    }
    throw err;
  }

  return (
    <MemberProfile
      gymId={ctx.gymId}
      gymSlug={gymSlug}
      currency={member.currency}
      member={member}
    />
  );
}

export default function MemberDetailPage(props: MemberDetailPageProps) {
  return (
    <Suspense fallback={<MemberDetailSkeleton />}>
      <MemberDetailContent {...props} />
    </Suspense>
  );
}
