import { z } from "zod";
import { GymStatus, SaasSubscriptionStatus, SaasBillingPeriod } from "@prisma/client";

// ==============================================================================
// FIXIA GymOS — SaaS Platform Administration Validation Schemas (M19)
// ==============================================================================

export const gymStatusUpdateSchema = z.object({
  status: z.nativeEnum(GymStatus, {
    error: "Invalid gym status. Allowed: ACTIVE, TRIAL, SUSPENDED, INACTIVE",
  }),
  reason: z
    .string()
    .trim()
    .min(3, "Audit reason must be at least 3 characters")
    .max(500, "Reason cannot exceed 500 characters"),
});

export type GymStatusUpdateInput = z.infer<typeof gymStatusUpdateSchema>;

export const saasPlanSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Plan name must be at least 2 characters")
    .max(80, "Plan name cannot exceed 80 characters"),
  code: z
    .string()
    .trim()
    .min(2, "Code must be at least 2 characters")
    .max(40, "Code cannot exceed 40 characters")
    .regex(
      /^[A-Z0-9_]+$/,
      "Code must be uppercase alphanumeric and underscores (e.g. STARTER, PRO_YEARLY)"
    ),
  description: z.string().trim().max(500).optional().nullable(),
  monthlyPrice: z.coerce.number().min(0, "Monthly price cannot be negative"),
  yearlyPrice: z.coerce.number().min(0, "Yearly price cannot be negative"),
  trialDays: z.coerce.number().int().min(0).max(365).default(14),
  gracePeriodDays: z.coerce.number().int().min(0).max(60).default(7),
  maxMembers: z.coerce.number().int().min(-1, "-1 represents unlimited members").default(100),
  maxStaff: z.coerce.number().int().min(-1, "-1 represents unlimited staff").default(3),
  maxClasses: z.coerce.number().int().min(-1, "-1 represents unlimited classes").default(10),
  features: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export type SaasPlanInput = z.infer<typeof saasPlanSchema>;

export const assignSubscriptionSchema = z.object({
  planId: z.string().uuid("Invalid plan identifier"),
  billingPeriod: z.nativeEnum(SaasBillingPeriod).default(SaasBillingPeriod.MONTHLY),
  status: z.nativeEnum(SaasSubscriptionStatus).default(SaasSubscriptionStatus.ACTIVE),
  trialDays: z.coerce.number().int().min(0).max(365).optional().nullable(),
  customFeatureOverrides: z.record(z.string(), z.boolean()).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export type AssignSubscriptionInput = z.infer<typeof assignSubscriptionSchema>;

export const gymSupportNotesSchema = z.object({
  notes: z.string().trim().max(2000, "Notes cannot exceed 2000 characters"),
});

export type GymSupportNotesInput = z.infer<typeof gymSupportNotesSchema>;

