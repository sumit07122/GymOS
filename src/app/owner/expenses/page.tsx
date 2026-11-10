import * as React from "react";
import { requireOwnerSession } from "@/lib/auth/guards";
import GymExpensesPage from "@/app/(dashboard)/[gymSlug]/expenses/page";

export default async function OwnerExpensesPage() {
  const { gym } = await requireOwnerSession("/owner/expenses");
  return <GymExpensesPage params={Promise.resolve({ gymSlug: gym.slug })} />;
}
