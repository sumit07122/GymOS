/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireGymAccess } from "@/lib/auth/guards";
import { GymRole } from "@prisma/client";
import {
  updateGymWebsiteConfig,
  submitPublicEnquiry,
} from "@/lib/services/website.service";
import {
  websiteConfigUpdateSchema,
  publicEnquirySchema,
} from "@/lib/validations/website";

export interface WebsiteActionState {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
  data?: any;
}

/**
 * Owner/Staff action to update gym website content, branding, facilities, and publication status.
 */
export async function updateWebsiteConfigAction(
  _prevState: WebsiteActionState | null,
  formData: FormData
): Promise<WebsiteActionState> {
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

    // Parse facilities array from form
    let facilities: string[] = [];
    const facilitiesRaw = formData.get("facilities")?.toString();
    if (facilitiesRaw) {
      try {
        facilities = JSON.parse(facilitiesRaw);
      } catch {
        facilities = facilitiesRaw.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    // Parse galleryUrls array from form
    let galleryUrls: string[] = [];
    const galleryRaw = formData.get("galleryUrls")?.toString();
    if (galleryRaw) {
      try {
        galleryUrls = JSON.parse(galleryRaw);
      } catch {
        galleryUrls = galleryRaw.split("\n").map((s) => s.trim()).filter(Boolean);
      }
    }

    const rawData = {
      isPublished: formData.get("isPublished") === "true",
      headline: formData.get("headline")?.toString() || null,
      subheadline: formData.get("subheadline")?.toString() || null,
      tagline: formData.get("tagline")?.toString() || null,
      heroImageUrl: formData.get("heroImageUrl")?.toString() || null,
      aboutText: formData.get("aboutText")?.toString() || null,
      primaryColor: formData.get("primaryColor")?.toString() || "#4f46e5",
      secondaryColor: formData.get("secondaryColor")?.toString() || "#0f172a",
      facilities,
      galleryUrls,
      whatsAppNumber: formData.get("whatsAppNumber")?.toString() || null,
      instagramHandle: formData.get("instagramHandle")?.toString() || null,
      facebookUrl: formData.get("facebookUrl")?.toString() || null,
      googleMapsUrl: formData.get("googleMapsUrl")?.toString() || null,
      seoTitle: formData.get("seoTitle")?.toString() || null,
      seoDescription: formData.get("seoDescription")?.toString() || null,
      customNotice: formData.get("customNotice")?.toString() || null,
      // Core gym business overrides
      phone: formData.get("phone")?.toString() || undefined,
      email: formData.get("email")?.toString() || undefined,
      addressLine1: formData.get("addressLine1")?.toString() || undefined,
      city: formData.get("city")?.toString() || undefined,
      openingHours: formData.get("openingHours")?.toString() || undefined,
      logoUrl: formData.get("logoUrl")?.toString() || undefined,
    };

    const parsed = websiteConfigUpdateSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Validation failed.",
      };
    }

    const updated = await updateGymWebsiteConfig(context, parsed.data);

    if (gymSlug) {
      revalidatePath(`/gym/${gymSlug}`);
      revalidatePath(`/${gymSlug}/website`);
    }

    return {
      success: true,
      message: "Website settings, branding, and content published successfully.",
      data: updated,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to update website configuration.",
    };
  }
}

/**
 * Public action for visitors to submit an enquiry on the gym website.
 */
export async function submitPublicEnquiryAction(
  gymSlug: string,
  formData: FormData
): Promise<WebsiteActionState> {
  try {
    const headerList = await headers();
    const forwarded = headerList.get("x-forwarded-for");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    const rawData = {
      firstName: formData.get("firstName")?.toString() || "",
      lastName: formData.get("lastName")?.toString() || "",
      phone: formData.get("phone")?.toString() || "",
      email: formData.get("email")?.toString() || undefined,
      interestedPlanId: formData.get("interestedPlanId")?.toString() || undefined,
      notes: formData.get("notes")?.toString() || undefined,
    };

    const parsed = publicEnquirySchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Please complete all required fields.",
      };
    }

    const result = await submitPublicEnquiry(gymSlug, parsed.data, clientIp);
    return {
      success: true,
      message: result.message,
      data: { leadId: result.leadId },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to submit enquiry. Please try again or message on WhatsApp.",
    };
  }
}
