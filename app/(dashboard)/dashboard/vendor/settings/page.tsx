import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard/dashboard-page"

export const metadata: Metadata = {
  title: "Profile Settings",
}

export default function VendorSettingsPage() {
  return <DashboardPage eyebrow="Vendor Dashboard" title="Profile Settings" />
}
