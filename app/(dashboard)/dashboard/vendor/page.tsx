import type { Metadata } from "next"
import Link from "next/link"
import { PlusIcon } from "lucide-react"

import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { VendorOverview } from "@/components/dashboard/vendor/vendor-overview"
import { requireDashboardRole } from "@/lib/auth-server"
import { dashboardPaths } from "@/lib/dashboard"
import { getVendorBookings } from "@/lib/vendor-bookings"
import {
  getVendorServiceUsage,
  getVendorServices,
} from "@/lib/vendor-overview"

export const metadata: Metadata = {
  title: "Vendor Overview",
}

export default async function VendorDashboardPage() {
  const { session } = await requireDashboardRole("vendor")
  const vendorEmail = session.user.email

  const [bookingsResult, servicesResult] = await Promise.all([
    getVendorBookings(vendorEmail),
    getVendorServices(vendorEmail),
  ])

  const usage = await getVendorServiceUsage(
    vendorEmail,
    servicesResult.services
  )

  const vendorName = session.user.name?.trim()

  return (
    <DashboardPage
      eyebrow="Vendor Dashboard"
      title={vendorName ? `Welcome back, ${vendorName}` : "Welcome back"}
      description="Here's how your wedding services are doing this season."
      action={
        <Link
          href={dashboardPaths.vendor.newService}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#7a1f3d] px-4 text-sm font-medium text-[#f8f2e7] transition-colors hover:bg-[#65203a] focus-visible:ring-2 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none"
        >
          <PlusIcon aria-hidden className="size-4" />
          Add service
        </Link>
      }
    >
      <VendorOverview
        bookings={bookingsResult.bookings}
        services={servicesResult.services}
        usage={usage}
        loadError={bookingsResult.error ?? servicesResult.error}
      />
    </DashboardPage>
  )
}
