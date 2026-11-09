/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import { requireGymAccess } from "@/lib/auth/guards";
import { GymRole, MemberStatus } from "@prisma/client";
import {
  createMember,
  updateMember,
  archiveMember,
  unarchiveMember,
  deleteMember,
  addWorkoutRecord,
  importMembersFromCsv,
} from "@/lib/services/member.service";
import {
  memberCreateSchema,
  memberUpdateSchema,
} from "@/lib/validations/member";

export interface MemberActionState {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
  memberId?: string;
  gymSlug?: string;
  importedCount?: number;
  skippedCount?: number;
  importErrors?: string[];
}

/**
 * Server Action: Create Member
 */
export async function createMemberAction(
  _prevState: MemberActionState | null,
  formData: FormData
): Promise<MemberActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) {
      return { success: false, error: "Missing gym identifier." };
    }

    const { session, context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
    ]);

    const rawData = {
      memberCode: formData.get("memberCode") || undefined,
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email") || undefined,
      phone: formData.get("phone") || undefined,
      dateOfBirth: formData.get("dateOfBirth") || undefined,
      gender: formData.get("gender") || undefined,
      photoUrl: formData.get("photoUrl") || undefined,
      address: formData.get("address") || undefined,
      emergencyContactName: formData.get("emergencyContactName") || undefined,
      emergencyContactPhone: formData.get("emergencyContactPhone") || undefined,
      joiningDate: formData.get("joiningDate") || undefined,
      medicalNotes: formData.get("medicalNotes") || undefined,
      internalNotes: formData.get("internalNotes") || undefined,
      status: (formData.get("status") as MemberStatus) || MemberStatus.ACTIVE,
    };

    const validation = memberCreateSchema.safeParse(rawData);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      return {
        success: false,
        error: "Please correct the form errors.",
        fieldErrors,
      };
    }

    const member = await createMember(
      context,
      validation.data,
      session.user.name || "Staff"
    );

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/members`);
      revalidatePath(`/${gymSlug}/dashboard`);
    }

    return {
      success: true,
      message: `Member ${member.firstName} ${member.lastName} (${member.memberCode}) created successfully.`,
      memberId: member.id,
      gymSlug,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to create member.",
    };
  }
}

/**
 * Server Action: Update Member
 */
export async function updateMemberAction(
  _prevState: MemberActionState | null,
  formData: FormData
): Promise<MemberActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();
    const memberId = formData.get("id")?.toString();

    if (!gymId || !memberId) {
      return { success: false, error: "Missing member or gym identifier." };
    }

    const { session, context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
    ]);

    const rawData = {
      id: memberId,
      firstName: formData.get("firstName") || undefined,
      lastName: formData.get("lastName") || undefined,
      email: formData.get("email") || undefined,
      phone: formData.get("phone") || undefined,
      dateOfBirth: formData.get("dateOfBirth") || undefined,
      gender: formData.get("gender") || undefined,
      photoUrl: formData.get("photoUrl") || undefined,
      address: formData.get("address") || undefined,
      emergencyContactName: formData.get("emergencyContactName") || undefined,
      emergencyContactPhone: formData.get("emergencyContactPhone") || undefined,
      joiningDate: formData.get("joiningDate") || undefined,
      medicalNotes: formData.get("medicalNotes") || undefined,
      internalNotes: formData.get("internalNotes") || undefined,
      status: (formData.get("status") as MemberStatus) || undefined,
    };

    const validation = memberUpdateSchema.safeParse(rawData);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      return {
        success: false,
        error: "Please correct the form errors.",
        fieldErrors,
      };
    }

    const member = await updateMember(
      context,
      memberId,
      validation.data,
      session.user.name || "Staff"
    );

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/members`);
      revalidatePath(`/${gymSlug}/members/${memberId}`);
      revalidatePath(`/${gymSlug}/dashboard`);
    }

    return {
      success: true,
      message: `Member ${member.firstName} ${member.lastName} updated successfully.`,
      memberId: member.id,
      gymSlug,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to update member.",
    };
  }
}

/**
 * Server Action: Archive Member
 */
export async function archiveMemberAction(
  _prevState: MemberActionState | null,
  formData: FormData
): Promise<MemberActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();
    const memberId = formData.get("memberId")?.toString();
    const reason = formData.get("reason")?.toString() || "Archived by staff";

    if (!gymId || !memberId) {
      return { success: false, error: "Missing required identifiers." };
    }

    const { session, context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
    ]);

    await archiveMember(context, memberId, reason, session.user.name || "Staff");

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/members`);
      revalidatePath(`/${gymSlug}/members/${memberId}`);
      revalidatePath(`/${gymSlug}/dashboard`);
    }

    return {
      success: true,
      message: "Member archived successfully.",
      gymSlug,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to archive member.",
    };
  }
}

/**
 * Server Action: Unarchive Member
 */
export async function unarchiveMemberAction(
  _prevState: MemberActionState | null,
  formData: FormData
): Promise<MemberActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();
    const memberId = formData.get("memberId")?.toString();

    if (!gymId || !memberId) {
      return { success: false, error: "Missing required identifiers." };
    }

    const { session, context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
    ]);

    await unarchiveMember(context, memberId, session.user.name || "Staff");

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/members`);
      revalidatePath(`/${gymSlug}/members/${memberId}`);
      revalidatePath(`/${gymSlug}/dashboard`);
    }

    return {
      success: true,
      message: "Member restored to Active status.",
      gymSlug,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to restore member.",
    };
  }
}

/**
 * Server Action: Delete Member (strictly blocked if financial/attendance history exists)
 */
export async function deleteMemberAction(
  _prevState: MemberActionState | null,
  formData: FormData
): Promise<MemberActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();
    const memberId = formData.get("memberId")?.toString();

    if (!gymId || !memberId) {
      return { success: false, error: "Missing required identifiers." };
    }

    const { context } = await requireGymAccess(gymId, [GymRole.OWNER]);

    await deleteMember(context, memberId);

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/members`);
      revalidatePath(`/${gymSlug}/dashboard`);
    }

    return {
      success: true,
      message: "Member record permanently removed.",
      gymSlug,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to delete member.",
    };
  }
}

/**
 * Server Action: Add Workout Record
 */
export async function addWorkoutRecordAction(
  _prevState: MemberActionState | null,
  formData: FormData
): Promise<MemberActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();
    const memberId = formData.get("memberId")?.toString();
    const title = formData.get("title")?.toString();
    const notes = formData.get("notes")?.toString();

    if (!gymId || !memberId || !title?.trim()) {
      return { success: false, error: "Workout title is required." };
    }

    const { session, context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
    ]);

    await addWorkoutRecord(
      context,
      memberId,
      title,
      notes,
      session.user.name || "Trainer"
    );

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/members/${memberId}`);
    }

    return {
      success: true,
      message: "Workout record logged successfully.",
      gymSlug,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to log workout record.",
    };
  }
}

/**
 * Server Action: Import Members from CSV
 */
export async function importMembersCsvAction(
  _prevState: MemberActionState | null,
  formData: FormData
): Promise<MemberActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();
    const csvContent = formData.get("csvContent")?.toString();

    if (!gymId || !csvContent?.trim()) {
      return { success: false, error: "CSV data is required." };
    }

    const { session, context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
    ]);

    const result = await importMembersFromCsv(
      context,
      csvContent,
      session.user.name || "Staff"
    );

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/members`);
      revalidatePath(`/${gymSlug}/dashboard`);
    }

    return {
      success: result.imported > 0,
      message: `Successfully imported ${result.imported} member(s). ${result.skipped > 0 ? `${result.skipped} row(s) skipped.` : ""}`,
      importedCount: result.imported,
      skippedCount: result.skipped,
      importErrors: result.errors,
      gymSlug,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to import CSV.",
    };
  }
}
