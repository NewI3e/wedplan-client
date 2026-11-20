import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard/dashboard-page"

export const metadata: Metadata = {
  title: "My Services",
}

export default function VendorServicesPage() {
  return <DashboardPage eyebrow="Vendor Dashboard" title="My Services" />
}
