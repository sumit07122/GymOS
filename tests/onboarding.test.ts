import { describe, it, expect } from "vitest";
import {
  gymOnboardingSchema,
  gymSettingsUpdateSchema,
} from "@/lib/validations/gym";

describe("Milestone M05: Gym Onboarding & Settings Validation", () => {
  it("successfully validates complete valid gym onboarding inputs", () => {
    const validData = {
      name: "Iron Peak Fitness",
      slug: "iron-peak-fitness",
      phone: "+1-555-234-5678",
      email: "contact@ironpeak.com",
      addressLine1: "100 Fitness Way",
      addressLine2: "Suite 4B",
      city: "Austin",
      state: "TX",
      postalCode: "78701",
      country: "US",
      currency: "USD",
      timezone: "America/Chicago",
      openingHours: "Mon-Fri: 06:00-22:00\nSat-Sun: 08:00-20:00",
      taxRate: 8.25,
      taxNumber: "TX-99887766",
      logoUrl: "https://example.com/logo.png",
    };

    const result = gymOnboardingSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Iron Peak Fitness");
      expect(result.data.slug).toBe("iron-peak-fitness");
      expect(result.data.taxRate).toBe(8.25);
    }
  });

  it("applies default country, currency, and timezone when omitted", () => {
    const minimalData = {
      name: "Metropolis Gym",
      slug: "metropolis-gym",
    };

    const result = gymOnboardingSchema.safeParse(minimalData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.country).toBe("US");
      expect(result.data.currency).toBe("USD");
      expect(result.data.timezone).toBe("America/New_York");
      expect(result.data.taxRate).toBe(0);
    }
  });

  it("rejects invalid gym slug formats (spaces, uppercase, special characters)", () => {
    const invalidSlugs = [
      "Iron Peak",
      "iron_peak",
      "Iron-Peak",
      "iron peak fitness",
      "-leading-hyphen",
      "trailing-hyphen-",
      "invalid@slug!",
    ];

    for (const slug of invalidSlugs) {
      const result = gymOnboardingSchema.safeParse({
        name: "Test Gym",
        slug,
      });
      expect(result.success).toBe(false);
    }
  });

  it("rejects short or empty gym names", () => {
    const result = gymOnboardingSchema.safeParse({
      name: "A",
      slug: "a-gym",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid tax rates (negative or exceeding 100%)", () => {
    const negativeTax = gymOnboardingSchema.safeParse({
      name: "Valid Gym",
      slug: "valid-gym",
      taxRate: -5,
    });
    expect(negativeTax.success).toBe(false);

    const excessiveTax = gymOnboardingSchema.safeParse({
      name: "Valid Gym",
      slug: "valid-gym",
      taxRate: 105,
    });
    expect(excessiveTax.success).toBe(false);
  });

  it("rejects invalid email formats", () => {
    const invalidEmail = gymOnboardingSchema.safeParse({
      name: "Valid Gym",
      slug: "valid-gym",
      email: "not-an-email",
    });
    expect(invalidEmail.success).toBe(false);
  });

  it("validates gym settings update schema with partial fields", () => {
    const updateData = {
      name: "Iron Peak Fitness Club (Updated)",
      openingHours: "Open 24/7",
      taxRate: 10.0,
    };

    const result = gymSettingsUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Iron Peak Fitness Club (Updated)");
      expect(result.data.openingHours).toBe("Open 24/7");
      expect(result.data.taxRate).toBe(10.0);
    }
  });
});

