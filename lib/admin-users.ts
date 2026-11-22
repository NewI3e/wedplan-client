import "server-only"

import { appDb } from "@/lib/subscriptions"

export type AdminUserRole = "admin" | "vendor" | "customer"

export type AdminUser = {
  id: string
  name: string
  email: string
  role: AdminUserRole
  image: string | null
  blocked: boolean
  businessName: string | null
  createdAt: string
}

export type AdminUsersResult = {
  users: AdminUser[]
  error: string | null
}

type UserRecord = {
  _id?: unknown
  name?: unknown
  email?: unknown
  role?: unknown
  image?: unknown
  blocked?: unknown
  businessName?: unknown
  createdAt?: unknown
}

function asString(value: unknown): string {
  if (typeof value === "string") return value
  if (value === null || value === undefined) return ""
  return String(value)
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

function normalizeRole(value: unknown): AdminUserRole {
  const role = asString(value).trim().toLowerCase()

  if (role === "admin" || role === "vendor") return role
  return "customer"
}

function humanizeEmail(email: string): string {
  const localPart = email.split("@")[0] ?? ""
  const words = localPart.split(/[._-]+/).filter(Boolean)

  if (words.length === 0) return "WedPlan member"

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

/**
 * Loads every account for the admin user-management screen.
 * Admin accounts are sorted first so the protected rows stay visible.
 */
export async function getAdminUsers(): Promise<AdminUsersResult> {
  try {
    const records = await appDb()
      .collection<UserRecord>("user")
      .find({})
      .toArray()

    const users: AdminUser[] = []

    for (const record of records) {
      const id = asString(record._id)
      if (!id) continue

      const email = asString(record.email).trim().toLowerCase()
      const role = normalizeRole(record.role)

      users.push({
        id,
        name: asString(record.name).trim() || humanizeEmail(email),
        email,
        role,
        image: asString(record.image).trim() || null,
        blocked: record.blocked === true,
        businessName: asString(record.businessName).trim() || null,
        createdAt: asIsoDate(record.createdAt),
      })
    }

    const roleWeight: Record<AdminUserRole, number> = {
      admin: 0,
      vendor: 1,
      customer: 2,
    }

    users.sort((a, b) => {
      const byRole = roleWeight[a.role] - roleWeight[b.role]
      if (byRole !== 0) return byRole

      return (b.createdAt || "").localeCompare(a.createdAt || "")
    })

    return { users, error: null }
  } catch (error) {
    console.error("Failed to load admin users:", error)

    return {
      users: [],
      error:
        "We couldn't load users right now. Please refresh the page and try again.",
    }
  }
}
