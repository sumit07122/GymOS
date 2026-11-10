/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import { getDatabaseSession } from "@/lib/auth/session";
import {
  refreshPortalDynamicQr,
  updatePortalMemberProfile,
  portalBookClass,
  portalCancelBooking,
  portalLogMemberWeight,
} from "@/lib/services/portal.service";
import {
  memberProfileUpdateSchema,
  memberWeightLogSchema,
  memberBookClassSchema,
  memberCancelBookingSchema,
} from "@/lib/validations/portal";

export interface PortalActionState {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * Server action to regenerate short-lived HMAC-signed QR token for the authenticated member.
 */
export async function refreshDynamicQrAction(
  gymSlug: string
): Promise<PortalActionState> {
  try {
    const session = await getDatabaseSession();
    if (!session) {
      return { success: false, error: "Unauthenticated. Please log in." };
    }

    const qrResult = await refreshPortalDynamicQr(
      session.user.id,
      session.user.email,
      gymSlug
    );

    return {
      success: true,
      message: "Dynamic QR code refreshed.",
      data: qrResult,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to refresh dynamic QR code.",
    };
  }
}

/**
 * Server action for member to update their own contact information.
 */
export async function updateMemberProfileAction(
  gymSlug: string,
  formData: FormData
): Promise<PortalActionState> {
  try {
    const session = await getDatabaseSession();
    if (!session) {
      return { success: false, error: "Unauthenticated. Please log in." };
    }

    const rawData = {
      phone: formData.get("phone")?.toString() || null,
      address: formData.get("address")?.toString() || null,
      emergencyContactName:
        formData.get("emergencyContactName")?.toString() || null,
      emergencyContactPhone:
        formData.get("emergencyContactPhone")?.toString() || null,
    };

    const parsed = memberProfileUpdateSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Validation failed.",
      };
    }

    const result = await updatePortalMemberProfile(
      session.user.id,
      session.user.email,
      gymSlug,
      parsed.data
    );

    revalidatePath(`/portal/${gymSlug}`);
    return {
      success: true,
      message: "Profile updated successfully.",
      data: result.member,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to update profile.",
    };
  }
}

/**
 * Server action for member to book a group class session.
 */
export async function bookClassAction(
  gymSlug: string,
  scheduleId: string
): Promise<PortalActionState> {
  try {
    const session = await getDatabaseSession();
    if (!session) {
      return { success: false, error: "Unauthenticated. Please log in." };
    }

    const parsed = memberBookClassSchema.safeParse({ scheduleId });
    if (!parsed.success) {
      return { success: false, error: "Invalid schedule ID." };
    }

    const booking = await portalBookClass(
      session.user.id,
      session.user.email,
      gymSlug,
      parsed.data.scheduleId
    );

    revalidatePath(`/portal/${gymSlug}`);
    return {
      success: true,
      message: "Class booked successfully! See you on the floor.",
      data: { bookingId: booking.id },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Unable to book class.",
    };
  }
}

/**
 * Server action for member to cancel their own class booking.
 */
export async function cancelBookingAction(
  gymSlug: string,
  bookingId: string
): Promise<PortalActionState> {
  try {
    const session = await getDatabaseSession();
    if (!session) {
      return { success: false, error: "Unauthenticated. Please log in." };
    }

    const parsed = memberCancelBookingSchema.safeParse({ bookingId });
    if (!parsed.success) {
      return { success: false, error: "Invalid booking ID." };
    }

    const cancelled = await portalCancelBooking(
      session.user.id,
      session.user.email,
      gymSlug,
      parsed.data.bookingId
    );

    revalidatePath(`/portal/${gymSlug}`);
    return {
      success: true,
      message: "Class booking cancelled.",
      data: { bookingId: cancelled.id },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Unable to cancel booking.",
    };
  }
}

/**
 * Server action for member to log their current weight.
 */
export async function logWeightAction(
  gymSlug: string,
  formData: FormData
): Promise<PortalActionState> {
  try {
    const session = await getDatabaseSession();
    if (!session) {
      return { success: false, error: "Unauthenticated. Please log in." };
    }

    const rawData = {
      weightKg: formData.get("weightKg")?.toString() || "",
      notes: formData.get("notes")?.toString() || null,
    };

    const parsed = memberWeightLogSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid weight entry.",
      };
    }

    const record = await portalLogMemberWeight(
      session.user.id,
      session.user.email,
      gymSlug,
      parsed.data
    );

    revalidatePath(`/portal/${gymSlug}`);
    return {
      success: true,
      message: `Logged ${record.weightKg} kg successfully. Keep up the consistency!`,
      data: { id: record.id },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to log weight.",
    };
  }
}
