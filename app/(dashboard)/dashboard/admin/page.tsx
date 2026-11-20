import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard/dashboard-page"

export const metadata: Metadata = {
  title: "Admin Overview",
}

export default function AdminDashboardPage() {
  return <DashboardPage eyebrow="Admin Dashboard" title="Overview" />
}
