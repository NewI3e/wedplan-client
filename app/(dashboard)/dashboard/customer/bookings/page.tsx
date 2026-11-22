import type { Metadata } from "next"

import { CustomerBookingsPanel } from "@/components/dashboard/customer/customer-bookings-panel"
import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { requireDashboardRole } from "@/lib/auth-server"
import { getCustomerBookings } from "@/lib/customer-bookings"

export const metadata: Metadata = {
  title: "My Bookings",
}

export default async function CustomerBookingsPage() {
  const { session } = await requireDashboardRole("customer")
  const { bookings, error } = await getCustomerBookings(session.user.email)

  return (
    <DashboardPage
      eyebrow="Customer Dashboard"
      title="My Bookings"
      description="You can cancel a request while it's still pending."
    >
      <CustomerBookingsPanel bookings={bookings} loadError={error} />
    </DashboardPage>
  )
}
