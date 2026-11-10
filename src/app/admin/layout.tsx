import * as React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDatabaseSession } from "@/lib/auth/session";
import { SystemRole } from "@prisma/client";
import { PlatformAdminNav } from "@/components/admin/platform-admin-nav";

export const metadata: Metadata = {
  title: "FIXIA Platform Administration",
  description: "Cloud management, SaaS subscriptions, and tenant security.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getDatabaseSession();

  // Strict SUPER_ADMIN Authorization Guard
  if (!session) {
    redirect("/login?returnUrl=/admin");
  }

  if (session.user.role !== SystemRole.SUPER_ADMIN) {
    redirect("/login?error=UnauthorizedAccess");
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <PlatformAdminNav user={session.user} />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
