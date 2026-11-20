import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard/dashboard-page"

export const metadata: Metadata = {
  title: "Subscription",
}

export default function VendorSubscriptionPage() {
  return <DashboardPage eyebrow="Vendor Dashboard" title="Subscription" />
}
