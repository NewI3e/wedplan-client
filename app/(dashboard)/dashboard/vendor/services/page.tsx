import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { VendorServicesList } from "@/components/dashboard/vendor/vendor-services-list"

export const metadata: Metadata = {
  title: "My Services",
}

export default function VendorServicesPage() {
  return (
    <DashboardPage
      eyebrow="Vendor Dashboard"
      title="My Services"
      description="Manage the services you offer, pause them, edit details or remove them."
    >
      <VendorServicesList />
    </DashboardPage>
  )
}