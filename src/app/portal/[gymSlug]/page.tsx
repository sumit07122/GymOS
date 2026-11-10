import * as React from "react";
import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/guards";
import { getPortalDashboardData } from "@/lib/services/portal.service";
import { PortalHub } from "@/components/portal/portal-hub";
import { SystemRole, GymRole } from "@prisma/client";
import { Loader2 } from "lucide-react";

interface PortalPageProps {
  params: Promise<{ gymSlug: string }>;
}

function PortalSkeleton() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
        <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
        <span className="font-medium">Loading your member portal...</span>
      </div>
    </div>
  );
}

async function PortalContent({ params }: PortalPageProps) {
  const { gymSlug } = await params;
  const session = await requireAuth(`/portal/${gymSlug}`);

  const isStaffOrAdmin =
    session.user.role === SystemRole.SUPER_ADMIN ||
    session.user.gymRoles.some((gr) =>
      ([GymRole.OWNER, GymRole.STAFF] as GymRole[]).includes(gr.role)
    );

  const initialData = await getPortalDashboardData(
    session.user.id,
    session.user.email,
    gymSlug
  );

  return (
    <PortalHub
      initialData={{ ...initialData, userEmail: session.user.email }}
      isStaffOrAdmin={isStaffOrAdmin}
    />
  );
}

export default async function MemberPortalPage(props: PortalPageProps) {
  return (
    <Suspense fallback={<PortalSkeleton />}>
      <PortalContent {...props} />
    </Suspense>
  );
}
