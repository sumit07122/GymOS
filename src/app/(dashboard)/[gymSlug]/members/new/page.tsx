import * as React from "react";
import { Suspense } from "react";
import { resolveTenantContext } from "@/lib/tenant/resolver";
import { MemberForm } from "@/components/members/member-form";
import { Loader2 } from "lucide-react";

interface NewMemberPageProps {
  params: Promise<{ gymSlug: string }>;
}

function NewMemberSkeleton() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        <span>Loading member registration form...</span>
      </div>
    </div>
  );
}

async function NewMemberContent({ params }: NewMemberPageProps) {
  const { gymSlug } = await params;
  const ctx = await resolveTenantContext(gymSlug);

  return (
    <MemberForm
      gymId={ctx.gymId}
      gymSlug={gymSlug}
      mode="create"
    />
  );
}

export default function NewMemberPage(props: NewMemberPageProps) {
  return (
    <Suspense fallback={<NewMemberSkeleton />}>
      <NewMemberContent {...props} />
    </Suspense>
  );
}

