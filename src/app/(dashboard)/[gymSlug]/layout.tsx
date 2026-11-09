import * as React from "react";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { AppShell } from "@/components/dashboard/app-shell";
import { SystemRole } from "@prisma/client";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ gymSlug: string }>;
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { gymSlug } = await params;
  const session = await requireAuth(`/${gymSlug}/dashboard`);

  // Verify access to the requested gym tenant
  let currentGym: {
    id: string;
    name: string;
    slug: string;
    currency: string;
  } | null = null;

  let activeRole = "MEMBER";

  if (session.user.role === SystemRole.SUPER_ADMIN) {
    const gym = await db.gym.findFirst({
      where: {
        OR: [{ slug: gymSlug }, { id: gymSlug }],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        currency: true,
      },
    });

    if (!gym) {
      notFound();
    }

    currentGym = gym;
    activeRole = "SUPER_ADMIN";
  } else {
    const matchingRole = session.user.gymRoles.find(
      (gr) => gr.gym.slug === gymSlug || gr.gym.id === gymSlug
    );

    if (!matchingRole) {
      // User is not authorized to access this specific gym workspace
      notFound();
    }

    currentGym = {
      id: matchingRole.gym.id,
      name: matchingRole.gym.name,
      slug: matchingRole.gym.slug,
      currency: matchingRole.gym.currency,
    };
    activeRole = matchingRole.role;
  }

  // Format list of authorized gyms for the switcher
  const userGyms = session.user.gymRoles.map((gr) => ({
    id: gr.gym.id,
    name: gr.gym.name,
    slug: gr.gym.slug,
    city: gr.gym.city,
    role: gr.role as string,
  }));

  // If super admin and not explicitly in gymRoles, include current target gym
  if (
    session.user.role === SystemRole.SUPER_ADMIN &&
    !userGyms.some((g) => g.id === currentGym!.id)
  ) {
    userGyms.unshift({
      id: currentGym.id,
      name: currentGym.name,
      slug: currentGym.slug,
      city: null,
      role: "SUPER_ADMIN",
    });
  }

  return (
    <AppShell
      currentGym={currentGym}
      userGyms={userGyms}
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: activeRole,
      }}
    >
      {children}
    </AppShell>
  );
}

