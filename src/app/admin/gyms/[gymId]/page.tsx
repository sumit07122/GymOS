import { redirect } from "next/navigation";

interface GymAdminDetailPageProps {
  params: Promise<{ gymId: string }>;
}

export default async function GymAdminDetailPage(props: GymAdminDetailPageProps) {
  const { gymId } = await props.params;
  redirect(`/platform-admin/gyms/${gymId}`);
}
