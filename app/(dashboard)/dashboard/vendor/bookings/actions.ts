"use server"

import { revalidatePath } from "next/cache"

import { getServerSession, resolveDashboardRole } from "@/lib/auth-server"
import { dashboardPaths } from "@/lib/dashboard"
import {
  decideVendorBooking,
  getVendorBookings,
  type BookingDecision,
} from "@/lib/vendor-bookings"

export type DecideBookingResult = { ok: true } | { ok: false; message: string }

/**
 * Accepts or rejects a pending booking for the signed-in vendor.
 *
 * The vendor email comes from the Better Auth session, never from the client,
 * so one vendor cannot decide on another vendor's requests.
 */
export async function decideBookingAction(
  bookingId: string,
  decision: BookingDecision
): Promise<DecideBookingResult> {
  const session = await getServerSession()

  if (!session) {
    return {
      ok: false,
      message: "Please sign in again to update this request.",
    }
  }

  if (resolveDashboardRole(session.user.role) !== "vendor") {
    return {
      ok: false,
      message: "Only vendor accounts can accept or reject requests.",
    }
  }

  if (!bookingId.trim()) {
    return { ok: false, message: "This booking could not be identified." }
  }

  if (decision !== "accepted" && decision !== "rejected") {
    return { ok: false, message: "Invalid booking decision." }
  }

  const vendorEmail = session.user.email

  try {
    const { bookings } = await getVendorBookings(vendorEmail)
    const booking = bookings.find((item) => item._id === bookingId)

    if (!booking) {
      return {
        ok: false,
        message: "This request is not addressed to your business.",
      }
    }

    if (booking.status !== "pending") {
      return {
        ok: false,
        message: "Only pending requests can be accepted or rejected.",
      }
    }

    await decideVendorBooking(bookingId, vendorEmail, decision)
    revalidatePath(dashboardPaths.vendor.bookings)

    return { ok: true }
  } catch (error) {
    console.error("Booking decision error:", error)

    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "We couldn't update this request. Please try again.",
    }
  }
}
