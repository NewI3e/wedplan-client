import Link from "next/link"
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CalendarDaysIcon,
  CalendarHeartIcon,
  CircleCheckIcon,
  Clock3Icon,
  MapPinIcon,
  SparklesIcon,
  StoreIcon,
} from "lucide-react"

import {
  BookingStatusBadge,
  formatBookingDate,
  getBookingStatusMeta,
} from "@/components/dashboard/booking-display"
import type { CustomerBooking } from "@/lib/customer-bookings"
import { dashboardPaths } from "@/lib/dashboard"
import { routes } from "@/lib/routes"
import { cn } from "@/lib/utils"

const DAY_MS = 86_400_000

const STATUS_ORDER = ["pending", "accepted", "rejected", "cancelled"] as const

const STAT_CARD =
  "rounded-xl border border-[#e8decd] bg-[#fffdf9] p-4 shadow-[0_2px_12px_rgba(60,40,25,0.04)] sm:p-5"

function toUtcDay(value: string): number | null {
  if (!value) return null

  const date = new Date(value.length <= 10 ? `${value}T00:00:00.000Z` : value)

  if (Number.isNaN(date.getTime())) return null

  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

function getDaysUntil(value: string): number | null {
  const target = toUtcDay(value)
  if (target === null) return null

  const now = new Date()
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  )

  return Math.round((target - today) / DAY_MS)
}

function getCountdownLabel(days: number | null) {
  if (days === null) return "Upcoming"
  if (days === 0) return "Today"
  if (days === 1) return "Tomorrow"
  return `In ${days} days`
}

function StatCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string
  value: number
  hint: string
  icon: React.ReactNode
  tone: "brand" | "amber" | "green" | "rose"
}) {
  const tones = {
    brand: "bg-[#f5e8ea] text-[#7a1f3d]",
    amber: "bg-[#fbf3e2] text-[#a87b26]",
    green: "bg-[#eaf7ef] text-[#2f7a4b]",
    rose: "bg-[#f8e9e5] text-[#b15252]",
  }

  return (
    <div className={STAT_CARD}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[0.68rem] font-medium tracking-[0.14em] text-[#2b2118]/45 uppercase">
          {label}
        </p>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            tones[tone]
          )}
        >
          {icon}
        </span>
      </div>

      <p className="mt-3 font-display text-3xl leading-none text-[#2b2118]">
        {value}
      </p>
      <p className="mt-2 truncate text-xs text-[#2b2118]/45">{hint}</p>
    </div>
  )
}

export function CustomerOverview({
  bookings,
  loadError,
}: {
  bookings: CustomerBooking[]
  loadError: string | null
}) {
  if (loadError) {
    return (
      <div className="rounded-xl border border-[#e8decd] bg-[#fdfaf5] px-6 py-12 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f5e8e4] text-[#b33a3a]">
          <CalendarHeartIcon aria-hidden className="size-5" />
        </span>
        <h2 className="mt-4 font-display text-2xl text-[#2b2118]">
          Overview unavailable
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#2b2118]/55">
          {loadError}
        </p>
        <a
          href={dashboardPaths.customer.overview}
          className="mt-5 inline-flex h-9 items-center justify-center rounded-lg bg-[#7a1f3d] px-4 text-sm font-medium text-[#f8f2e7] transition-colors hover:bg-[#65203a] focus-visible:ring-2 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none"
        >
          Try again
        </a>
      </div>
    )
  }

  const pendingCount = bookings.filter(
    (booking) => booking.status === "pending"
  ).length
  const acceptedCount = bookings.filter(
    (booking) => booking.status === "accepted"
  ).length
  const rejectedCount = bookings.filter(
    (booking) => booking.status === "rejected"
  ).length
  const cancelledCount = bookings.filter(
    (booking) => booking.status === "cancelled"
  ).length

  const upcomingBookings = bookings
    .filter((booking) => {
      const days = getDaysUntil(booking.eventDate)
      return (
        days !== null &&
        days >= 0 &&
        (booking.status === "pending" || booking.status === "accepted")
      )
    })
    .sort((a, b) => (toUtcDay(a.eventDate) ?? 0) - (toUtcDay(b.eventDate) ?? 0))

  const nextEvent = upcomingBookings[0] ?? null
  const nextEventDays = nextEvent ? getDaysUntil(nextEvent.eventDate) : null

  const statusCounts: Record<string, number> = {
    pending: pendingCount,
    accepted: acceptedCount,
    rejected: rejectedCount,
    cancelled: cancelledCount,
  }

  const recentBookings = bookings.slice(0, 4)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total requests"
          value={bookings.length}
          hint={
            bookings.length === 1
              ? "1 request so far"
              : `${bookings.length} requests so far`
          }
          icon={<CalendarDaysIcon aria-hidden className="size-4" />}
          tone="brand"
        />
        <StatCard
          label="Awaiting reply"
          value={pendingCount}
          hint={
            pendingCount > 0
              ? "Vendors are reviewing"
              : "Nothing awaiting review"
          }
          icon={<Clock3Icon aria-hidden className="size-4" />}
          tone="amber"
        />
        <StatCard
          label="Confirmed"
          value={acceptedCount}
          hint={
            acceptedCount > 0
              ? "Ready for your big day"
              : "No confirmations yet"
          }
          icon={<CircleCheckIcon aria-hidden className="size-4" />}
          tone="green"
        />
        <StatCard
          label="Upcoming events"
          value={upcomingBookings.length}
          hint={
            nextEvent
              ? `Next is ${formatBookingDate(nextEvent.eventDate)}`
              : "No events scheduled"
          }
          icon={<SparklesIcon aria-hidden className="size-4" />}
          tone="rose"
        />
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#e0d4c1] bg-[#fdfaf5] px-6 py-14 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#efe6d6] text-[#7a1f3d]">
            <CalendarHeartIcon aria-hidden className="size-6" />
          </span>
          <h2 className="mt-4 font-display text-2xl text-[#2b2118]">
            Your wedding plans start here
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#2b2118]/55">
            Browse trusted vendors, send your first booking request, and follow
            every reply from this dashboard.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Link
              href={routes.services}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#7a1f3d] px-4 text-sm font-medium text-[#f8f2e7] transition-colors hover:bg-[#65203a] focus-visible:ring-2 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none"
            >
              <StoreIcon aria-hidden className="size-4" />
              Browse services
            </Link>
            <Link
              href={dashboardPaths.customer.settings}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-[#e8decd] bg-white px-4 text-sm font-medium text-[#2b2118]/70 transition-colors hover:bg-[#f7f2e9] hover:text-[#2b2118] focus-visible:ring-2 focus-visible:ring-[#7a1f3d]/25 focus-visible:outline-none"
            >
              Complete profile
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-[1.65fr_1fr]">
            <section className="overflow-hidden rounded-xl border border-[#e8decd] bg-[#fffdf9] shadow-[0_2px_12px_rgba(60,40,25,0.04)]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eee5d6] px-5 py-4">
                <div>
                  <h2 className="font-display text-xl text-[#2b2118]">
                    Next event
                  </h2>
                  <p className="mt-0.5 text-xs text-[#2b2118]/45">
                    Your closest pending or confirmed celebration.
                  </p>
                </div>
                <Link
                  href={dashboardPaths.customer.bookings}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#7a1f3d] hover:text-[#65203a]"
                >
                  All bookings
                  <ArrowRightIcon aria-hidden className="size-3.5" />
                </Link>
              </div>

              {nextEvent ? (
                <div className="grid sm:grid-cols-[190px_1fr]">
                  <div className="relative min-h-48 overflow-hidden bg-[#efe6d6] sm:min-h-60">
                    {nextEvent.serviceImage ? (
                      <img
                        src={nextEvent.serviceImage}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#f3e6df] via-[#f7f1e7] to-[#efe6d6]">
                        <CalendarHeartIcon
                          aria-hidden
                          className="size-12 text-[#b08a3e]/70"
                        />
                      </div>
                    )}

                    <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.12em] text-[#7a1f3d] uppercase shadow-sm">
                      {getCountdownLabel(nextEventDays)}
                    </span>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[0.6rem] font-medium tracking-[0.2em] text-[#a98a4b] uppercase">
                          Celebration
                        </p>
                        <h3 className="mt-1 font-display text-2xl leading-tight text-[#2b2118]">
                          {nextEvent.serviceName}
                        </h3>
                        <p className="mt-1 text-sm text-[#2b2118]/50">
                          {nextEvent.vendorName}
                        </p>
                      </div>

                      <BookingStatusBadge status={nextEvent.status} />
                    </div>

                    <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="flex items-start gap-2">
                        <CalendarDaysIcon
                          aria-hidden
                          className="mt-0.5 size-4 shrink-0 text-[#a98a4b]"
                        />
                        <div>
                          <dt className="text-[0.62rem] font-medium tracking-[0.12em] text-[#2b2118]/40 uppercase">
                            Event date
                          </dt>
                          <dd className="mt-0.5 text-sm font-medium text-[#2b2118]">
                            {formatBookingDate(nextEvent.eventDate)}
                          </dd>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPinIcon
                          aria-hidden
                          className="mt-0.5 size-4 shrink-0 text-[#a98a4b]"
                        />
                        <div className="min-w-0">
                          <dt className="text-[0.62rem] font-medium tracking-[0.12em] text-[#2b2118]/40 uppercase">
                            Location
                          </dt>
                          <dd className="mt-0.5 truncate text-sm font-medium text-[#2b2118]">
                            {nextEvent.eventLocation || "Not shared yet"}
                          </dd>
                        </div>
                      </div>
                    </dl>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link
                        href={dashboardPaths.customer.bookings}
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-[#7a1f3d] px-4 text-sm font-medium text-[#f8f2e7] transition-colors hover:bg-[#65203a] focus-visible:ring-2 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none"
                      >
                        View booking
                      </Link>

                      {nextEvent.serviceId ? (
                        <Link
                          href={`${routes.services}/${nextEvent.serviceId}`}
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-[#e8decd] bg-white px-4 text-sm font-medium text-[#2b2118]/70 transition-colors hover:bg-[#f7f2e9] hover:text-[#2b2118] focus-visible:ring-2 focus-visible:ring-[#7a1f3d]/25 focus-visible:outline-none"
                        >
                          View service
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center px-6 py-12 text-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-[#efe6d6] text-[#7a1f3d]">
                    <CalendarHeartIcon aria-hidden className="size-5" />
                  </span>
                  <h3 className="mt-3 font-display text-xl text-[#2b2118]">
                    No upcoming events
                  </h3>
                  <p className="mt-1 max-w-sm text-sm leading-relaxed text-[#2b2118]/50">
                    Send a new request or wait for a vendor to confirm and your
                    next celebration will appear here.
                  </p>
                  <Link
                    href={routes.services}
                    className="mt-4 inline-flex h-9 items-center justify-center rounded-lg border border-[#e8decd] bg-white px-4 text-sm font-medium text-[#2b2118]/70 transition-colors hover:bg-[#f7f2e9] hover:text-[#2b2118]"
                  >
                    Browse services
                  </Link>
                </div>
              )}
            </section>

            <section className="rounded-xl border border-[#e8decd] bg-[#fffdf9] p-5 shadow-[0_2px_12px_rgba(60,40,25,0.04)]">
              <h2 className="font-display text-xl text-[#2b2118]">
                Booking status
              </h2>
              <p className="mt-0.5 text-xs text-[#2b2118]/45">
                A breakdown of all your requests.
              </p>

              <ul className="mt-5 space-y-4">
                {STATUS_ORDER.map((status) => {
                  const meta = getBookingStatusMeta(status)
                  const count = statusCounts[status] ?? 0
                  const percent =
                    bookings.length > 0
                      ? Math.round((count / bookings.length) * 100)
                      : 0

                  return (
                    <li key={status}>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex items-center gap-2 text-[#2b2118]/65">
                          <span
                            aria-hidden
                            className={cn("size-1.5 rounded-full", meta.dot)}
                          />
                          {meta.label}
                        </span>
                        <span className="font-medium text-[#2b2118]">
                          {count}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f0e8da]">
                        <span
                          className={cn("block h-full rounded-full", meta.bar)}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>

              <Link
                href={dashboardPaths.customer.bookings}
                className="mt-5 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[#e8decd] bg-white text-sm font-medium text-[#2b2118]/70 transition-colors hover:bg-[#f7f2e9] hover:text-[#2b2118] focus-visible:ring-2 focus-visible:ring-[#7a1f3d]/25 focus-visible:outline-none"
              >
                Manage bookings
                <ArrowRightIcon aria-hidden className="size-3.5" />
              </Link>
            </section>
          </div>

          <section className="overflow-hidden rounded-xl border border-[#e8decd] bg-[#fffdf9] shadow-[0_2px_12px_rgba(60,40,25,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eee5d6] px-5 py-4">
              <div>
                <h2 className="font-display text-xl text-[#2b2118]">
                  Recent requests
                </h2>
                <p className="mt-0.5 text-xs text-[#2b2118]/45">
                  The latest updates on your booking enquiries.
                </p>
              </div>
              <Link
                href={dashboardPaths.customer.bookings}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#7a1f3d] hover:text-[#65203a]"
              >
                View all
                <ArrowRightIcon aria-hidden className="size-3.5" />
              </Link>
            </div>

            <ul className="divide-y divide-[#eee5d6]">
              {recentBookings.map((booking) => (
                <li key={booking._id}>
                  <Link
                    href={dashboardPaths.customer.bookings}
                    className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#fbf7ef] sm:px-5"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#e8decd] bg-[#efe6d6]">
                      {booking.serviceImage ? (
                        <img
                          src={booking.serviceImage}
                          alt=""
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      ) : (
                        <StoreIcon
                          aria-hidden
                          className="size-4 text-[#a98a4b]"
                        />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[#2b2118]">
                        {booking.serviceName}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-[#2b2118]/45">
                        {booking.vendorName}
                      </span>
                    </span>

                    <span className="hidden w-28 shrink-0 md:block">
                      <span className="block text-[0.62rem] font-medium tracking-[0.1em] text-[#2b2118]/40 uppercase">
                        Event
                      </span>
                      <span className="mt-0.5 block text-xs font-medium text-[#2b2118]/75">
                        {formatBookingDate(booking.eventDate)}
                      </span>
                    </span>

                    <span className="hidden w-24 shrink-0 lg:block">
                      <span className="block text-[0.62rem] font-medium tracking-[0.1em] text-[#2b2118]/40 uppercase">
                        Requested
                      </span>
                      <span className="mt-0.5 block text-xs font-medium text-[#2b2118]/75">
                        {formatBookingDate(booking.createdAt)}
                      </span>
                    </span>

                    <BookingStatusBadge status={booking.status} />

                    <ArrowUpRightIcon
                      aria-hidden
                      className="size-4 shrink-0 text-[#2b2118]/30"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
