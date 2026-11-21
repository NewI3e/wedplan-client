import {
  BOOKINGS_API_URL,
  asString,
  extractList,
  fetchJson,
  loadBookingEnrichment,
  mapBooking,
  type BookingRecord,
} from "@/lib/booking-records"

export type BookingDecision = "accepted" | "rejected"

export type VendorBooking = BookingRecord

export type VendorBookingsResult = {
  bookings: VendorBooking[]
  error: string | null
}

/**
 * Loads only the booking requests addressed to the signed-in vendor.
 * `email` must come from the Better Auth session on the server.
 */
export async function getVendorBookings(
  email: string
): Promise<VendorBookingsResult> {
  const vendorEmail = email.trim().toLowerCase()

  if (!vendorEmail) {
    return {
      bookings: [],
      error:
        "We could not verify the email on your account. Please sign in again.",
    }
  }

  try {
    const [bookingsPayload, enrichment] = await Promise.all([
      fetchJson(
        `${BOOKINGS_API_URL}/bookings/vendor?email=${encodeURIComponent(vendorEmail)}`
      ),
      loadBookingEnrichment(),
    ])

    const bookings = extractList(bookingsPayload, "bookings")
      .map((rawBooking) => mapBooking(rawBooking, enrichment))
      .filter(
        (booking): booking is VendorBooking =>
          booking !== null && booking.vendorEmail === vendorEmail
      )

    return { bookings, error: null }
  } catch (error) {
    console.error("Failed to load vendor bookings:", error)

    return {
      bookings: [],
      error:
        "We couldn't load your booking requests right now. Please refresh the page and try again.",
    }
  }
}

/**
 * Accepts or rejects a pending request. Invoked from a Server Action so the
 * vendor email always comes from the authenticated session.
 */
export async function decideVendorBooking(
  bookingId: string,
  vendorEmail: string,
  decision: BookingDecision
): Promise<void> {
  const res = await fetch(
    `${BOOKINGS_API_URL}/bookings/${encodeURIComponent(bookingId)}/decision`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendorEmail: vendorEmail.trim().toLowerCase(),
        decision,
      }),
      cache: "no-store",
    }
  )

  const payload = await res.json().catch(() => null)

  if (!res.ok) {
    const message =
      payload && typeof payload === "object"
        ? asString((payload as Record<string, unknown>).message)
        : ""

    throw new Error(
      message || `Failed to update the booking (status ${res.status}).`
    )
  }
}
