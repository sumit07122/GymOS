import * as React from "react";
import { Metadata } from "next";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { PlatformAdminNav } from "@/components/admin/platform-admin-nav";

export const metadata: Metadata = {
  title: "FIXIA Platform Administration",
  description: "Cloud management, SaaS subscriptions, and tenant security for FIXIA GymOS.",
};

export default async function PlatformAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSuperAdmin("/platform-admin");

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink flex flex-col">
      <PlatformAdminNav user={session.user} />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
