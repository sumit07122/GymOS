/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db";
import {
  TenantContext,
  assertPermission,
  assertTenantOwnership,
} from "@/lib/tenant/context";
import { Expense, ExpenseCategory, PaymentMethod } from "@prisma/client";
import {
  ExpenseCategoryCreateInput,
  ExpenseCreateInput,
  ExpenseUpdateInput,
  ExpenseFilterParams,
} from "@/lib/validations/expense";

// ==============================================================================
// FIXIA GymOS — Expense Management Domain Errors
// ==============================================================================

export class ExpenseCategoryNotFoundError extends Error {
  constructor(id: string) {
    super(`Expense category "${id}" not found or does not belong to this gym.`);
    this.name = "ExpenseCategoryNotFoundError";
  }
}

export class ExpenseNotFoundError extends Error {
  constructor(id: string) {
    super(`Expense "${id}" not found or does not belong to this gym.`);
    this.name = "ExpenseNotFoundError";
  }
}

export class CategoryInUseError extends Error {
  constructor(name: string) {
    super(
      `Category "${name}" cannot be deleted because it has associated expense records.`
    );
    this.name = "CategoryInUseError";
  }
}

export class DuplicateCategoryError extends Error {
  constructor(name: string) {
    super(`An expense category named "${name}" already exists for this gym.`);
    this.name = "DuplicateCategoryError";
  }
}

// ==============================================================================
// Types
// ==============================================================================

export type ExpenseWithDetails = Expense & {
  category: { id: string; name: string };
  recordedByUser: { id: string; name: string | null };
  editLogs?: Array<{
    id: string;
    fieldChanged: string;
    oldValue: string | null;
    newValue: string | null;
    reason: string | null;
    createdAt: Date;
    editedByUserId: string;
  }>;
};

export type ExpenseOverview = {
  totalAllTime: number;
  totalThisMonth: number;
  totalThisYear: number;
  countThisMonth: number;
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    total: number;
    count: number;
    percentage: number;
  }>;
  paymentMethodBreakdown: Array<{
    method: PaymentMethod;
    total: number;
    count: number;
  }>;
  monthlyTotals: Array<{
    month: string; // "YYYY-MM"
    total: number;
    count: number;
  }>;
};

// ==============================================================================
// DEFAULT CATEGORIES
// ==============================================================================

const DEFAULT_CATEGORIES = [
  "Rent",
  "Electricity",
  "Equipment",
  "Maintenance",
  "Staff Salary",
  "Cleaning",
  "Marketing",
  "Other",
];

/**
 * Seeds the 8 default expense categories for a gym (idempotent — skips existing).
 */
export async function seedDefaultExpenseCategories(
  ctx: TenantContext
): Promise<ExpenseCategory[]> {
  assertPermission(ctx, "EXPENSE_WRITE");

  const existing = await db.expenseCategory.findMany({
    where: { gymId: ctx.gymId },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((c) => c.name));

  const toCreate = DEFAULT_CATEGORIES.filter((name) => !existingNames.has(name));

  if (toCreate.length === 0) return [];

  await db.expenseCategory.createMany({
    data: toCreate.map((name) => ({ gymId: ctx.gymId, name })),
    skipDuplicates: true,
  });

  return db.expenseCategory.findMany({
    where: { gymId: ctx.gymId },
    orderBy: { name: "asc" },
  });
}

// ==============================================================================
// CATEGORY MANAGEMENT
// ==============================================================================

export async function createExpenseCategory(
  ctx: TenantContext,
  input: ExpenseCategoryCreateInput
): Promise<ExpenseCategory> {
  assertPermission(ctx, "EXPENSE_WRITE");

  const existing = await db.expenseCategory.findFirst({
    where: { gymId: ctx.gymId, name: input.name.trim() },
  });
  if (existing) {
    throw new DuplicateCategoryError(input.name.trim());
  }

  return db.expenseCategory.create({
    data: { gymId: ctx.gymId, name: input.name.trim() },
  });
}

export async function listExpenseCategories(
  ctx: TenantContext
): Promise<ExpenseCategory[]> {
  assertPermission(ctx, "EXPENSE_READ");

  return db.expenseCategory.findMany({
    where: { gymId: ctx.gymId },
    orderBy: { name: "asc" },
  });
}

export async function deleteExpenseCategory(
  ctx: TenantContext,
  categoryId: string
): Promise<void> {
  assertPermission(ctx, "EXPENSE_WRITE");

  const category = await db.expenseCategory.findFirst({
    where: { id: categoryId, gymId: ctx.gymId },
  });
  if (!category) throw new ExpenseCategoryNotFoundError(categoryId);
  assertTenantOwnership(ctx, category.gymId);

  // Prevent deletion if any expense (including soft-deleted) uses this category
  const inUseCount = await db.expense.count({
    where: { categoryId, gymId: ctx.gymId },
  });
  if (inUseCount > 0) {
    throw new CategoryInUseError(category.name);
  }

  await db.expenseCategory.delete({ where: { id: categoryId } });
}

// ==============================================================================
// EXPENSE CRUD
// ==============================================================================

export async function createExpense(
  ctx: TenantContext,
  input: ExpenseCreateInput
): Promise<ExpenseWithDetails> {
  assertPermission(ctx, "EXPENSE_WRITE");

  // Validate category belongs to this gym
  const category = await db.expenseCategory.findFirst({
    where: { id: input.categoryId, gymId: ctx.gymId },
  });
  if (!category) throw new ExpenseCategoryNotFoundError(input.categoryId);

  const expense = await db.expense.create({
    data: {
      gymId: ctx.gymId,
      categoryId: input.categoryId,
      recordedByUserId: ctx.userId,
      title: input.title.trim(),
      amount: input.amount,
      expenseDate: new Date(input.expenseDate),
      paymentMethod: input.paymentMethod ?? PaymentMethod.CASH,
      vendorName: input.vendorName?.trim() || null,
      notes: input.notes?.trim() || null,
      receiptUrl: input.receiptUrl?.trim() || null,
    },
    include: {
      category: { select: { id: true, name: true } },
      recordedByUser: { select: { id: true, name: true } },
    },
  });

  return expense as ExpenseWithDetails;
}

export async function updateExpense(
  ctx: TenantContext,
  expenseId: string,
  input: ExpenseUpdateInput
): Promise<ExpenseWithDetails> {
  assertPermission(ctx, "EXPENSE_WRITE");

  const existing = await db.expense.findFirst({
    where: { id: expenseId, gymId: ctx.gymId, isDeleted: false },
    include: { category: { select: { id: true, name: true } } },
  });
  if (!existing) throw new ExpenseNotFoundError(expenseId);
  assertTenantOwnership(ctx, existing.gymId);

  // Validate new category belongs to gym if changed
  if (input.categoryId && input.categoryId !== existing.categoryId) {
    const cat = await db.expenseCategory.findFirst({
      where: { id: input.categoryId, gymId: ctx.gymId },
    });
    if (!cat) throw new ExpenseCategoryNotFoundError(input.categoryId);
  }

  // Build audit log entries for changed fields
  const auditEntries: Array<{
    gymId: string;
    expenseId: string;
    editedByUserId: string;
    fieldChanged: string;
    oldValue: string | null;
    newValue: string | null;
    reason: string | null;
  }> = [];

  const reason = input.reason?.trim() || null;

  const trackChange = (field: string, oldVal: any, newVal: any) => {
    const oldStr = oldVal !== null && oldVal !== undefined ? String(oldVal) : null;
    const newStr = newVal !== null && newVal !== undefined ? String(newVal) : null;
    if (oldStr !== newStr) {
      auditEntries.push({
        gymId: ctx.gymId,
        expenseId,
        editedByUserId: ctx.userId,
        fieldChanged: field,
        oldValue: oldStr,
        newValue: newStr,
        reason,
      });
    }
  };

  if (input.title !== undefined) trackChange("title", existing.title, input.title.trim());
  if (input.amount !== undefined) trackChange("amount", existing.amount.toString(), String(input.amount));
  if (input.expenseDate !== undefined) trackChange("expenseDate", existing.expenseDate.toISOString(), new Date(input.expenseDate).toISOString());
  if (input.categoryId !== undefined) trackChange("categoryId", existing.categoryId, input.categoryId);
  if (input.paymentMethod !== undefined) trackChange("paymentMethod", existing.paymentMethod, input.paymentMethod);
  if (input.vendorName !== undefined) trackChange("vendorName", existing.vendorName, input.vendorName.trim() || null);
  if (input.notes !== undefined) trackChange("notes", existing.notes, input.notes.trim() || null);
  if (input.receiptUrl !== undefined) trackChange("receiptUrl", existing.receiptUrl, input.receiptUrl.trim() || null);

  const updateData: Record<string, any> = {};
  if (input.title !== undefined) updateData.title = input.title.trim();
  if (input.amount !== undefined) updateData.amount = input.amount;
  if (input.expenseDate !== undefined) updateData.expenseDate = new Date(input.expenseDate);
  if (input.categoryId !== undefined) updateData.categoryId = input.categoryId;
  if (input.paymentMethod !== undefined) updateData.paymentMethod = input.paymentMethod;
  if (input.vendorName !== undefined) updateData.vendorName = input.vendorName.trim() || null;
  if (input.notes !== undefined) updateData.notes = input.notes.trim() || null;
  if (input.receiptUrl !== undefined) updateData.receiptUrl = input.receiptUrl.trim() || null;

  // Use callback-style transaction so ExpenseEditLog access is deferred (safe with mocked $transaction)
  const updated = await db.$transaction(async (tx: any) => {
    if (auditEntries.length > 0) {
      await tx.expenseEditLog.createMany({ data: auditEntries });
    }
    return tx.expense.update({
      where: { id: expenseId },
      data: updateData,
      include: {
        category: { select: { id: true, name: true } },
        recordedByUser: { select: { id: true, name: true } },
      },
    });
  });

  return updated as ExpenseWithDetails;
}

export async function getExpenseById(
  ctx: TenantContext,
  expenseId: string
): Promise<ExpenseWithDetails> {
  assertPermission(ctx, "EXPENSE_READ");

  const expense = await db.expense.findFirst({
    where: { id: expenseId, gymId: ctx.gymId, isDeleted: false },
    include: {
      category: { select: { id: true, name: true } },
      recordedByUser: { select: { id: true, name: true } },
      editLogs: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fieldChanged: true,
          oldValue: true,
          newValue: true,
          reason: true,
          createdAt: true,
          editedByUserId: true,
        },
      },
    },
  });

  if (!expense) throw new ExpenseNotFoundError(expenseId);
  assertTenantOwnership(ctx, expense.gymId);

  return expense as ExpenseWithDetails;
}

export async function getExpensesList(
  ctx: TenantContext,
  params: Partial<ExpenseFilterParams> = {}
): Promise<{ expenses: ExpenseWithDetails[]; total: number }> {
  assertPermission(ctx, "EXPENSE_READ");

  const pageNum = Number(params.page || 1);
  const limitNum = Number(params.limit || 50);
  const skip = (pageNum - 1) * limitNum;

  const where: Record<string, any> = {
    gymId: ctx.gymId,
    isDeleted: false,
  };

  if (params.categoryId) where.categoryId = params.categoryId;
  if (params.paymentMethod) where.paymentMethod = params.paymentMethod;
  if (params.dateFrom || params.dateTo) {
    where.expenseDate = {};
    if (params.dateFrom) where.expenseDate.gte = new Date(params.dateFrom);
    if (params.dateTo) where.expenseDate.lte = new Date(params.dateTo);
  }
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { vendorName: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [expenses, total] = await db.$transaction([
    db.expense.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        recordedByUser: { select: { id: true, name: true } },
      },
      orderBy: { expenseDate: "desc" },
      skip,
      take: limitNum,
    }),
    db.expense.count({ where }),
  ]);

  return { expenses: expenses as ExpenseWithDetails[], total };
}

export async function softDeleteExpense(
  ctx: TenantContext,
  expenseId: string,
  reason?: string
): Promise<void> {
  assertPermission(ctx, "EXPENSE_WRITE");

  const expense = await db.expense.findFirst({
    where: { id: expenseId, gymId: ctx.gymId, isDeleted: false },
  });
  if (!expense) throw new ExpenseNotFoundError(expenseId);
  assertTenantOwnership(ctx, expense.gymId);

  await db.$transaction(async (tx: any) => {
    await tx.expense.update({
      where: { id: expenseId },
      data: { isDeleted: true },
    });
    await tx.expenseEditLog.create({
      data: {
        gymId: ctx.gymId,
        expenseId,
        editedByUserId: ctx.userId,
        fieldChanged: "isDeleted",
        oldValue: "false",
        newValue: "true",
        reason: reason?.trim() || "Marked as deleted",
      },
    });
  });
}

// ==============================================================================
// REPORTING
// ==============================================================================

export async function getExpenseOverview(
  ctx: TenantContext
): Promise<ExpenseOverview> {
  assertPermission(ctx, "EXPENSE_READ");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const baseWhere = { gymId: ctx.gymId, isDeleted: false };

  const [allExpenses, thisMonthExpenses, thisYearExpenses, categoryGroups, paymentGroups] =
    await db.$transaction([
      db.expense.aggregate({ where: baseWhere, _sum: { amount: true }, _count: true }),
      db.expense.aggregate({
        where: { ...baseWhere, expenseDate: { gte: startOfMonth } },
        _sum: { amount: true },
        _count: true,
      }),
      db.expense.aggregate({
        where: { ...baseWhere, expenseDate: { gte: startOfYear } },
        _sum: { amount: true },
        _count: true,
      }),
      db.expense.groupBy({
        by: ["categoryId"],
        where: baseWhere,
        _sum: { amount: true },
        _count: { id: true },
        orderBy: { categoryId: "asc" },
      }),
      db.expense.groupBy({
        by: ["paymentMethod"],
        where: baseWhere,
        _sum: { amount: true },
        _count: { id: true },
        orderBy: { paymentMethod: "asc" },
      }),
    ]);

  // Fetch category names for the breakdown
  const categoryIds = categoryGroups.map((g: any) => g.categoryId);
  const categories = await db.expenseCategory.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  const totalAllTime = Number(allExpenses._sum?.amount ?? 0);

  const categoryBreakdown = (categoryGroups as any[])
    .map((g) => {
      const amt = Number(g._sum?.amount ?? 0);
      const cnt = typeof g._count === "object" && g._count !== null ? Number(g._count.id ?? 0) : Number(g._count ?? 0);
      return {
        categoryId: g.categoryId,
        categoryName: catMap.get(g.categoryId) ?? "Unknown",
        total: amt,
        count: cnt,
        percentage: totalAllTime > 0 ? Math.round((amt / totalAllTime) * 100) : 0,
      };
    })
    .sort((a, b) => b.total - a.total);

  const paymentMethodBreakdown = (paymentGroups as any[]).map((g) => {
    const amt = Number(g._sum?.amount ?? 0);
    const cnt = typeof g._count === "object" && g._count !== null ? Number(g._count.id ?? 0) : Number(g._count ?? 0);
    return {
      method: g.paymentMethod as PaymentMethod,
      total: amt,
      count: cnt,
    };
  });

  // Monthly totals for last 12 months
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const recentExpenses = await db.expense.findMany({
    where: { ...baseWhere, expenseDate: { gte: twelveMonthsAgo } },
    select: { expenseDate: true, amount: true },
  });

  const monthlyMap = new Map<string, { total: number; count: number }>();
  for (const e of recentExpenses) {
    const key = `${e.expenseDate.getFullYear()}-${String(e.expenseDate.getMonth() + 1).padStart(2, "0")}`;
    const existing = monthlyMap.get(key) ?? { total: 0, count: 0 };
    monthlyMap.set(key, {
      total: existing.total + Number(e.amount),
      count: existing.count + 1,
    });
  }
  const monthlyTotals = Array.from(monthlyMap.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    totalAllTime,
    totalThisMonth: Number(thisMonthExpenses._sum.amount ?? 0),
    totalThisYear: Number(thisYearExpenses._sum.amount ?? 0),
    countThisMonth: thisMonthExpenses._count,
    categoryBreakdown,
    paymentMethodBreakdown,
    monthlyTotals,
  };
}
