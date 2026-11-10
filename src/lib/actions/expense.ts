/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import { requireGymAccess } from "@/lib/auth/guards";
import { GymRole, PaymentMethod } from "@prisma/client";
import {
  createExpense,
  updateExpense,
  softDeleteExpense,
  createExpenseCategory,
  deleteExpenseCategory,
  seedDefaultExpenseCategories,
} from "@/lib/services/expense.service";
import {
  expenseCreateSchema,
  expenseUpdateSchema,
  expenseCategoryCreateSchema,
} from "@/lib/validations/expense";

export interface ExpenseActionState {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
  data?: any;
}

// ==============================================================================
// CREATE EXPENSE
// ==============================================================================
export async function createExpenseAction(
  _prevState: ExpenseActionState | null,
  formData: FormData
): Promise<ExpenseActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) return { success: false, error: "Missing gym workspace identifier." };

    const { context } = await requireGymAccess(gymId, [GymRole.OWNER, GymRole.STAFF]);

    const rawData = {
      categoryId: formData.get("categoryId")?.toString() || "",
      title: formData.get("title")?.toString() || "",
      amount: formData.get("amount")?.toString() || "0",
      expenseDate: formData.get("expenseDate")?.toString() || "",
      paymentMethod:
        (formData.get("paymentMethod")?.toString() as PaymentMethod) ||
        PaymentMethod.CASH,
      vendorName: formData.get("vendorName")?.toString() || undefined,
      notes: formData.get("notes")?.toString() || undefined,
      receiptUrl: formData.get("receiptUrl")?.toString() || undefined,
    };

    const parsed = expenseCreateSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString();
        if (key) fieldErrors[key] = issue.message;
      }
      return { success: false, error: "Validation failed.", fieldErrors };
    }

    const expense = await createExpense(context, parsed.data);
    if (gymSlug) revalidatePath(`/${gymSlug}/expenses`);

    return { success: true, message: "Expense recorded successfully.", data: { id: expense.id } };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to create expense." };
  }
}

// ==============================================================================
// UPDATE EXPENSE
// ==============================================================================
export async function updateExpenseAction(
  _prevState: ExpenseActionState | null,
  formData: FormData
): Promise<ExpenseActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();
    const expenseId = formData.get("expenseId")?.toString();

    if (!gymId || !expenseId)
      return { success: false, error: "Missing required identifiers." };

    const { context } = await requireGymAccess(gymId, [GymRole.OWNER, GymRole.STAFF]);

    const rawData: Record<string, any> = { reason: formData.get("reason")?.toString() || "" };

    const fields = ["categoryId", "title", "amount", "expenseDate", "paymentMethod", "vendorName", "notes", "receiptUrl"];
    for (const field of fields) {
      const val = formData.get(field)?.toString();
      if (val !== null && val !== undefined) rawData[field] = val;
    }

    const parsed = expenseUpdateSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString();
        if (key) fieldErrors[key] = issue.message;
      }
      return { success: false, error: "Validation failed.", fieldErrors };
    }

    await updateExpense(context, expenseId, parsed.data);
    if (gymSlug) revalidatePath(`/${gymSlug}/expenses`);

    return { success: true, message: "Expense updated and audit log recorded." };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to update expense." };
  }
}

// ==============================================================================
// SOFT DELETE EXPENSE
// ==============================================================================
export async function deleteExpenseAction(
  _prevState: ExpenseActionState | null,
  formData: FormData
): Promise<ExpenseActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();
    const expenseId = formData.get("expenseId")?.toString();
    const reason = formData.get("reason")?.toString();

    if (!gymId || !expenseId)
      return { success: false, error: "Missing required identifiers." };

    const { context } = await requireGymAccess(gymId, [GymRole.OWNER, GymRole.STAFF]);
    await softDeleteExpense(context, expenseId, reason);
    if (gymSlug) revalidatePath(`/${gymSlug}/expenses`);

    return { success: true, message: "Expense removed from active records." };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to delete expense." };
  }
}

// ==============================================================================
// CREATE EXPENSE CATEGORY
// ==============================================================================
export async function createCategoryAction(
  _prevState: ExpenseActionState | null,
  formData: FormData
): Promise<ExpenseActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) return { success: false, error: "Missing gym workspace identifier." };

    const { context } = await requireGymAccess(gymId, [GymRole.OWNER, GymRole.STAFF]);

    const parsed = expenseCategoryCreateSchema.safeParse({
      name: formData.get("name")?.toString() || "",
    });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid category name." };
    }

    const category = await createExpenseCategory(context, parsed.data);
    if (gymSlug) revalidatePath(`/${gymSlug}/expenses`);

    return { success: true, message: `Category "${category.name}" created.`, data: category };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to create category." };
  }
}

// ==============================================================================
// DELETE EXPENSE CATEGORY
// ==============================================================================
export async function deleteCategoryAction(
  _prevState: ExpenseActionState | null,
  formData: FormData
): Promise<ExpenseActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();
    const categoryId = formData.get("categoryId")?.toString();

    if (!gymId || !categoryId)
      return { success: false, error: "Missing required identifiers." };

    const { context } = await requireGymAccess(gymId, [GymRole.OWNER]);
    await deleteExpenseCategory(context, categoryId);
    if (gymSlug) revalidatePath(`/${gymSlug}/expenses`);

    return { success: true, message: "Category deleted." };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to delete category." };
  }
}

// ==============================================================================
// SEED DEFAULT CATEGORIES
// ==============================================================================
export async function seedDefaultCategoriesAction(
  _prevState: ExpenseActionState | null,
  formData: FormData
): Promise<ExpenseActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) return { success: false, error: "Missing gym workspace identifier." };

    const { context } = await requireGymAccess(gymId, [GymRole.OWNER]);
    await seedDefaultExpenseCategories(context);
    if (gymSlug) revalidatePath(`/${gymSlug}/expenses`);

    return { success: true, message: "Default expense categories created." };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to seed categories." };
  }
}

