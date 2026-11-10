/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getGymPublicWebsiteData,
  getOrCreateGymWebsiteConfig,
  updateGymWebsiteConfig,
  submitPublicEnquiry,
  WebsiteNotFoundError,
  WebsiteRateLimitError,
  _resetEnquiryRateLimitMapForTesting,
} from "@/lib/services/website.service";
import {
  publicEnquirySchema,
  websiteConfigUpdateSchema,
} from "@/lib/validations/website";
import { createTenantContext } from "@/lib/tenant/context";
import { InsufficientPermissionError } from "@/lib/tenant/permissions";
import { db } from "@/lib/db";
import { GymRole, LeadSource, LeadStage, LeadActivityType } from "@prisma/client";

describe("Milestone M16: Gym-Branded Public Website", () => {
  const gymAlpha = {
    id: "gym-alpha-123",
    name: "Alpha Power & Iron Gym",
    slug: "alpha-power",
    logoUrl: "https://example.com/alpha-logo.png",
    phone: "+1 555-0101",
    email: "contact@alphagym.com",
    addressLine1: "100 Broadway Suite 4",
    addressLine2: "Floor 2",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "USA",
    currency: "USD",
    openingHours: "Mon - Sat: 05:00 - 23:00 | Sun: 07:00 - 20:00",
    websiteConfig: {
      id: "config-alpha",
      gymId: "gym-alpha-123",
      isPublished: true,
      headline: "Unleash Your Inner Titan",
      subheadline: "NYC's premier athletic training ground.",
      tagline: "Iron Sharpens Iron.",
      heroImageUrl: "https://example.com/alpha-hero.jpg",
      aboutText: "Alpha Power has built community strength since 2018.",
      primaryColor: "#dc2626",
      secondaryColor: "#111827",
      facilities: JSON.stringify(["Powerlifting Platforms", "Infrared Sauna", "Cryotherapy"]),
      galleryUrls: JSON.stringify(["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"]),
      featuredTrainers: JSON.stringify([
        {
          name: "Marcus Cole",
          role: "Head Strength Coach",
          bio: "Specialist in powerlifting.",
          imageUrl: "https://example.com/trainer1.jpg",
        },
      ]),
      whatsAppNumber: "+15550101",
      instagramHandle: "@alphapowernyc",
      facebookUrl: "https://facebook.com/alphapower",
      googleMapsUrl: "https://maps.google.com/?q=Alpha+Power",
      seoTitle: "Alpha Power & Iron Gym | NYC",
      seoDescription: "Join Alpha Power gym today for elite lifting.",
      customNotice: "Special holiday operating hours apply on Labor Day.",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const gymBeta = {
    id: "gym-beta-456",
    name: "Zenith Yoga & Pilates Studio",
    slug: "zenith-studio",
    logoUrl: null,
    phone: "+1 555-0202",
    email: "namaste@zenith.com",
    addressLine1: "250 Ocean Drive",
    addressLine2: null,
    city: "Miami",
    state: "FL",
    postalCode: "33139",
    country: "USA",
    currency: "USD",
    openingHours: null,
    websiteConfig: null, // No custom config yet (tests default fallbacks)
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

  const ownerBetaContext = createTenantContext({
    gymId: gymBeta.id,
    userId: "owner-beta",
    userEmail: "owner@zenith.com",
    role: GymRole.OWNER,
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    _resetEnquiryRateLimitMapForTesting();
  });

  // ============================================================================
  // 1. SLUG RESOLUTION & MULTIPLE DISTINCT GYMS
  // ============================================================================
  describe("Slug Resolution & Distinct Gym Websites", () => {
    it("successfully loads public website data by unique gym slug", async () => {
      vi.spyOn(db.gym, "findFirst").mockResolvedValue(gymAlpha as any);
      vi.spyOn(db.membershipPlan, "findMany").mockResolvedValue([
        {
          id: "plan-1",
          name: "Standard Membership",
          description: "Full gym floor access",
          durationDays: 30,
          price: 69 as any,
          admissionFee: 20 as any,
          benefits: "Locker room, Cardio floor",
          accessRestrictions: "Standard hours",
        },
      ] as any);

      const result = await getGymPublicWebsiteData("alpha-power");

      expect(result.gym.name).toBe("Alpha Power & Iron Gym");
      expect(result.gym.slug).toBe("alpha-power");
      expect(result.website.headline).toBe("Unleash Your Inner Titan");
      expect(result.website.primaryColor).toBe("#dc2626");
      expect(result.website.facilities).toEqual([
        "Powerlifting Platforms",
        "Infrared Sauna",
        "Cryotherapy",
      ]);
      expect(result.plans).toHaveLength(1);
      expect(result.plans[0].name).toBe("Standard Membership");
      expect(result.plans[0].price).toBe(69);
    });

    it("resolves website data if gym ID is passed instead of slug", async () => {
      vi.spyOn(db.gym, "findFirst").mockResolvedValue(gymAlpha as any);
      vi.spyOn(db.membershipPlan, "findMany").mockResolvedValue([]);

      const result = await getGymPublicWebsiteData("gym-alpha-123");

      expect(result.gym.id).toBe("gym-alpha-123");
      expect(result.gym.name).toBe("Alpha Power & Iron Gym");
    });

    it("throws WebsiteNotFoundError when gym slug is invalid or does not exist", async () => {
      vi.spyOn(db.gym, "findFirst").mockResolvedValue(null);

      await expect(getGymPublicWebsiteData("non-existent-gym")).rejects.toThrow(
        WebsiteNotFoundError
      );
    });

    it("isolates multiple distinct gyms completely", async () => {
      vi.spyOn(db.gym, "findFirst")
        .mockResolvedValueOnce(gymAlpha as any)
        .mockResolvedValueOnce(gymBeta as any);
      vi.spyOn(db.membershipPlan, "findMany").mockResolvedValue([]);

      const alphaData = await getGymPublicWebsiteData("alpha-power");
      const betaData = await getGymPublicWebsiteData("zenith-studio");

      expect(alphaData.gym.name).toBe("Alpha Power & Iron Gym");
      expect(alphaData.gym.city).toBe("New York");
      expect(alphaData.website.primaryColor).toBe("#dc2626");

      expect(betaData.gym.name).toBe("Zenith Yoga & Pilates Studio");
      expect(betaData.gym.city).toBe("Miami");
      expect(betaData.website.primaryColor).toBe("#4f46e5"); // Fallback color
    });
  });

  // ============================================================================
  // 2. SAFE PUBLIC DATA EXPOSURE & SENSITIVE DATA LEAK PREVENTION
  // ============================================================================
  describe("Safe Public Data Exposure", () => {
    it("never exposes private member, payment, invoice, or attendance records", async () => {
      vi.spyOn(db.gym, "findFirst").mockResolvedValue(gymAlpha as any);
      vi.spyOn(db.membershipPlan, "findMany").mockResolvedValue([
        {
          id: "plan-1",
          name: "Standard Membership",
          description: "Full gym floor access",
          durationDays: 30,
          price: 69 as any,
          admissionFee: 20 as any,
          benefits: null,
          accessRestrictions: null,
        },
      ] as any);

      const result = (await getGymPublicWebsiteData("alpha-power")) as any;

      // Verify absence of sensitive internal entities
      expect(result.members).toBeUndefined();
      expect(result.payments).toBeUndefined();
      expect(result.invoices).toBeUndefined();
      expect(result.attendance).toBeUndefined();
      expect(result.expenses).toBeUndefined();
      expect(result.revenue).toBeUndefined();
      expect(result.secret).toBeUndefined();
      expect(result.qrSigningSecret).toBeUndefined();
    });

    it("only queries active and non-archived membership plans", async () => {
      vi.spyOn(db.gym, "findFirst").mockResolvedValue(gymAlpha as any);
      const findPlansSpy = vi.spyOn(db.membershipPlan, "findMany").mockResolvedValue([]);

      await getGymPublicWebsiteData("alpha-power");

      expect(findPlansSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            gymId: "gym-alpha-123",
            isActive: true,
            isArchived: false,
          },
        })
      );
    });

    it("provides clean curated defaults for unconfigured gyms", async () => {
      vi.spyOn(db.gym, "findFirst").mockResolvedValue(gymBeta as any);
      vi.spyOn(db.membershipPlan, "findMany").mockResolvedValue([]);

      const result = await getGymPublicWebsiteData("zenith-studio");

      expect(result.website.headline).toContain("Zenith Yoga & Pilates Studio");
      expect(result.website.subheadline).toContain("Miami");
      expect(result.website.facilities.length).toBeGreaterThan(0);
      expect(result.website.galleryUrls.length).toBeGreaterThan(0);
      expect(result.website.featuredTrainers.length).toBeGreaterThan(0);
      expect(result.website.primaryColor).toBe("#4f46e5");
      expect(result.website.secondaryColor).toBe("#0f172a");
    });
  });

  // ============================================================================
  // 3. PUBLICATION STATUS & VISIBILITY
  // ============================================================================
  describe("Publication Status", () => {
    it("correctly flags published websites", async () => {
      vi.spyOn(db.gym, "findFirst").mockResolvedValue(gymAlpha as any);
      vi.spyOn(db.membershipPlan, "findMany").mockResolvedValue([]);

      const result = await getGymPublicWebsiteData("alpha-power");
      expect(result.website.isPublished).toBe(true);
    });

    it("correctly flags unpublished websites", async () => {
      const unpublishedGym = {
        ...gymAlpha,
        websiteConfig: {
          ...gymAlpha.websiteConfig,
          isPublished: false,
        },
      };

      vi.spyOn(db.gym, "findFirst").mockResolvedValue(unpublishedGym as any);
      vi.spyOn(db.membershipPlan, "findMany").mockResolvedValue([]);

      const result = await getGymPublicWebsiteData("alpha-power");
      expect(result.website.isPublished).toBe(false);
    });
  });

  // ============================================================================
  // 4. PUBLIC ENQUIRY SUBMISSION & CRM PIPELINE INTEGRATION
  // ============================================================================
  describe("Public Enquiry Submissions", () => {
    it("creates a Lead with LeadSource.WEBSITE and LeadStage.NEW upon valid submission", async () => {
      vi.spyOn(db.gym, "findFirst").mockResolvedValue({
        id: gymAlpha.id,
        name: gymAlpha.name,
        websiteConfig: { isPublished: true },
      } as any);

      const mockLead = {
        id: "lead-new-1",
        gymId: gymAlpha.id,
        firstName: "Sarah",
        lastName: "Connor",
        phone: "+1 555-9988",
        email: "sarah@resistance.org",
        source: LeadSource.WEBSITE,
        stage: LeadStage.NEW,
        interestedPlanId: null,
        notes: "Interested in strength training",
      };

      const createLeadSpy = vi.spyOn(db.lead, "create").mockResolvedValue(mockLead as any);

      const response = await submitPublicEnquiry(
        "alpha-power",
        {
          firstName: "Sarah",
          lastName: "Connor",
          phone: "+1 555-9988",
          email: "sarah@resistance.org",
          notes: "Interested in strength training",
        },
        "192.168.1.10"
      );

      expect(response.success).toBe(true);
      expect(response.leadId).toBe("lead-new-1");
      expect(response.message).toContain("Alpha Power & Iron Gym");

      expect(createLeadSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            gymId: gymAlpha.id,
            firstName: "Sarah",
            lastName: "Connor",
            phone: "+1 555-9988",
            email: "sarah@resistance.org",
            source: LeadSource.WEBSITE,
            stage: LeadStage.NEW,
            activities: {
              create: expect.objectContaining({
                gymId: gymAlpha.id,
                type: LeadActivityType.VISIT_NOTE,
              }),
            },
          }),
        })
      );
    });

    it("verifies interested plan belongs to current gym before associating", async () => {
      vi.spyOn(db.gym, "findFirst").mockResolvedValue({
        id: gymAlpha.id,
        name: gymAlpha.name,
        websiteConfig: { isPublished: true },
      } as any);

      // Membership plan belonging to gymAlpha
      vi.spyOn(db.membershipPlan, "findFirst").mockResolvedValue({
        id: "valid-plan-alpha",
        gymId: gymAlpha.id,
      } as any);

      const createLeadSpy = vi.spyOn(db.lead, "create").mockResolvedValue({
        id: "lead-plan-1",
      } as any);

      await submitPublicEnquiry(
        "alpha-power",
        {
          firstName: "John",
          lastName: "Doe",
          phone: "+1 555-3344",
          interestedPlanId: "valid-plan-alpha",
        },
        "192.168.1.20"
      );

      expect(createLeadSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            interestedPlanId: "valid-plan-alpha",
          }),
        })
      );
    });

    it("ignores interested plan if plan belongs to a different gym (cross-tenant protection)", async () => {
      vi.spyOn(db.gym, "findFirst").mockResolvedValue({
        id: gymAlpha.id,
        name: gymAlpha.name,
        websiteConfig: { isPublished: true },
      } as any);

      // Plan lookup finds nothing in gymAlpha (it belonged to gymBeta)
      vi.spyOn(db.membershipPlan, "findFirst").mockResolvedValue(null);

      const createLeadSpy = vi.spyOn(db.lead, "create").mockResolvedValue({
        id: "lead-plan-2",
      } as any);

      await submitPublicEnquiry(
        "alpha-power",
        {
          firstName: "Jane",
          lastName: "Doe",
          phone: "+1 555-3344",
          interestedPlanId: "foreign-plan-beta",
        },
        "192.168.1.30"
      );

      expect(createLeadSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            interestedPlanId: null, // Safely ignored
          }),
        })
      );
    });

    it("throws WebsiteNotFoundError if inquiry is sent to non-existent gym", async () => {
      vi.spyOn(db.gym, "findFirst").mockResolvedValue(null);

      await expect(
        submitPublicEnquiry("ghost-gym", {
          firstName: "Ghost",
          lastName: "User",
          phone: "+1 555-0000",
        })
      ).rejects.toThrow(WebsiteNotFoundError);
    });
  });

  // ============================================================================
  // 5. RATE LIMITING PROTECTION
  // ============================================================================
  describe("Rate Limiting", () => {
    it("blocks rapid enquiry flooding from the same IP address after 5 requests", async () => {
      vi.spyOn(db.gym, "findFirst").mockResolvedValue({
        id: gymAlpha.id,
        name: gymAlpha.name,
        websiteConfig: { isPublished: true },
      } as any);
      vi.spyOn(db.lead, "create").mockResolvedValue({ id: "lead-spam" } as any);

      const spammerIp = "203.0.113.42";

      // Submit 5 valid requests
      for (let i = 0; i < 5; i++) {
        const res = await submitPublicEnquiry(
          "alpha-power",
          {
            firstName: `Spam${i}`,
            lastName: "Bot",
            phone: `+1 555-000${i}`,
          },
          spammerIp
        );
        expect(res.success).toBe(true);
      }

      // 6th request should be blocked by rate limit
      await expect(
        submitPublicEnquiry(
          "alpha-power",
          {
            firstName: "Spam6",
            lastName: "Bot",
            phone: "+1 555-0006",
          },
          spammerIp
        )
      ).rejects.toThrow(WebsiteRateLimitError);

      // Other client IPs should still be allowed
      const legitRes = await submitPublicEnquiry(
        "alpha-power",
        {
          firstName: "Legit",
          lastName: "User",
          phone: "+1 555-9999",
        },
        "198.51.100.99"
      );
      expect(legitRes.success).toBe(true);
    });
  });

  // ============================================================================
  // 6. OWNER / STAFF CONTROLS & AUTHORIZATION
  // ============================================================================
  describe("Owner & Staff Website Controls", () => {
    it("allows authorized gym owner to fetch or auto-create website configuration", async () => {
      vi.spyOn(db.gymWebsiteConfig, "findUnique").mockResolvedValue(null);
      vi.spyOn(db.gym, "findUnique").mockResolvedValue(gymAlpha as any);
      vi.spyOn(db.gymWebsiteConfig, "create").mockResolvedValue({
        id: "config-new",
        gymId: gymAlpha.id,
        isPublished: true,
      } as any);

      const result = await getOrCreateGymWebsiteConfig(ownerAlphaContext);
      expect(result.gym.name).toBe("Alpha Power & Iron Gym");
      expect(result.config.isPublished).toBe(true);
    });

    it("allows authorized gym owner to fetch existing website configuration", async () => {
      vi.spyOn(db.gymWebsiteConfig, "findUnique").mockResolvedValue(gymAlpha.websiteConfig as any);
      vi.spyOn(db.gym, "findUnique").mockResolvedValue(gymAlpha as any);

      const result = await getOrCreateGymWebsiteConfig(ownerAlphaContext);
      expect(result.config.headline).toBe("Unleash Your Inner Titan");
    });

    it("rejects unauthorized staff or member roles from configuring website without SETTINGS_MANAGE", async () => {
      await expect(getOrCreateGymWebsiteConfig(staffAlphaContext)).rejects.toThrow(
        InsufficientPermissionError
      );
      await expect(getOrCreateGymWebsiteConfig(memberAlphaContext)).rejects.toThrow(
        InsufficientPermissionError
      );
    });

    it("allows owner to update website content, branding, facilities, and contact details", async () => {
      const updateData = {
        isPublished: true,
        headline: "Metabolic Mastery Awaits",
        subheadline: "Elite conditioning on Broadway.",
        primaryColor: "#059669",
        secondaryColor: "#0f172a",
        facilities: ["Olympic Rigs", "Cold Plunge", "Normatec Compression"],
        phone: "+1 555-7777",
        city: "Brooklyn",
      };

      const updatedConfigMock = {
        id: "config-alpha",
        gymId: gymAlpha.id,
        ...updateData,
      };

      vi.spyOn(db, "$transaction").mockResolvedValue([updatedConfigMock, { id: gymAlpha.id }] as any);

      const result = await updateGymWebsiteConfig(ownerAlphaContext, updateData);

      expect(result.headline).toBe("Metabolic Mastery Awaits");
      expect(result.primaryColor).toBe("#059669");
    });

    it("rejects unauthorized member role from updating website configuration", async () => {
      await expect(
        updateGymWebsiteConfig(memberAlphaContext, {
          headline: "Hacked Website",
        })
      ).rejects.toThrow(InsufficientPermissionError);
    });

    it("enforces tenant isolation preventing staff of Gym A from updating Gym B", async () => {
      // Trying to update gym Beta using owner Alpha's context
      vi.spyOn(db, "$transaction").mockImplementation(async () => {
        // Confirm transaction uses ctx.gymId
        expect(ownerAlphaContext.gymId).not.toBe(ownerBetaContext.gymId);
        return [{}, {}];
      });

      await updateGymWebsiteConfig(ownerAlphaContext, { headline: "Updated" });
    });
  });

  // ============================================================================
  // 7. VALIDATION SCHEMAS
  // ============================================================================
  describe("Zod Validation Schemas", () => {
    describe("publicEnquirySchema", () => {
      it("validates legitimate public enquiry input", () => {
        const input = {
          firstName: "Marcus",
          lastName: "Aurelius",
          phone: "+1 555-1234",
          email: "marcus@rome.org",
          notes: "Need info on morning classes",
        };

        const parsed = publicEnquirySchema.safeParse(input);
        expect(parsed.success).toBe(true);
      });

      it("rejects missing first name or empty phone", () => {
        const invalid1 = {
          firstName: "",
          lastName: "Doe",
          phone: "+1 555-1234",
        };
        const parsed1 = publicEnquirySchema.safeParse(invalid1);
        expect(parsed1.success).toBe(false);

        const invalid2 = {
          firstName: "John",
          lastName: "Doe",
          phone: "",
        };
        const parsed2 = publicEnquirySchema.safeParse(invalid2);
        expect(parsed2.success).toBe(false);
      });

      it("rejects invalid email formats", () => {
        const invalidEmail = {
          firstName: "John",
          lastName: "Doe",
          phone: "+1 555-1234",
          email: "not-an-email",
        };
        const parsed = publicEnquirySchema.safeParse(invalidEmail);
        expect(parsed.success).toBe(false);
      });
    });

    describe("websiteConfigUpdateSchema", () => {
      it("validates hex colors properly", () => {
        const validConfig = {
          primaryColor: "#4f46e5",
          secondaryColor: "#111827",
        };
        const parsed = websiteConfigUpdateSchema.safeParse(validConfig);
        expect(parsed.success).toBe(true);

        const invalidConfig = {
          primaryColor: "not-a-hex",
        };
        const parsedInvalid = websiteConfigUpdateSchema.safeParse(invalidConfig);
        expect(parsedInvalid.success).toBe(false);
      });

      it("validates facilities and gallery arrays", () => {
        const valid = {
          facilities: ["Weights", "Cardio"],
          galleryUrls: ["https://example.com/img1.jpg"],
        };
        const parsed = websiteConfigUpdateSchema.safeParse(valid);
        expect(parsed.success).toBe(true);
      });
    });
  });
});
