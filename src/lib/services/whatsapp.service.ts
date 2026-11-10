/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db";
import { TenantContext, assertPermission } from "@/lib/tenant/context";
import {
  WhatsAppProviderType,
  WhatsAppNotificationEvent,
  WhatsAppNotificationStatus,
} from "@prisma/client";
import {
  WhatsAppConfigInput,
  MemberConsentInput,
  SendTestMessageInput,
  SendAnnouncementInput,
  UpdateTemplateInput,
} from "@/lib/validations/whatsapp";
import {
  STANDARD_WHATSAPP_TEMPLATES,
  interpolateTemplateText,
} from "@/lib/integrations/whatsapp/templates";
import {
  getWhatsAppProvider,
  WhatsAppProvider,
} from "@/lib/integrations/whatsapp/provider";

// ==============================================================================
// FIXIA GymOS — WhatsApp Business Notifications Service (M17)
// ==============================================================================

export class WhatsAppConsentRequiredError extends Error {
  constructor(memberName?: string) {
    super(
      `MANDATORY COMPLIANCE: Member "${memberName || "Recipient"}" has not opted in to receive WhatsApp notifications.`
    );
    this.name = "WhatsAppConsentRequiredError";
  }
}

export class WhatsAppNotificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WhatsAppNotificationError";
  }
}

export class DuplicateNotificationError extends Error {
  constructor(idempotencyKey: string) {
    super(`A notification with idempotency key "${idempotencyKey}" has already been processed.`);
    this.name = "DuplicateNotificationError";
  }
}

/**
 * Masks sensitive access tokens for safe frontend inspection.
 */
function maskSecret(val: string | null | undefined): string | null {
  if (!val) return null;
  if (val.length <= 8) return "••••••••";
  return `${val.substring(0, 4)}••••••••${val.substring(val.length - 4)}`;
}

/**
 * Initializes default templates for a gym workspace if they don't already exist.
 */
export async function ensureDefaultWhatsAppTemplates(gymId: string) {
  const existingTemplates = await db.whatsAppTemplate.findMany({
    where: { gymId },
    select: { eventType: true },
  });

  const existingTypes = new Set(existingTemplates.map((t) => t.eventType));

  const templatesToCreate = Object.values(STANDARD_WHATSAPP_TEMPLATES)
    .filter((tmpl) => !existingTypes.has(tmpl.eventType))
    .map((tmpl) => ({
      gymId,
      eventType: tmpl.eventType,
      templateName: tmpl.templateName,
      languageCode: tmpl.languageCode,
      headerText: tmpl.headerText,
      bodyText: tmpl.bodyText,
      footerText: tmpl.footerText,
      status: "APPROVED",
      variables: JSON.stringify(tmpl.variables),
    }));

  if (templatesToCreate.length > 0) {
    await db.whatsAppTemplate.createMany({
      data: templatesToCreate,
      skipDuplicates: true,
    });
  }
}

/**
 * Resolves or initializes WhatsApp configuration for a gym tenant.
 */
export async function getOrCreateWhatsAppConfig(ctx: TenantContext) {
  assertPermission(ctx, "SETTINGS_MANAGE");

  let config = await db.gymWhatsAppConfig.findUnique({
    where: { gymId: ctx.gymId },
  });

  if (!config) {
    config = await db.gymWhatsAppConfig.create({
      data: {
        gymId: ctx.gymId,
        provider: WhatsAppProviderType.MOCK_SANDBOX,
        isEnabled: true,
        isLiveDelivery: false,
        notifyOnMembershipCreated: true,
        notifyOnMembershipExpiring: true,
        expiryReminderDays: 3,
        notifyOnPaymentReceived: true,
        notifyOnDuesOverdue: true,
        notifyOnBookingConfirmed: true,
        notifyOnBookingCancelled: true,
      },
    });
  }

  // Ensure default approved templates exist
  await ensureDefaultWhatsAppTemplates(ctx.gymId);

  // Return with masked credentials for safe UI exposure
  return {
    ...config,
    accessTokenMasked: maskSecret(config.accessToken),
    authTokenMasked: maskSecret(config.authToken),
    hasAccessToken: !!config.accessToken,
    hasAuthToken: !!config.authToken,
  };
}

/**
 * Updates WhatsApp configuration, credentials, and notification preferences.
 */
export async function updateWhatsAppConfig(
  ctx: TenantContext,
  input: WhatsAppConfigInput
) {
  assertPermission(ctx, "SETTINGS_MANAGE");

  const existing = await db.gymWhatsAppConfig.findUnique({
    where: { gymId: ctx.gymId },
  });

  // Keep existing credentials if omitted/blank in update
  const accessToken =
    input.accessToken && input.accessToken.trim() !== ""
      ? input.accessToken.trim()
      : existing?.accessToken ?? null;

  const authToken =
    input.authToken && input.authToken.trim() !== ""
      ? input.authToken.trim()
      : existing?.authToken ?? null;

  const updated = await db.gymWhatsAppConfig.upsert({
    where: { gymId: ctx.gymId },
    create: {
      gymId: ctx.gymId,
      provider: input.provider ?? WhatsAppProviderType.MOCK_SANDBOX,
      isEnabled: input.isEnabled ?? true,
      isLiveDelivery: input.isLiveDelivery ?? false,
      phoneNumberId: input.phoneNumberId?.trim() || null,
      wabaId: input.wabaId?.trim() || null,
      accessToken,
      accountSid: input.accountSid?.trim() || null,
      authToken,
      senderPhoneNumber: input.senderPhoneNumber?.trim() || null,
      webhookVerifyToken: input.webhookVerifyToken?.trim() || null,
      notifyOnMembershipCreated: input.notifyOnMembershipCreated ?? true,
      notifyOnMembershipExpiring: input.notifyOnMembershipExpiring ?? true,
      expiryReminderDays: input.expiryReminderDays ?? 3,
      notifyOnPaymentReceived: input.notifyOnPaymentReceived ?? true,
      notifyOnDuesOverdue: input.notifyOnDuesOverdue ?? true,
      notifyOnBookingConfirmed: input.notifyOnBookingConfirmed ?? true,
      notifyOnBookingCancelled: input.notifyOnBookingCancelled ?? true,
      customHeader: input.customHeader?.trim() || null,
      customFooter: input.customFooter?.trim() || null,
    },
    update: {
      provider: input.provider ?? undefined,
      isEnabled: input.isEnabled ?? undefined,
      isLiveDelivery: input.isLiveDelivery ?? undefined,
      phoneNumberId: input.phoneNumberId !== undefined ? input.phoneNumberId?.trim() || null : undefined,
      wabaId: input.wabaId !== undefined ? input.wabaId?.trim() || null : undefined,
      accessToken,
      accountSid: input.accountSid !== undefined ? input.accountSid?.trim() || null : undefined,
      authToken,
      senderPhoneNumber:
        input.senderPhoneNumber !== undefined
          ? input.senderPhoneNumber?.trim() || null
          : undefined,
      webhookVerifyToken:
        input.webhookVerifyToken !== undefined
          ? input.webhookVerifyToken?.trim() || null
          : undefined,
      notifyOnMembershipCreated: input.notifyOnMembershipCreated ?? undefined,
      notifyOnMembershipExpiring: input.notifyOnMembershipExpiring ?? undefined,
      expiryReminderDays: input.expiryReminderDays ?? undefined,
      notifyOnPaymentReceived: input.notifyOnPaymentReceived ?? undefined,
      notifyOnDuesOverdue: input.notifyOnDuesOverdue ?? undefined,
      notifyOnBookingConfirmed: input.notifyOnBookingConfirmed ?? undefined,
      notifyOnBookingCancelled: input.notifyOnBookingCancelled ?? undefined,
      customHeader: input.customHeader !== undefined ? input.customHeader?.trim() || null : undefined,
      customFooter: input.customFooter !== undefined ? input.customFooter?.trim() || null : undefined,
    },
  });

  return {
    ...updated,
    accessTokenMasked: maskSecret(updated.accessToken),
    authTokenMasked: maskSecret(updated.authToken),
    hasAccessToken: !!updated.accessToken,
    hasAuthToken: !!updated.authToken,
  };
}

/**
 * Retrieves the templates configured for a gym.
 */
export async function getWhatsAppTemplates(ctx: TenantContext) {
  assertPermission(ctx, "SETTINGS_MANAGE");
  await ensureDefaultWhatsAppTemplates(ctx.gymId);

  return db.whatsAppTemplate.findMany({
    where: { gymId: ctx.gymId },
    orderBy: { eventType: "asc" },
  });
}

/**
 * Updates a specific template's body text or headers.
 */
export async function updateWhatsAppTemplate(
  ctx: TenantContext,
  input: UpdateTemplateInput
) {
  assertPermission(ctx, "SETTINGS_MANAGE");

  const template = await db.whatsAppTemplate.findFirst({
    where: { id: input.templateId, gymId: ctx.gymId },
  });

  if (!template) {
    throw new WhatsAppNotificationError("Template not found for this gym.");
  }

  return db.whatsAppTemplate.update({
    where: { id: template.id },
    data: {
      bodyText: input.bodyText.trim(),
      headerText: input.headerText?.trim() || null,
      footerText: input.footerText?.trim() || null,
      status: "APPROVED", // Re-approved locally in system
    },
  });
}

/**
 * Updates a member's WhatsApp opt-in consent status.
 */
export async function updateMemberWhatsAppConsent(
  ctx: TenantContext,
  input: MemberConsentInput
) {
  assertPermission(ctx, "MEMBER_UPDATE");

  const member = await db.member.findFirst({
    where: { id: input.memberId, gymId: ctx.gymId },
  });

  if (!member) {
    throw new WhatsAppNotificationError("Member not found in this gym workspace.");
  }

  const updatedMember = await db.member.update({
    where: { id: member.id },
    data: {
      whatsappConsent: input.whatsappConsent,
      whatsappConsentAt: input.whatsappConsent ? new Date() : null,
      whatsappConsentSource: input.whatsappConsent ? input.consentSource : null,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      whatsappConsent: true,
      whatsappConsentAt: true,
      whatsappConsentSource: true,
    },
  });

  return updatedMember;
}

/**
 * Retrieves member consent overview and opt-in list.
 */
export async function getMemberConsentDirectory(
  ctx: TenantContext,
  options?: { page?: number; limit?: number; search?: string }
) {
  assertPermission(ctx, "MEMBER_READ");

  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const skip = (page - 1) * limit;

  const whereClause: any = {
    gymId: ctx.gymId,
    status: "ACTIVE",
  };

  if (options?.search) {
    const term = options.search.trim();
    whereClause.OR = [
      { firstName: { contains: term, mode: "insensitive" } },
      { lastName: { contains: term, mode: "insensitive" } },
      { phone: { contains: term } },
      { memberCode: { contains: term, mode: "insensitive" } },
    ];
  }

  const [members, totalCount, consentedCount] = await Promise.all([
    db.member.findMany({
      where: whereClause,
      select: {
        id: true,
        memberCode: true,
        firstName: true,
        lastName: true,
        phone: true,
        whatsappConsent: true,
        whatsappConsentAt: true,
        whatsappConsentSource: true,
      },
      orderBy: { firstName: "asc" },
      skip,
      take: limit,
    }),
    db.member.count({ where: whereClause }),
    db.member.count({ where: { gymId: ctx.gymId, whatsappConsent: true } }),
  ]);

  return {
    members,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
      totalCount,
      consentedCount,
      optInRate: totalCount > 0 ? Math.round((consentedCount / totalCount) * 100) : 0,
    },
  };
}

/**
 * Retrieves paginated notification audit log history.
 */
export async function getWhatsAppNotificationHistory(
  ctx: TenantContext,
  options?: {
    page?: number;
    limit?: number;
    eventType?: WhatsAppNotificationEvent;
    status?: WhatsAppNotificationStatus;
    search?: string;
  }
) {
  assertPermission(ctx, "SETTINGS_MANAGE");

  const page = options?.page || 1;
  const limit = options?.limit || 25;
  const skip = (page - 1) * limit;

  const where: any = { gymId: ctx.gymId };

  if (options?.eventType) where.eventType = options.eventType;
  if (options?.status) where.status = options.status;
  if (options?.search) {
    const term = options.search.trim();
    where.OR = [
      { recipientPhone: { contains: term } },
      { recipientName: { contains: term, mode: "insensitive" } },
      { messageBody: { contains: term, mode: "insensitive" } },
    ];
  }

  const [notifications, totalCount] = await Promise.all([
    db.whatsAppNotification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        member: {
          select: {
            id: true,
            memberCode: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
    db.whatsAppNotification.count({ where }),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
      totalCount,
    },
  };
}

// ==============================================================================
// CORE NOTIFICATION DISPATCHER & LIFECYCLE
// ==============================================================================

export interface DispatchNotificationParams {
  gymId: string;
  memberId?: string | null;
  recipientPhone: string;
  recipientName?: string;
  eventType: WhatsAppNotificationEvent;
  parameters: Record<string, string | number>;
  idempotencyKey?: string;
  providerOverride?: WhatsAppProvider;
}

/**
 * Core notification dispatch engine:
 * 1. Checks Member Consent (Compliance).
 * 2. Checks Idempotency (Prevent Duplicate Dispatch).
 * 3. Resolves Gym Settings and Feature Toggles.
 * 4. Resolves and Interpolates Approved Template.
 * 5. Calls Provider (Meta / Twilio / Mock).
 * 6. Records Audit Log with Status and Provider Message ID.
 */
export async function dispatchWhatsAppNotification(
  params: DispatchNotificationParams
) {
  const {
    gymId,
    memberId,
    recipientPhone,
    recipientName,
    eventType,
    parameters,
    idempotencyKey,
    providerOverride,
  } = params;

  // 1. Consent Gate
  if (memberId) {
    const member = await db.member.findUnique({
      where: { id: memberId },
      select: { whatsappConsent: true, firstName: true, lastName: true },
    });

    if (!member || !member.whatsappConsent) {
      throw new WhatsAppConsentRequiredError(
        recipientName || (member ? `${member.firstName} ${member.lastName}` : undefined)
      );
    }
  }

  // 2. Duplicate Check / Idempotency
  if (idempotencyKey) {
    const existing = await db.whatsAppNotification.findUnique({
      where: {
        gymId_idempotencyKey: {
          gymId,
          idempotencyKey,
        },
      },
    });

    if (
      existing &&
      (existing.status === WhatsAppNotificationStatus.SENT ||
        existing.status === WhatsAppNotificationStatus.DELIVERED ||
        existing.status === WhatsAppNotificationStatus.READ)
    ) {
      return {
        alreadySent: true,
        notification: existing,
        message: `Notification already delivered (id: ${existing.id}).`,
      };
    }
  }

  // 3. Resolve Gym Config
  const gymConfig = await db.gymWhatsAppConfig.findUnique({
    where: { gymId },
  });

  if (gymConfig && !gymConfig.isEnabled) {
    return {
      success: false,
      skipped: true,
      reason: "WhatsApp notifications disabled by gym owner.",
    };
  }

  // Check event-specific preferences
  if (gymConfig) {
    if (eventType === "MEMBERSHIP_CONFIRMATION" && !gymConfig.notifyOnMembershipCreated) return { skipped: true };
    if (eventType === "MEMBERSHIP_EXPIRY_REMINDER" && !gymConfig.notifyOnMembershipExpiring) return { skipped: true };
    if (eventType === "PAYMENT_RECEIPT" && !gymConfig.notifyOnPaymentReceived) return { skipped: true };
    if (eventType === "DUES_REMINDER" && !gymConfig.notifyOnDuesOverdue) return { skipped: true };
    if (eventType === "CLASS_BOOKING_CONFIRMATION" && !gymConfig.notifyOnBookingConfirmed) return { skipped: true };
    if (eventType === "BOOKING_CANCELLATION" && !gymConfig.notifyOnBookingCancelled) return { skipped: true };
  }

  // 4. Resolve Template
  let template = await db.whatsAppTemplate.findFirst({
    where: { gymId, eventType },
  });

  if (!template) {
    const standard = STANDARD_WHATSAPP_TEMPLATES[eventType];
    template = {
      id: "std-fallback",
      gymId,
      eventType,
      templateName: standard.templateName,
      languageCode: standard.languageCode,
      headerText: standard.headerText,
      bodyText: standard.bodyText,
      footerText: standard.footerText,
      status: "APPROVED",
      variables: JSON.stringify(standard.variables),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // 5. Interpolate Message Body
  const renderedBody = interpolateTemplateText(template.bodyText, parameters);

  // 6. Instantiate Provider
  const provider = providerOverride || getWhatsAppProvider(gymConfig);

  // Initial Record creation in DB
  const notification = await db.whatsAppNotification.create({
    data: {
      gymId,
      memberId: memberId || null,
      recipientPhone,
      recipientName: recipientName || null,
      eventType,
      templateName: template.templateName,
      parameters: JSON.stringify(parameters),
      messageBody: renderedBody,
      status: WhatsAppNotificationStatus.PENDING,
      provider: provider.type,
      idempotencyKey: idempotencyKey || null,
      retryCount: 0,
      maxRetries: 3,
    },
  });

  // 7. Execute Send through Provider
  try {
    const result = await provider.sendTemplate({
      recipientPhone,
      templateName: template.templateName,
      languageCode: template.languageCode,
      parameters,
      renderedBody,
      headerText: template.headerText,
      footerText: template.footerText,
    });

    if (result.success) {
      const updated = await db.whatsAppNotification.update({
        where: { id: notification.id },
        data: {
          status: WhatsAppNotificationStatus.SENT,
          providerMessageId: result.providerMessageId || null,
          providerResponse: result.rawResponse ? JSON.stringify(result.rawResponse) : null,
          sentAt: new Date(),
          errorMessage: null,
        },
      });

      return {
        success: true,
        notification: updated,
      };
    } else {
      const failed = await db.whatsAppNotification.update({
        where: { id: notification.id },
        data: {
          status: WhatsAppNotificationStatus.FAILED,
          errorMessage: result.error || "Provider rejected dispatch.",
          providerResponse: result.rawResponse ? JSON.stringify(result.rawResponse) : null,
        },
      });

      return {
        success: false,
        notification: failed,
        error: result.error,
      };
    }
  } catch (err: any) {
    const failed = await db.whatsAppNotification.update({
      where: { id: notification.id },
      data: {
        status: WhatsAppNotificationStatus.FAILED,
        errorMessage: err?.message || "Internal exception during WhatsApp dispatch.",
      },
    });

    return {
      success: false,
      notification: failed,
      error: err?.message,
    };
  }
}

/**
 * Retries a previously failed notification.
 * Enforces maximum retry attempts (max 3).
 */
export async function retryWhatsAppNotification(
  ctx: TenantContext,
  notificationId: string,
  providerOverride?: WhatsAppProvider
) {
  assertPermission(ctx, "NOTIFICATION_SEND");

  const record = await db.whatsAppNotification.findFirst({
    where: { id: notificationId, gymId: ctx.gymId },
    include: { member: true },
  });

  if (!record) {
    throw new WhatsAppNotificationError("Notification record not found.");
  }

  if (record.status === WhatsAppNotificationStatus.DELIVERED || record.status === WhatsAppNotificationStatus.SENT) {
    throw new WhatsAppNotificationError("Notification has already succeeded.");
  }

  if (record.retryCount >= record.maxRetries) {
    throw new WhatsAppNotificationError(
      `Max retry limit (${record.maxRetries}) reached for this notification.`
    );
  }

  // Ensure member has consent before retry
  if (record.member && !record.member.whatsappConsent) {
    throw new WhatsAppConsentRequiredError(record.recipientName || undefined);
  }

  const gymConfig = await db.gymWhatsAppConfig.findUnique({
    where: { gymId: ctx.gymId },
  });

  const provider = providerOverride || getWhatsAppProvider(gymConfig);

  const parsedParams = record.parameters ? JSON.parse(record.parameters) : {};

  // Increment retry count
  await db.whatsAppNotification.update({
    where: { id: record.id },
    data: {
      retryCount: { increment: 1 },
      lastRetryAt: new Date(),
      status: WhatsAppNotificationStatus.PENDING,
    },
  });

  const sendResult = await provider.sendTemplate({
    recipientPhone: record.recipientPhone,
    templateName: record.templateName,
    languageCode: "en_US",
    parameters: parsedParams,
    renderedBody: record.messageBody,
  });

  if (sendResult.success) {
    const updated = await db.whatsAppNotification.update({
      where: { id: record.id },
      data: {
        status: WhatsAppNotificationStatus.SENT,
        providerMessageId: sendResult.providerMessageId || null,
        providerResponse: sendResult.rawResponse ? JSON.stringify(sendResult.rawResponse) : null,
        sentAt: new Date(),
        errorMessage: null,
      },
    });

    return { success: true, notification: updated };
  } else {
    const updated = await db.whatsAppNotification.update({
      where: { id: record.id },
      data: {
        status: WhatsAppNotificationStatus.FAILED,
        errorMessage: sendResult.error || "Retry failed at provider level.",
      },
    });

    return { success: false, notification: updated, error: sendResult.error };
  }
}

/**
 * Sends a sandbox connectivity test message to verify provider integration.
 */
export async function sendTestWhatsAppMessage(
  ctx: TenantContext,
  input: SendTestMessageInput,
  providerOverride?: WhatsAppProvider
) {
  assertPermission(ctx, "SETTINGS_MANAGE");

  const gymConfig = await db.gymWhatsAppConfig.findUnique({
    where: { gymId: ctx.gymId },
  });

  const provider = providerOverride || getWhatsAppProvider(gymConfig);

  const gym = await db.gym.findUnique({
    where: { id: ctx.gymId },
    select: { name: true },
  });

  const testBody = `[FIXIA GymOS Test] Hi ${input.recipientName}, your WhatsApp Business integration for "${gym?.name || "Your Gym"}" is operational.\n\nMessage: ${input.messageText}`;

  // Log in notification history with eventType GYM_ANNOUNCEMENT and test flag
  const notification = await db.whatsAppNotification.create({
    data: {
      gymId: ctx.gymId,
      recipientPhone: input.recipientPhone,
      recipientName: input.recipientName,
      eventType: WhatsAppNotificationEvent.GYM_ANNOUNCEMENT,
      templateName: "gym_sandbox_test",
      messageBody: testBody,
      status: WhatsAppNotificationStatus.PENDING,
      provider: provider.type,
      idempotencyKey: `TEST_MSG:${Date.now()}:${Math.random().toString(36).substring(2, 7)}`,
    },
  });

  const sendResult = await provider.sendText({
    recipientPhone: input.recipientPhone,
    messageText: testBody,
  });

  if (sendResult.success) {
    await db.whatsAppNotification.update({
      where: { id: notification.id },
      data: {
        status: WhatsAppNotificationStatus.SENT,
        providerMessageId: sendResult.providerMessageId || null,
        sentAt: new Date(),
      },
    });

    return {
      success: true,
      providerMessageId: sendResult.providerMessageId,
      message: `Test message sent successfully via ${provider.type}.`,
    };
  } else {
    await db.whatsAppNotification.update({
      where: { id: notification.id },
      data: {
        status: WhatsAppNotificationStatus.FAILED,
        errorMessage: sendResult.error,
      },
    });

    return {
      success: false,
      error: sendResult.error || "Failed to deliver test message.",
    };
  }
}

/**
 * Sends an important gym announcement to opted-in members.
 */
export async function sendGymAnnouncement(
  ctx: TenantContext,
  input: SendAnnouncementInput,
  providerOverride?: WhatsAppProvider
) {
  assertPermission(ctx, "NOTIFICATION_SEND");

  const gym = await db.gym.findUnique({
    where: { id: ctx.gymId },
    select: { name: true },
  });

  let targetMembers: Array<{ id: string; phone: string | null; firstName: string; lastName: string }> = [];

  if (input.target === "SPECIFIC_MEMBER" && input.memberId) {
    const member = await db.member.findFirst({
      where: {
        id: input.memberId,
        gymId: ctx.gymId,
        whatsappConsent: true,
      },
      select: { id: true, phone: true, firstName: true, lastName: true },
    });

    if (!member) {
      throw new WhatsAppNotificationError("Selected member is not found or has not given WhatsApp consent.");
    }
    targetMembers = [member];
  } else {
    // Query active members with verified WhatsApp consent
    targetMembers = await db.member.findMany({
      where: {
        gymId: ctx.gymId,
        status: "ACTIVE",
        whatsappConsent: true,
        phone: { not: null },
      },
      select: { id: true, phone: true, firstName: true, lastName: true },
    });
  }

  if (targetMembers.length === 0) {
    return {
      success: true,
      totalDispatched: 0,
      message: "No opted-in members found with valid phone numbers to receive announcement.",
    };
  }

  let successCount = 0;
  let failureCount = 0;

  for (const m of targetMembers) {
    if (!m.phone) continue;

    const idempotencyKey = `ANNOUNCEMENT:${ctx.gymId}:${Date.now()}:${m.id}`;

    const res = await dispatchWhatsAppNotification({
      gymId: ctx.gymId,
      memberId: m.id,
      recipientPhone: m.phone,
      recipientName: `${m.firstName} ${m.lastName}`.trim(),
      eventType: WhatsAppNotificationEvent.GYM_ANNOUNCEMENT,
      parameters: {
        gymName: gym?.name || "Our Gym",
        announcementTitle: input.title,
        announcementBody: input.message,
      },
      idempotencyKey,
      providerOverride,
    });

    if (res.success) {
      successCount++;
    } else {
      failureCount++;
    }
  }

  return {
    success: true,
    totalDispatched: targetMembers.length,
    successCount,
    failureCount,
    message: `Dispatched announcement to ${successCount} opted-in members (${failureCount} failed).`,
  };
}

// ==============================================================================
// WEBHOOK DELIVERY & STATUS HANDLER (Confirmation Callback)
// ==============================================================================

export interface WebhookStatusPayload {
  providerMessageId: string;
  status: "delivered" | "read" | "failed";
  timestamp?: number | string;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Handles incoming provider status webhook events (Meta / Twilio).
 * Updates status from SENT to DELIVERED or READ only upon provider confirmation.
 */
export async function handleWhatsAppWebhookStatusUpdate(payload: WebhookStatusPayload) {
  const notification = await db.whatsAppNotification.findFirst({
    where: { providerMessageId: payload.providerMessageId },
  });

  if (!notification) {
    return { success: false, reason: "Notification not found for message ID." };
  }

  const updateData: any = {};
  const statusTime = payload.timestamp ? new Date(payload.timestamp) : new Date();

  if (payload.status === "delivered") {
    updateData.status = WhatsAppNotificationStatus.DELIVERED;
    updateData.deliveredAt = statusTime;
  } else if (payload.status === "read") {
    updateData.status = WhatsAppNotificationStatus.READ;
    updateData.readAt = statusTime;
    if (!notification.deliveredAt) {
      updateData.deliveredAt = statusTime;
    }
  } else if (payload.status === "failed") {
    updateData.status = WhatsAppNotificationStatus.FAILED;
    updateData.errorMessage = payload.errorMessage || `Delivery failed (Code: ${payload.errorCode || "Unknown"})`;
  }

  const updated = await db.whatsAppNotification.update({
    where: { id: notification.id },
    data: updateData,
  });

  return { success: true, notification: updated };
}

// ==============================================================================
// BUSINESS EVENT NOTIFICATION DISPATCHERS
// ==============================================================================

/**
 * 1. Dispatches membership welcome & activation confirmation.
 */
export async function notifyMembershipConfirmation(
  membershipId: string,
  providerOverride?: WhatsAppProvider
) {
  const membership = await db.membership.findUnique({
    where: { id: membershipId },
    include: {
      member: true,
      plan: true,
      gym: true,
    },
  });

  if (!membership || !membership.member || !membership.member.phone) {
    return { success: false, reason: "Membership or member phone not found." };
  }

  const idempotencyKey = `MEMBERSHIP_CONFIRMATION:${membership.id}`;

  return dispatchWhatsAppNotification({
    gymId: membership.gymId,
    memberId: membership.memberId,
    recipientPhone: membership.member.phone,
    recipientName: `${membership.member.firstName} ${membership.member.lastName}`.trim(),
    eventType: WhatsAppNotificationEvent.MEMBERSHIP_CONFIRMATION,
    parameters: {
      gymName: membership.gym.name,
      memberName: membership.member.firstName,
      planName: membership.plan.name,
      expiryDate: membership.endDate ? new Date(membership.endDate).toLocaleDateString() : "Ongoing",
      memberCode: membership.member.memberCode,
    },
    idempotencyKey,
    providerOverride,
  });
}

/**
 * 2. Dispatches membership expiry reminder.
 */
export async function notifyMembershipExpiryReminder(
  membershipId: string,
  daysRemaining: number,
  providerOverride?: WhatsAppProvider
) {
  const membership = await db.membership.findUnique({
    where: { id: membershipId },
    include: {
      member: true,
      plan: true,
      gym: true,
    },
  });

  if (!membership || !membership.member || !membership.member.phone) {
    return { success: false, reason: "Membership or member phone not found." };
  }

  // Scoped to date to avoid multiple reminders on the same day
  const dateStr = new Date().toISOString().split("T")[0];
  const idempotencyKey = `EXPIRY_REMINDER:${membership.id}:${dateStr}`;

  return dispatchWhatsAppNotification({
    gymId: membership.gymId,
    memberId: membership.memberId,
    recipientPhone: membership.member.phone,
    recipientName: `${membership.member.firstName} ${membership.member.lastName}`.trim(),
    eventType: WhatsAppNotificationEvent.MEMBERSHIP_EXPIRY_REMINDER,
    parameters: {
      memberName: membership.member.firstName,
      planName: membership.plan.name,
      gymName: membership.gym.name,
      daysRemaining: String(daysRemaining),
      expiryDate: membership.endDate ? new Date(membership.endDate).toLocaleDateString() : "Soon",
    },
    idempotencyKey,
    providerOverride,
  });
}

/**
 * 3. Dispatches payment receipt notification.
 */
export async function notifyPaymentReceipt(
  paymentId: string,
  providerOverride?: WhatsAppProvider
) {
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: {
      member: true,
      gym: true,
      allocations: {
        include: {
          invoice: true,
        },
      },
    },
  });

  if (!payment || !payment.member || !payment.member.phone) {
    return { success: false, reason: "Payment or member phone record not found." };
  }

  const idempotencyKey = `PAYMENT_RECEIPT:${payment.id}`;

  const remainingDue = payment.allocations?.[0]?.invoice
    ? Math.max(
        0,
        Number(payment.allocations[0].invoice.totalAmount) -
          Number(payment.allocations[0].invoice.paidAmount)
      ).toFixed(2)
    : "0.00";

  return dispatchWhatsAppNotification({
    gymId: payment.gymId,
    memberId: payment.memberId,
    recipientPhone: payment.member.phone,
    recipientName: `${payment.member.firstName} ${payment.member.lastName}`.trim(),
    eventType: WhatsAppNotificationEvent.PAYMENT_RECEIPT,
    parameters: {
      memberName: payment.member.firstName,
      currency: payment.gym.currency,
      amount: Number(payment.amount).toFixed(2),
      description: payment.notes || "Gym Membership Dues",
      receiptNumber: payment.paymentNumber,
      remainingDue,
      gymName: payment.gym.name,
    },
    idempotencyKey,
    providerOverride,
  });
}

/**
 * 4. Dispatches outstanding dues / invoice overdue reminder.
 */
export async function notifyDuesReminder(
  invoiceId: string,
  providerOverride?: WhatsAppProvider
) {
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      member: true,
      gym: true,
    },
  });

  if (!invoice || !invoice.member || !invoice.member.phone) {
    return { success: false, reason: "Invoice or member record not found." };
  }

  const pendingAmount = Math.max(0, Number(invoice.totalAmount) - Number(invoice.paidAmount));
  if (pendingAmount <= 0) {
    return { success: false, reason: "Invoice has zero outstanding balance." };
  }

  const dateStr = new Date().toISOString().split("T")[0];
  const idempotencyKey = `DUES_REMINDER:${invoice.id}:${dateStr}`;

  return dispatchWhatsAppNotification({
    gymId: invoice.gymId,
    memberId: invoice.memberId,
    recipientPhone: invoice.member.phone,
    recipientName: `${invoice.member.firstName} ${invoice.member.lastName}`.trim(),
    eventType: WhatsAppNotificationEvent.DUES_REMINDER,
    parameters: {
      memberName: invoice.member.firstName,
      gymName: invoice.gym.name,
      currency: invoice.gym.currency,
      outstandingAmount: pendingAmount.toFixed(2),
      invoiceNumber: invoice.invoiceNumber,
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "Immediate",
      gymPhone: invoice.gym.phone || "Front Desk",
    },
    idempotencyKey,
    providerOverride,
  });
}

/**
 * 5. Dispatches class booking confirmation.
 */
export async function notifyClassBookingConfirmation(
  bookingId: string,
  providerOverride?: WhatsAppProvider
) {
  const booking = await db.classBooking.findUnique({
    where: { id: bookingId },
    include: {
      member: true,
      gym: true,
      schedule: {
        include: {
          class: true,
        },
      },
    },
  });

  if (!booking || !booking.member || !booking.member.phone) {
    return { success: false, reason: "Booking or member phone not found." };
  }

  const idempotencyKey = `BOOKING_CONFIRMATION:${booking.id}`;
  const startTimeStr = booking.schedule?.startTime
    ? new Date(booking.schedule.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Scheduled Time";
  const classDateStr = booking.schedule?.startTime
    ? new Date(booking.schedule.startTime).toLocaleDateString()
    : new Date(booking.bookedAt).toLocaleDateString();

  return dispatchWhatsAppNotification({
    gymId: booking.gymId,
    memberId: booking.memberId,
    recipientPhone: booking.member.phone,
    recipientName: `${booking.member.firstName} ${booking.member.lastName}`.trim(),
    eventType: WhatsAppNotificationEvent.CLASS_BOOKING_CONFIRMATION,
    parameters: {
      className: booking.schedule?.class?.name || "Fitness Class",
      gymName: booking.gym.name,
      classDate: classDateStr,
      startTime: startTimeStr,
      trainerName: booking.schedule?.class?.name || "Staff Coach",
    },
    idempotencyKey,
    providerOverride,
  });
}

/**
 * 6. Dispatches class booking cancellation.
 */
export async function notifyClassBookingCancellation(
  bookingId: string,
  providerOverride?: WhatsAppProvider
) {
  const booking = await db.classBooking.findUnique({
    where: { id: bookingId },
    include: {
      member: true,
      gym: true,
      schedule: {
        include: {
          class: true,
        },
      },
    },
  });

  if (!booking || !booking.member || !booking.member.phone) {
    return { success: false, reason: "Booking or member phone not found." };
  }

  const idempotencyKey = `BOOKING_CANCELLATION:${booking.id}`;
  const startTimeStr = booking.schedule?.startTime
    ? new Date(booking.schedule.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Scheduled Time";
  const classDateStr = booking.schedule?.startTime
    ? new Date(booking.schedule.startTime).toLocaleDateString()
    : new Date(booking.bookedAt).toLocaleDateString();

  return dispatchWhatsAppNotification({
    gymId: booking.gymId,
    memberId: booking.memberId,
    recipientPhone: booking.member.phone,
    recipientName: `${booking.member.firstName} ${booking.member.lastName}`.trim(),
    eventType: WhatsAppNotificationEvent.BOOKING_CANCELLATION,
    parameters: {
      memberName: booking.member.firstName,
      className: booking.schedule?.class?.name || "Fitness Class",
      classDate: classDateStr,
      startTime: startTimeStr,
      gymName: booking.gym.name,
    },
    idempotencyKey,
    providerOverride,
  });
}

