/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import { requireGymAccess } from "@/lib/auth/guards";
import { GymRole, StockMovementType } from "@prisma/client";
import {
  createInventoryItem,
  updateInventoryItem,
  recordStockMovement,
} from "@/lib/services/inventory.service";
import {
  itemCreateSchema,
  itemUpdateSchema,
  stockMovementCreateSchema,
} from "@/lib/validations/inventory";

export interface InventoryActionState {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
  data?: any;
}

export async function createItemAction(
  _prevState: InventoryActionState | null,
  formData: FormData
): Promise<InventoryActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) return { success: false, error: "Missing gym workspace identifier." };

    const { context } = await requireGymAccess(gymId, [GymRole.OWNER, GymRole.STAFF]);

    const rawData = {
      name: formData.get("name")?.toString() || "",
      sku: formData.get("sku")?.toString() || "",
      category: formData.get("category")?.toString() || undefined,
      costPrice: formData.get("costPrice")?.toString() || "0",
      retailPrice: formData.get("retailPrice")?.toString() || "0",
      initialStock: formData.get("initialStock")?.toString() || "0",
      reorderPoint: formData.get("reorderPoint")?.toString() || "5",
    };

    const parsed = itemCreateSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString();
        if (key) fieldErrors[key] = issue.message;
      }
      return { success: false, error: "Validation failed.", fieldErrors };
    }

    const item = await createInventoryItem(context, parsed.data);
    if (gymSlug) revalidatePath(`/${gymSlug}/inventory`);

    return {
      success: true,
      message: `Item "${item.name}" added to inventory.`,
      data: item,
    };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to create inventory item." };
  }
}

export async function updateItemAction(
  _prevState: InventoryActionState | null,
  formData: FormData
): Promise<InventoryActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();
    const itemId = formData.get("itemId")?.toString();

    if (!gymId || !itemId) return { success: false, error: "Missing required identifiers." };

    const { context } = await requireGymAccess(gymId, [GymRole.OWNER, GymRole.STAFF]);

    const rawData: Record<string, any> = {};
    if (formData.has("name")) rawData.name = formData.get("name")?.toString();
    if (formData.has("category")) rawData.category = formData.get("category")?.toString();
    if (formData.has("costPrice")) rawData.costPrice = formData.get("costPrice")?.toString();
    if (formData.has("retailPrice")) rawData.retailPrice = formData.get("retailPrice")?.toString();
    if (formData.has("reorderPoint")) rawData.reorderPoint = formData.get("reorderPoint")?.toString();

    const parsed = itemUpdateSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: "Validation failed." };
    }

    await updateInventoryItem(context, itemId, parsed.data);
    if (gymSlug) revalidatePath(`/${gymSlug}/inventory`);

    return { success: true, message: "Inventory item updated successfully." };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to update item." };
  }
}

export async function archiveItemAction(
  _prevState: InventoryActionState | null,
  formData: FormData
): Promise<InventoryActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();
    const itemId = formData.get("itemId")?.toString();

    if (!gymId || !itemId) return { success: false, error: "Missing required identifiers." };

    const { context } = await requireGymAccess(gymId, [GymRole.OWNER]);

    await updateInventoryItem(context, itemId, { isActive: false });
    if (gymSlug) revalidatePath(`/${gymSlug}/inventory`);

    return { success: true, message: "Inventory item archived." };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to archive item." };
  }
}

export async function recordStockMovementAction(
  _prevState: InventoryActionState | null,
  formData: FormData
): Promise<InventoryActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) return { success: false, error: "Missing gym workspace identifier." };

    const { context } = await requireGymAccess(gymId, [GymRole.OWNER, GymRole.STAFF]);

    const rawData = {
      itemId: formData.get("itemId")?.toString() || "",
      type: (formData.get("type")?.toString() as StockMovementType) || StockMovementType.PURCHASE_RECEIPT,
      quantity: formData.get("quantity")?.toString() || "0",
      referenceNumber: formData.get("referenceNumber")?.toString() || undefined,
      notes: formData.get("notes")?.toString() || undefined,
    };

    const parsed = stockMovementCreateSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString();
        if (key) fieldErrors[key] = issue.message;
      }
      return { success: false, error: "Validation failed.", fieldErrors };
    }

    const movement = await recordStockMovement(context, parsed.data);
    if (gymSlug) revalidatePath(`/${gymSlug}/inventory`);

    return {
      success: true,
      message: `Stock movement recorded: ${movement.quantity > 0 ? "+" : ""}${movement.quantity} units (Balance: ${movement.newStock}).`,
      data: movement,
    };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to adjust stock." };
  }
}
