import * as React from "react";
import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/guards";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { Loader2 } from "lucide-react";

function OnboardingSkeleton() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        <span>Loading onboarding setup...</span>
      </div>
    </div>
  );
}

async function OnboardingContent() {
  const session = await requireAuth("/onboarding");

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <OnboardingWizard
        user={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        }}
      />
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingSkeleton />}>
      <OnboardingContent />
    </Suspense>
  );
}
