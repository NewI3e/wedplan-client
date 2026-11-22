"use server"

import { revalidatePath } from "next/cache"

import { getServerSession, resolveDashboardRole } from "@/lib/auth-server"
import {
  getCustomerBookings,
  cancelCustomerBooking,
} from "@/lib/customer-bookings"
import { dashboardPaths } from "@/lib/dashboard"

export type CancelBookingResult = { ok: true } | { ok: false; message: string }

/**
 * Cancels a pending booking for the signed-in customer.
 *
 * The booking email is taken from the Better Auth session, never from the
 * client, so one customer cannot cancel another customer's request.
 */
export async function cancelBookingAction(
  bookingId: string
): Promise<CancelBookingResult> {
  const session = await getServerSession()

  if (!session) {
    return { ok: false, message: "Please sign in again to cancel a booking." }
  }

  if (resolveDashboardRole(session.user.role) !== "customer") {
    return {
      ok: false,
      message: "Only customer accounts can cancel bookings.",
    }
  }

  if (!bookingId.trim()) {
    return { ok: false, message: "This booking could not be identified." }
  }

  const customerEmail = session.user.email

  try {
    const { bookings } = await getCustomerBookings(customerEmail)
    const booking = bookings.find((item) => item._id === bookingId)

    if (!booking) {
      return {
        ok: false,
        message: "This booking does not belong to your account.",
      }
    }

    if (booking.status !== "pending") {
      return {
        ok: false,
        message: "Only pending booking requests can be cancelled.",
      }
    }

    await cancelCustomerBooking(bookingId, customerEmail)
    revalidatePath(dashboardPaths.customer.bookings)

    return { ok: true }
  } catch (error) {
    console.error("Cancel booking error:", error)

    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "We couldn't cancel this booking. Please try again.",
    }
  }
}
