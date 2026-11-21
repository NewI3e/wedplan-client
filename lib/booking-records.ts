export const BOOKINGS_API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "")

export type BookingStatus = "pending" | "accepted" | "rejected" | "cancelled"

export type BookingRecord = {
  _id: string
  serviceId: string
  serviceName: string
  serviceImage: string | null
  customerEmail: string
  customerName: string
  customerImage: string | null
  vendorName: string
  vendorEmail: string
  eventDate: string
  eventLocation: string
  createdAt: string
  status: string
  price: number
  message: string
}

type RawBooking = {
  _id?: unknown
  serviceId?: unknown
  serviceName?: unknown
  customerEmail?: unknown
  customerName?: unknown
  vendorEmail?: unknown
  eventDate?: unknown
  eventLocation?: unknown
  createdAt?: unknown
  status?: unknown
  price?: unknown
  message?: unknown
}

type ServiceSummary = {
  name: string
  image: string | null
}

export type BookingEnrichment = {
  serviceMap: Map<string, ServiceSummary>
  userNameByEmail: Map<string, string>
  userImageByEmail: Map<string, string>
}

export function asString(value: unknown): string {
  if (typeof value === "string") return value
  if (value === null || value === undefined) return ""
  return String(value)
}

function asNumber(value: unknown): number {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

/** Mongo/Express dates arrive as ISO strings; normalise without shifting days. */
function asDateString(value: unknown): string {
  if (value instanceof Date) return value.toISOString()

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date.toISOString()
  }

  return ""
}

function humanizeEmail(email: string): string {
  const localPart = email.split("@")[0] ?? ""
  const words = localPart.split(/[._-]+/).filter(Boolean)

  if (words.length === 0) return "WedPlan partner"

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function extractList(payload: unknown, key: string): unknown[] {
  if (Array.isArray(payload)) return payload

  if (payload && typeof payload === "object") {
    const value = (payload as Record<string, unknown>)[key]
    if (Array.isArray(value)) return value
  }

  return []
}

export async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, { cache: "no-store" })

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`)
  }

  return res.json()
}

export async function loadBookingEnrichment(): Promise<BookingEnrichment> {
  const [servicesPayload, usersPayload] = await Promise.all([
    fetchJson(`${BOOKINGS_API_URL}/services`).catch(() => []),
    fetchJson(`${BOOKINGS_API_URL}/users`).catch(() => []),
  ])

  const serviceMap = new Map<string, ServiceSummary>()

  for (const rawService of extractList(servicesPayload, "services")) {
    if (!rawService || typeof rawService !== "object") continue

    const service = rawService as Record<string, unknown>
    const id = asString(service._id)
    if (!id) continue

    serviceMap.set(id, {
      name: asString(service.name) || asString(service.serviceName),
      image: asString(service.photoUrl) || null,
    })
  }

  const userNameByEmail = new Map<string, string>()
  const userImageByEmail = new Map<string, string>()

  for (const rawUser of extractList(usersPayload, "users")) {
    if (!rawUser || typeof rawUser !== "object") continue

    const user = rawUser as Record<string, unknown>
    const userEmail = asString(user.email).trim().toLowerCase()
    const userName = asString(user.name).trim()
    const userImage = asString(user.image).trim()

    if (userEmail && userName) {
      userNameByEmail.set(userEmail, userName)
    }

    if (userEmail && userImage) {
      userImageByEmail.set(userEmail, userImage)
    }
  }

  return { serviceMap, userNameByEmail, userImageByEmail }
}

export function mapBooking(
  rawBooking: unknown,
  enrichment: BookingEnrichment
): BookingRecord | null {
  if (!rawBooking || typeof rawBooking !== "object") return null

  const booking = rawBooking as RawBooking
  const id = asString(booking._id)
  if (!id) return null

  const serviceId = asString(booking.serviceId)
  const customerEmail = asString(booking.customerEmail).trim().toLowerCase()
  const vendorEmail = asString(booking.vendorEmail).trim().toLowerCase()
  const service = enrichment.serviceMap.get(serviceId)

  return {
    _id: id,
    serviceId,
    serviceName:
      asString(booking.serviceName) || service?.name || "Wedding service",
    serviceImage: service?.image ?? null,
    customerEmail,
    customerName: asString(booking.customerName),
    customerImage: enrichment.userImageByEmail.get(customerEmail) ?? null,
    vendorName:
      enrichment.userNameByEmail.get(vendorEmail) ||
      humanizeEmail(vendorEmail || customerEmail),
    vendorEmail,
    eventDate: asDateString(booking.eventDate),
    eventLocation: asString(booking.eventLocation),
    createdAt: asDateString(booking.createdAt),
    status: asString(booking.status).trim().toLowerCase() || "pending",
    price: asNumber(booking.price),
    message: asString(booking.message),
  }
}
