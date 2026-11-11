import { redirect } from "next/navigation";

export default function AdminAuditRedirectPage() {
  redirect("/platform-admin/audit-logs");
}
