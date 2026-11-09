import { z } from "zod";

// ==============================================================================
// FIXIA GymOS — Gym Onboarding & Settings Validation Schemas
// ==============================================================================

export const gymOnboardingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Gym name must be at least 2 characters")
    .max(100, "Gym name cannot exceed 100 characters"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug cannot exceed 50 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens (e.g. apex-fitness)"
    ),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email format").max(100).optional().or(z.literal("")),
  addressLine1: z.string().trim().max(150).optional().or(z.literal("")),
  addressLine2: z.string().trim().max(150).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  state: z.string().trim().max(100).optional().or(z.literal("")),
  postalCode: z.string().trim().max(20).optional().or(z.literal("")),
  country: z.string().trim().min(2).max(3).default("US"),
  currency: z.string().trim().min(3).max(3).default("USD"),
  timezone: z.string().trim().min(2).max(100).default("America/New_York"),
  openingHours: z.string().trim().max(500).optional().or(z.literal("")),
  taxRate: z.coerce.number().min(0, "Tax rate cannot be negative").max(100, "Tax rate cannot exceed 100%").default(0),
  taxNumber: z.string().trim().max(50).optional().or(z.literal("")),
  logoUrl: z.string().trim().max(500).optional().or(z.literal("")),
});

export type GymOnboardingInput = z.infer<typeof gymOnboardingSchema>;

export const gymSettingsUpdateSchema = gymOnboardingSchema.partial().extend({
  name: z.string().trim().min(2, "Gym name must be at least 2 characters").max(100),
});

export type GymSettingsUpdateInput = z.infer<typeof gymSettingsUpdateSchema>;

