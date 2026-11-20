import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard/dashboard-page"

export const metadata: Metadata = {
  title: "My Bookings",
}

export default function CustomerBookingsPage() {
  return <DashboardPage eyebrow="Customer Dashboard" title="My Bookings" />
}
