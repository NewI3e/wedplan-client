import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { requireDashboardRole } from "@/lib/auth-server"

export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireDashboardRole("customer")

  return <DashboardShell role="customer">{children}</DashboardShell>
}
