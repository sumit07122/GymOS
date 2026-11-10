import { db } from "@/lib/db";
import { TenantContext, assertPermission } from "@/lib/tenant/context";
import { LeadSource, LeadStage, LeadActivityType } from "@prisma/client";
import {
  WebsiteConfigUpdateInput,
  PublicEnquiryInput,
} from "@/lib/validations/website";

// ==============================================================================
// FIXIA GymOS — Public Website & Branding Service (M16)
// ==============================================================================
// Invariants:
// 1. Safe Public Data Exposure: NEVER leak member profiles, payments, invoices,
//    attendance ledgers, revenue numbers, staff private notes, or internal secrets.
// 2. Strict Tenant Scoping: The public site displays only data for the requested gym slug.
// 3. Enquiry Rate Limiting: Prevents spam bots and malicious enquiry flooding.
// 4. Safe Defaults: Every gym gets an attractive, complete public page instantly.
// ==============================================================================

export class WebsiteNotFoundError extends Error {
  constructor(slug: string) {
    super(`Gym website for "${slug}" was not found.`);
    this.name = "WebsiteNotFoundError";
  }
}

export class WebsiteRateLimitError extends Error {
  constructor(message = "Too many inquiry submissions. Please wait 10 minutes or contact us directly on WhatsApp.") {
    super(message);
    this.name = "WebsiteRateLimitError";
  }
}

// In-memory sliding window rate limiter (5 inquiries per 10 minutes per IP)
const enquiryRateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function _resetEnquiryRateLimitMapForTesting() {
  enquiryRateLimitMap.clear();
}

function checkRateLimit(clientIp: string, maxRequests = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const entry = enquiryRateLimitMap.get(clientIp);

  if (!entry || now > entry.resetAt) {
    enquiryRateLimitMap.set(clientIp, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (entry.count >= maxRequests) {
    throw new WebsiteRateLimitError();
  }

  entry.count += 1;
}

// Default curated fallback assets
const DEFAULT_FACILITIES = [
  "Free Weights & Olympic Platforms",
  "Cardio Deck & Treadmills",
  "Sauna & Recovery Lounge",
  "Locker Rooms & Hot Showers",
  "Functional Turf & Kettlebells",
  "Certified Personal Training",
  "Smoothie & Protein Bar",
  "Free High-Speed Wi-Fi",
];

const DEFAULT_GALLERY = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1000&q=80",
];

const DEFAULT_TRAINERS = [
  {
    name: "Alex Rivers",
    role: "Head Strength Coach",
    bio: "Certified CSCS with 8+ years coaching functional powerlifting and hypertrophy.",
    imageUrl: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Elena Chen",
    role: "Mobility & Conditioning",
    bio: "Specializing in athletic durability, HIIT conditioning, and mobility recovery.",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Marcus Brody",
    role: "Performance Specialist",
    bio: "Passionate about transforming fitness beginners into confident, lifelong athletes.",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
];

/**
 * Parses JSON safely with fallback.
 */
function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Public Data Exposure: Fetches safe public gym profile, branding, facilities,
 * active membership pricing, trainers, gallery, and contact information.
 */
export async function getGymPublicWebsiteData(gymSlug: string) {
  const gym = await db.gym.findFirst({
    where: {
      OR: [{ slug: gymSlug }, { id: gymSlug }],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      phone: true,
      email: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      postalCode: true,
      country: true,
      currency: true,
      openingHours: true,
      websiteConfig: true,
    },
  });

  if (!gym) {
    throw new WebsiteNotFoundError(gymSlug);
  }

  // Fetch only active, public membership plans (no internal financial records)
  const plans = await db.membershipPlan.findMany({
    where: {
      gymId: gym.id,
      isActive: true,
      isArchived: false,
    },
    select: {
      id: true,
      name: true,
      description: true,
      durationDays: true,
      price: true,
      admissionFee: true,
      benefits: true,
      accessRestrictions: true,
    },
    orderBy: { price: "asc" },
  });

  const config = gym.websiteConfig;
  const isPublished = config?.isPublished ?? true;

  // Resolved public data
  return {
    gym: {
      id: gym.id,
      name: gym.name,
      slug: gym.slug,
      logoUrl: gym.logoUrl,
      phone: gym.phone,
      email: gym.email,
      addressLine1: gym.addressLine1,
      addressLine2: gym.addressLine2,
      city: gym.city,
      state: gym.state,
      postalCode: gym.postalCode,
      country: gym.country,
      currency: gym.currency,
      openingHours:
        gym.openingHours ||
        "Mon - Fri: 06:00 - 22:00 | Sat: 07:00 - 20:00 | Sun: 08:00 - 18:00",
    },
    website: {
      isPublished,
      headline:
        config?.headline ||
        `Forge Strength & Peak Vitality at ${gym.name}`,
      subheadline:
        config?.subheadline ||
        `Premier fitness facility in ${gym.city || "your neighborhood"}. World-class equipment, personalized coaching, and an inspiring community.`,
      tagline: config?.tagline || "Built for Consistency. Engineered for Results.",
      heroImageUrl:
        config?.heroImageUrl ||
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=80",
      aboutText:
        config?.aboutText ||
        `${gym.name} was founded on a simple conviction: that everybody deserves access to high-caliber fitness coaching, state-of-the-art strength gear, and a welcoming community that keeps you motivated. Whether you are stepping into a gym for the first time or setting a new powerlifting PR, our doors are open.`,
      primaryColor: config?.primaryColor || "#4f46e5",
      secondaryColor: config?.secondaryColor || "#0f172a",
      facilities: safeJsonParse<string[]>(
        config?.facilities,
        DEFAULT_FACILITIES
      ),
      galleryUrls: safeJsonParse<string[]>(
        config?.galleryUrls,
        DEFAULT_GALLERY
      ),
      featuredTrainers: safeJsonParse<typeof DEFAULT_TRAINERS>(
        config?.featuredTrainers,
        DEFAULT_TRAINERS
      ),
      whatsAppNumber: config?.whatsAppNumber || gym.phone || null,
      instagramHandle: config?.instagramHandle || null,
      facebookUrl: config?.facebookUrl || null,
      googleMapsUrl: config?.googleMapsUrl || null,
      seoTitle:
        config?.seoTitle ||
        `${gym.name} | Gym & Fitness Center in ${gym.city || "Town"}`,
      seoDescription:
        config?.seoDescription ||
        `Join ${gym.name} today. Access high-quality weights, cardio equipment, expert personal training, and dynamic classes.`,
      customNotice: config?.customNotice || null,
    },
    plans: plans.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      durationDays: p.durationDays,
      durationMonths: Math.round(p.durationDays / 30) || 1,
      price: Number(p.price),
      admissionFee: Number(p.admissionFee),
      benefits: p.benefits
        ? p.benefits.split(",").map((b) => b.trim()).filter(Boolean)
        : ["Full Gym Floor Access", "Locker Room & Showers", "Free Fitness Assessment"],
      accessRestrictions: p.accessRestrictions
        ? p.accessRestrictions.split(",").map((r) => r.trim()).filter(Boolean)
        : ["All-Hours Access"],
    })),
  };
}

/**
 * Gets or creates default website configuration for gym management.
 */
export async function getOrCreateGymWebsiteConfig(ctx: TenantContext) {
  assertPermission(ctx, "SETTINGS_MANAGE");

  let config = await db.gymWebsiteConfig.findUnique({
    where: { gymId: ctx.gymId },
  });

  const gym = await db.gym.findUnique({
    where: { id: ctx.gymId },
  });

  if (!gym) throw new Error("Gym workspace not found.");

  if (!config) {
    config = await db.gymWebsiteConfig.create({
      data: {
        gymId: ctx.gymId,
        isPublished: true,
        primaryColor: "#4f46e5",
        secondaryColor: "#0f172a",
        facilities: JSON.stringify(DEFAULT_FACILITIES),
        galleryUrls: JSON.stringify(DEFAULT_GALLERY),
        featuredTrainers: JSON.stringify(DEFAULT_TRAINERS),
      },
    });
  }

  return { gym, config };
}

/**
 * Updates website configuration, branding, and public settings (Owner/Staff only).
 */
export async function updateGymWebsiteConfig(
  ctx: TenantContext,
  input: WebsiteConfigUpdateInput
) {
  assertPermission(ctx, "SETTINGS_MANAGE");

  const [updatedConfig] = await db.$transaction([
    db.gymWebsiteConfig.upsert({
      where: { gymId: ctx.gymId },
      create: {
        gymId: ctx.gymId,
        isPublished: input.isPublished ?? true,
        headline: input.headline?.trim() || null,
        subheadline: input.subheadline?.trim() || null,
        tagline: input.tagline?.trim() || null,
        heroImageUrl: input.heroImageUrl?.trim() || null,
        aboutText: input.aboutText?.trim() || null,
        primaryColor: input.primaryColor || "#4f46e5",
        secondaryColor: input.secondaryColor || "#0f172a",
        facilities: JSON.stringify(input.facilities || DEFAULT_FACILITIES),
        galleryUrls: JSON.stringify(input.galleryUrls || DEFAULT_GALLERY),
        featuredTrainers: JSON.stringify(
          input.featuredTrainers || DEFAULT_TRAINERS
        ),
        whatsAppNumber: input.whatsAppNumber?.trim() || null,
        instagramHandle: input.instagramHandle?.trim() || null,
        facebookUrl: input.facebookUrl?.trim() || null,
        googleMapsUrl: input.googleMapsUrl?.trim() || null,
        seoTitle: input.seoTitle?.trim() || null,
        seoDescription: input.seoDescription?.trim() || null,
        customNotice: input.customNotice?.trim() || null,
      },
      update: {
        isPublished: input.isPublished ?? true,
        headline: input.headline?.trim() || null,
        subheadline: input.subheadline?.trim() || null,
        tagline: input.tagline?.trim() || null,
        heroImageUrl: input.heroImageUrl?.trim() || null,
        aboutText: input.aboutText?.trim() || null,
        primaryColor: input.primaryColor || "#4f46e5",
        secondaryColor: input.secondaryColor || "#0f172a",
        facilities: JSON.stringify(input.facilities || DEFAULT_FACILITIES),
        galleryUrls: JSON.stringify(input.galleryUrls || DEFAULT_GALLERY),
        featuredTrainers: JSON.stringify(
          input.featuredTrainers || DEFAULT_TRAINERS
        ),
        whatsAppNumber: input.whatsAppNumber?.trim() || null,
        instagramHandle: input.instagramHandle?.trim() || null,
        facebookUrl: input.facebookUrl?.trim() || null,
        googleMapsUrl: input.googleMapsUrl?.trim() || null,
        seoTitle: input.seoTitle?.trim() || null,
        seoDescription: input.seoDescription?.trim() || null,
        customNotice: input.customNotice?.trim() || null,
      },
    }),
    db.gym.update({
      where: { id: ctx.gymId },
      data: {
        phone: input.phone !== undefined ? input.phone?.trim() || null : undefined,
        email: input.email !== undefined ? input.email?.trim() || null : undefined,
        addressLine1:
          input.addressLine1 !== undefined
            ? input.addressLine1?.trim() || null
            : undefined,
        city: input.city !== undefined ? input.city?.trim() || null : undefined,
        openingHours:
          input.openingHours !== undefined
            ? input.openingHours?.trim() || null
            : undefined,
        logoUrl:
          input.logoUrl !== undefined
            ? input.logoUrl?.trim() || null
            : undefined,
      },
    }),
  ]);

  return updatedConfig;
}

/**
 * Handles public visitor inquiry submissions.
 * Validates, rate-limits, and safely records as a Lead with LeadSource.WEBSITE.
 */
export async function submitPublicEnquiry(
  gymSlug: string,
  input: PublicEnquiryInput,
  clientIp = "127.0.0.1"
) {
  // 1. Rate Limiting Check
  checkRateLimit(clientIp);

  // 2. Resolve Gym
  const gym = await db.gym.findFirst({
    where: {
      OR: [{ slug: gymSlug }, { id: gymSlug }],
    },
    select: {
      id: true,
      name: true,
      websiteConfig: { select: { isPublished: true } },
    },
  });

  if (!gym) {
    throw new WebsiteNotFoundError(gymSlug);
  }

  // 3. Optional plan verification
  let validPlanId: string | null = null;
  if (input.interestedPlanId && input.interestedPlanId.trim()) {
    const plan = await db.membershipPlan.findFirst({
      where: {
        id: input.interestedPlanId.trim(),
        gymId: gym.id,
      },
    });
    if (plan) {
      validPlanId = plan.id;
    }
  }

  // 4. Safely create Lead record
  const lead = await db.lead.create({
    data: {
      gymId: gym.id,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim() || null,
      source: LeadSource.WEBSITE,
      stage: LeadStage.NEW,
      interestedPlanId: validPlanId,
      notes: input.notes?.trim() || "Inquiry submitted via public website.",
      activities: {
        create: {
          gymId: gym.id,
          type: LeadActivityType.VISIT_NOTE,
          notes: `Public website enquiry from ${input.firstName} ${input.lastName} (${input.phone}).`,
        },
      },
    },
  });

  return {
    success: true,
    message: `Thank you, ${input.firstName}! The team at ${gym.name} has received your inquiry and will contact you shortly.`,
    leadId: lead.id,
  };
}
