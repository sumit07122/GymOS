import { redirect } from "next/navigation";

interface GymPublicPageProps {
  params: Promise<{ gymSlug: string }>;
}

export default async function GymPublicWebsiteRedirectPage({ params }: GymPublicPageProps) {
  const { gymSlug } = await params;
  redirect(`/g/${gymSlug}`);
}
