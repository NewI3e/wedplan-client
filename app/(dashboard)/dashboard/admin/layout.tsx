import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { requireDashboardRole } from "@/lib/auth-server"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireDashboardRole("admin")

  return <DashboardShell role="admin">{children}</DashboardShell>
}
