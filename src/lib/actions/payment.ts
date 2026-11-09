/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import { requireGymAccess } from "@/lib/auth/guards";
import { GymRole, PaymentMethod, AdjustmentType } from "@prisma/client";
import {
  createInvoice,
  recordPayment,
  processRefund,
  processAdjustment,
  voidInvoice,
} from "@/lib/services/payment.service";
import {
  invoiceCreateSchema,
  paymentRecordSchema,
  refundCreateSchema,
  adjustmentCreateSchema,
  invoiceVoidSchema,
} from "@/lib/validations/payment";

export interface PaymentActionState {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
  data?: any;
}

/**
 * Server Action: Create and issue a new tax-compliant invoice.
 */
export async function createInvoiceAction(
  _prevState: PaymentActionState | null,
  formData: FormData
): Promise<PaymentActionState> {
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
      memberId: formData.get("memberId")?.toString() || "",
      membershipId: formData.get("membershipId")?.toString() || undefined,
      subtotal: formData.get("subtotal"),
      taxAmount: formData.get("taxAmount") || 0,
      dueDate: formData.get("dueDate")?.toString() || undefined,
      notes: formData.get("notes")?.toString() || undefined,
    };

    const parsed = invoiceCreateSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      return {
        success: false,
        error: "Please check all invoice fields.",
        fieldErrors,
      };
    }

    const invoice = await createInvoice(context, parsed.data);

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/payments`);
      revalidatePath(`/${gymSlug}/dashboard`);
      revalidatePath(`/${gymSlug}/members/${parsed.data.memberId}`);
    }

    return {
      success: true,
      message: `Invoice ${invoice.invoiceNumber} created successfully.`,
      data: invoice,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to create invoice.",
    };
  }
}

/**
 * Server Action: Record a manual or verified payment.
 */
export async function recordPaymentAction(
  _prevState: PaymentActionState | null,
  formData: FormData
): Promise<PaymentActionState> {
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

    const autoAllocateVal = formData.get("autoAllocate");
    const autoAllocate = autoAllocateVal !== null ? autoAllocateVal === "true" || autoAllocateVal === "on" : true;

    const rawData = {
      memberId: formData.get("memberId")?.toString() || "",
      amount: formData.get("amount"),
      method: formData.get("method")?.toString() as PaymentMethod,
      gatewayRef: formData.get("gatewayRef")?.toString() || undefined,
      notes: formData.get("notes")?.toString() || undefined,
      receivedAt: formData.get("receivedAt")?.toString() || undefined,
      invoiceId: formData.get("invoiceId")?.toString() || undefined,
      autoAllocate,
    };

    const parsed = paymentRecordSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      return {
        success: false,
        error: "Please check payment details.",
        fieldErrors,
      };
    }

    const payment = await recordPayment(context, parsed.data);

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/payments`);
      revalidatePath(`/${gymSlug}/dashboard`);
      revalidatePath(`/${gymSlug}/members/${parsed.data.memberId}`);
    }

    return {
      success: true,
      message: `Payment of ₹${payment.amount.toLocaleString()} recorded successfully (${payment.paymentNumber}).`,
      data: payment,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to record payment.",
    };
  }
}

/**
 * Server Action: Process audited refund.
 */
export async function processRefundAction(
  _prevState: PaymentActionState | null,
  formData: FormData
): Promise<PaymentActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) {
      return { success: false, error: "Missing gym identifier." };
    }

    const { context } = await requireGymAccess(gymId, [GymRole.OWNER]);

    const rawData = {
      paymentId: formData.get("paymentId")?.toString() || "",
      amount: formData.get("amount"),
      reason: formData.get("reason")?.toString() || "",
      invoiceId: formData.get("invoiceId")?.toString() || undefined,
    };

    const parsed = refundCreateSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      return {
        success: false,
        error: "Please check refund details.",
        fieldErrors,
      };
    }

    const refund = await processRefund(context, parsed.data);

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/payments`);
      revalidatePath(`/${gymSlug}/dashboard`);
    }

    return {
      success: true,
      message: `Refund of ₹${refund.amount.toLocaleString()} processed successfully.`,
      data: refund,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to process refund.",
    };
  }
}

/**
 * Server Action: Process credit note, discount or write-off adjustment.
 */
export async function processAdjustmentAction(
  _prevState: PaymentActionState | null,
  formData: FormData
): Promise<PaymentActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) {
      return { success: false, error: "Missing gym identifier." };
    }

    const { context } = await requireGymAccess(gymId, [GymRole.OWNER]);

    const rawData = {
      invoiceId: formData.get("invoiceId")?.toString() || "",
      type: formData.get("type")?.toString() as AdjustmentType,
      amount: formData.get("amount"),
      reason: formData.get("reason")?.toString() || "",
    };

    const parsed = adjustmentCreateSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      return {
        success: false,
        error: "Please check adjustment parameters.",
        fieldErrors,
      };
    }

    const adjustment = await processAdjustment(context, parsed.data);

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/payments`);
      revalidatePath(`/${gymSlug}/dashboard`);
    }

    return {
      success: true,
      message: `Adjustment of ₹${adjustment.amount.toLocaleString()} applied to invoice.`,
      data: adjustment,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to process adjustment.",
    };
  }
}

/**
 * Server Action: Void an unpaid invoice.
 */
export async function voidInvoiceAction(
  _prevState: PaymentActionState | null,
  formData: FormData
): Promise<PaymentActionState> {
  try {
    const gymId = formData.get("gymId")?.toString();
    const gymSlug = formData.get("gymSlug")?.toString();

    if (!gymId) {
      return { success: false, error: "Missing gym identifier." };
    }

    const { context } = await requireGymAccess(gymId, [GymRole.OWNER]);

    const rawData = {
      invoiceId: formData.get("invoiceId")?.toString() || "",
      reason: formData.get("reason")?.toString() || "",
    };

    const parsed = invoiceVoidSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      return {
        success: false,
        error: "Please provide a valid cancellation reason.",
        fieldErrors,
      };
    }

    const voided = await voidInvoice(context, parsed.data);

    if (gymSlug) {
      revalidatePath(`/${gymSlug}/payments`);
      revalidatePath(`/${gymSlug}/dashboard`);
    }

    return {
      success: true,
      message: `Invoice ${voided.invoiceNumber} has been voided.`,
      data: voided,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to void invoice.",
    };
  }
}
