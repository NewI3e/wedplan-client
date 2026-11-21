import type { Metadata } from "next"

import { CustomerOverview } from "@/components/dashboard/customer/customer-overview"
import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { requireDashboardRole } from "@/lib/auth-server"
import { getCustomerBookings } from "@/lib/customer-bookings"

export const metadata: Metadata = {
  title: "Customer Overview",
}

function getFirstName(name: string | null | undefined) {
  return name?.trim().split(/\s+/)[0] || null
}

export default async function CustomerDashboardPage() {
  const { session } = await requireDashboardRole("customer")
  const { bookings, error } = await getCustomerBookings(session.user.email)
  const firstName = getFirstName(session.user.name)

  return (
    <DashboardPage
      eyebrow="Customer Dashboard"
      title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
      description="Here's a snapshot of your wedding plans, booking requests and what's coming up next."
    >
      <CustomerOverview bookings={bookings} loadError={error} />
    </DashboardPage>
  )
}
