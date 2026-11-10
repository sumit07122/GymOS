import { z } from "zod";

// ==============================================================================
// FIXIA GymOS — Public Website & Branding Validation Schemas (M16)
// ==============================================================================

export const websiteConfigUpdateSchema = z.object({
  isPublished: z.boolean().default(true),
  headline: z.string().max(150, "Headline cannot exceed 150 characters").optional().nullable(),
  subheadline: z.string().max(300, "Subheadline cannot exceed 300 characters").optional().nullable(),
  tagline: z.string().max(100, "Tagline cannot exceed 100 characters").optional().nullable(),
  heroImageUrl: z.string().max(500).optional().nullable().or(z.literal("")),
  aboutText: z.string().max(3000, "About text cannot exceed 3000 characters").optional().nullable(),
  primaryColor: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid hex color format (e.g. #4f46e5)")
    .default("#4f46e5"),
  secondaryColor: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid hex color format")
    .default("#0f172a"),
  facilities: z.array(z.string().max(60)).default([]),
  galleryUrls: z.array(z.string().max(500)).default([]),
  featuredTrainers: z
    .array(
      z.object({
        name: z.string().min(1).max(100),
        role: z.string().min(1).max(100),
        bio: z.string().max(250).optional().nullable(),
        imageUrl: z.string().max(500).optional().nullable(),
      })
    )
    .default([]),
  whatsAppNumber: z.string().max(30).optional().nullable(),
  instagramHandle: z.string().max(50).optional().nullable(),
  facebookUrl: z.string().max(255).optional().nullable().or(z.literal("")),
  googleMapsUrl: z.string().max(500).optional().nullable().or(z.literal("")),
  seoTitle: z.string().max(100).optional().nullable(),
  seoDescription: z.string().max(300).optional().nullable(),
  customNotice: z.string().max(300).optional().nullable(),
  // Core gym business overrides
  phone: z.string().max(30).optional().nullable(),
  email: z.string().email("Invalid email address").optional().nullable().or(z.literal("")),
  addressLine1: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  openingHours: z.string().max(255).optional().nullable(),
  logoUrl: z.string().max(500).optional().nullable().or(z.literal("")),
});

export type WebsiteConfigUpdateInput = z.input<typeof websiteConfigUpdateSchema>;

export const publicEnquirySchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  phone: z.string().min(5, "Valid phone number is required").max(25, "Phone number too long"),
  email: z.string().email("Invalid email address").optional().nullable().or(z.literal("")),
  interestedPlanId: z.string().optional().nullable(),
  notes: z.string().max(1000, "Message cannot exceed 1000 characters").optional().nullable(),
});

export type PublicEnquiryInput = z.infer<typeof publicEnquirySchema>;
