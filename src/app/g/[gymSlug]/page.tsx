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

const DEMO_SPARTAN_DATA = {
  gym: {
    id: "demo-spartan",
    name: "Spartan Athletics Club",
    slug: "spartan-athletics",
    logoUrl: null,
    phone: "+91 98765 43210",
    email: "hello@spartanathletics.com",
    addressLine1: "14 Olympic Way, Sector 5",
    addressLine2: null,
    city: "Bengaluru",
    state: "KA",
    postalCode: "560001",
    country: "IN",
    currency: "INR",
    openingHours: "Mon - Sat: 05:30 - 22:30 | Sun: 07:00 - 19:00",
  },
  website: {
    isPublished: true,
    headline: "Forge Strength & Peak Athletic Vitality",
    subheadline:
      "Premier Olympic barbell floor, functional turf, and conditioning arena in Bengaluru. Powered by FIXIA GymOS.",
    tagline: "Discipline Over Motivation • 24/7 Access",
    heroImageUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=80",
    aboutText:
      "Spartan Athletics was engineered to give athletes and fitness enthusiasts an uncompromising training ground. Complete with Eleiko barbell sets, custom power racks, sprint turf, and cold plunge recovery suites.",
    primaryColor: "#0B6B4F",
    secondaryColor: "#062E23",
    facilities: [
      "Eleiko Olympic Platforms",
      "Turf Sprint Lanes",
      "Cold Plunge & Finnish Sauna",
      "Bio-impedance Body Scan",
      "Recovery Lounge",
    ],
    galleryUrls: [
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80",
    ],
    featuredTrainers: [
      {
        name: "Devendra Rao",
        role: "Head Strength Coach",
        bio: "CSCS certified with 10+ years coaching national powerlifters and sprinters.",
        imageUrl:
          "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80",
      },
      {
        name: "Ananya Sharma",
        role: "Mobility & Conditioning",
        bio: "Specializing in joint longevity, recovery routines, and functional hypertrophy.",
        imageUrl:
          "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=600&q=80",
      },
    ],
    whatsAppNumber: "+919876543210",
    instagramHandle: "@spartanathletics",
    facebookUrl: null,
    googleMapsUrl: null,
    seoTitle: "Spartan Athletics Club | Elite Fitness Center",
    seoDescription:
      "Join Spartan Athletics Club in Bengaluru. Olympic lifting, performance conditioning, and dynamic QR passes.",
    customNotice: "Spring Training Camp Enrollment Now Open",
  },
  plans: [
    {
      id: "spartan-monthly",
      name: "Monthly Athletic",
      description: "Full floor access, locker, and shower facilities",
      durationDays: 30,
      durationMonths: 1,
      price: 3499,
      admissionFee: 999,
      benefits: ["24/7 Access", "Dynamic QR Turnstile Pass", "Free Induction Session"],
      accessRestrictions: [],
    },
    {
      id: "spartan-quarterly",
      name: "Quarterly Pro",
      description: "Most popular choice with 1-on-1 coaching intake",
      durationDays: 90,
      durationMonths: 3,
      price: 8999,
      admissionFee: 0,
      benefits: [
        "All Monthly Features",
        "2 Free Personal Training Sessions",
        "Body Composition Scan",
        "Guest Passes",
      ],
      accessRestrictions: [],
    },
    {
      id: "spartan-annual",
      name: "Annual Elite",
      description: "Complete sovereign athlete experience",
      durationDays: 365,
      durationMonths: 12,
      price: 27999,
      admissionFee: 0,
      benefits: [
        "All Quarterly Features",
        "Monthly Sauna & Cold Plunge Pass",
        "Priority Peak Hours",
        "Dedicated Locker",
      ],
      accessRestrictions: [],
    },
  ],
};

export default async function PublicGymPage({ params }: GymPublicPageProps) {
  const { gymSlug } = await params;

  let data;
  try {
    data = await getGymPublicWebsiteData(gymSlug);
  } catch {
    if (gymSlug === "spartan-athletics" || gymSlug === "ironforge-fitness") {
      data = DEMO_SPARTAN_DATA;
    } else {
      notFound();
    }
  }

  if (!data && (gymSlug === "spartan-athletics" || gymSlug === "ironforge-fitness")) {
    data = DEMO_SPARTAN_DATA;
  }

  return <WebsiteHub data={data} />;
}
