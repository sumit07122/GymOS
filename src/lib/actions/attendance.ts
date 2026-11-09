/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import { requireGymAccess } from "@/lib/auth/guards";
import { GymRole } from "@prisma/client";
import {
  processQrAttendanceScan,
  recordManualAttendance,
  generateMemberQrPass,
  ScanResult,
  AttendanceValidationError,
} from "@/lib/services/attendance.service";
import {
  qrScanInputSchema,
  manualAttendanceSchema,
} from "@/lib/validations/attendance";

export interface AttendanceActionState {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
  scanResult?: ScanResult;
}

/**
 * Server Action: Process dynamic QR code attendance scan.
 */
export async function scanQrCodeAction(
  _prevState: AttendanceActionState | null,
  formData: FormData
): Promise<AttendanceActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) {
      return { success: false, error: "Missing gym identifier." };
    }

    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
    ]);

    const rawData = {
      qrData: formData.get("qrData")?.toString() || "",
      mode: (formData.get("mode")?.toString() as any) || "CHECK_IN",
      deviceInfo: formData.get("deviceInfo")?.toString() || undefined,
    };

    const parsed = qrScanInputSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      return {
        success: false,
        error: "Invalid QR scan payload.",
        fieldErrors,
      };
    }

    const result = await processQrAttendanceScan(context, parsed.data);

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/attendance`);
      revalidatePath(`/${gymSlug}/dashboard`);
    }

    return {
      success: true,
      message: result.message,
      scanResult: result,
    };
  } catch (error: any) {
    if (error instanceof AttendanceValidationError) {
      return {
        success: false,
        error: error.message,
        scanResult: {
          success: false,
          status: "REJECTED" as any,
          mode: "CHECK_IN",
          message: error.message,
          member: error.memberInfo || {
            id: "",
            fullName: "Unknown Member",
            memberCode: "UNKNOWN",
          },
        },
      };
    }

    return {
      success: false,
      error: error.message || "Failed to process attendance scan.",
    };
  }
}

/**
 * Server Action: Record manual attendance override with mandatory audit reason.
 */
export async function manualAttendanceAction(
  _prevState: AttendanceActionState | null,
  formData: FormData
): Promise<AttendanceActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) {
      return { success: false, error: "Missing gym identifier." };
    }

    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
    ]);

    const rawData = {
      memberId: formData.get("memberId")?.toString(),
      mode: (formData.get("mode")?.toString() as any) || "CHECK_IN",
      reason: formData.get("reason")?.toString(),
      customTime: formData.get("customTime")?.toString() || undefined,
    };

    const parsed = manualAttendanceSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      return {
        success: false,
        error: "Validation failed for manual attendance entry.",
        fieldErrors,
      };
    }

    const result = await recordManualAttendance(context, parsed.data);

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/attendance`);
      revalidatePath(`/${gymSlug}/dashboard`);
    }

    return {
      success: true,
      message: result.message,
      scanResult: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to log manual attendance.",
    };
  }
}

/**
 * Server Action: Generates dynamic 60-second QR token pass for a member.
 */
export async function getMemberDynamicQrPassAction(
  gymId: string,
  memberId: string
) {
  try {
    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
      GymRole.MEMBER,
    ]);

    return {
      success: true,
      data: await generateMemberQrPass(context, memberId),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to generate dynamic QR token.",
    };
  }
}
