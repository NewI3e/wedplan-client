import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard/dashboard-page"

export const metadata: Metadata = {
  title: "Profile Settings",
}

export default function AdminSettingsPage() {
  return <DashboardPage eyebrow="Admin Dashboard" title="Profile Settings" />
}
