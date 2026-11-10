import * as React from "react";
import { requireOwnerSession } from "@/lib/auth/guards";
import GymPaymentsPage from "@/app/(dashboard)/[gymSlug]/payments/page";

export default async function OwnerPaymentsPage() {
  const { gym } = await requireOwnerSession("/owner/payments");
  return <GymPaymentsPage params={Promise.resolve({ gymSlug: gym.slug })} />;
}
