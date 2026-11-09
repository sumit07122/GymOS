import { z } from "zod";
import { MemberStatus } from "@prisma/client";

// ==============================================================================
// FIXIA GymOS — Member Validation Schemas
// ==============================================================================

export const memberCreateSchema = z.object({
  memberCode: z
    .string()
    .trim()
    .max(50, "Member code cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(100, "First name cannot exceed 100 characters"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(100, "Last name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .email("Invalid email format")
    .max(100, "Email cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .min(7, "Phone must have at least 7 characters")
    .max(30, "Phone cannot exceed 30 characters")
    .regex(/^[0-9+\s\-().]+$/, "Invalid phone format")
    .optional()
    .or(z.literal("")),
  dateOfBirth: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val) return true;
      const d = new Date(val);
      return !isNaN(d.getTime()) && d < new Date();
    }, "Date of birth must be a valid past date"),
  gender: z
    .string()
    .trim()
    .max(50)
    .optional()
    .or(z.literal("")),
  photoUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .max(255, "Address cannot exceed 255 characters")
    .optional()
    .or(z.literal("")),
  emergencyContactName: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal("")),
  emergencyContactPhone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal("")),
  joiningDate: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val) return true;
      return !isNaN(new Date(val).getTime());
    }, "Invalid joining date format"),
  medicalNotes: z
    .string()
    .trim()
    .max(2000, "Medical notes cannot exceed 2,000 characters")
    .optional()
    .or(z.literal("")),
  internalNotes: z
    .string()
    .trim()
    .max(2000, "Internal notes cannot exceed 2,000 characters")
    .optional()
    .or(z.literal("")),
  status: z
    .nativeEnum(MemberStatus)
    .optional(),
});

export type MemberCreateInput = z.infer<typeof memberCreateSchema>;

export const memberUpdateSchema = memberCreateSchema.partial().extend({
  id: z.string().uuid("Invalid member ID"),
});

export type MemberUpdateInput = z.infer<typeof memberUpdateSchema>;

export const memberCsvRowSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  memberCode: z.string().trim().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  gender: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  emergencyContactName: z.string().trim().optional().or(z.literal("")),
  emergencyContactPhone: z.string().trim().optional().or(z.literal("")),
  joiningDate: z.string().trim().optional().or(z.literal("")),
});

export type MemberCsvRowInput = z.infer<typeof memberCsvRowSchema>;

