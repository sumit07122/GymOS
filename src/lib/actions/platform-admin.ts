/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { getDatabaseSession } from "@/lib/auth/session";
import { SystemRole } from "@prisma/client";
import {
  updateGymAccountStatus,
  updateGymSupportNotes,
  createSaasPlan,
  updateSaasPlan,
  assignGymSubscription,
  onboardGymTransactional,
  createSubscriptionAddon,
  recordSubscriptionPayment,
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
  onboardGymSchema,
  OnboardGymInput,
  subscriptionAddonSchema,
  SubscriptionAddonInput,
  recordSubscriptionPaymentSchema,
  RecordSubscriptionPaymentInput,
} from "@/lib/validations/saas-admin";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

function formatErrorMessage(err: unknown, fallback = "Operation failed."): string {
  if (err instanceof ZodError) {
    return err.issues.map((i) => i.message).join(". ");
  }
  if (err && typeof err === "object" && "issues" in err && Array.isArray((err as any).issues)) {
    return (err as any).issues.map((i: any) => i.message || JSON.stringify(i)).join(". ");
  }
  if (err instanceof Error) {
    const msg = err.message.trim();
    if ((msg.startsWith("[") || msg.startsWith("{")) && (msg.includes('"message"') || msg.includes('"code"'))) {
      try {
        const parsed = JSON.parse(msg);
        if (Array.isArray(parsed)) {
          return parsed.map((i: any) => i.message || i.code).filter(Boolean).join(". ");
        } else if (parsed && typeof parsed === "object" && parsed.message) {
          return String(parsed.message);
        }
      } catch {}
    }
    return msg;
  }
  if (typeof err === "string") {
    const trimmed = err.trim();
    if ((trimmed.startsWith("[") || trimmed.startsWith("{")) && (trimmed.includes('"message"') || trimmed.includes('"code"'))) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((i: any) => i.message || i.code).filter(Boolean).join(". ");
        } else if (parsed && typeof parsed === "object" && parsed.message) {
          return String(parsed.message);
        }
      } catch {}
    }
    return trimmed;
  }
  return fallback;
}

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

    revalidatePath("/platform-admin");
    revalidatePath(`/platform-admin/gyms/${gymId}`);
    revalidatePath("/platform-admin/gyms");
    revalidatePath("/admin");
    revalidatePath(`/platform-admin/gyms/${gymId}`);
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

    revalidatePath(`/platform-admin/gyms/${gymId}`);
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

    revalidatePath("/platform-admin/plans");
    revalidatePath("/platform-admin");
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

    revalidatePath(`/platform-admin/gyms/${gymId}`);
    revalidatePath("/platform-admin/subscriptions");
    revalidatePath("/platform-admin/gyms");
    revalidatePath("/platform-admin");
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

export async function onboardGymAction(input: OnboardGymInput) {
  try {
    const session = await requireSuperAdminSession();
    const parsed = onboardGymSchema.parse(input);

    const result = await onboardGymTransactional(session.user.id, parsed);

    revalidatePath("/platform-admin");
    revalidatePath("/platform-admin/gyms");
    revalidatePath("/admin");
    revalidatePath("/admin/gyms");

    return {
      success: true,
      data: result,
    };
  } catch (err: unknown) {
    const message = formatErrorMessage(err, "Failed to onboard gym.");
    return {
      success: false,
      error: message,
    };
  }
}

export async function createSubscriptionAddonAction(input: SubscriptionAddonInput) {
  try {
    const session = await requireSuperAdminSession();
    const parsed = subscriptionAddonSchema.parse(input);

    const addon = await createSubscriptionAddon(session.user.id, parsed);

    revalidatePath("/platform-admin/addons");

    return {
      success: true,
      addon,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create subscription add-on.";
    return {
      success: false,
      error: message,
    };
  }
}

export async function recordSubscriptionPaymentAction(input: RecordSubscriptionPaymentInput) {
  try {
    const session = await requireSuperAdminSession();
    const parsed = recordSubscriptionPaymentSchema.parse(input);

    const payment = await recordSubscriptionPayment(session.user.id, parsed);

    revalidatePath("/platform-admin/payments");
    revalidatePath(`/platform-admin/gyms/${parsed.gymId}`);

    return {
      success: true,
      payment,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record subscription payment.";
    return {
      success: false,
      error: message,
    };
  }
}

