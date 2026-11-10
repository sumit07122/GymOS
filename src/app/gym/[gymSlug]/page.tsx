import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGymPublicWebsiteData } from "@/lib/services/website.service";
import { getDatabaseSession } from "@/lib/auth/session";
import { WebsiteHub } from "@/components/website/website-hub";
import { SystemRole, GymRole } from "@prisma/client";

interface GymPublicPageProps {
  params: Promise<{ gymSlug: string }>;
}

/**
 * Dynamic SEO metadata generator for gym public websites.
 */
export async function generateMetadata({
  params,
}: GymPublicPageProps): Promise<Metadata> {
  const { gymSlug } = await params;

  try {
    const data = await getGymPublicWebsiteData(gymSlug);
    const title = data.website.seoTitle || `${data.gym.name} | Gym & Fitness`;
    const description =
      data.website.seoDescription ||
      data.website.subheadline ||
      `Visit ${data.gym.name} in ${data.gym.city || "your area"}. State-of-the-art strength training, group classes, and certified personal trainers.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: data.website.heroImageUrl ? [data.website.heroImageUrl] : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch {
    return {
      title: "Gym Website",
    };
  }
}

export default async function GymPublicWebsitePage({
  params,
}: GymPublicPageProps) {
  const { gymSlug } = await params;

  let data;
  try {
    data = await getGymPublicWebsiteData(gymSlug);
  } catch {
    notFound();
  }

  // Check optional authenticated session to allow owner/staff to preview unpublished sites
  let isOwnerOrStaff = false;
  try {
    const session = await getDatabaseSession();
    if (session) {
      isOwnerOrStaff =
        session.user.role === SystemRole.SUPER_ADMIN ||
        session.user.gymRoles.some(
          (gr) =>
            (gr.gymId === data.gym.id || gr.gym.slug === gymSlug) &&
            (gr.role === GymRole.OWNER || gr.role === GymRole.STAFF)
        );
    }
  } catch {
    // Unauthenticated visitors proceed normally
  }

  return <WebsiteHub data={data} isOwnerOrStaff={isOwnerOrStaff} />;
}
