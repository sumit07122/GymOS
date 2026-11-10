import * as React from "react";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { resolveTenantContext } from "@/lib/tenant/resolver";
import { db } from "@/lib/db";
import { GymRole, SystemRole } from "@prisma/client";
import { Loader2 } from "lucide-react";
import {
  getOrCreateWhatsAppConfig,
  getWhatsAppTemplates,
  getMemberConsentDirectory,
  getWhatsAppNotificationHistory,
} from "@/lib/services/whatsapp.service";
import { WhatsAppHub } from "@/components/whatsapp/whatsapp-hub";

interface WhatsAppPageProps {
  params: Promise<{ gymSlug: string }>;
}

function WhatsAppSkeleton() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        <span>Loading WhatsApp Business notifications...</span>
      </div>
    </div>
  );
}

async function WhatsAppContent({ params }: WhatsAppPageProps) {
  const { gymSlug } = await params;
  const ctx = await resolveTenantContext(gymSlug);

  // Security gate: Gym OWNER, STAFF, or SUPER_ADMIN
  const isAuthorized =
    ctx.role === GymRole.OWNER ||
    ctx.role === GymRole.STAFF ||
    ctx.role === SystemRole.SUPER_ADMIN;

  if (!isAuthorized) {
    redirect(`/${gymSlug}/dashboard`);
  }

  const gym = await db.gym.findUnique({
    where: { id: ctx.gymId },
    select: {
      id: true,
      name: true,
      slug: true,
      phone: true,
    },
  });

  if (!gym) {
    notFound();
  }

  // Load configuration, templates, consent directory, and recent history
  const [config, templates, consentData, historyData] = await Promise.all([
    getOrCreateWhatsAppConfig(ctx),
    getWhatsAppTemplates(ctx),
    getMemberConsentDirectory(ctx, { page: 1, limit: 20 }),
    getWhatsAppNotificationHistory(ctx, { page: 1, limit: 25 }),
  ]);

  return (
    <WhatsAppHub
      gym={gym}
      config={config}
      templates={templates}
      consentData={consentData}
      historyData={historyData}
    />
  );
}

export default function WhatsAppPage(props: WhatsAppPageProps) {
  return (
    <Suspense fallback={<WhatsAppSkeleton />}>
      <WhatsAppContent {...props} />
    </Suspense>
  );
}

