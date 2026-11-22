"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CalendarDaysIcon,
  CheckIcon,
  InboxIcon,
  LoaderCircleIcon,
  MapPinIcon,
  QuoteIcon,
  StoreIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { decideBookingAction } from "@/app/(dashboard)/dashboard/vendor/bookings/actions"
import {
  BookingStatusBadge,
  formatBookingDate,
  formatBookingPrice,
} from "@/components/dashboard/booking-display"
import { dashboardPaths } from "@/lib/dashboard"
import { cn } from "@/lib/utils"
import type { BookingDecision, VendorBooking } from "@/lib/vendor-bookings"

type FilterValue = "all" | "pending" | "accepted" | "rejected"

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
]

const ACCEPT_BUTTON =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-[#3f7d58] px-3.5 text-xs font-medium text-white transition-colors hover:bg-[#356b4b] focus-visible:ring-2 focus-visible:ring-[#3f7d58]/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"

const REJECT_BUTTON =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#e9b9b7] bg-white px-3.5 text-xs font-medium text-[#b33a3a] transition-colors hover:bg-[#fdf2f2] focus-visible:ring-2 focus-visible:ring-[#b33a3a]/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"

function getInitials(name: string, email: string) {
  const source = name.trim() || email.split("@")[0] || "Customer"

  const parts = source
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)

  return parts.map((part) => part[0]?.toUpperCase()).join("") || "C"
}

function getDisplayName(booking: VendorBooking) {
  return (
    booking.customerName.trim() ||
    booking.customerEmail.split("@")[0] ||
    "Customer"
  )
}

type DecisionTarget = {
  booking: VendorBooking
  decision: BookingDecision
}

export function VendorBookingsPanel({
  bookings,
  loadError,
}: {
  bookings: VendorBooking[]
  loadError: string | null
}) {
  const router = useRouter()

  const [filter, setFilter] = React.useState<FilterValue>("all")
  const [statusOverrides, setStatusOverrides] = React.useState<
    Record<string, string>
  >({})
  const [decisionTarget, setDecisionTarget] =
    React.useState<DecisionTarget | null>(null)
  const [decidingId, setDecidingId] = React.useState<string | null>(null)

  const items = React.useMemo(
    () =>
      bookings.map((booking) =>
        statusOverrides[booking._id]
          ? { ...booking, status: statusOverrides[booking._id] }
          : booking
      ),
    [bookings, statusOverrides]
  )

  React.useEffect(() => {
    if (!decisionTarget) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || decidingId) return

      setDecisionTarget(null)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [decisionTarget, decidingId])

  const visibleBookings =
    filter === "all"
      ? items
      : items.filter((booking) => booking.status === filter)

  const counts: Record<FilterValue, number> = {
    all: items.length,
    pending: items.filter((booking) => booking.status === "pending").length,
    accepted: items.filter((booking) => booking.status === "accepted").length,
    rejected: items.filter((booking) => booking.status === "rejected").length,
  }

  async function handleDecision() {
    if (!decisionTarget || decidingId) return

    const { booking, decision } = decisionTarget
    setDecidingId(booking._id)

    try {
      const result = await decideBookingAction(booking._id, decision)

      if (!result.ok) {
        toast.error(result.message)
        return
      }

      setStatusOverrides((current) => ({
        ...current,
        [booking._id]: decision,
      }))
      setDecisionTarget(null)
      toast.success(
        decision === "accepted"
          ? "Booking request accepted."
          : "Booking request rejected."
      )
    } catch (error) {
      console.error("Failed to update booking:", error)
      toast.error("We couldn't update this request. Please try again.")
    } finally {
      setDecidingId(null)
    }
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-[#e8decd] bg-[#fdfaf5] px-6 py-12 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f5e8e4] text-[#b33a3a]">
          <InboxIcon aria-hidden className="size-5" />
        </span>
        <h2 className="mt-4 font-display text-2xl text-[#2b2118]">
          Requests unavailable
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#2b2118]/55">
          {loadError}
        </p>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="mt-5 inline-flex h-9 items-center justify-center rounded-lg bg-[#7a1f3d] px-4 text-sm font-medium text-[#f8f2e7] transition-colors hover:bg-[#65203a] focus-visible:ring-2 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Status filters */}
      <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-[#e8decd] bg-[#efe7d8]/55 p-1">
        {FILTERS.map((item) => {
          const active = filter === item.value

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[0.8rem] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#7a1f3d]/25 focus-visible:outline-none",
                active
                  ? "bg-white text-[#2b2118] shadow-sm"
                  : "text-[#2b2118]/55 hover:text-[#2b2118]"
              )}
            >
              <span>{item.label}</span>
              <span
                className={cn(
                  "text-xs font-normal",
                  active ? "text-[#2b2118]/45" : "text-[#2b2118]/35"
                )}
              >
                {counts[item.value]}
              </span>
            </button>
          )
        })}
      </div>

      {items.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e0d4c1] bg-[#fdfaf5] px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-[#efe6d6] text-[#7a1f3d]">
            <InboxIcon aria-hidden className="size-6" />
          </span>
          <h2 className="mt-4 font-display text-2xl text-[#2b2118]">
            No booking requests yet
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#2b2118]/55">
            When customers request your services, their enquiries will appear
            here for you to accept or reject.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Link
              href={dashboardPaths.vendor.services}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#7a1f3d] px-4 text-sm font-medium text-[#f8f2e7] transition-colors hover:bg-[#65203a] focus-visible:ring-2 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none"
            >
              <StoreIcon aria-hidden className="size-4" />
              Manage services
            </Link>
            <Link
              href={dashboardPaths.vendor.newService}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-[#e8decd] bg-white px-4 text-sm font-medium text-[#2b2118]/70 transition-colors hover:bg-[#f7f2e9] hover:text-[#2b2118] focus-visible:ring-2 focus-visible:ring-[#7a1f3d]/25 focus-visible:outline-none"
            >
              Add a service
            </Link>
          </div>
        </div>
      ) : visibleBookings.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e0d4c1] bg-[#fdfaf5] px-6 py-14 text-center">
          <p className="text-sm text-[#2b2118]/60">
            You have no {filter} requests right now.
          </p>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="mt-3 text-sm font-medium text-[#7a1f3d] underline underline-offset-4 hover:text-[#65203a]"
          >
            Show all requests
          </button>
        </div>
      ) : (
        <div className="mt-6 grid items-stretch gap-4 xl:grid-cols-2">
          {visibleBookings.map((booking) => {
            const customerName = getDisplayName(booking)
            const pending = booking.status === "pending"

            return (
              <article
                key={booking._id}
                className="flex flex-col rounded-xl border border-[#e8decd] bg-[#fffdf9] p-4 shadow-[0_2px_12px_rgba(60,40,25,0.04)] sm:p-5"
              >
                <header className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e8decd] bg-[#f8e6e2] font-display text-xs font-medium text-[#7a1f3d]">
                      {booking.customerImage ? (
                        <img
                          src={booking.customerImage}
                          alt=""
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      ) : (
                        getInitials(booking.customerName, booking.customerEmail)
                      )}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#2b2118]">
                        {customerName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-[#2b2118]/45">
                        {booking.customerEmail}
                      </p>
                    </div>
                  </div>

                  <BookingStatusBadge status={booking.status} />
                </header>

                <div className="mt-4 flex items-center gap-3 rounded-lg border border-[#eee5d6] bg-[#faf6ee] p-2.5">
                  <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#efe6d6]">
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

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#2b2118]">
                      {booking.serviceName}
                    </p>
                    {booking.price > 0 ? (
                      <p className="mt-0.5 text-sm font-semibold text-[#7a1f3d]">
                        ৳{formatBookingPrice(booking.price)}
                      </p>
                    ) : null}
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <dt className="flex items-center gap-1.5 text-[0.68rem] text-[#2b2118]/45">
                      <CalendarDaysIcon aria-hidden className="size-3.5" />
                      Event date
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-[#2b2118]">
                      {formatBookingDate(booking.eventDate)}
                    </dd>
                  </div>

                  <div className="min-w-0">
                    <dt className="flex items-center gap-1.5 text-[0.68rem] text-[#2b2118]/45">
                      <MapPinIcon aria-hidden className="size-3.5" />
                      Location
                    </dt>
                    <dd className="mt-1 truncate text-sm font-semibold text-[#2b2118]">
                      {booking.eventLocation || "Not shared"}
                    </dd>
                  </div>
                </dl>

                {booking.message ? (
                  <blockquote className="mt-4 flex gap-2 border-l-2 border-[#c8a96a] pl-3">
                    <QuoteIcon
                      aria-hidden
                      className="mt-0.5 size-3.5 shrink-0 text-[#a98a4b]"
                    />
                    <p className="text-sm leading-relaxed text-[#2b2118]/70 italic">
                      “{booking.message}”
                    </p>
                  </blockquote>
                ) : null}

                <footer className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
                  <p className="text-xs text-[#2b2118]/45">
                    Requested {formatBookingDate(booking.createdAt)}
                  </p>

                  {pending ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setDecisionTarget({
                            booking,
                            decision: "rejected",
                          })
                        }
                        className={REJECT_BUTTON}
                        aria-label={`Reject request from ${customerName}`}
                      >
                        <XIcon aria-hidden className="size-3.5" />
                        Reject
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDecisionTarget({
                            booking,
                            decision: "accepted",
                          })
                        }
                        className={ACCEPT_BUTTON}
                        aria-label={`Accept request from ${customerName}`}
                      >
                        <CheckIcon aria-hidden className="size-3.5" />
                        Accept
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-[#2b2118]/45">
                      {booking.status === "cancelled"
                        ? "Cancelled by customer"
                        : "Decision made"}
                    </p>
                  )}
                </footer>
              </article>
            )
          })}
        </div>
      )}

      {decisionTarget ? (
        <DecisionDialog
          target={decisionTarget}
          deciding={decidingId === decisionTarget.booking._id}
          onCancel={() => setDecisionTarget(null)}
          onConfirm={handleDecision}
        />
      ) : null}
    </>
  )
}

function DecisionDialog({
  target,
  deciding,
  onCancel,
  onConfirm,
}: {
  target: DecisionTarget
  deciding: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  const accepting = target.decision === "accepted"
  const customerName = getDisplayName(target.booking)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b2118]/50 p-4 backdrop-blur-[1px]"
      role="presentation"
      onClick={() => {
        if (!deciding) onCancel()
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="decision-dialog-title"
        aria-describedby="decision-dialog-description"
        className="w-full max-w-sm rounded-2xl border border-[#e8decd] bg-[#fffdf9] p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <span
          className={cn(
            "flex size-12 items-center justify-center rounded-full",
            accepting
              ? "bg-[#eaf7ef] text-[#2f7a4b]"
              : "bg-[#fdecef] text-[#b23a52]"
          )}
        >
          {accepting ? (
            <CheckIcon aria-hidden className="size-6" />
          ) : (
            <XIcon aria-hidden className="size-6" />
          )}
        </span>

        <h2
          id="decision-dialog-title"
          className="mt-4 font-display text-2xl text-[#2b2118]"
        >
          {accepting ? "Accept this request?" : "Reject this request?"}
        </h2>

        <p
          id="decision-dialog-description"
          className="mt-2 text-sm leading-relaxed text-[#2b2118]/60"
        >
          You&apos;re about to {accepting ? "accept" : "reject"} the request
          from{" "}
          <strong className="font-medium text-[#2b2118]">{customerName}</strong>{" "}
          for{" "}
          <strong className="font-medium text-[#2b2118]">
            {target.booking.serviceName}
          </strong>
          . This decision is final.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={deciding}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-[#e8decd] bg-white px-4 text-sm font-medium text-[#2b2118]/70 transition-colors hover:bg-[#f7f2e9] hover:text-[#2b2118] disabled:opacity-60"
          >
            Go back
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deciding}
            className={cn(
              "inline-flex h-9 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70",
              accepting
                ? "bg-[#3f7d58] hover:bg-[#356b4b]"
                : "bg-[#b33a3a] hover:bg-[#9b3030]"
            )}
          >
            {deciding ? (
              <LoaderCircleIcon aria-hidden className="size-4 animate-spin" />
            ) : null}
            {deciding
              ? "Saving..."
              : accepting
                ? "Accept request"
                : "Reject request"}
          </button>
        </div>
      </div>
    </div>
  )
}
