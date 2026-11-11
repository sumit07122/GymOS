import * as React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
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
  let session;
  try {
    session = await requireSuperAdmin("/platform-admin");
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.warn("Auth exception in PlatformAdminLayout, redirecting to login:", err);
    redirect("/platform-admin/login");
  }

  return (
    <div className="min-h-screen bg-[#F7FAF8] font-sans text-[#171C19] flex flex-col">
      <PlatformAdminNav user={session.user} />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
