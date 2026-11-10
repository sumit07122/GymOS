import { z } from "zod";
import { WhatsAppProviderType, WhatsAppNotificationEvent } from "@prisma/client";

// ==============================================================================
// FIXIA GymOS — WhatsApp Business Notifications Validation Schemas (M17)
// ==============================================================================

export const whatsappConfigSchema = z.object({
  provider: z.nativeEnum(WhatsAppProviderType).default(WhatsAppProviderType.MOCK_SANDBOX),
  isEnabled: z.boolean().default(false),
  isLiveDelivery: z.boolean().default(false),
  phoneNumberId: z.string().max(100).optional().nullable(),
  wabaId: z.string().max(100).optional().nullable(),
  accessToken: z.string().max(1000).optional().nullable(),
  accountSid: z.string().max(100).optional().nullable(),
  authToken: z.string().max(1000).optional().nullable(),
  senderPhoneNumber: z
    .string()
    .max(30)
    .regex(/^(\+[1-9]\d{1,14})?$/, "Phone number must be in E.164 format (e.g. +15551234567)")
    .optional()
    .nullable()
    .or(z.literal("")),
  webhookVerifyToken: z.string().max(100).optional().nullable(),
  notifyOnMembershipCreated: z.boolean().default(true),
  notifyOnMembershipExpiring: z.boolean().default(true),
  expiryReminderDays: z.number().int().min(1).max(30).default(3),
  notifyOnPaymentReceived: z.boolean().default(true),
  notifyOnDuesOverdue: z.boolean().default(true),
  notifyOnBookingConfirmed: z.boolean().default(true),
  notifyOnBookingCancelled: z.boolean().default(true),
  customHeader: z.string().max(60).optional().nullable(),
  customFooter: z.string().max(60).optional().nullable(),
});

export type WhatsAppConfigInput = z.input<typeof whatsappConfigSchema>;

export const memberConsentSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  whatsappConsent: z.boolean(),
  consentSource: z.string().max(50).default("FRONT_DESK"),
});

export type MemberConsentInput = z.infer<typeof memberConsentSchema>;

export const sendTestMessageSchema = z.object({
  recipientPhone: z
    .string()
    .min(8, "Phone number is too short")
    .max(20, "Phone number is too long")
    .regex(/^\+?[1-9]\d{6,14}$/, "Please enter a valid phone number with country code (e.g. +15551234567)"),
  recipientName: z.string().min(1, "Recipient name is required").max(100),
  messageText: z.string().min(3, "Message text is required").max(1000),
});

export type SendTestMessageInput = z.infer<typeof sendTestMessageSchema>;

export const sendAnnouncementSchema = z.object({
  target: z.enum(["ALL_OPTED_IN_MEMBERS", "ACTIVE_PLAN_HOLDERS", "SPECIFIC_MEMBER"]).default("ALL_OPTED_IN_MEMBERS"),
  memberId: z.string().optional().nullable(),
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  message: z.string().min(5, "Message must be at least 5 characters").max(1000),
});

export type SendAnnouncementInput = z.infer<typeof sendAnnouncementSchema>;

export const retryNotificationSchema = z.object({
  notificationId: z.string().min(1, "Notification ID is required"),
});

export type RetryNotificationInput = z.infer<typeof retryNotificationSchema>;

export const updateTemplateSchema = z.object({
  templateId: z.string().min(1),
  eventType: z.nativeEnum(WhatsAppNotificationEvent),
  bodyText: z.string().min(10, "Template body must be at least 10 characters").max(2000),
  headerText: z.string().max(60).optional().nullable(),
  footerText: z.string().max(60).optional().nullable(),
});

export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;

