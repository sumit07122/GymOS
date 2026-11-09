import * as React from "react";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { resolveTenantContext } from "@/lib/tenant/resolver";
import { getMemberById, MemberNotFoundError } from "@/lib/services/member.service";
import { MemberForm } from "@/components/members/member-form";
import { Loader2 } from "lucide-react";

interface EditMemberPageProps {
  params: Promise<{ gymSlug: string; memberId: string }>;
}

function EditMemberSkeleton() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        <span>Loading member editor...</span>
      </div>
    </div>
  );
}

async function EditMemberContent({ params }: EditMemberPageProps) {
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
    <MemberForm
      gymId={ctx.gymId}
      gymSlug={gymSlug}
      mode="edit"
      initialData={{
        id: member.id,
        memberCode: member.memberCode,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone,
        photoUrl: member.photoUrl,
        address: member.address,
        gender: member.gender,
        dateOfBirth: member.dateOfBirth,
        emergencyContactName: member.emergencyContactName,
        emergencyContactPhone: member.emergencyContactPhone,
        joiningDate: member.joiningDate,
        medicalNotes: member.medicalNotes,
        internalNotes: member.internalNotes,
        status: member.status,
      }}
    />
  );
}

export default function EditMemberPage(props: EditMemberPageProps) {
  return (
    <Suspense fallback={<EditMemberSkeleton />}>
      <EditMemberContent {...props} />
    </Suspense>
  );
}
