import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGymPublicWebsiteData } from "@/lib/services/website.service";
import { WebsiteHub } from "@/components/website/website-hub";

interface GymPublicPageProps {
  params: Promise<{ gymSlug: string }>;
}

export async function generateMetadata({
  params,
}: GymPublicPageProps): Promise<Metadata> {
  const { gymSlug } = await params;

  try {
    const data = await getGymPublicWebsiteData(gymSlug);
    const title = data.website.seoTitle || `${data.gym.name} | Official Website`;
    const description =
      data.website.seoDescription ||
      data.website.subheadline ||
      `Official website of ${data.gym.name}. Facilities, membership plans, opening hours, and contact details.`;

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

export default async function PublicGymPage({ params }: GymPublicPageProps) {
  const { gymSlug } = await params;

  let data;
  try {
    data = await getGymPublicWebsiteData(gymSlug);
  } catch {
    notFound();
  }

  return <WebsiteHub data={data} />;
}
