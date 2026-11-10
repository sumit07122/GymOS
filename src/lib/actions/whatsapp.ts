/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import { resolveTenantContext } from "@/lib/tenant/resolver";
import {
  updateWhatsAppConfig,
  updateMemberWhatsAppConsent,
  updateWhatsAppTemplate,
  sendTestWhatsAppMessage,
  sendGymAnnouncement,
  retryWhatsAppNotification,
  WhatsAppConsentRequiredError,
} from "@/lib/services/whatsapp.service";
import {
  whatsappConfigSchema,
  memberConsentSchema,
  sendTestMessageSchema,
  sendAnnouncementSchema,
  retryNotificationSchema,
  updateTemplateSchema,
} from "@/lib/validations/whatsapp";

// ==============================================================================
// FIXIA GymOS — WhatsApp Server Actions (M17)
// ==============================================================================

export async function updateWhatsAppConfigAction(
  gymSlug: string,
  rawInput: any
) {
  try {
    const ctx = await resolveTenantContext(gymSlug);
    const parsed = whatsappConfigSchema.parse(rawInput);
    const updated = await updateWhatsAppConfig(ctx, parsed);

    revalidatePath(`/${gymSlug}/whatsapp`);
    revalidatePath(`/${gymSlug}/settings`);

    return {
      success: true,
      data: updated,
      message: "WhatsApp configuration and credentials saved successfully.",
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to update WhatsApp configuration.",
    };
  }
}

export async function updateMemberConsentAction(
  gymSlug: string,
  memberId: string,
  whatsappConsent: boolean,
  consentSource = "DASHBOARD"
) {
  try {
    const ctx = await resolveTenantContext(gymSlug);
    const parsed = memberConsentSchema.parse({
      memberId,
      whatsappConsent,
      consentSource,
    });

    const updated = await updateMemberWhatsAppConsent(ctx, parsed);

    revalidatePath(`/${gymSlug}/whatsapp`);
    revalidatePath(`/${gymSlug}/members/${memberId}`);

    return {
      success: true,
      data: updated,
      message: `WhatsApp opt-in status updated for ${updated.firstName} ${updated.lastName}.`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to update member consent.",
    };
  }
}

export async function updateWhatsAppTemplateAction(
  gymSlug: string,
  rawInput: any
) {
  try {
    const ctx = await resolveTenantContext(gymSlug);
    const parsed = updateTemplateSchema.parse(rawInput);
    const updated = await updateWhatsAppTemplate(ctx, parsed);

    revalidatePath(`/${gymSlug}/whatsapp`);

    return {
      success: true,
      data: updated,
      message: "Template content saved successfully.",
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to update template.",
    };
  }
}

export async function sendTestWhatsAppMessageAction(
  gymSlug: string,
  rawInput: any
) {
  try {
    const ctx = await resolveTenantContext(gymSlug);
    const parsed = sendTestMessageSchema.parse(rawInput);
    const res = await sendTestWhatsAppMessage(ctx, parsed);

    revalidatePath(`/${gymSlug}/whatsapp`);

    return res;
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to dispatch test WhatsApp message.",
    };
  }
}

export async function sendGymAnnouncementAction(
  gymSlug: string,
  rawInput: any
) {
  try {
    const ctx = await resolveTenantContext(gymSlug);
    const parsed = sendAnnouncementSchema.parse(rawInput);
    const res = await sendGymAnnouncement(ctx, parsed);

    revalidatePath(`/${gymSlug}/whatsapp`);

    return res;
  } catch (err: any) {
    if (err instanceof WhatsAppConsentRequiredError) {
      return {
        success: false,
        error: err.message,
      };
    }
    return {
      success: false,
      error: err?.message || "Failed to dispatch gym announcement.",
    };
  }
}

export async function retryWhatsAppNotificationAction(
  gymSlug: string,
  notificationId: string
) {
  try {
    const ctx = await resolveTenantContext(gymSlug);
    const parsed = retryNotificationSchema.parse({ notificationId });
    const res = await retryWhatsAppNotification(ctx, parsed.notificationId);

    revalidatePath(`/${gymSlug}/whatsapp`);

    return res;
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to retry WhatsApp notification.",
    };
  }
}

