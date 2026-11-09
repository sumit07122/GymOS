/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import { requireGymAccess } from "@/lib/auth/guards";
import { GymRole, LeadSource, LeadStage, LeadActivityType, PaymentMethod } from "@prisma/client";
import {
  createLead,
  updateLead,
  changeLeadStatus,
  logLeadActivity,
  scheduleFollowUp,
  convertLeadToMember,
} from "@/lib/services/lead.service";
import {
  leadCreateSchema,
  leadUpdateSchema,
  leadStageChangeSchema,
  leadActivityLogSchema,
  leadFollowUpSchema,
  leadConvertSchema,
} from "@/lib/validations/lead";

export interface LeadActionState {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
  data?: any;
}

/**
 * Server Action: Create a new lead inquiry.
 */
export async function createLeadAction(
  _prevState: LeadActionState | null,
  formData: FormData
): Promise<LeadActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) {
      return { success: false, error: "Missing gym workspace identifier." };
    }

    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
    ]);

    const rawData = {
      firstName: formData.get("firstName")?.toString() || "",
      lastName: formData.get("lastName")?.toString() || "",
      phone: formData.get("phone")?.toString() || "",
      email: formData.get("email")?.toString() || undefined,
      source: (formData.get("source")?.toString() as LeadSource) || LeadSource.WALK_IN,
      stage: (formData.get("stage")?.toString() as LeadStage) || LeadStage.NEW,
      interestedPlanId: formData.get("interestedPlanId")?.toString() || undefined,
      assignedStaffId: formData.get("assignedStaffId")?.toString() || undefined,
      trialDate: formData.get("trialDate")?.toString() || undefined,
      followUpDate: formData.get("followUpDate")?.toString() || undefined,
      followUpNotes: formData.get("followUpNotes")?.toString() || undefined,
      notes: formData.get("notes")?.toString() || undefined,
    };

    const parsed = leadCreateSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      return {
        success: false,
        error: "Please check all lead fields.",
        fieldErrors,
      };
    }

    const lead = await createLead(context, parsed.data);

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/leads`);
      revalidatePath(`/${gymSlug}/dashboard`);
    }

    return {
      success: true,
      message: `Lead for ${lead.firstName} ${lead.lastName} added successfully.`,
      data: lead,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to create lead.",
    };
  }
}

/**
 * Server Action: Update lead details.
 */
export async function updateLeadAction(
  _prevState: LeadActionState | null,
  formData: FormData
): Promise<LeadActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) {
      return { success: false, error: "Missing gym workspace identifier." };
    }

    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
    ]);

    const rawData = {
      leadId: formData.get("leadId")?.toString() || "",
      firstName: formData.get("firstName")?.toString() || "",
      lastName: formData.get("lastName")?.toString() || "",
      phone: formData.get("phone")?.toString() || "",
      email: formData.get("email")?.toString() || undefined,
      source: formData.get("source")?.toString() as LeadSource,
      interestedPlanId: formData.get("interestedPlanId")?.toString() || undefined,
      assignedStaffId: formData.get("assignedStaffId")?.toString() || undefined,
      trialDate: formData.get("trialDate")?.toString() || undefined,
      followUpDate: formData.get("followUpDate")?.toString() || undefined,
      followUpNotes: formData.get("followUpNotes")?.toString() || undefined,
      notes: formData.get("notes")?.toString() || undefined,
    };

    const parsed = leadUpdateSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      return {
        success: false,
        error: "Please verify lead information.",
        fieldErrors,
      };
    }

    const lead = await updateLead(context, parsed.data);

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/leads`);
      revalidatePath(`/${gymSlug}/dashboard`);
    }

    return {
      success: true,
      message: `Lead ${lead.firstName} ${lead.lastName} updated.`,
      data: lead,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to update lead.",
    };
  }
}

/**
 * Server Action: Change pipeline stage.
 */
export async function changeLeadStatusAction(
  _prevState: LeadActionState | null,
  formData: FormData
): Promise<LeadActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) {
      return { success: false, error: "Missing gym workspace identifier." };
    }

    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
    ]);

    const rawData = {
      leadId: formData.get("leadId")?.toString() || "",
      stage: formData.get("stage")?.toString() as LeadStage,
      lostReason: formData.get("lostReason")?.toString() || undefined,
      notes: formData.get("notes")?.toString() || undefined,
    };

    const parsed = leadStageChangeSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid stage change parameters.",
      };
    }

    const updated = await changeLeadStatus(context, parsed.data);

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/leads`);
      revalidatePath(`/${gymSlug}/dashboard`);
    }

    return {
      success: true,
      message: `Lead pipeline moved to ${updated.stage}.`,
      data: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to change lead status.",
    };
  }
}

/**
 * Server Action: Manually log call, conversation, or notes.
 */
export async function logLeadActivityAction(
  _prevState: LeadActionState | null,
  formData: FormData
): Promise<LeadActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) {
      return { success: false, error: "Missing gym workspace identifier." };
    }

    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
    ]);

    const rawData = {
      leadId: formData.get("leadId")?.toString() || "",
      type: formData.get("type")?.toString() as LeadActivityType,
      notes: formData.get("notes")?.toString() || "",
    };

    const parsed = leadActivityLogSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: "Please enter activity notes.",
      };
    }

    const activity = await logLeadActivity(context, parsed.data);

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/leads`);
    }

    return {
      success: true,
      message: "Conversation activity recorded.",
      data: activity,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to log lead activity.",
    };
  }
}

/**
 * Server Action: Schedule a follow-up reminder.
 */
export async function scheduleFollowUpAction(
  _prevState: LeadActionState | null,
  formData: FormData
): Promise<LeadActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) {
      return { success: false, error: "Missing gym workspace identifier." };
    }

    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
    ]);

    const rawData = {
      leadId: formData.get("leadId")?.toString() || "",
      followUpDate: formData.get("followUpDate")?.toString() || "",
      followUpNotes: formData.get("followUpNotes")?.toString() || undefined,
    };

    const parsed = leadFollowUpSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: "Please select a valid follow-up date.",
      };
    }

    const lead = await scheduleFollowUp(context, parsed.data);

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/leads`);
      revalidatePath(`/${gymSlug}/dashboard`);
    }

    return {
      success: true,
      message: "Follow-up reminder scheduled.",
      data: lead,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to schedule follow-up.",
    };
  }
}

/**
 * Server Action: Convert lead into an active member.
 */
export async function convertLeadAction(
  _prevState: LeadActionState | null,
  formData: FormData
): Promise<LeadActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) {
      return { success: false, error: "Missing gym workspace identifier." };
    }

    const { context } = await requireGymAccess(gymId, [
      GymRole.OWNER,
      GymRole.STAFF,
    ]);

    const createMembershipVal = formData.get("createMembership");
    const createMembership =
      createMembershipVal === "true" || createMembershipVal === "on";

    const rawData = {
      leadId: formData.get("leadId")?.toString() || "",
      planId: formData.get("planId")?.toString() || undefined,
      startDate: formData.get("startDate")?.toString() || undefined,
      amountPaid: formData.get("amountPaid") || 0,
      paymentMethod: formData.get("paymentMethod")?.toString() as PaymentMethod,
      createMembership,
      notes: formData.get("notes")?.toString() || undefined,
    };

    const parsed = leadConvertSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: "Please check conversion parameters.",
      };
    }

    const result = await convertLeadToMember(context, parsed.data);

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/leads`);
      revalidatePath(`/${gymSlug}/members`);
      revalidatePath(`/${gymSlug}/dashboard`);
    }

    const message = result.isExistingMember
      ? `Lead converted and linked to existing member ${result.member.firstName} ${result.member.lastName} (${result.member.memberCode}).`
      : `Successfully converted to new member ${result.member.firstName} ${result.member.lastName} (${result.member.memberCode})!`;

    return {
      success: true,
      message,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to convert lead.",
    };
  }
}

