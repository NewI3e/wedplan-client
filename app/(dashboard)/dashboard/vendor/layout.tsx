import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { requireDashboardRole } from "@/lib/auth-server"

export default async function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireDashboardRole("vendor")

  return <DashboardShell role="vendor">{children}</DashboardShell>
}
