"use server";

import { getDatabaseSession } from "@/lib/auth/session";
import { SystemRole } from "@prisma/client";
import {
  updateGymAccountStatus,
  updateGymSupportNotes,
  createSaasPlan,
  updateSaasPlan,
  assignGymSubscription,
} from "@/lib/services/platform-admin.service";
import {
  gymStatusUpdateSchema,
  GymStatusUpdateInput,
  saasPlanSchema,
  SaasPlanInput,
  assignSubscriptionSchema,
  AssignSubscriptionInput,
  gymSupportNotesSchema,
  GymSupportNotesInput,
} from "@/lib/validations/saas-admin";
import { revalidatePath } from "next/cache";

// ==============================================================================
// FIXIA GymOS — Platform Administration Server Actions (M19)
// ==============================================================================

async function requireSuperAdminSession() {
  const session = await getDatabaseSession();
  if (!session || session.user.role !== SystemRole.SUPER_ADMIN) {
    throw new Error("Access Denied: Super Admin authorization required.");
  }
  return session;
}

export async function updateGymAccountStatusAction(
  gymId: string,
  input: GymStatusUpdateInput
) {
  try {
    const session = await requireSuperAdminSession();
    const parsed = gymStatusUpdateSchema.parse(input);

    const result = await updateGymAccountStatus(session.user.id, gymId, {
      status: parsed.status,
      reason: parsed.reason,
    });

    revalidatePath("/admin");
    revalidatePath(`/admin/gyms/${gymId}`);
    revalidatePath("/admin/gyms");

    return {
      success: true,
      gymId: result.gymId,
      status: result.status,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update gym status.";
    return {
      success: false,
      error: message,
    };
  }
}

export async function updateGymSupportNotesAction(
  gymId: string,
  input: GymSupportNotesInput
) {
  try {
    const session = await requireSuperAdminSession();
    const parsed = gymSupportNotesSchema.parse(input);

    await updateGymSupportNotes(session.user.id, gymId, parsed.notes);

    revalidatePath(`/admin/gyms/${gymId}`);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update support notes.";
    return {
      success: false,
      error: message,
    };
  }
}

export async function createSaasPlanAction(input: SaasPlanInput) {
  try {
    const session = await requireSuperAdminSession();
    const parsed = saasPlanSchema.parse(input);

    const result = await createSaasPlan(session.user.id, parsed);

    revalidatePath("/admin/plans");
    revalidatePath("/admin");

    return {
      success: true,
      plan: result.plan,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create SaaS plan.";
    return {
      success: false,
      error: message,
    };
  }
}

export async function updateSaasPlanAction(
  planId: string,
  input: Partial<SaasPlanInput>
) {
  try {
    const session = await requireSuperAdminSession();
    const parsed = saasPlanSchema.partial().parse(input);

    const result = await updateSaasPlan(session.user.id, planId, parsed);

    revalidatePath("/admin/plans");

    return {
      success: true,
      plan: result.plan,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update SaaS plan.";
    return {
      success: false,
      error: message,
    };
  }
}

export async function assignGymSubscriptionAction(
  gymId: string,
  input: AssignSubscriptionInput
) {
  try {
    const session = await requireSuperAdminSession();
    const parsed = assignSubscriptionSchema.parse(input);

    const result = await assignGymSubscription(session.user.id, gymId, parsed);

    revalidatePath(`/admin/gyms/${gymId}`);
    revalidatePath("/admin/gyms");
    revalidatePath("/admin");

    return {
      success: true,
      subscription: result.subscription,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to assign subscription.";
    return {
      success: false,
      error: message,
    };
  }
}

