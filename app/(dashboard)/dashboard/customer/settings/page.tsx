import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard/dashboard-page"

export const metadata: Metadata = {
  title: "Profile Settings",
}

export default function CustomerSettingsPage() {
  return <DashboardPage eyebrow="Customer Dashboard" title="Profile Settings" />
}
