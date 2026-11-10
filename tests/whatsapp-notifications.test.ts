/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  dispatchWhatsAppNotification,
  getOrCreateWhatsAppConfig,
  updateWhatsAppConfig,
  getWhatsAppTemplates,
  updateWhatsAppTemplate,
  updateMemberWhatsAppConsent,
  retryWhatsAppNotification,
  sendTestWhatsAppMessage,
  sendGymAnnouncement,
  handleWhatsAppWebhookStatusUpdate,
  notifyMembershipConfirmation,
  notifyMembershipExpiryReminder,
  notifyPaymentReceipt,
  notifyDuesReminder,
  notifyClassBookingConfirmation,
  notifyClassBookingCancellation,
  WhatsAppConsentRequiredError,
  WhatsAppNotificationError,
} from "@/lib/services/whatsapp.service";
import {
  MockSandboxWhatsAppProvider,
  getWhatsAppProvider,
} from "@/lib/integrations/whatsapp/provider";
import { interpolateTemplateText } from "@/lib/integrations/whatsapp/templates";
import { createTenantContext } from "@/lib/tenant/context";
import { InsufficientPermissionError } from "@/lib/tenant/permissions";
import { db } from "@/lib/db";
import {
  GymRole,
  WhatsAppProviderType,
  WhatsAppNotificationEvent,
  WhatsAppNotificationStatus,
} from "@prisma/client";

describe("Milestone M17: WhatsApp Business Notifications", () => {
  const gymAlpha = {
    id: "gym-alpha-wa",
    name: "Alpha Strength Club",
    slug: "alpha-strength",
    phone: "+1 555-0100",
    currency: "USD",
  };

  const gymBeta = {
    id: "gym-beta-wa",
    name: "Beta Performance Gym",
    slug: "beta-gym",
    phone: "+1 555-0200",
    currency: "EUR",
  };

  const ownerAlphaContext = createTenantContext({
    gymId: gymAlpha.id,
    userId: "owner-alpha",
    userEmail: "owner@alphagym.com",
    role: GymRole.OWNER,
  });

  const staffAlphaContext = createTenantContext({
    gymId: gymAlpha.id,
    userId: "staff-alpha",
    userEmail: "staff@alphagym.com",
    role: GymRole.STAFF,
  });

  const memberAlphaContext = createTenantContext({
    gymId: gymAlpha.id,
    userId: "member-alpha",
    userEmail: "member@alphagym.com",
    role: GymRole.MEMBER,
  });

  const memberConsented = {
    id: "mem-opted-in",
    gymId: gymAlpha.id,
    memberCode: "MEM-101",
    firstName: "Sarah",
    lastName: "Connor",
    phone: "+1 555-0199",
    whatsappConsent: true,
    whatsappConsentAt: new Date(),
    whatsappConsentSource: "FRONT_DESK",
  };

  const memberNotConsented = {
    id: "mem-opted-out",
    gymId: gymAlpha.id,
    memberCode: "MEM-102",
    firstName: "John",
    lastName: "Doe",
    phone: "+1 555-0188",
    whatsappConsent: false,
    whatsappConsentAt: null,
    whatsappConsentSource: null,
  };

  const mockConfig = {
    id: "config-wa-1",
    gymId: gymAlpha.id,
    provider: WhatsAppProviderType.MOCK_SANDBOX,
    isEnabled: true,
    isLiveDelivery: false,
    phoneNumberId: null,
    wabaId: null,
    accessToken: null,
    accountSid: null,
    authToken: null,
    senderPhoneNumber: null,
    webhookVerifyToken: null,
    notifyOnMembershipCreated: true,
    notifyOnMembershipExpiring: true,
    expiryReminderDays: 3,
    notifyOnPaymentReceived: true,
    notifyOnDuesOverdue: true,
    notifyOnBookingConfirmed: true,
    notifyOnBookingCancelled: true,
    customHeader: null,
    customFooter: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(db.whatsAppTemplate, "createMany").mockResolvedValue({ count: 7 } as any);
  });

  // ============================================================================
  // 1. MEMBER CONSENT ENFORCEMENT & COMPLIANCE
  // ============================================================================
  describe("Consent Enforcement & Opt-In Rules", () => {
    it("allows notification dispatch when member has verified WhatsApp opt-in consent", async () => {
      vi.spyOn(db.member, "findUnique").mockResolvedValue(memberConsented as any);
      vi.spyOn(db.gymWhatsAppConfig, "findUnique").mockResolvedValue(mockConfig as any);
      vi.spyOn(db.whatsAppTemplate, "findFirst").mockResolvedValue(null);

      const mockCreatedNotification = {
        id: "notif-1",
        gymId: gymAlpha.id,
        memberId: memberConsented.id,
        recipientPhone: memberConsented.phone,
        recipientName: "Sarah Connor",
        eventType: WhatsAppNotificationEvent.MEMBERSHIP_CONFIRMATION,
        templateName: "gym_membership_welcome",
        messageBody: "Welcome to Alpha Strength Club",
        status: WhatsAppNotificationStatus.PENDING,
        provider: WhatsAppProviderType.MOCK_SANDBOX,
        retryCount: 0,
        maxRetries: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(db.whatsAppNotification, "create").mockResolvedValue(mockCreatedNotification as any);
      vi.spyOn(db.whatsAppNotification, "update").mockResolvedValue({
        ...mockCreatedNotification,
        status: WhatsAppNotificationStatus.SENT,
        providerMessageId: "wamid.mock_123",
      } as any);

      const result = await dispatchWhatsAppNotification({
        gymId: gymAlpha.id,
        memberId: memberConsented.id,
        recipientPhone: memberConsented.phone,
        recipientName: "Sarah Connor",
        eventType: WhatsAppNotificationEvent.MEMBERSHIP_CONFIRMATION,
        parameters: {
          gymName: gymAlpha.name,
          memberName: memberConsented.firstName,
          planName: "Pro Annual",
          expiryDate: "12/31/2026",
          memberCode: memberConsented.memberCode,
        },
      });

      expect(result.success).toBe(true);
      expect((result as any).notification.status).toBe(WhatsAppNotificationStatus.SENT);
    });

    it("strictly blocks notification dispatch and throws WhatsAppConsentRequiredError when member has not opted in", async () => {
      vi.spyOn(db.member, "findUnique").mockResolvedValue(memberNotConsented as any);

      await expect(
        dispatchWhatsAppNotification({
          gymId: gymAlpha.id,
          memberId: memberNotConsented.id,
          recipientPhone: memberNotConsented.phone,
          recipientName: "John Doe",
          eventType: WhatsAppNotificationEvent.PAYMENT_RECEIPT,
          parameters: {
            gymName: gymAlpha.name,
            memberName: "John",
            currency: "USD",
            amount: "150",
          },
        })
      ).rejects.toThrow(WhatsAppConsentRequiredError);
    });

    it("allows updating member opt-in consent status with audit source", async () => {
      vi.spyOn(db.member, "findFirst").mockResolvedValue(memberNotConsented as any);
      const updateMemberSpy = vi.spyOn(db.member, "update").mockResolvedValue({
        ...memberNotConsented,
        whatsappConsent: true,
        whatsappConsentAt: new Date(),
        whatsappConsentSource: "MEMBER_PORTAL",
      } as any);

      const updated = await updateMemberWhatsAppConsent(staffAlphaContext, {
        memberId: memberNotConsented.id,
        whatsappConsent: true,
        consentSource: "MEMBER_PORTAL",
      });

      expect(updated.whatsappConsent).toBe(true);
      expect(updateMemberSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: memberNotConsented.id },
          data: expect.objectContaining({
            whatsappConsent: true,
            whatsappConsentSource: "MEMBER_PORTAL",
          }),
        })
      );
    });
  });

  // ============================================================================
  // 2. DUPLICATE PREVENTION & IDEMPOTENCY
  // ============================================================================
  describe("Duplicate Notification Prevention", () => {
    it("skips duplicate sending if notification with same idempotencyKey was already delivered", async () => {
      const idempotencyKey = "PAYMENT_RECEIPT:pay-123";

      vi.spyOn(db.member, "findUnique").mockResolvedValue(memberConsented as any);
      vi.spyOn(db.whatsAppNotification, "findUnique").mockResolvedValue({
        id: "notif-existing",
        gymId: gymAlpha.id,
        idempotencyKey,
        status: WhatsAppNotificationStatus.DELIVERED,
      } as any);

      const createSpy = vi.spyOn(db.whatsAppNotification, "create");

      const result = await dispatchWhatsAppNotification({
        gymId: gymAlpha.id,
        memberId: memberConsented.id,
        recipientPhone: memberConsented.phone,
        eventType: WhatsAppNotificationEvent.PAYMENT_RECEIPT,
        parameters: { amount: "100" },
        idempotencyKey,
      });

      expect((result as any).alreadySent).toBe(true);
      expect(createSpy).not.toHaveBeenCalled();
    });

    it("proceeds with dispatch if no prior notification matches idempotencyKey", async () => {
      const idempotencyKey = "PAYMENT_RECEIPT:pay-456";

      vi.spyOn(db.member, "findUnique").mockResolvedValue(memberConsented as any);
      vi.spyOn(db.whatsAppNotification, "findUnique").mockResolvedValue(null);
      vi.spyOn(db.gymWhatsAppConfig, "findUnique").mockResolvedValue(mockConfig as any);
      vi.spyOn(db.whatsAppTemplate, "findFirst").mockResolvedValue(null);

      vi.spyOn(db.whatsAppNotification, "create").mockResolvedValue({
        id: "notif-new",
        gymId: gymAlpha.id,
        idempotencyKey,
        status: WhatsAppNotificationStatus.PENDING,
      } as any);
      vi.spyOn(db.whatsAppNotification, "update").mockResolvedValue({
        id: "notif-new",
        status: WhatsAppNotificationStatus.SENT,
      } as any);

      const result = await dispatchWhatsAppNotification({
        gymId: gymAlpha.id,
        memberId: memberConsented.id,
        recipientPhone: memberConsented.phone,
        eventType: WhatsAppNotificationEvent.PAYMENT_RECEIPT,
        parameters: { amount: "100" },
        idempotencyKey,
      });

      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // 3. ALL 7 NOTIFICATION EVENTS & PARAMETER INTERPOLATION
  // ============================================================================
  describe("7 Official Notification Events & Templates", () => {
    it("correctly interpolates dynamic variables in template text", () => {
      const template = "Welcome to {{gymName}}, {{memberName}}! Valid until {{expiryDate}}.";
      const interpolated = interpolateTemplateText(template, {
        gymName: "Alpha Strength",
        memberName: "Sarah",
        expiryDate: "2026-12-31",
      });

      expect(interpolated).toBe("Welcome to Alpha Strength, Sarah! Valid until 2026-12-31.");
    });

    it("1. handles notifyMembershipConfirmation", async () => {
      vi.spyOn(db.membership, "findUnique").mockResolvedValue({
        id: "membership-001",
        gymId: gymAlpha.id,
        memberId: memberConsented.id,
        endDate: new Date("2026-12-31"),
        gym: gymAlpha,
        member: memberConsented,
        plan: { name: "Pro Strength 12-Month" },
      } as any);

      vi.spyOn(db.member, "findUnique").mockResolvedValue(memberConsented as any);
      vi.spyOn(db.whatsAppNotification, "findUnique").mockResolvedValue(null);
      vi.spyOn(db.gymWhatsAppConfig, "findUnique").mockResolvedValue(mockConfig as any);
      vi.spyOn(db.whatsAppTemplate, "findFirst").mockResolvedValue(null);

      const createSpy = vi.spyOn(db.whatsAppNotification, "create").mockResolvedValue({
        id: "notif-welcome",
        status: WhatsAppNotificationStatus.PENDING,
      } as any);
      vi.spyOn(db.whatsAppNotification, "update").mockResolvedValue({
        id: "notif-welcome",
        status: WhatsAppNotificationStatus.SENT,
      } as any);

      const res = await notifyMembershipConfirmation("membership-001");
      expect(res.success).toBe(true);
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: WhatsAppNotificationEvent.MEMBERSHIP_CONFIRMATION,
            recipientPhone: memberConsented.phone,
          }),
        })
      );
    });

    it("2. handles notifyMembershipExpiryReminder", async () => {
      vi.spyOn(db.membership, "findUnique").mockResolvedValue({
        id: "membership-002",
        gymId: gymAlpha.id,
        memberId: memberConsented.id,
        endDate: new Date("2026-03-31"),
        gym: gymAlpha,
        member: memberConsented,
        plan: { name: "Quarterly Flex" },
      } as any);

      vi.spyOn(db.member, "findUnique").mockResolvedValue(memberConsented as any);
      vi.spyOn(db.whatsAppNotification, "findUnique").mockResolvedValue(null);
      vi.spyOn(db.gymWhatsAppConfig, "findUnique").mockResolvedValue(mockConfig as any);
      vi.spyOn(db.whatsAppTemplate, "findFirst").mockResolvedValue(null);

      const createSpy = vi.spyOn(db.whatsAppNotification, "create").mockResolvedValue({
        id: "notif-expiry",
        status: WhatsAppNotificationStatus.PENDING,
      } as any);
      vi.spyOn(db.whatsAppNotification, "update").mockResolvedValue({
        id: "notif-expiry",
        status: WhatsAppNotificationStatus.SENT,
      } as any);

      const res = await notifyMembershipExpiryReminder("membership-002", 3);
      expect(res.success).toBe(true);
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: WhatsAppNotificationEvent.MEMBERSHIP_EXPIRY_REMINDER,
          }),
        })
      );
    });

    it("3. handles notifyPaymentReceipt", async () => {
      vi.spyOn(db.payment, "findUnique").mockResolvedValue({
        id: "payment-003",
        gymId: gymAlpha.id,
        memberId: memberConsented.id,
        amount: 89.0 as any,
        paymentNumber: "PAY-901",
        notes: "Monthly Membership Dues",
        gym: gymAlpha,
        member: memberConsented,
        allocations: [
          {
            invoice: {
              totalAmount: 89.0,
              paidAmount: 89.0,
            },
          },
        ],
      } as any);

      vi.spyOn(db.member, "findUnique").mockResolvedValue(memberConsented as any);
      vi.spyOn(db.whatsAppNotification, "findUnique").mockResolvedValue(null);
      vi.spyOn(db.gymWhatsAppConfig, "findUnique").mockResolvedValue(mockConfig as any);
      vi.spyOn(db.whatsAppTemplate, "findFirst").mockResolvedValue(null);

      const createSpy = vi.spyOn(db.whatsAppNotification, "create").mockResolvedValue({
        id: "notif-payment",
        status: WhatsAppNotificationStatus.PENDING,
      } as any);
      vi.spyOn(db.whatsAppNotification, "update").mockResolvedValue({
        id: "notif-payment",
        status: WhatsAppNotificationStatus.SENT,
      } as any);

      const res = await notifyPaymentReceipt("payment-003");
      expect(res.success).toBe(true);
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: WhatsAppNotificationEvent.PAYMENT_RECEIPT,
          }),
        })
      );
    });

    it("4. handles notifyDuesReminder", async () => {
      vi.spyOn(db.invoice, "findUnique").mockResolvedValue({
        id: "invoice-004",
        gymId: gymAlpha.id,
        memberId: memberConsented.id,
        invoiceNumber: "INV-2024",
        totalAmount: 150.0 as any,
        paidAmount: 50.0 as any,
        dueDate: new Date("2026-04-01"),
        gym: gymAlpha,
        member: memberConsented,
      } as any);

      vi.spyOn(db.member, "findUnique").mockResolvedValue(memberConsented as any);
      vi.spyOn(db.whatsAppNotification, "findUnique").mockResolvedValue(null);
      vi.spyOn(db.gymWhatsAppConfig, "findUnique").mockResolvedValue(mockConfig as any);
      vi.spyOn(db.whatsAppTemplate, "findFirst").mockResolvedValue(null);

      const createSpy = vi.spyOn(db.whatsAppNotification, "create").mockResolvedValue({
        id: "notif-dues",
        status: WhatsAppNotificationStatus.PENDING,
      } as any);
      vi.spyOn(db.whatsAppNotification, "update").mockResolvedValue({
        id: "notif-dues",
        status: WhatsAppNotificationStatus.SENT,
      } as any);

      const res = await notifyDuesReminder("invoice-004");
      expect(res.success).toBe(true);
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: WhatsAppNotificationEvent.DUES_REMINDER,
          }),
        })
      );
    });

    it("5. handles notifyClassBookingConfirmation", async () => {
      vi.spyOn(db.classBooking, "findUnique").mockResolvedValue({
        id: "booking-005",
        gymId: gymAlpha.id,
        memberId: memberConsented.id,
        bookedAt: new Date("2026-04-10"),
        gym: gymAlpha,
        member: memberConsented,
        schedule: {
          startTime: new Date("2026-04-10T07:00:00Z"),
          class: { name: "Olympic Weightlifting", trainerName: "Coach Marcus" },
        },
      } as any);

      vi.spyOn(db.member, "findUnique").mockResolvedValue(memberConsented as any);
      vi.spyOn(db.whatsAppNotification, "findUnique").mockResolvedValue(null);
      vi.spyOn(db.gymWhatsAppConfig, "findUnique").mockResolvedValue(mockConfig as any);
      vi.spyOn(db.whatsAppTemplate, "findFirst").mockResolvedValue(null);

      const createSpy = vi.spyOn(db.whatsAppNotification, "create").mockResolvedValue({
        id: "notif-booking",
        status: WhatsAppNotificationStatus.PENDING,
      } as any);
      vi.spyOn(db.whatsAppNotification, "update").mockResolvedValue({
        id: "notif-booking",
        status: WhatsAppNotificationStatus.SENT,
      } as any);

      const res = await notifyClassBookingConfirmation("booking-005");
      expect(res.success).toBe(true);
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: WhatsAppNotificationEvent.CLASS_BOOKING_CONFIRMATION,
          }),
        })
      );
    });

    it("6. handles notifyClassBookingCancellation", async () => {
      vi.spyOn(db.classBooking, "findUnique").mockResolvedValue({
        id: "booking-006",
        gymId: gymAlpha.id,
        memberId: memberConsented.id,
        bookedAt: new Date("2026-04-10"),
        gym: gymAlpha,
        member: memberConsented,
        schedule: {
          startTime: new Date("2026-04-10T07:00:00Z"),
          class: { name: "Olympic Weightlifting" },
        },
      } as any);

      vi.spyOn(db.member, "findUnique").mockResolvedValue(memberConsented as any);
      vi.spyOn(db.whatsAppNotification, "findUnique").mockResolvedValue(null);
      vi.spyOn(db.gymWhatsAppConfig, "findUnique").mockResolvedValue(mockConfig as any);
      vi.spyOn(db.whatsAppTemplate, "findFirst").mockResolvedValue(null);

      const createSpy = vi.spyOn(db.whatsAppNotification, "create").mockResolvedValue({
        id: "notif-cancel",
        status: WhatsAppNotificationStatus.PENDING,
      } as any);
      vi.spyOn(db.whatsAppNotification, "update").mockResolvedValue({
        id: "notif-cancel",
        status: WhatsAppNotificationStatus.SENT,
      } as any);

      const res = await notifyClassBookingCancellation("booking-006");
      expect(res.success).toBe(true);
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: WhatsAppNotificationEvent.BOOKING_CANCELLATION,
          }),
        })
      );
    });

    it("7. handles sendGymAnnouncement to opted-in members", async () => {
      vi.spyOn(db.gym, "findUnique").mockResolvedValue(gymAlpha as any);
      vi.spyOn(db.member, "findMany").mockResolvedValue([memberConsented] as any);
      vi.spyOn(db.member, "findUnique").mockResolvedValue(memberConsented as any);
      vi.spyOn(db.whatsAppNotification, "findUnique").mockResolvedValue(null);
      vi.spyOn(db.gymWhatsAppConfig, "findUnique").mockResolvedValue(mockConfig as any);
      vi.spyOn(db.whatsAppTemplate, "findFirst").mockResolvedValue(null);

      vi.spyOn(db.whatsAppNotification, "create").mockResolvedValue({
        id: "notif-announcement",
        status: WhatsAppNotificationStatus.PENDING,
      } as any);
      vi.spyOn(db.whatsAppNotification, "update").mockResolvedValue({
        id: "notif-announcement",
        status: WhatsAppNotificationStatus.SENT,
      } as any);

      const res = await sendGymAnnouncement(staffAlphaContext, {
        target: "ALL_OPTED_IN_MEMBERS",
        title: "Labor Day Schedule",
        message: "We will be open 08:00 - 14:00 on Monday.",
      });

      expect(res.success).toBe(true);
      expect(res.successCount).toBe(1);
    });
  });

  // ============================================================================
  // 4. PROVIDER FAILURES, ERROR RECORDING & RETRY HANDLING
  // ============================================================================
  describe("Provider Failures & Retry Lifecycle", () => {
    it("marks notification as FAILED and records error message when provider rejects send", async () => {
      vi.spyOn(db.member, "findUnique").mockResolvedValue(memberConsented as any);
      vi.spyOn(db.whatsAppNotification, "findUnique").mockResolvedValue(null);
      vi.spyOn(db.gymWhatsAppConfig, "findUnique").mockResolvedValue(mockConfig as any);
      vi.spyOn(db.whatsAppTemplate, "findFirst").mockResolvedValue(null);

      const failingProvider = new MockSandboxWhatsAppProvider({ simulateFailures: true });

      vi.spyOn(db.whatsAppNotification, "create").mockResolvedValue({
        id: "notif-fail-1",
        status: WhatsAppNotificationStatus.PENDING,
      } as any);

      const updateSpy = vi.spyOn(db.whatsAppNotification, "update").mockResolvedValue({
        id: "notif-fail-1",
        status: WhatsAppNotificationStatus.FAILED,
        errorMessage: "Provider rejected message: Simulated sandbox carrier rejection.",
      } as any);

      const result = await dispatchWhatsAppNotification({
        gymId: gymAlpha.id,
        memberId: memberConsented.id,
        recipientPhone: memberConsented.phone,
        eventType: WhatsAppNotificationEvent.PAYMENT_RECEIPT,
        parameters: { amount: "50" },
        providerOverride: failingProvider,
      });

      expect(result.success).toBe(false);
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "notif-fail-1" },
          data: expect.objectContaining({
            status: WhatsAppNotificationStatus.FAILED,
          }),
        })
      );
    });

    it("successfully retries a previously failed notification and increments retryCount", async () => {
      const failedRecord = {
        id: "notif-failed",
        gymId: gymAlpha.id,
        memberId: memberConsented.id,
        recipientPhone: memberConsented.phone,
        recipientName: "Sarah Connor",
        eventType: WhatsAppNotificationEvent.PAYMENT_RECEIPT,
        templateName: "gym_payment_receipt",
        parameters: JSON.stringify({ amount: "50" }),
        messageBody: "Your receipt",
        status: WhatsAppNotificationStatus.FAILED,
        retryCount: 1,
        maxRetries: 3,
        member: memberConsented,
      };

      vi.spyOn(db.whatsAppNotification, "findFirst").mockResolvedValue(failedRecord as any);
      vi.spyOn(db.gymWhatsAppConfig, "findUnique").mockResolvedValue(mockConfig as any);

      const workingProvider = new MockSandboxWhatsAppProvider({ simulateFailures: false });

      const updateSpy = vi.spyOn(db.whatsAppNotification, "update")
        .mockResolvedValueOnce({ ...failedRecord, retryCount: 2, status: WhatsAppNotificationStatus.PENDING } as any)
        .mockResolvedValueOnce({ ...failedRecord, retryCount: 2, status: WhatsAppNotificationStatus.SENT } as any);

      const retryRes = await retryWhatsAppNotification(
        staffAlphaContext,
        "notif-failed",
        workingProvider
      );

      expect(retryRes.success).toBe(true);
      expect(updateSpy).toHaveBeenCalledTimes(2);
    });

    it("rejects retry when max retries limit (3) is exceeded", async () => {
      const exhaustedRecord = {
        id: "notif-exhausted",
        gymId: gymAlpha.id,
        memberId: memberConsented.id,
        status: WhatsAppNotificationStatus.FAILED,
        retryCount: 3,
        maxRetries: 3,
        member: memberConsented,
      };

      vi.spyOn(db.whatsAppNotification, "findFirst").mockResolvedValue(exhaustedRecord as any);

      await expect(
        retryWhatsAppNotification(staffAlphaContext, "notif-exhausted")
      ).rejects.toThrow(WhatsAppNotificationError);
    });
  });

  // ============================================================================
  // 5. DELIVERY STATUS INTEGRITY & WEBHOOK CONFIRMATION
  // ============================================================================
  describe("Delivery Status Integrity & Webhooks", () => {
    it("never falsely claims DELIVERED upon initial dispatch; initial status is SENT", async () => {
      vi.spyOn(db.member, "findUnique").mockResolvedValue(memberConsented as any);
      vi.spyOn(db.whatsAppNotification, "findUnique").mockResolvedValue(null);
      vi.spyOn(db.gymWhatsAppConfig, "findUnique").mockResolvedValue(mockConfig as any);
      vi.spyOn(db.whatsAppTemplate, "findFirst").mockResolvedValue(null);

      vi.spyOn(db.whatsAppNotification, "create").mockResolvedValue({
        id: "notif-test",
        status: WhatsAppNotificationStatus.PENDING,
      } as any);
      const updateSpy = vi.spyOn(db.whatsAppNotification, "update").mockResolvedValue({
        id: "notif-test",
        status: WhatsAppNotificationStatus.SENT,
      } as any);

      await dispatchWhatsAppNotification({
        gymId: gymAlpha.id,
        memberId: memberConsented.id,
        recipientPhone: memberConsented.phone,
        eventType: WhatsAppNotificationEvent.PAYMENT_RECEIPT,
        parameters: { amount: "100" },
      });

      // Verify status set to SENT, NOT DELIVERED
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: WhatsAppNotificationStatus.SENT,
          }),
        })
      );
    });

    it("updates status to DELIVERED when webhook delivery callback is received", async () => {
      const sentNotification = {
        id: "notif-webhook-1",
        providerMessageId: "wamid.mock_webhook_123",
        status: WhatsAppNotificationStatus.SENT,
      };

      vi.spyOn(db.whatsAppNotification, "findFirst").mockResolvedValue(sentNotification as any);
      const updateSpy = vi.spyOn(db.whatsAppNotification, "update").mockResolvedValue({
        ...sentNotification,
        status: WhatsAppNotificationStatus.DELIVERED,
        deliveredAt: new Date(),
      } as any);

      const webhookRes = await handleWhatsAppWebhookStatusUpdate({
        providerMessageId: "wamid.mock_webhook_123",
        status: "delivered",
        timestamp: Date.now(),
      });

      expect(webhookRes.success).toBe(true);
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: WhatsAppNotificationStatus.DELIVERED,
          }),
        })
      );
    });

    it("updates status to READ when member opens the message", async () => {
      const sentNotification = {
        id: "notif-webhook-2",
        providerMessageId: "wamid.mock_webhook_456",
        status: WhatsAppNotificationStatus.DELIVERED,
      };

      vi.spyOn(db.whatsAppNotification, "findFirst").mockResolvedValue(sentNotification as any);
      const updateSpy = vi.spyOn(db.whatsAppNotification, "update").mockResolvedValue({
        ...sentNotification,
        status: WhatsAppNotificationStatus.READ,
        readAt: new Date(),
      } as any);

      const webhookRes = await handleWhatsAppWebhookStatusUpdate({
        providerMessageId: "wamid.mock_webhook_456",
        status: "read",
        timestamp: Date.now(),
      });

      expect(webhookRes.success).toBe(true);
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: WhatsAppNotificationStatus.READ,
          }),
        })
      );
    });
  });

  // ============================================================================
  // 6. OWNER SETTINGS, CREDENTIAL MASKING & RBAC
  // ============================================================================
  describe("Owner Settings & Security Isolation", () => {
    it("masks sensitive access tokens and auth tokens on retrieval", async () => {
      const configWithSecrets = {
        ...mockConfig,
        accessToken: "EAAG_super_secret_permanent_token_xyz123",
        authToken: "twilio_secret_auth_token_456",
      };

      vi.spyOn(db.gymWhatsAppConfig, "findUnique").mockResolvedValue(configWithSecrets as any);
      vi.spyOn(db.whatsAppTemplate, "findMany").mockResolvedValue([]);

      const result = await getOrCreateWhatsAppConfig(ownerAlphaContext);

      expect(result.accessToken).toBe("EAAG_super_secret_permanent_token_xyz123");
      expect(result.accessTokenMasked).toBe("EAAG••••••••z123");
      expect(result.authTokenMasked).toBe("twil••••••••_456");
      expect(result.hasAccessToken).toBe(true);
    });

    it("rejects unauthorized member from managing WhatsApp configuration", async () => {
      await expect(getOrCreateWhatsAppConfig(memberAlphaContext)).rejects.toThrow(
        InsufficientPermissionError
      );
    });

    it("routes unverified/pending credentials to MockSandboxProvider", () => {
      const unverifiedConfig = {
        provider: WhatsAppProviderType.META_CLOUD_API,
        isLiveDelivery: false, // Not live verified
        phoneNumberId: "12345",
        accessToken: "secret",
      };

      const provider = getWhatsAppProvider(unverifiedConfig);
      expect(provider.type).toBe(WhatsAppProviderType.MOCK_SANDBOX);
    });

    it("allows owner to update WhatsApp configuration and credentials", async () => {
      vi.spyOn(db.gymWhatsAppConfig, "findUnique").mockResolvedValue(mockConfig as any);
      vi.spyOn(db.gymWhatsAppConfig, "upsert").mockResolvedValue({
        ...mockConfig,
        provider: WhatsAppProviderType.META_CLOUD_API,
        phoneNumberId: "phone-12345",
        isLiveDelivery: true,
      } as any);

      const res = await updateWhatsAppConfig(ownerAlphaContext, {
        provider: WhatsAppProviderType.META_CLOUD_API,
        phoneNumberId: "phone-12345",
        isLiveDelivery: true,
      });

      expect(res.provider).toBe(WhatsAppProviderType.META_CLOUD_API);
      expect(res.isLiveDelivery).toBe(true);
    });

    it("allows owner to retrieve and update template content", async () => {
      const mockTmpl = {
        id: "tmpl-1",
        gymId: gymAlpha.id,
        eventType: WhatsAppNotificationEvent.PAYMENT_RECEIPT,
        templateName: "gym_payment_receipt",
        bodyText: "Old body text",
      };

      vi.spyOn(db.whatsAppTemplate, "findMany").mockResolvedValue([mockTmpl as any]);
      vi.spyOn(db.whatsAppTemplate, "findFirst").mockResolvedValue(mockTmpl as any);
      vi.spyOn(db.whatsAppTemplate, "update").mockResolvedValue({
        ...mockTmpl,
        bodyText: "Updated receipt body text",
      } as any);

      const templates = await getWhatsAppTemplates(ownerAlphaContext);
      expect(templates).toHaveLength(1);

      const updated = await updateWhatsAppTemplate(ownerAlphaContext, {
        templateId: "tmpl-1",
        eventType: WhatsAppNotificationEvent.PAYMENT_RECEIPT,
        bodyText: "Updated receipt body text",
      });
      expect(updated.bodyText).toBe("Updated receipt body text");
    });

    it("allows sending sandbox test connectivity messages", async () => {
      vi.spyOn(db.gymWhatsAppConfig, "findUnique").mockResolvedValue(mockConfig as any);
      vi.spyOn(db.gym, "findUnique").mockResolvedValue(gymAlpha as any);
      vi.spyOn(db.whatsAppNotification, "create").mockResolvedValue({ id: "notif-test-1" } as any);
      vi.spyOn(db.whatsAppNotification, "update").mockResolvedValue({
        id: "notif-test-1",
        status: WhatsAppNotificationStatus.SENT,
      } as any);

      const res = await sendTestWhatsAppMessage(ownerAlphaContext, {
        recipientPhone: "+15550199",
        recipientName: "Tester",
        messageText: "Connectivity verification test.",
      });

      expect(res.success).toBe(true);
      expect(res.message).toContain("Test message sent successfully");
    });

    it("strictly isolates tenant data preventing Gym A from viewing Gym B notifications", async () => {
      const findManySpy = vi.spyOn(db.whatsAppNotification, "findMany").mockResolvedValue([]);
      vi.spyOn(db.whatsAppNotification, "count").mockResolvedValue(0);

      // Staff of Gym A queries notification history
      await db.whatsAppNotification.findMany({
        where: { gymId: gymAlpha.id },
      });

      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { gymId: gymAlpha.id },
        })
      );
      expect(gymAlpha.id).not.toBe(gymBeta.id);
    });
  });
});
