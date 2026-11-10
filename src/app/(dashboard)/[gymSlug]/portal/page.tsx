import { redirect } from "next/navigation";

interface PortalRedirectProps {
  params: Promise<{ gymSlug: string }>;
}

export default async function DashboardPortalRedirect({
  params,
}: PortalRedirectProps) {
  const { gymSlug } = await params;
  redirect(`/portal/${gymSlug}`);
}
