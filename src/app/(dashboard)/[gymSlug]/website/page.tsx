import * as React from "react";
import { Suspense } from "react";
import { resolveTenantContext } from "@/lib/tenant/resolver";
import { getOrCreateGymWebsiteConfig } from "@/lib/services/website.service";
import { WebsiteOwnerControls } from "@/components/website/website-owner-controls";
import { Loader2 } from "lucide-react";

interface WebsiteSettingsPageProps {
  params: Promise<{ gymSlug: string }>;
}

function WebsiteSkeleton() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span>Loading website builder and branding controls...</span>
      </div>
    </div>
  );
}

async function WebsiteContent({ params }: WebsiteSettingsPageProps) {
  const { gymSlug } = await params;
  const ctx = await resolveTenantContext(gymSlug);
  const { gym, config } = await getOrCreateGymWebsiteConfig(ctx);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Public Website & Branding
        </h1>
        <p className="text-xs text-slate-500">
          Customize your gym&apos;s public website, hero banner, amenities, gallery, and color accents.
        </p>
      </div>

      <WebsiteOwnerControls gym={gym} initialConfig={config} />
    </div>
  );
}

export default async function WebsiteSettingsPage(props: WebsiteSettingsPageProps) {
  return (
    <Suspense fallback={<WebsiteSkeleton />}>
      <WebsiteContent {...props} />
    </Suspense>
  );
}
