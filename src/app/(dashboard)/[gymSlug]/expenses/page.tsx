import * as React from "react";
import { Suspense } from "react";
import { resolveTenantContext } from "@/lib/tenant/resolver";
import {
  getExpensesList,
  getExpenseOverview,
  listExpenseCategories,
} from "@/lib/services/expense.service";
import { ExpensesHub } from "@/components/expenses/expenses-hub";
import { Loader2 } from "lucide-react";
import { GymRole, SystemRole } from "@prisma/client";
import { db } from "@/lib/db";

interface ExpensesPageProps {
  params: Promise<{ gymSlug: string }>;
}

function ExpensesSkeleton() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span>Loading expense records and financial analysis…</span>
      </div>
    </div>
  );
}

async function ExpensesContent({ params }: ExpensesPageProps) {
  const { gymSlug } = await params;
  const ctx = await resolveTenantContext(gymSlug);

  const [categories, expensesResult, overview, gym] = await Promise.all([
    listExpenseCategories(ctx),
    getExpensesList(ctx, { limit: 100 }),
    getExpenseOverview(ctx),
    db.gym.findUnique({
      where: { id: ctx.gymId },
      select: { id: true, name: true, currency: true },
    }),
  ]);

  const isOwner =
    ctx.role === GymRole.OWNER || ctx.role === SystemRole.SUPER_ADMIN;

  return (
    <ExpensesHub
      expenses={expensesResult.expenses}
      categories={categories}
      overview={overview}
      gymId={ctx.gymId}
      gymSlug={gymSlug}
      isOwner={isOwner}
      currency={gym?.currency ?? "INR"}
    />
  );
}

export default function ExpensesPage({ params }: ExpensesPageProps) {
  return (
    <Suspense fallback={<ExpensesSkeleton />}>
      <ExpensesContent params={params} />
    </Suspense>
  );
}

