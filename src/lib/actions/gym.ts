"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAuth, requireGymAccess } from "@/lib/auth/guards";
import { GymRole } from "@prisma/client";
import {
  gymOnboardingSchema,
  gymSettingsUpdateSchema,
} from "@/lib/validations/gym";

// ==============================================================================
// FIXIA GymOS — Gym Onboarding & Settings Server Actions
// ==============================================================================
// Security Invariants:
// 1. Authenticated session mandatory.
// 2. Gym creation automatically associates current user as verified OWNER.
// 3. Settings updates require verified OWNER authorization for that specific gym.
// 4. Server-side Zod validation on all inputs.
// ==============================================================================

export interface ActionState {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
  gymSlug?: string;
}

/**
 * Creates a brand new gym workspace with the authenticated user as verified OWNER.
 */
export async function createGymOnboardingAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const session = await requireAuth();

    const rawData = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      phone: formData.get("phone") || undefined,
      email: formData.get("email") || undefined,
      addressLine1: formData.get("addressLine1") || undefined,
      addressLine2: formData.get("addressLine2") || undefined,
      city: formData.get("city") || undefined,
      state: formData.get("state") || undefined,
      postalCode: formData.get("postalCode") || undefined,
      country: formData.get("country") || "US",
      currency: formData.get("currency") || "USD",
      timezone: formData.get("timezone") || "America/New_York",
      openingHours: formData.get("openingHours") || undefined,
      taxRate: formData.get("taxRate") || 0,
      taxNumber: formData.get("taxNumber") || undefined,
      logoUrl: formData.get("logoUrl") || undefined,
    };

    const validationResult = gymOnboardingSchema.safeParse(rawData);

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validationResult.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      return {
        success: false,
        error: "Please correct the errors in the form.",
        fieldErrors,
      };
    }

    const data = validationResult.data;

    // Check if slug is unique
    const existingGym = await db.gym.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });

    if (existingGym) {
      return {
        success: false,
        fieldErrors: {
          slug: "This gym URL slug is already taken. Please choose a unique slug.",
        },
      };
    }

    // Cryptographic secret for QR check-ins
    const qrSigningSecret = crypto.randomBytes(32).toString("hex");

    // Execute atomic creation
    const newGym = await db.$transaction(async (tx) => {
      const gym = await tx.gym.create({
        data: {
          name: data.name,
          slug: data.slug,
          phone: data.phone || null,
          email: data.email || null,
          addressLine1: data.addressLine1 || null,
          addressLine2: data.addressLine2 || null,
          city: data.city || null,
          state: data.state || null,
          postalCode: data.postalCode || null,
          country: data.country,
          currency: data.currency,
          timezone: data.timezone,
          openingHours: data.openingHours || null,
          taxRate: data.taxRate,
          taxNumber: data.taxNumber || null,
          logoUrl: data.logoUrl || null,
          qrSigningSecret,
          status: "ACTIVE",
        },
      });

      // Bind current authenticated user as verified OWNER
      await tx.userGymRole.create({
        data: {
          userId: session.user.id,
          gymId: gym.id,
          role: GymRole.OWNER,
          isPrimary: true,
        },
      });

      // Seed standard default expense categories for immediate operational use
      const defaultCategories = [
        "Rent & Facilities",
        "Utilities",
        "Equipment & Maintenance",
        "Staff Payroll",
        "Marketing & Ads",
        "Cleaning & Sanitation",
        "General & Miscellaneous",
      ];

      for (const name of defaultCategories) {
        await tx.expenseCategory.create({
          data: {
            gymId: gym.id,
            name,
          },
        });
      }

      return gym;
    });

    revalidatePath("/(dashboard)", "layout");

    return {
      success: true,
      gymSlug: newGym.slug,
      message: "Gym workspace created successfully!",
    };
  } catch (err: unknown) {
    console.error("Gym onboarding error:", err);
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to create gym workspace.",
    };
  }
}

/**
 * Updates basic business settings and profile for an existing gym.
 * Strictly verifies OWNER authorization for the target gym.
 */
export async function updateGymSettingsAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();

    if (!gymId) {
      return { success: false, error: "Missing gym identifier." };
    }

    // Enforce server-side role check: user must be verified OWNER of this gym
    await requireGymAccess(gymId, [GymRole.OWNER]);

    const rawData = {
      name: formData.get("name"),
      phone: formData.get("phone") || undefined,
      email: formData.get("email") || undefined,
      addressLine1: formData.get("addressLine1") || undefined,
      addressLine2: formData.get("addressLine2") || undefined,
      city: formData.get("city") || undefined,
      state: formData.get("state") || undefined,
      postalCode: formData.get("postalCode") || undefined,
      country: formData.get("country") || "US",
      currency: formData.get("currency") || "USD",
      timezone: formData.get("timezone") || "America/New_York",
      openingHours: formData.get("openingHours") || undefined,
      taxRate: formData.get("taxRate") || 0,
      taxNumber: formData.get("taxNumber") || undefined,
      logoUrl: formData.get("logoUrl") || undefined,
    };

    const validationResult = gymSettingsUpdateSchema.safeParse(rawData);

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validationResult.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      return {
        success: false,
        error: "Please correct the errors in the form.",
        fieldErrors,
      };
    }

    const data = validationResult.data;

    const updatedGym = await db.gym.update({
      where: { id: gymId },
      data: {
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        addressLine1: data.addressLine1 || null,
        addressLine2: data.addressLine2 || null,
        city: data.city || null,
        state: data.state || null,
        postalCode: data.postalCode || null,
        country: data.country,
        currency: data.currency,
        timezone: data.timezone,
        openingHours: data.openingHours || null,
        taxRate: data.taxRate,
        taxNumber: data.taxNumber || null,
        logoUrl: data.logoUrl || null,
      },
      select: {
        slug: true,
      },
    });

    revalidatePath(`/${updatedGym.slug}/settings`);
    revalidatePath(`/${updatedGym.slug}/dashboard`);

    return {
      success: true,
      message: "Gym settings updated successfully.",
      gymSlug: updatedGym.slug,
    };
  } catch (err: unknown) {
    console.error("Gym settings update error:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to update gym business settings.",
    };
  }
}

