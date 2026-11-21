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

export type VendorServiceUsage = {
  plan: string
  /** `null` means unlimited (premium). */
  limit: number | null
  used: number
  remaining: number | null
  canCreate: boolean
}

/** Local fallback when the usage endpoint can't be reached. */
export function usageFromServices(
  services: VendorService[]
): VendorServiceUsage {
  const used = services.filter((service) => service.status !== "rejected").length

  return {
    plan: "free",
    limit: FREE_SERVICE_LIMIT,
    used,
    remaining: Math.max(0, FREE_SERVICE_LIMIT - used),
    canCreate: used < FREE_SERVICE_LIMIT,
  }
}

/**
 * Loads the vendor's plan and how many services they have used.
 * `email` must come from the Better Auth session on the server.
 */
export async function getVendorServiceUsage(
  email: string,
  services: VendorService[] = []
): Promise<VendorServiceUsage> {
  const vendorEmail = email.trim().toLowerCase()

  if (!vendorEmail) return usageFromServices(services)

  try {
    const payload = await fetchJson(
      `${BOOKINGS_API_URL}/services/usage?vendorEmail=${encodeURIComponent(
        vendorEmail
      )}`
    )

    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid service usage response")
    }

    const usage = payload as Record<string, unknown>
    const used = Number(usage.used)

    return {
      plan: asString(usage.plan) || "free",
      limit:
        usage.limit === null || usage.limit === undefined
          ? null
          : Number(usage.limit),
      used: Number.isFinite(used) ? used : 0,
      remaining:
        usage.remaining === null || usage.remaining === undefined
          ? null
          : Number(usage.remaining),
      canCreate: usage.canCreate !== false,
    }
  } catch (error) {
    console.error("Failed to load vendor service usage:", error)
    return usageFromServices(services)
  }
}
