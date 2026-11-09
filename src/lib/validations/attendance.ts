import { z } from "zod";
import { AttendanceStatus, CheckInMethod } from "@prisma/client";

// ==============================================================================
// FIXIA GymOS — Attendance & QR Validation Schemas
// ==============================================================================

export const qrTokenPayloadSchema = z.object({
  v: z.number().int().default(1),
  gid: z.string().min(1, "Invalid gym identifier in QR payload"),
  mid: z.string().min(1, "Invalid member identifier in QR payload"),
  ts: z.number().int("Timestamp must be an integer"),
  nonce: z.string().min(8, "Nonce must be at least 8 characters"),
  sig: z.string().min(32, "Signature must be at least 32 characters"),
});

export const qrScanInputSchema = z.object({
  qrData: z.string().min(1, "Scanned QR code data is required"),
  mode: z.enum(["CHECK_IN", "CHECK_OUT"]).default("CHECK_IN"),
  deviceInfo: z.string().max(255).optional(),
});

export const manualAttendanceSchema = z.object({
  memberId: z.string().min(1, "Invalid member ID"),
  mode: z.enum(["CHECK_IN", "CHECK_OUT"]).default("CHECK_IN"),
  reason: z
    .string()
    .trim()
    .min(3, "Audit reason must be at least 3 characters")
    .max(255, "Audit reason cannot exceed 255 characters"),
  customTime: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const d = new Date(val);
      return !isNaN(d.getTime());
    }, "Custom check-in time must be a valid date"),
});

export const attendanceFilterSchema = z.object({
  date: z.string().optional(),
  status: z.nativeEnum(AttendanceStatus).or(z.literal("ALL")).optional(),
  method: z.nativeEnum(CheckInMethod).or(z.literal("ALL")).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type QrTokenPayload = z.infer<typeof qrTokenPayloadSchema>;
export type QrScanInput = z.infer<typeof qrScanInputSchema>;
export type ManualAttendanceInput = z.infer<typeof manualAttendanceSchema>;
export type AttendanceFilterParams = z.infer<typeof attendanceFilterSchema>;
