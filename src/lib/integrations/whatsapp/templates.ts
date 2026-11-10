import { WhatsAppNotificationEvent } from "@prisma/client";

// ==============================================================================
// FIXIA GymOS — WhatsApp Approved Templates & Variable Interpolator (M17)
// ==============================================================================

export interface StandardTemplateDefinition {
  eventType: WhatsAppNotificationEvent;
  templateName: string;
  languageCode: string;
  headerText: string | null;
  bodyText: string;
  footerText: string | null;
  variables: string[];
  description: string;
}

export const STANDARD_WHATSAPP_TEMPLATES: Record<
  WhatsAppNotificationEvent,
  StandardTemplateDefinition
> = {
  MEMBERSHIP_CONFIRMATION: {
    eventType: "MEMBERSHIP_CONFIRMATION",
    templateName: "gym_membership_welcome",
    languageCode: "en_US",
    headerText: "Welcome to {{gymName}}",
    bodyText:
      "Hi {{memberName}}! 🎉 Welcome to {{gymName}}. Your {{planName}} membership has been activated and is valid until {{expiryDate}}. Your unique member code is {{memberCode}}. Train hard and reach your peak!",
    footerText: "Powered by FIXIA GymOS",
    variables: ["gymName", "memberName", "planName", "expiryDate", "memberCode"],
    description: "Dispatched automatically when a new membership plan is registered or renewed.",
  },
  MEMBERSHIP_EXPIRY_REMINDER: {
    eventType: "MEMBERSHIP_EXPIRY_REMINDER",
    templateName: "gym_membership_expiry_reminder",
    languageCode: "en_US",
    headerText: "Membership Renewal Alert",
    bodyText:
      "Hi {{memberName}}, this is a friendly reminder that your {{planName}} membership at {{gymName}} will expire in {{daysRemaining}} days on {{expiryDate}}. Renew at the front desk or via your member portal to avoid any interruption in your training.",
    footerText: "Reply HELP or stop by the front desk for renewal packages.",
    variables: ["memberName", "planName", "gymName", "daysRemaining", "expiryDate"],
    description: "Sent in advance (e.g. 3 days before) to prevent lapses in gym access.",
  },
  PAYMENT_RECEIPT: {
    eventType: "PAYMENT_RECEIPT",
    templateName: "gym_payment_receipt",
    languageCode: "en_US",
    headerText: "Payment Receipt Confirmed",
    bodyText:
      "Hi {{memberName}}, we have received your payment of {{currency}} {{amount}} for {{description}} (Receipt #{{receiptNumber}}). Your current outstanding balance is {{currency}} {{remainingDue}}. Thank you for your continued support!",
    footerText: "Official payment receipt from {{gymName}}",
    variables: ["memberName", "currency", "amount", "description", "receiptNumber", "remainingDue", "gymName"],
    description: "Dispatched upon successful recording of cash, UPI, card, or bank transfer payments.",
  },
  DUES_REMINDER: {
    eventType: "DUES_REMINDER",
    templateName: "gym_dues_reminder",
    languageCode: "en_US",
    headerText: "Outstanding Balance Notice",
    bodyText:
      "Hi {{memberName}}, this is a courtesy reminder from {{gymName}} regarding your pending balance of {{currency}} {{outstandingAmount}} for invoice #{{invoiceNumber}} (Due: {{dueDate}}). Kindly settle your dues at your earliest convenience.",
    footerText: "Contact {{gymPhone}} for assistance.",
    variables: ["memberName", "gymName", "currency", "outstandingAmount", "invoiceNumber", "dueDate", "gymPhone"],
    description: "Sent to members with pending invoices to prompt timely fee collection.",
  },
  CLASS_BOOKING_CONFIRMATION: {
    eventType: "CLASS_BOOKING_CONFIRMATION",
    templateName: "gym_class_booking_confirmed",
    languageCode: "en_US",
    headerText: "Class Booking Confirmed",
    bodyText:
      "Booking Confirmed! You are registered for {{className}} at {{gymName}} on {{classDate}} at {{startTime}} with Coach {{trainerName}}. Please arrive 10 minutes before start time.",
    footerText: "Need to reschedule? Cancel at least 2 hours in advance via the portal.",
    variables: ["className", "gymName", "classDate", "startTime", "trainerName"],
    description: "Sent to members when their group class or workout slot reservation is confirmed.",
  },
  BOOKING_CANCELLATION: {
    eventType: "BOOKING_CANCELLATION",
    templateName: "gym_class_booking_cancelled",
    languageCode: "en_US",
    headerText: "Booking Cancellation Notice",
    bodyText:
      "Hi {{memberName}}, your booking for {{className}} on {{classDate}} at {{startTime}} at {{gymName}} has been cancelled. Your booking credit has been restored where applicable.",
    footerText: "Explore alternative classes in your member portal.",
    variables: ["memberName", "className", "classDate", "startTime", "gymName"],
    description: "Sent to members when their class booking is cancelled by them or by staff.",
  },
  GYM_ANNOUNCEMENT: {
    eventType: "GYM_ANNOUNCEMENT",
    templateName: "gym_important_announcement",
    languageCode: "en_US",
    headerText: "Important Gym Announcement",
    bodyText:
      "Attention {{gymName}} Members:\n\n*{{announcementTitle}}*\n\n{{announcementBody}}\n\nThank you for being a valued member of our fitness community!",
    footerText: "Broadcast sent to all subscribed members.",
    variables: ["gymName", "announcementTitle", "announcementBody"],
    description: "Owner broadcast for facility upgrades, holiday hours, schedule adjustments, or weather alerts.",
  },
};

/**
 * Interpolates variables into a template text string.
 * Supports both {{variableName}} and {{1}}, {{2}} positional styles.
 */
export function interpolateTemplateText(
  templateText: string,
  parameters: Record<string, string | number | undefined | null>
): string {
  let result = templateText;

  // Replace named variables {{key}}
  for (const [key, value] of Object.entries(parameters)) {
    const formatted = value !== undefined && value !== null ? String(value) : "";
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    result = result.replace(regex, formatted);
  }

  return result;
}

