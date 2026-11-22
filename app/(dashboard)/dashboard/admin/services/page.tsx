import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { AdminServicesPanel } from "@/components/dashboard/admin/admin-services"
import { getAdminServices } from "@/lib/admin-services"

export const metadata: Metadata = {
  title: "Manage Services",
}

export default async function AdminServicesPage() {
  const { services, categories, error } = await getAdminServices()

  return (
    <DashboardPage
      eyebrow="Admin Dashboard"
      title="Manage Services"
      description="Only approved and available services appear on the public site."
    >
      <AdminServicesPanel
        services={services}
        categories={categories}
        error={error}
      />
    </DashboardPage>
  )
}
