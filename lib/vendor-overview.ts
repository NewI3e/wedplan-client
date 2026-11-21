import {
  BOOKINGS_API_URL,
  asString,
  extractList,
  fetchJson,
} from "@/lib/booking-records"

/** Every vendor starts on the free plan until subscriptions are stored. */
export const FREE_SERVICE_LIMIT = 3

export type VendorService = {
  _id: string
  name: string
  category: string
  location: string
  price: number
  photoUrl: string | null
  status: string
  available: boolean
  createdAt: string
}

export type VendorServicesResult = {
  services: VendorService[]
  error: string | null
}

function asNumber(value: unknown): number {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

function mapService(rawService: unknown): VendorService | null {
  if (!rawService || typeof rawService !== "object") return null

  const service = rawService as Record<string, unknown>
  const id = asString(service._id)
  if (!id) return null

  return {
    _id: id,
    name: asString(service.name) || "Wedding service",
    category: asString(service.category),
    location: asString(service.location),
    price: asNumber(service.price),
    photoUrl: asString(service.photoUrl) || null,
    status: asString(service.status).trim().toLowerCase() || "pending",
    available: service.available !== false,
    createdAt: asString(service.createdAt),
  }
}

/**
 * Loads only the services owned by the signed-in vendor.
 * `email` must come from the Better Auth session on the server.
 */
export async function getVendorServices(
  email: string
): Promise<VendorServicesResult> {
  const vendorEmail = email.trim().toLowerCase()

  if (!vendorEmail) {
    return {
      services: [],
      error:
        "We could not verify the email on your account. Please sign in again.",
    }
  }

  try {
    const payload = await fetchJson(
      `${BOOKINGS_API_URL}/My-services?email=${encodeURIComponent(vendorEmail)}`
    )

    const services = extractList(payload, "services")
      .map(mapService)
      .filter((service): service is VendorService => service !== null)

    return { services, error: null }
  } catch (error) {
    console.error("Failed to load vendor services:", error)

    return {
      services: [],
      error:
        "We couldn't load your services right now. Please refresh the page and try again.",
    }
  }
}
