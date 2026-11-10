import * as React from "react";
import { Metadata } from "next";
import { requireOwnerSession } from "@/lib/auth/guards";
import { OwnerShell } from "@/components/owner/owner-shell";

export const metadata: Metadata = {
  title: "Gym Owner Portal | FIXIA GymOS",
  description: "Manage your gym members, memberships, payments, attendance, and business operations.",
};

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, gym } = await requireOwnerSession("/owner/dashboard");

  return (
    <OwnerShell
      currentGym={{
        id: gym.id,
        name: gym.name,
        slug: gym.slug,
        currency: gym.currency,
        status: gym.status,
      }}
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      }}
    >
      {children}
    </OwnerShell>
  );
}

