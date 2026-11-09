/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import { requireGymAccess } from "@/lib/auth/guards";
import { GymRole } from "@prisma/client";
import {
  createPlan,
  updatePlan,
  archivePlan,
  assignMembership,
  renewMembership,
  extendMembership,
  pauseMembership,
  resumeMembership,
  cancelMembership,
} from "@/lib/services/membership.service";
import {
  planCreateSchema,
  planUpdateSchema,
  membershipAssignSchema,
  membershipRenewSchema,
  membershipExtendSchema,
  membershipPauseSchema,
  membershipResumeSchema,
  membershipCancelSchema,
} from "@/lib/validations/membership";

export interface MembershipActionState {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
  planId?: string;
  membershipId?: string;
}

// ==============================================================================
// PLAN ACTIONS
// ==============================================================================

export async function createPlanAction(
  _prevState: MembershipActionState | null,
  formData: FormData
): Promise<MembershipActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) {
      return { success: false, error: "Missing gym identifier." };
    }

    const { context } = await requireGymAccess(gymId, [GymRole.OWNER]);

    const rawData = {
      name: formData.get("name"),
      description: formData.get("description") || undefined,
      durationDays: formData.get("durationDays"),
      price: formData.get("price"),
      admissionFee: formData.get("admissionFee") || 0,
      maxSessions: formData.get("maxSessions") || undefined,
      benefits: formData.get("benefits") || undefined,
      accessRestrictions: formData.get("accessRestrictions") || undefined,
      isActive: formData.get("isActive") === "false" ? false : true,
    };

    const parsed = planCreateSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      return {
        success: false,
        error: "Please correct the errors in the plan form.",
        fieldErrors,
      };
    }

    const created = await createPlan(context, parsed.data);

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/memberships`);
    }

    return {
      success: true,
      message: `Plan "${created.name}" created successfully.`,
      planId: created.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to create membership plan.",
    };
  }
}

export async function updatePlanAction(
  _prevState: MembershipActionState | null,
  formData: FormData
): Promise<MembershipActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();
    const id = formData.get("id")?.toString();

    if (!gymId || !id) {
      return { success: false, error: "Missing required plan identifiers." };
    }

    const { context } = await requireGymAccess(gymId, [GymRole.OWNER]);

    const rawData = {
      id,
      name: formData.get("name") || undefined,
      description: formData.get("description") || undefined,
      durationDays: formData.get("durationDays") || undefined,
      price: formData.get("price") || undefined,
      admissionFee: formData.get("admissionFee") || undefined,
      maxSessions: formData.get("maxSessions") || undefined,
      benefits: formData.get("benefits") || undefined,
      accessRestrictions: formData.get("accessRestrictions") || undefined,
      isActive: formData.get("isActive") !== null
        ? formData.get("isActive") === "true"
        : undefined,
    };

    const parsed = planUpdateSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      return {
        success: false,
        error: "Validation failed on plan update.",
        fieldErrors,
      };
    }

    const updated = await updatePlan(context, parsed.data);

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/memberships`);
    }

    return {
      success: true,
      message: `Plan "${updated.name}" updated successfully.`,
      planId: updated.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to update membership plan.",
    };
  }
}

export async function archivePlanAction(
  gymId: string,
  planId: string,
  gymSlug?: string
): Promise<MembershipActionState> {
  try {
    const { context } = await requireGymAccess(gymId, [GymRole.OWNER]);
    const archived = await archivePlan(context, planId);

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/memberships`);
    }

    return {
      success: true,
      message: `Plan "${archived.name}" has been archived.`,
      planId: archived.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to archive membership plan.",
    };
  }
}

// ==============================================================================
// MEMBERSHIP LIFECYCLE ACTIONS
// ==============================================================================

export async function assignMembershipAction(
  _prevState: MembershipActionState | null,
  formData: FormData
): Promise<MembershipActionState> {
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
      memberId: formData.get("memberId"),
      planId: formData.get("planId"),
      startDate: formData.get("startDate") || undefined,
      customPrice: formData.get("customPrice") || undefined,
      customAdmissionFee: formData.get("customAdmissionFee") || undefined,
      notes: formData.get("notes") || undefined,
    };

    const parsed = membershipAssignSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      return {
        success: false,
        error: "Validation failed for membership assignment.",
        fieldErrors,
      };
    }

    const membership = await assignMembership(context, parsed.data);

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/memberships`);
      revalidatePath(`/${gymSlug}/members`);
      revalidatePath(`/${gymSlug}/members/${parsed.data.memberId}`);
    }

    return {
      success: true,
      message: "Membership plan assigned successfully.",
      membershipId: membership.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to assign membership plan.",
    };
  }
}

export async function renewMembershipAction(
  _prevState: MembershipActionState | null,
  formData: FormData
): Promise<MembershipActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();
    const memberId = formData.get("memberId")?.toString();

    if (!gymId) {
      return { success: false, error: "Missing gym identifier." };
    }

    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
    ]);

    const rawData = {
      membershipId: formData.get("membershipId"),
      planId: formData.get("planId") || undefined,
      startDate: formData.get("startDate") || undefined,
      customPrice: formData.get("customPrice") || undefined,
      notes: formData.get("notes") || undefined,
    };

    const parsed = membershipRenewSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      return {
        success: false,
        error: "Validation failed for renewal.",
        fieldErrors,
      };
    }

    const newMembership = await renewMembership(context, parsed.data);

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/memberships`);
      revalidatePath(`/${gymSlug}/members`);
      if (memberId) {
        revalidatePath(`/${gymSlug}/members/${memberId}`);
      }
    }

    return {
      success: true,
      message: "Membership renewed successfully.",
      membershipId: newMembership.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to renew membership.",
    };
  }
}

export async function extendMembershipAction(
  _prevState: MembershipActionState | null,
  formData: FormData
): Promise<MembershipActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();
    const memberId = formData.get("memberId")?.toString();

    if (!gymId) {
      return { success: false, error: "Missing gym identifier." };
    }

    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
    ]);

    const rawData = {
      membershipId: formData.get("membershipId"),
      extensionDays: formData.get("extensionDays"),
      reason: formData.get("reason"),
    };

    const parsed = membershipExtendSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      return {
        success: false,
        error: "Validation failed for extension.",
        fieldErrors,
      };
    }

    const updated = await extendMembership(context, parsed.data);

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/memberships`);
      revalidatePath(`/${gymSlug}/members`);
      if (memberId) {
        revalidatePath(`/${gymSlug}/members/${memberId}`);
      }
    }

    return {
      success: true,
      message: `Membership extended by ${parsed.data.extensionDays} days.`,
      membershipId: updated.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to extend membership.",
    };
  }
}

export async function pauseMembershipAction(
  _prevState: MembershipActionState | null,
  formData: FormData
): Promise<MembershipActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();
    const memberId = formData.get("memberId")?.toString();

    if (!gymId) {
      return { success: false, error: "Missing gym identifier." };
    }

    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
    ]);

    const rawData = {
      membershipId: formData.get("membershipId"),
      reason: formData.get("reason"),
    };

    const parsed = membershipPauseSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      return {
        success: false,
        error: "Validation failed for pause action.",
        fieldErrors,
      };
    }

    const updated = await pauseMembership(context, parsed.data);

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/memberships`);
      revalidatePath(`/${gymSlug}/members`);
      if (memberId) {
        revalidatePath(`/${gymSlug}/members/${memberId}`);
      }
    }

    return {
      success: true,
      message: "Membership has been paused.",
      membershipId: updated.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to pause membership.",
    };
  }
}

export async function resumeMembershipAction(
  gymId: string,
  membershipId: string,
  gymSlug?: string,
  memberId?: string
): Promise<MembershipActionState> {
  try {
    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
    ]);

    const parsed = membershipResumeSchema.safeParse({ membershipId });
    if (!parsed.success) {
      return { success: false, error: "Invalid membership ID." };
    }

    const updated = await resumeMembership(context, parsed.data);

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/memberships`);
      revalidatePath(`/${gymSlug}/members`);
      if (memberId) {
        revalidatePath(`/${gymSlug}/members/${memberId}`);
      }
    }

    return {
      success: true,
      message: "Membership resumed successfully.",
      membershipId: updated.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to resume membership.",
    };
  }
}

export async function cancelMembershipAction(
  _prevState: MembershipActionState | null,
  formData: FormData
): Promise<MembershipActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();
    const memberId = formData.get("memberId")?.toString();

    if (!gymId) {
      return { success: false, error: "Missing gym identifier." };
    }

    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
    ]);

    const rawData = {
      membershipId: formData.get("membershipId"),
      cancellationReason: formData.get("cancellationReason"),
    };

    const parsed = membershipCancelSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      return {
        success: false,
        error: "Validation failed for cancellation.",
        fieldErrors,
      };
    }

    const updated = await cancelMembership(context, parsed.data);

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/memberships`);
      revalidatePath(`/${gymSlug}/members`);
      if (memberId) {
        revalidatePath(`/${gymSlug}/members/${memberId}`);
      }
    }

    return {
      success: true,
      message: "Membership cancelled.",
      membershipId: updated.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to cancel membership.",
    };
  }
}
