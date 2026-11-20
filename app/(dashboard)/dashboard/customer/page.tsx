import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard/dashboard-page"

export const metadata: Metadata = {
  title: "Customer Overview",
}

export default function CustomerDashboardPage() {
  return <DashboardPage eyebrow="Customer Dashboard" title="Overview" />
}
