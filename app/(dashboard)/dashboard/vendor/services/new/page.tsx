import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard/dashboard-page"

export const metadata: Metadata = {
  title: "Add Service",
}

export default function VendorAddServicePage() {
  return <DashboardPage eyebrow="Vendor Dashboard" title="Add Service" />
}
