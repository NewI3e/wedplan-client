import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { VendorBookingsPanel } from "@/components/dashboard/vendor/vendor-bookings-panel"
import { requireDashboardRole } from "@/lib/auth-server"
import { getVendorBookings } from "@/lib/vendor-bookings"

export const metadata: Metadata = {
  title: "Booking Requests",
}

export default async function VendorBookingsPage() {
  const { session } = await requireDashboardRole("vendor")
  const { bookings, error } = await getVendorBookings(session.user.email)

  return (
    <DashboardPage
      eyebrow="Vendor Dashboard"
      title="Booking Requests"
      description="Review incoming enquiries and accept or reject requests while they're pending."
    >
      <VendorBookingsPanel bookings={bookings} loadError={error} />
    </DashboardPage>
  )
}
