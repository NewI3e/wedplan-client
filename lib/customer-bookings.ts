import {
  BOOKINGS_API_URL,
  asString,
  extractList,
  fetchJson,
  loadBookingEnrichment,
  mapBooking,
  type BookingRecord,
  type BookingStatus,
} from "@/lib/booking-records"

export type { BookingStatus }

export type CustomerBooking = BookingRecord

export type CustomerBookingsResult = {
  bookings: CustomerBooking[]
  error: string | null
}

/**
 * Loads only the bookings that belong to the signed-in customer.
 *
 * `email` must come from the Better Auth session on the server — never from a
 * query string or client state. The extra filter below is defence in depth in
 * case the API ever returns more than it should.
 */
export async function getCustomerBookings(
  email: string
): Promise<CustomerBookingsResult> {
  const customerEmail = email.trim().toLowerCase()

  if (!customerEmail) {
    return {
      bookings: [],
      error:
        "We could not verify the email on your account. Please sign in again.",
    }
  }

  try {
    const [bookingsPayload, enrichment] = await Promise.all([
      fetchJson(
        `${BOOKINGS_API_URL}/bookings?email=${encodeURIComponent(customerEmail)}`
      ),
      loadBookingEnrichment(),
    ])

    const bookings = extractList(bookingsPayload, "bookings")
      .map((rawBooking) => mapBooking(rawBooking, enrichment))
      .filter(
        (booking): booking is CustomerBooking =>
          booking !== null && booking.customerEmail === customerEmail
      )

    return { bookings, error: null }
  } catch (error) {
    console.error("Failed to load customer bookings:", error)

    return {
      bookings: [],
      error:
        "We couldn't load your bookings right now. Please refresh the page and try again.",
    }
  }
}

/**
 * Calls the API to cancel one of the customer's pending requests.
 * Always invoked from a Server Action so the email comes from the session.
 */
export async function cancelCustomerBooking(
  bookingId: string,
  customerEmail: string
): Promise<void> {
  const res = await fetch(
    `${BOOKINGS_API_URL}/bookings/${encodeURIComponent(bookingId)}/cancel`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerEmail: customerEmail.trim().toLowerCase(),
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
      message || `Failed to cancel the booking (status ${res.status}).`
    )
  }
}
