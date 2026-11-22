"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CalendarDaysIcon,
  CircleXIcon,
  EyeIcon,
  ImageIcon,
  LoaderCircleIcon,
  MapPinIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cancelBookingAction } from "@/app/(dashboard)/dashboard/customer/bookings/actions"
import {
  BookingStatusBadge,
  formatBookingDate,
  formatBookingPrice,
} from "@/components/dashboard/booking-display"
import type { CustomerBooking } from "@/lib/customer-bookings"
import { cn } from "@/lib/utils"

type FilterValue = "all" | "pending" | "accepted" | "rejected" | "cancelled"

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
]

const VIEW_BUTTON =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[#e8decd] bg-white px-3 text-[0.72rem] font-medium text-[#2b2118]/70 transition-colors hover:bg-[#f7f2e9] hover:text-[#2b2118] focus-visible:ring-2 focus-visible:ring-[#7a1f3d]/25 focus-visible:outline-none"

const CANCEL_BUTTON =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[#e9b9b7] bg-white px-3 text-[0.72rem] font-medium text-[#b33a3a] transition-colors hover:bg-[#fdf2f2] focus-visible:ring-2 focus-visible:ring-[#b33a3a]/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"

function ServiceCell({ booking }: { booking: CustomerBooking }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#e8decd] bg-[#efe6d6]">
        {booking.serviceImage ? (
          <img
            src={booking.serviceImage}
            alt=""
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <ImageIcon aria-hidden className="size-4 text-[#a98a4b]" />
        )}
      </span>

      <span className="min-w-0">
        <span className="block truncate text-[0.82rem] font-medium text-[#2b2118]">
          {booking.serviceName}
        </span>
        <span className="mt-0.5 block truncate text-xs text-[#2b2118]/45">
          {booking.vendorName}
        </span>
      </span>
    </div>
  )
}

function BookingActions({
  booking,
  onView,
  onCancel,
}: {
  booking: CustomerBooking
  onView: (booking: CustomerBooking) => void
  onCancel: (booking: CustomerBooking) => void
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => onView(booking)}
        className={VIEW_BUTTON}
        aria-label={`View booking for ${booking.serviceName}`}
      >
        <EyeIcon aria-hidden className="size-3.5" />
        View
      </button>

      {booking.status === "pending" ? (
        <button
          type="button"
          onClick={() => onCancel(booking)}
          className={CANCEL_BUTTON}
          aria-label={`Cancel booking for ${booking.serviceName}`}
        >
          <CircleXIcon aria-hidden className="size-3.5" />
          Cancel
        </button>
      ) : null}
    </>
  )
}

export function CustomerBookingsPanel({
  bookings,
  loadError,
}: {
  bookings: CustomerBooking[]
  loadError: string | null
}) {
  const router = useRouter()

  const [filter, setFilter] = React.useState<FilterValue>("all")
  const [statusOverrides, setStatusOverrides] = React.useState<
    Record<string, string>
  >({})
  const [activeBooking, setActiveBooking] =
    React.useState<CustomerBooking | null>(null)
  const [cancelTarget, setCancelTarget] =
    React.useState<CustomerBooking | null>(null)
  const [cancellingId, setCancellingId] = React.useState<string | null>(null)

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
    if (!activeBooking && !cancelTarget) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || cancellingId) return

      setCancelTarget(null)
      setActiveBooking(null)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [activeBooking, cancelTarget, cancellingId])

  const visibleBookings =
    filter === "all"
      ? items
      : items.filter((booking) => booking.status === filter)

  async function handleCancel() {
    if (!cancelTarget || cancellingId) return

    const target = cancelTarget
    setCancellingId(target._id)

    try {
      const result = await cancelBookingAction(target._id)

      if (!result.ok) {
        toast.error(result.message)
        return
      }

      setStatusOverrides((current) => ({
        ...current,
        [target._id]: "cancelled",
      }))
      setActiveBooking((current) =>
        current && current._id === target._id
          ? { ...current, status: "cancelled" }
          : current
      )
      setCancelTarget(null)
      toast.success(`Your booking for ${target.serviceName} was cancelled.`)
    } catch (error) {
      console.error("Failed to cancel booking:", error)
      toast.error("We couldn't cancel this booking. Please try again.")
    } finally {
      setCancellingId(null)
    }
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-[#e8decd] bg-[#fdfaf5] px-6 py-12 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f5e8e4] text-[#b33a3a]">
          <CircleXIcon aria-hidden className="size-5" />
        </span>
        <h2 className="mt-4 font-display text-2xl text-[#2b2118]">
          Bookings unavailable
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
                "rounded-lg px-4 py-1.5 text-[0.8rem] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#7a1f3d]/25 focus-visible:outline-none",
                active
                  ? "bg-white text-[#2b2118] shadow-sm"
                  : "text-[#2b2118]/55 hover:text-[#2b2118]"
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      {items.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e0d4c1] bg-[#fdfaf5] px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-[#efe6d6] text-[#7a1f3d]">
            <CalendarDaysIcon aria-hidden className="size-6" />
          </span>
          <h2 className="mt-4 font-display text-2xl text-[#2b2118]">
            No bookings yet
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#2b2118]/55">
            When you request a service, it will appear here so you can follow
            its status.
          </p>
          <Link
            href="/services"
            className="mt-5 inline-flex h-9 items-center justify-center rounded-lg bg-[#7a1f3d] px-4 text-sm font-medium text-[#f8f2e7] transition-colors hover:bg-[#65203a] focus-visible:ring-2 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none"
          >
            Browse services
          </Link>
        </div>
      ) : visibleBookings.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e0d4c1] bg-[#fdfaf5] px-6 py-14 text-center">
          <p className="text-sm text-[#2b2118]/60">
            You have no {filter} bookings right now.
          </p>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="mt-3 text-sm font-medium text-[#7a1f3d] underline underline-offset-4 hover:text-[#65203a]"
          >
            Show all bookings
          </button>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-[#e8decd] bg-[#fffdf9] shadow-[0_2px_12px_rgba(60,40,25,0.04)]">
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[860px] table-fixed">
              <colgroup>
                <col className="w-[30%]" />
                <col className="w-[22%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
                <col className="w-[18%]" />
              </colgroup>

              <thead>
                <tr className="border-b border-[#eee5d6] text-left">
                  <th
                    scope="col"
                    className="py-3 pr-4 pl-5 text-[0.78rem] font-medium text-[#2b2118]/55"
                  >
                    Service
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-[0.78rem] font-medium text-[#2b2118]/55"
                  >
                    Event
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-[0.78rem] font-medium text-[#2b2118]/55"
                  >
                    Requested
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-[0.78rem] font-medium text-[#2b2118]/55"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="py-3 pr-5 pl-4 text-right text-[0.78rem] font-medium text-[#2b2118]/55"
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#eee5d6]">
                {visibleBookings.map((booking) => (
                  <tr
                    key={booking._id}
                    className="align-middle transition-colors hover:bg-[#fbf7ef]"
                  >
                    <td className="py-3 pr-4 pl-5">
                      <ServiceCell booking={booking} />
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-[0.82rem] font-medium text-[#2b2118]">
                        {formatBookingDate(booking.eventDate)}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-[#2b2118]/45">
                        <MapPinIcon aria-hidden className="size-3 shrink-0" />
                        <span className="truncate">
                          {booking.eventLocation || "Location not shared"}
                        </span>
                      </p>
                    </td>

                    <td className="px-4 py-3 text-[0.82rem] text-[#2b2118]/70">
                      {formatBookingDate(booking.createdAt)}
                    </td>

                    <td className="px-4 py-3">
                      <BookingStatusBadge status={booking.status} />
                    </td>

                    <td className="py-3 pr-5 pl-4">
                      <div className="flex items-center justify-end gap-2">
                        <BookingActions
                          booking={booking}
                          onView={setActiveBooking}
                          onCancel={setCancelTarget}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-[#eee5d6] md:hidden">
            {visibleBookings.map((booking) => (
              <div key={booking._id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <ServiceCell booking={booking} />
                  <BookingStatusBadge status={booking.status} />
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-[#2b2118]/45">Event</dt>
                    <dd className="mt-0.5 font-medium text-[#2b2118]/80">
                      {formatBookingDate(booking.eventDate)}
                    </dd>
                    <dd className="mt-0.5 flex items-center gap-1 text-[#2b2118]/45">
                      <MapPinIcon aria-hidden className="size-3 shrink-0" />
                      <span className="truncate">
                        {booking.eventLocation || "Location not shared"}
                      </span>
                    </dd>
                  </div>

                  <div>
                    <dt className="text-[#2b2118]/45">Requested</dt>
                    <dd className="mt-0.5 font-medium text-[#2b2118]/80">
                      {formatBookingDate(booking.createdAt)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 flex items-center justify-end gap-2">
                  <BookingActions
                    booking={booking}
                    onView={setActiveBooking}
                    onCancel={setCancelTarget}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeBooking ? (
        <BookingDetailsDialog
          booking={activeBooking}
          onClose={() => setActiveBooking(null)}
          onCancel={(booking) => setCancelTarget(booking)}
        />
      ) : null}

      {cancelTarget ? (
        <CancelBookingDialog
          booking={cancelTarget}
          cancelling={cancellingId === cancelTarget._id}
          onKeep={() => setCancelTarget(null)}
          onConfirm={handleCancel}
        />
      ) : null}
    </>
  )
}

function BookingDetailsDialog({
  booking,
  onClose,
  onCancel,
}: {
  booking: CustomerBooking
  onClose: () => void
  onCancel: (booking: CustomerBooking) => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#2b2118]/45 p-0 backdrop-blur-[1px] sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-details-title"
        className="max-h-[92svh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-[#e8decd] bg-[#fffdf9] p-5 shadow-2xl sm:rounded-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e8decd] bg-[#efe6d6]">
            {booking.serviceImage ? (
              <img
                src={booking.serviceImage}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <ImageIcon aria-hidden className="size-5 text-[#a98a4b]" />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-[0.6rem] font-medium tracking-[0.2em] text-[#a98a4b] uppercase">
              Booking details
            </p>
            <h2
              id="booking-details-title"
              className="mt-1 truncate font-display text-2xl leading-tight text-[#2b2118]"
            >
              {booking.serviceName}
            </h2>
            <p className="mt-1 truncate text-sm text-[#2b2118]/50">
              {booking.vendorName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking details"
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#2b2118]/45 transition-colors hover:bg-[#efe6d6] hover:text-[#2b2118] focus-visible:ring-2 focus-visible:ring-[#7a1f3d]/25 focus-visible:outline-none"
          >
            <XIcon aria-hidden className="size-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <BookingStatusBadge status={booking.status} />
          <span className="text-xs text-[#2b2118]/40">
            Ref #{booking._id.slice(-6).toUpperCase()}
          </span>
        </div>

        <dl className="mt-5 grid gap-4 rounded-xl border border-[#eee5d6] bg-[#fbf7ef] p-4 sm:grid-cols-2">
          <div>
            <dt className="text-[0.68rem] font-medium tracking-[0.14em] text-[#2b2118]/40 uppercase">
              Event date
            </dt>
            <dd className="mt-1 text-sm font-medium text-[#2b2118]">
              {formatBookingDate(booking.eventDate)}
            </dd>
          </div>

          <div>
            <dt className="text-[0.68rem] font-medium tracking-[0.14em] text-[#2b2118]/40 uppercase">
              Requested on
            </dt>
            <dd className="mt-1 text-sm font-medium text-[#2b2118]">
              {formatBookingDate(booking.createdAt)}
            </dd>
          </div>

          <div>
            <dt className="text-[0.68rem] font-medium tracking-[0.14em] text-[#2b2118]/40 uppercase">
              Location
            </dt>
            <dd className="mt-1 flex items-start gap-1.5 text-sm text-[#2b2118]">
              <MapPinIcon
                aria-hidden
                className="mt-0.5 size-3.5 shrink-0 text-[#a98a4b]"
              />
              {booking.eventLocation || "Not shared"}
            </dd>
          </div>

          <div>
            <dt className="text-[0.68rem] font-medium tracking-[0.14em] text-[#2b2118]/40 uppercase">
              Quoted price
            </dt>
            <dd className="mt-1 text-sm font-medium text-[#2b2118]">
              {booking.price > 0
                ? `৳${formatBookingPrice(booking.price)}`
                : "—"}
            </dd>
          </div>
        </dl>

        {booking.message ? (
          <div className="mt-4 rounded-xl border border-[#eee5d6] bg-white p-4">
            <p className="text-[0.68rem] font-medium tracking-[0.14em] text-[#2b2118]/40 uppercase">
              Your message
            </p>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-[#2b2118]/70">
              {booking.message}
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-[#eee5d6] pt-4">
          {booking.serviceId ? (
            <Link
              href={`/services/${booking.serviceId}`}
              className="text-sm font-medium text-[#7a1f3d] underline-offset-4 hover:underline"
            >
              View service
            </Link>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            {booking.status === "pending" ? (
              <button
                type="button"
                onClick={() => onCancel(booking)}
                className={CANCEL_BUTTON}
              >
                <CircleXIcon aria-hidden className="size-3.5" />
                Cancel request
              </button>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 items-center justify-center rounded-md border border-[#e8decd] bg-white px-4 text-[0.72rem] font-medium text-[#2b2118]/70 transition-colors hover:bg-[#f7f2e9] hover:text-[#2b2118]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CancelBookingDialog({
  booking,
  cancelling,
  onKeep,
  onConfirm,
}: {
  booking: CustomerBooking
  cancelling: boolean
  onKeep: () => void
  onConfirm: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#2b2118]/50 p-4 backdrop-blur-[1px]"
      role="presentation"
      onClick={() => {
        if (!cancelling) onKeep()
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cancel-booking-title"
        aria-describedby="cancel-booking-description"
        className="w-full max-w-sm rounded-2xl border border-[#e8decd] bg-[#fffdf9] p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-[#fdecef] text-[#b23a52]">
          <CircleXIcon aria-hidden className="size-6" />
        </span>

        <h2
          id="cancel-booking-title"
          className="mt-4 font-display text-2xl text-[#2b2118]"
        >
          Cancel this request?
        </h2>

        <p
          id="cancel-booking-description"
          className="mt-2 text-sm leading-relaxed text-[#2b2118]/60"
        >
          Your pending request for{" "}
          <strong className="font-medium text-[#2b2118]">
            {booking.serviceName}
          </strong>{" "}
          will be cancelled. This cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onKeep}
            disabled={cancelling}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-[#e8decd] bg-white px-4 text-sm font-medium text-[#2b2118]/70 transition-colors hover:bg-[#f7f2e9] hover:text-[#2b2118] disabled:opacity-60"
          >
            Keep booking
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={cancelling}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#b33a3a] px-4 text-sm font-medium text-white transition-colors hover:bg-[#9b3030] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {cancelling ? (
              <LoaderCircleIcon aria-hidden className="size-4 animate-spin" />
            ) : null}
            {cancelling ? "Cancelling..." : "Yes, cancel request"}
          </button>
        </div>
      </div>
    </div>
  )
}
