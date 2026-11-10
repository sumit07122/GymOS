import * as React from "react";
import { requireOwnerSession } from "@/lib/auth/guards";
import GymAttendancePage from "@/app/(dashboard)/[gymSlug]/attendance/page";

export default async function OwnerAttendancePage() {
  const { gym } = await requireOwnerSession("/owner/attendance");
  return <GymAttendancePage params={Promise.resolve({ gymSlug: gym.slug })} />;
}
