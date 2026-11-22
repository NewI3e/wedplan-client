import "server-only"

import { appDb } from "@/lib/subscriptions"

export type AdminServiceStatus = "pending" | "approved" | "rejected"

export type AdminService = {
  id: string
  name: string
  category: string
  location: string
  price: number
  description: string
  photoUrl: string | null
  status: AdminServiceStatus
  available: boolean
  vendorEmail: string
  vendorName: string
  vendorBusiness: string | null
  vendorPlan: "premium" | "free"
  createdAt: string
}

export type AdminServicesResult = {
  services: AdminService[]
  categories: string[]
  error: string | null
}

type ServiceRecord = {
  _id?: unknown
  name?: unknown
  category?: unknown
  location?: unknown
  price?: unknown
  description?: unknown
  photoUrl?: unknown
  vendorEmail?: unknown
  status?: unknown
  available?: unknown
  createdAt?: unknown
}

type UserRecord = {
  email?: string
  name?: string
  businessName?: string
}

type SubscriptionRecord = {
  vendorEmail?: string
  plan?: string
  status?: string
  currentPeriodEnd?: Date | string | null
}

function asString(value: unknown): string {
  if (typeof value === "string") return value
  if (value === null || value === undefined) return ""
  return String(value)
}

function asNumber(value: unknown): number {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

function asIsoDate(value: unknown): string {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : value.toISOString()
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? "" : date.toISOString()
  }

  return ""
}

function normalizeStatus(value: unknown): AdminServiceStatus {
  const status = asString(value).trim().toLowerCase()

  if (status === "approved" || status === "rejected") return status
  return "pending"
}

function humanizeEmail(email: string): string {
  const localPart = email.split("@")[0] ?? ""
  const words = localPart.split(/[._-]+/).filter(Boolean)

  if (words.length === 0) return "WedPlan vendor"

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

/** Premium vendors still inside their paid period. */
async function getPremiumEmails(): Promise<Set<string>> {
  const now = Date.now()

  const subscriptions = await appDb()
    .collection<SubscriptionRecord>("subscriptions")
    .find({ plan: "premium", status: "active" })
    .toArray()

  const premium = new Set<string>()

  for (const subscription of subscriptions) {
    const email = asString(subscription.vendorEmail).trim().toLowerCase()
    if (!email) continue

    const periodEnd = subscription.currentPeriodEnd
      ? new Date(subscription.currentPeriodEnd).getTime()
      : Number.NaN

    if (Number.isNaN(periodEnd) || periodEnd > now) {
      premium.add(email)
    }
  }

  return premium
}

/**
 * Loads every service for the admin moderation screen, newest first.
 * Reads the same `services` collection the Express API and vendor dashboard
 * use, then joins vendor profiles and subscription plans for display.
 */
export async function getAdminServices(): Promise<AdminServicesResult> {
  try {
    const [records, premiumEmails] = await Promise.all([
      appDb()
        .collection<ServiceRecord>("services")
        .find({})
        .sort({ createdAt: -1 })
        .toArray(),
      getPremiumEmails().catch(() => new Set<string>()),
    ])

    const emails = Array.from(
      new Set(
        records
          .map((record) => asString(record.vendorEmail).trim().toLowerCase())
          .filter(Boolean)
      )
    )

    const users = emails.length
      ? await appDb()
          .collection<UserRecord>("user")
          .find({ email: { $in: emails } })
          .toArray()
      : []

    const usersByEmail = new Map(
      users.map((user) => [asString(user.email).trim().toLowerCase(), user])
    )

    const services: AdminService[] = []

    for (const record of records) {
      const id = asString(record._id)
      if (!id) continue

      const vendorEmail = asString(record.vendorEmail).trim().toLowerCase()
      const user = usersByEmail.get(vendorEmail)
      const businessName = user?.businessName?.trim() || null

      services.push({
        id,
        name: asString(record.name).trim() || "Wedding service",
        category: asString(record.category).trim(),
        location: asString(record.location).trim(),
        price: asNumber(record.price),
        description: asString(record.description).trim(),
        photoUrl: asString(record.photoUrl).trim() || null,
        status: normalizeStatus(record.status),
        available: record.available !== false,
        vendorEmail,
        vendorName:
          user?.name?.trim() || humanizeEmail(vendorEmail || "WedPlan vendor"),
        vendorBusiness: businessName,
        vendorPlan: premiumEmails.has(vendorEmail) ? "premium" : "free",
        createdAt: asIsoDate(record.createdAt),
      })
    }

    const categories = Array.from(
      new Set(services.map((service) => service.category).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b))

    return { services, categories, error: null }
  } catch (error) {
    console.error("Failed to load admin services:", error)

    return {
      services: [],
      categories: [],
      error:
        "We couldn't load services right now. Please refresh the page and try again.",
    }
  }
}
