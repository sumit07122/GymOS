/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import { requireGymAccess } from "@/lib/auth/guards";
import { GymRole, ClassStatus } from "@prisma/client";
import {
  createClass,
  updateClass,
  createSchedule,
  updateSchedule,
  cancelSchedule,
  bookClass,
  cancelBooking,
  markBookingAttendance,
} from "@/lib/services/class.service";
import {
  classCreateSchema,
  classUpdateSchema,
  classScheduleCreateSchema,
  classScheduleUpdateSchema,
  classBookingCreateSchema,
} from "@/lib/validations/class";

export interface ClassActionState {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
  data?: any;
}

// ==============================================================================
// 1. CLASS TEMPLATES ACTIONS
// ==============================================================================

export async function createClassAction(
  _prevState: ClassActionState | null,
  formData: FormData
): Promise<ClassActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) return { success: false, error: "Missing gym workspace identifier." };

    const { context } = await requireGymAccess(gymId, [GymRole.OWNER, GymRole.STAFF]);

    const rawData = {
      name: formData.get("name")?.toString() || "",
      description: formData.get("description")?.toString() || undefined,
      defaultCapacity: formData.get("defaultCapacity")?.toString() || "20",
      durationMinutes: formData.get("durationMinutes")?.toString() || "60",
    };

    const parsed = classCreateSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString();
        if (key) fieldErrors[key] = issue.message;
      }
      return { success: false, error: "Validation failed.", fieldErrors };
    }

    const newClass = await createClass(context, parsed.data);
    if (gymSlug) revalidatePath(`/${gymSlug}/classes`);

    return {
      success: true,
      message: `Class "${newClass.name}" created successfully.`,
      data: newClass,
    };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to create class." };
  }
}

export async function updateClassAction(
  _prevState: ClassActionState | null,
  formData: FormData
): Promise<ClassActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();
    const classId = formData.get("classId")?.toString();

    if (!gymId || !classId) return { success: false, error: "Missing required identifiers." };

    const { context } = await requireGymAccess(gymId, [GymRole.OWNER, GymRole.STAFF]);

    const rawData: Record<string, any> = {};
    if (formData.has("name")) rawData.name = formData.get("name")?.toString();
    if (formData.has("description")) rawData.description = formData.get("description")?.toString();
    if (formData.has("defaultCapacity")) rawData.defaultCapacity = formData.get("defaultCapacity")?.toString();
    if (formData.has("durationMinutes")) rawData.durationMinutes = formData.get("durationMinutes")?.toString();

    const parsed = classUpdateSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: "Validation failed." };
    }

    await updateClass(context, classId, parsed.data);
    if (gymSlug) revalidatePath(`/${gymSlug}/classes`);

    return { success: true, message: "Class updated successfully." };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to update class." };
  }
}

// ==============================================================================
// 2. SCHEDULES ACTIONS
// ==============================================================================

export async function createScheduleAction(
  _prevState: ClassActionState | null,
  formData: FormData
): Promise<ClassActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) return { success: false, error: "Missing gym workspace identifier." };

    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
      GymRole.TRAINER,
    ]);

    const rawData = {
      classId: formData.get("classId")?.toString() || "",
      instructorUserId: formData.get("instructorUserId")?.toString() || undefined,
      startTime: formData.get("startTime")?.toString() || "",
      endTime: formData.get("endTime")?.toString() || "",
      capacity: formData.get("capacity")?.toString() || "20",
      roomLocation: formData.get("roomLocation")?.toString() || undefined,
    };

    const parsed = classScheduleCreateSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString();
        if (key) fieldErrors[key] = issue.message;
      }
      return { success: false, error: "Validation failed.", fieldErrors };
    }

    const schedule = await createSchedule(context, parsed.data);
    if (gymSlug) revalidatePath(`/${gymSlug}/classes`);

    return {
      success: true,
      message: "Class session scheduled successfully.",
      data: schedule,
    };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to schedule class session." };
  }
}

export async function updateScheduleAction(
  _prevState: ClassActionState | null,
  formData: FormData
): Promise<ClassActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();
    const scheduleId = formData.get("scheduleId")?.toString();

    if (!gymId || !scheduleId) return { success: false, error: "Missing required identifiers." };

    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
      GymRole.TRAINER,
    ]);

    const rawData: Record<string, any> = {};
    if (formData.has("instructorUserId")) rawData.instructorUserId = formData.get("instructorUserId")?.toString();
    if (formData.has("startTime")) rawData.startTime = formData.get("startTime")?.toString();
    if (formData.has("endTime")) rawData.endTime = formData.get("endTime")?.toString();
    if (formData.has("capacity")) rawData.capacity = formData.get("capacity")?.toString();
    if (formData.has("roomLocation")) rawData.roomLocation = formData.get("roomLocation")?.toString();
    if (formData.has("status")) rawData.status = formData.get("status")?.toString() as ClassStatus;

    const parsed = classScheduleUpdateSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: "Validation failed." };
    }

    await updateSchedule(context, scheduleId, parsed.data);
    if (gymSlug) revalidatePath(`/${gymSlug}/classes`);

    return { success: true, message: "Class session updated successfully." };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to update schedule." };
  }
}

export async function cancelScheduleAction(
  _prevState: ClassActionState | null,
  formData: FormData
): Promise<ClassActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();
    const scheduleId = formData.get("scheduleId")?.toString();

    if (!gymId || !scheduleId) return { success: false, error: "Missing required identifiers." };

    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
      GymRole.TRAINER,
    ]);

    await cancelSchedule(context, scheduleId);
    if (gymSlug) revalidatePath(`/${gymSlug}/classes`);

    return { success: true, message: "Class session cancelled." };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to cancel session." };
  }
}

// ==============================================================================
// 3. BOOKINGS & ATTENDANCE ACTIONS
// ==============================================================================

export async function bookClassAction(
  _prevState: ClassActionState | null,
  formData: FormData
): Promise<ClassActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) return { success: false, error: "Missing gym workspace identifier." };

    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
      GymRole.TRAINER,
      GymRole.MEMBER,
    ]);

    const rawData = {
      scheduleId: formData.get("scheduleId")?.toString() || "",
      memberId: formData.get("memberId")?.toString() || "",
    };

    const parsed = classBookingCreateSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: "Invalid booking request parameters." };
    }

    const booking = await bookClass(context, parsed.data.scheduleId, parsed.data.memberId);
    if (gymSlug) revalidatePath(`/${gymSlug}/classes`);

    return { success: true, message: "Class spot booked successfully!", data: booking };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to book class." };
  }
}

export async function cancelBookingAction(
  _prevState: ClassActionState | null,
  formData: FormData
): Promise<ClassActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();
    const bookingId = formData.get("bookingId")?.toString();

    if (!gymId || !bookingId) return { success: false, error: "Missing booking identifiers." };

    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
      GymRole.TRAINER,
      GymRole.MEMBER,
    ]);

    await cancelBooking(context, bookingId);
    if (gymSlug) revalidatePath(`/${gymSlug}/classes`);

    return { success: true, message: "Booking cancelled." };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to cancel booking." };
  }
}

export async function markAttendanceAction(
  _prevState: ClassActionState | null,
  formData: FormData
): Promise<ClassActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();
    const bookingId = formData.get("bookingId")?.toString();
    const attended = formData.get("attended")?.toString() === "true";

    if (!gymId || !bookingId) return { success: false, error: "Missing booking identifiers." };

    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
      GymRole.TRAINER,
    ]);

    await markBookingAttendance(context, bookingId, attended);
    if (gymSlug) revalidatePath(`/${gymSlug}/classes`);

    return {
      success: true,
      message: `Marked attendance as ${attended ? "Attended" : "No-Show"}.`,
    };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to mark attendance." };
  }
}

