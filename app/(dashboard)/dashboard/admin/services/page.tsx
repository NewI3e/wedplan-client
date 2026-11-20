import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard/dashboard-page"

export const metadata: Metadata = {
  title: "Manage Services",
}

export default function AdminServicesPage() {
  return <DashboardPage eyebrow="Admin Dashboard" title="Manage Services" />
}
