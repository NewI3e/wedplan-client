import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { AdminOverviewPanel } from "@/components/dashboard/admin/admin-overview"
import { getAdminOverview } from "@/lib/admin-overview"

export const metadata: Metadata = {
  title: "Admin Overview",
}

export default async function AdminDashboardPage() {
  const overview = await getAdminOverview()

  return (
    <DashboardPage
      eyebrow="Admin Dashboard"
      title="Platform overview"
      description="Everything happening on WedPlan this season."
    >
      <AdminOverviewPanel overview={overview} />
    </DashboardPage>
  )
}
