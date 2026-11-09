import { redirect } from "next/navigation";

interface GymIndexPageProps {
  params: Promise<{ gymSlug: string }>;
}

export default async function GymIndexPage({ params }: GymIndexPageProps) {
  const { gymSlug } = await params;
  redirect(`/${gymSlug}/dashboard`);
}

