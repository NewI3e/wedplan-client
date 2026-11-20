import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard/dashboard-page"

export const metadata: Metadata = {
  title: "Vendor Overview",
}

export default function VendorDashboardPage() {
  return <DashboardPage eyebrow="Vendor Dashboard" title="Overview" />
}
