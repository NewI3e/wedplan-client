import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard/dashboard-page"

export const metadata: Metadata = {
  title: "Booking Requests",
}

export default function VendorBookingsPage() {
  return <DashboardPage eyebrow="Vendor Dashboard" title="Booking Requests" />
}
