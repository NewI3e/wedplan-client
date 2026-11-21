import Link from "next/link"
import {
  ArrowRightIcon,
  CalendarCheckIcon,
  CalendarHeartIcon,
  Clock3Icon,
  CrownIcon,
  EyeIcon,
  LayoutGridIcon,
  StoreIcon,
} from "lucide-react"

import {
  ArrowUpRight,
  Sparkles,
  // keep your existing imports
} from "lucide-react";

import {
  BookingStatusBadge,
  formatBookingDate,
} from "@/components/dashboard/booking-display"
import type { VendorBooking } from "@/lib/vendor-bookings"
import type { VendorService, VendorServiceUsage } from "@/lib/vendor-overview"
import { dashboardPaths } from "@/lib/dashboard"
import { cn } from "@/lib/utils"

const CARD =
  "rounded-xl border border-[#e8decd] bg-[#fffdf9] shadow-[0_2px_12px_rgba(60,40,25,0.04)]"

const ADD_SERVICE_BUTTON =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#7a1f3d] px-4 text-sm font-medium text-[#f8f2e7] transition-colors hover:bg-[#65203a] focus-visible:ring-2 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none"

const SECONDARY_LINK =
  "inline-flex items-center gap-1 text-xs font-medium text-[#7a1f3d] transition-colors hover:text-[#65203a]"

function getDisplayName(booking: VendorBooking) {
  return (
    booking.customerName.trim() ||
    booking.customerEmail.split("@")[0] ||
    "Customer"
  )
}

function getInitials(name: string) {
  const parts = name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)

  return parts.map((part) => part[0]?.toUpperCase()).join("") || "C"
}

function getMonthBuckets(bookings: VendorBooking[]) {
  const now = new Date()
  const buckets: {
    key: string
    label: string
    count: number
    current: boolean
  }[] = []

  for (let offset = 4; offset >= 0; offset -= 1) {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1)
    )
    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`

    buckets.push({
      key,
      label: new Intl.DateTimeFormat("en-GB", {
        month: "short",
        timeZone: "UTC",
      }).format(date),
      count: 0,
      current: offset === 0,
    })
  }

  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]))

  for (const booking of bookings) {
    if (!booking.createdAt) continue

    const date = new Date(booking.createdAt)
    if (Number.isNaN(date.getTime())) continue

    const bucket = byKey.get(`${date.getUTCFullYear()}-${date.getUTCMonth()}`)

    if (bucket) bucket.count += 1
  }

  return buckets
}

function StatCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string
  value: string | number
  hint: string
  icon: React.ReactNode
  tone: "neutral" | "green" | "amber" | "pink" | "gold"
}) {
  const tones = {
    neutral: "bg-[#f3ece0] text-[#8a6a22]",
    green: "bg-[#eaf7ef] text-[#2f7a4b]",
    amber: "bg-[#fbf3e2] text-[#a87b26]",
    pink: "bg-[#fbe9ec] text-[#b23a52]",
    gold: "bg-[#f6ecd3] text-[#a87b26]",
  }

  return (
    <div className={cn(CARD, "p-4 sm:p-5")}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-[#2b2118]/60">{label}</p>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md",
            tones[tone]
          )}
        >
          {icon}
        </span>
      </div>

      <p className="mt-5 font-display text-3xl leading-none text-[#2b2118]">
        {value}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-[#2b2118]/45">{hint}</p>
    </div>
  )
}

export function VendorOverview({
  bookings,
  services,
  usage,
  loadError,
}: {
  bookings: VendorBooking[]
  services: VendorService[]
  usage: VendorServiceUsage
  loadError: string | null
}) {
  if (loadError) {
    return (
      <div className={cn(CARD, "px-6 py-12 text-center")}>
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f5e8e4] text-[#b33a3a]">
          <StoreIcon aria-hidden className="size-5" />
        </span>
        <h2 className="mt-4 font-display text-2xl text-[#2b2118]">
          Overview unavailable
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#2b2118]/55">
          {loadError}
        </p>
        <Link
          href={dashboardPaths.vendor.overview}
          className={cn(ADD_SERVICE_BUTTON, "mt-5")}
        >
          Try again
        </Link>
      </div>
    )
  }

  const activeServices = services.filter(
    (service) => service.available && service.status !== "rejected"
  ).length
  const pendingRequests = bookings.filter(
    (booking) => booking.status === "pending"
  ).length
  const acceptedBookings = bookings.filter(
    (booking) => booking.status === "accepted"
  ).length

  const latestBookings = bookings.slice(0, 4)
  const months = getMonthBuckets(bookings)
  const maxMonthCount = Math.max(1, ...months.map((month) => month.count))
  const isPremium = usage.plan !== "free"
  const atServiceLimit =
    !isPremium && usage.limit !== null && usage.used >= usage.limit
  const progress =
    isPremium || usage.limit === null
      ? 100
      : Math.min(100, Math.round((usage.used / usage.limit) * 100))

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Total services"
          value={services.length}
          hint="Including pending and rejected"
          icon={<LayoutGridIcon aria-hidden className="size-4" />}
          tone="neutral"
        />
        <StatCard
          label="Active services"
          value={activeServices}
          hint={
            isPremium
              ? "Unlimited on Premium"
              : `${usage.used} of ${usage.limit} on Free plan`
          }
          icon={<EyeIcon aria-hidden className="size-4" />}
          tone="green"
        />
        <StatCard
          label="Pending requests"
          value={pendingRequests}
          hint={
            pendingRequests > 0 ? "Waiting for your reply" : "Nothing to review"
          }
          icon={<Clock3Icon aria-hidden className="size-4" />}
          tone="amber"
        />
        <StatCard
          label="Accepted bookings"
          value={acceptedBookings}
          hint={
            acceptedBookings > 0 ? "Confirmed weddings" : "No confirmations yet"
          }
          icon={<CalendarCheckIcon aria-hidden className="size-4" />}
          tone="pink"
        />
        <StatCard
          label="Current plan"
          value={isPremium ? "Premium" : "Free"}
          hint={isPremium ? "Unlimited services" : "Upgrade for unlimited"}
          icon={<CrownIcon aria-hidden className="size-4" />}
          tone="gold"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.75fr_1fr]">
        <section className={cn(CARD, "overflow-hidden")}>
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eee5d6] px-5 py-4">
            <h2 className="font-display text-xl text-[#2b2118]">
              Latest booking requests
            </h2>
            <Link
              href={dashboardPaths.vendor.bookings}
              className={SECONDARY_LINK}
            >
              View all
              <ArrowRightIcon aria-hidden className="size-3.5" />
            </Link>
          </header>

          {latestBookings.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-[#efe6d6] text-[#7a1f3d]">
                <CalendarHeartIcon aria-hidden className="size-5" />
              </span>
              <h3 className="mt-3 font-display text-xl text-[#2b2118]">
                No booking requests yet
              </h3>
              <p className="mt-1 max-w-sm text-sm leading-relaxed text-[#2b2118]/50">
                When customers request your services, their enquiries will show
                up here.
              </p>
              <Link
                href={dashboardPaths.vendor.services}
                className={cn(ADD_SERVICE_BUTTON, "mt-4")}
              >
                Manage services
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[#eee5d6]">
              {latestBookings.map((booking) => {
                const customerName = getDisplayName(booking)

                return (
                  <li key={booking._id}>
                    <Link
                      href={dashboardPaths.vendor.bookings}
                      className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#fbf7ef] sm:px-5"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#e8decd] bg-[#f8e6e2] font-display text-xs font-medium text-[#7a1f3d]">
                        {booking.customerImage ? (
                          // Customer avatars can come from any auth provider host.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={booking.customerImage}
                            alt=""
                            loading="lazy"
                            className="size-full object-cover"
                          />
                        ) : (
                          getInitials(customerName)
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[#2b2118]">
                          {customerName}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-[#2b2118]/45">
                          {booking.serviceName}
                          {booking.eventDate
                            ? ` · ${formatBookingDate(booking.eventDate)}`
                            : ""}
                        </span>
                      </span>

                      <BookingStatusBadge status={booking.status} />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <div className="space-y-5">
          <section className={cn(CARD, "p-5")}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[0.66rem] font-semibold tracking-[0.16em] text-[#a98a4b] uppercase">
                {isPremium ? "Premium plan" : "Free plan"}
              </p>
              <CrownIcon aria-hidden className="size-4 text-[#c9a24d]" />
            </div>

            <p className="mt-3 font-display text-2xl leading-tight text-[#2b2118]">
              {isPremium
                ? `${usage.used} services · unlimited`
                : `${usage.used} / ${usage.limit} services`}
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#f4e3e4]">
              <span
                className="block h-full rounded-full bg-[#7a1f3d] transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="mt-3 text-xs leading-relaxed text-[#2b2118]/55">
              {isPremium
                ? "You're on Premium — add as many services as you like."
                : atServiceLimit
                  ? "You've reached your limit. Go Premium to publish more."
                  : `${usage.remaining ?? 0} more ${
                      usage.remaining === 1 ? "service" : "services"
                    } available on the Free plan.`}
            </p>

            <Link
              href={dashboardPaths.vendor.subscription}
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#e0c07c] bg-[#f2dfb9] text-sm font-medium text-[#6b4a17] transition-colors hover:bg-[#edd6a9] focus-visible:ring-2 focus-visible:ring-[#a98a4b]/35 focus-visible:outline-none"
            >
              <Sparkles aria-hidden className="size-4" />
              {isPremium ? "Manage subscription" : "Upgrade to Premium"}
            </Link>
          </section>

          <section className={cn(CARD, "p-5")}>
            <h2 className="font-display text-xl text-[#2b2118]">
              Requests by month
            </h2>

            <div className="mt-5 flex items-stretch gap-2">
              {months.map((month) => {
                const height =
                  month.count === 0
                    ? 4
                    : Math.max(
                        12,
                        Math.round((month.count / maxMonthCount) * 100)
                      )

                return (
                  <div
                    key={month.key}
                    className="flex min-w-0 flex-1 flex-col items-center"
                  >
                    <span className="text-xs font-medium text-[#2b2118]/70">
                      {month.count}
                    </span>

                    <div className="mt-2 flex h-24 w-full items-end justify-center">
                      <span
                        className={cn(
                          "block w-full max-w-9 rounded-full",
                          month.current ? "bg-[#7a1f3d]" : "bg-[#f2dfe1]"
                        )}
                        style={{ height: `${height}%` }}
                      />
                    </div>

                    <span
                      className={cn(
                        "mt-2 text-[0.68rem]",
                        month.current
                          ? "font-medium text-[#2b2118]"
                          : "text-[#2b2118]/55"
                      )}
                    >
                      {month.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
