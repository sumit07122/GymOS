import { z } from "zod";
import { LeadSource, LeadStage, LeadActivityType, PaymentMethod } from "@prisma/client";

// ==============================================================================
// FIXIA GymOS — Leads & CRM Validation Schemas
// ==============================================================================

export const leadCreateSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(50, "First name cannot exceed 50 characters"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name cannot exceed 50 characters"),
  phone: z
    .string()
    .trim()
    .min(5, "Valid phone number is required")
    .max(20, "Phone number cannot exceed 20 characters")
    .regex(/^[0-9+()\- ]+$/, "Invalid phone format"),
  email: z
    .string()
    .trim()
    .email("Invalid email format")
    .optional()
    .or(z.literal("")),
  source: z.nativeEnum(LeadSource).default(LeadSource.WALK_IN),
  stage: z.nativeEnum(LeadStage).default(LeadStage.NEW),
  interestedPlanId: z.string().optional().or(z.literal("")),
  assignedStaffId: z.string().optional().or(z.literal("")),
  trialDate: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const d = new Date(val);
      return !isNaN(d.getTime());
    }, "Trial date must be a valid date"),
  followUpDate: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const d = new Date(val);
      return !isNaN(d.getTime());
    }, "Follow-up date must be a valid date"),
  followUpNotes: z
    .string()
    .trim()
    .max(500, "Follow-up notes cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),
});

export const leadUpdateSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(50, "First name cannot exceed 50 characters"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name cannot exceed 50 characters"),
  phone: z
    .string()
    .trim()
    .min(5, "Valid phone number is required")
    .max(20, "Phone number cannot exceed 20 characters")
    .regex(/^[0-9+()\- ]+$/, "Invalid phone format"),
  email: z
    .string()
    .trim()
    .email("Invalid email format")
    .optional()
    .or(z.literal("")),
  source: z.nativeEnum(LeadSource),
  interestedPlanId: z.string().optional().or(z.literal("")),
  assignedStaffId: z.string().optional().or(z.literal("")),
  trialDate: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const d = new Date(val);
      return !isNaN(d.getTime());
    }, "Trial date must be a valid date"),
  followUpDate: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const d = new Date(val);
      return !isNaN(d.getTime());
    }, "Follow-up date must be a valid date"),
  followUpNotes: z
    .string()
    .trim()
    .max(500, "Follow-up notes cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),
});

export const leadStageChangeSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  stage: z.nativeEnum(LeadStage),
  lostReason: z
    .string()
    .trim()
    .max(255, "Lost reason cannot exceed 255 characters")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(500, "Activity notes cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export const leadActivityLogSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  type: z.nativeEnum(LeadActivityType),
  notes: z
    .string()
    .trim()
    .min(2, "Activity notes must be at least 2 characters")
    .max(1000, "Activity notes cannot exceed 1000 characters"),
});

export const leadFollowUpSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  followUpDate: z.string().min(1, "Follow-up date is required").refine((val) => {
    const d = new Date(val);
    return !isNaN(d.getTime());
  }, "Follow-up date must be a valid date"),
  followUpNotes: z
    .string()
    .trim()
    .max(500, "Follow-up reminder memo cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export const leadConvertSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  planId: z.string().optional().or(z.literal("")),
  startDate: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const d = new Date(val);
      return !isNaN(d.getTime());
    }, "Start date must be a valid date"),
  amountPaid: z.coerce.number().min(0, "Amount cannot be negative").default(0),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  createMembership: z.boolean().default(false),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const leadFilterSchema = z.object({
  stage: z.nativeEnum(LeadStage).or(z.literal("ALL")).optional(),
  source: z.nativeEnum(LeadSource).or(z.literal("ALL")).optional(),
  assignedStaffId: z.string().optional(),
  followUpFilter: z.enum(["ALL", "OVERDUE", "TODAY", "UPCOMING"]).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type LeadCreateInput = z.input<typeof leadCreateSchema>;
export type LeadUpdateInput = z.input<typeof leadUpdateSchema>;
export type LeadStageChangeInput = z.input<typeof leadStageChangeSchema>;
export type LeadActivityLogInput = z.input<typeof leadActivityLogSchema>;
export type LeadFollowUpInput = z.input<typeof leadFollowUpSchema>;
export type LeadConvertInput = z.input<typeof leadConvertSchema>;
export type LeadFilterParams = z.input<typeof leadFilterSchema>;

