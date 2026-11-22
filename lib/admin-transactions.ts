import "server-only"

import {
  appDb,
  subscriptionsCollection,
  type VendorSubscription,
} from "@/lib/subscriptions"

export type AdminTransactionStatus = "paid" | "failed" | "refunded" | "canceled"

export type AdminTransaction = {
  id: string
  /** Short, human-friendly reference shown in the table, e.g. `txn_8FJ2K`. */
  code: string
  vendorName: string
  vendorEmail: string
  plan: string
  amount: number
  currency: string
  /** ISO date used for sorting and display. */
  date: string
  status: AdminTransactionStatus
  stripeCustomerId: string | null
  stripeSubscriptionId: string
  interval: string | null
  quantity: number | null
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: string | null
}

export type AdminTransactionsResult = {
  transactions: AdminTransaction[]
  error: string | null
}

type UserRecord = {
  email?: string
  name?: string
  businessName?: string
}

function humanizeEmail(email: string): string {
  const localPart = email.split("@")[0] ?? ""
  const words = localPart.split(/[._-]+/).filter(Boolean)

  if (words.length === 0) return "WedPlan vendor"

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
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

function transactionDate(subscription: VendorSubscription): string {
  return (
    asIsoDate(subscription.createdAt) ||
    asIsoDate(subscription.currentPeriodStart) ||
    asIsoDate(subscription.updatedAt)
  )
}

function transactionCode(subscription: VendorSubscription): string {
  const raw =
    subscription.stripeSubscriptionId || String(subscription._id ?? "")
  const cleaned = raw.replace(/[^a-zA-Z0-9]/g, "")

  return `txn_${(cleaned.slice(-6) || "UNKNOWN").toUpperCase()}`
}

function transactionStatus(
  subscription: VendorSubscription
): AdminTransactionStatus {
  if (subscription.refunded) return "refunded"

  switch (subscription.status) {
    case "active":
      return "paid"
    case "past_due":
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
      return "failed"
    case "canceled":
    case "paused":
      return "canceled"
    default:
      return "failed"
  }
}

/**
 * Loads every vendor subscription as an admin-facing transaction.
 * One row per subscription; renewals update the same record.
 */
export async function getAdminTransactions(): Promise<AdminTransactionsResult> {
  try {
    const subscriptions = await subscriptionsCollection()
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    if (subscriptions.length === 0) {
      return { transactions: [], error: null }
    }

    const emails = Array.from(
      new Set(
        subscriptions
          .map((subscription) => subscription.vendorEmail?.trim().toLowerCase())
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
      users.map((user) => [
        String(user.email ?? "")
          .trim()
          .toLowerCase(),
        user,
      ])
    )

    const transactions = subscriptions.map((subscription) => {
      const vendorEmail = String(subscription.vendorEmail ?? "")
        .trim()
        .toLowerCase()
      const user = usersByEmail.get(vendorEmail)

      return {
        id: subscription.stripeSubscriptionId || String(subscription._id ?? ""),
        code: transactionCode(subscription),
        vendorName:
          user?.businessName?.trim() ||
          user?.name?.trim() ||
          humanizeEmail(vendorEmail),
        vendorEmail,
        plan: subscription.plan || "premium",
        amount:
          typeof subscription.amount === "number" ? subscription.amount : 0,
        currency: subscription.currency || "usd",
        date: transactionDate(subscription),
        status: transactionStatus(subscription),
        stripeCustomerId: subscription.stripeCustomerId ?? null,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        interval: subscription.interval ?? null,
        quantity: subscription.quantity ?? null,
        cancelAtPeriodEnd: Boolean(subscription.cancelAtPeriodEnd),
        currentPeriodEnd: subscription.currentPeriodEnd
          ? asIsoDate(subscription.currentPeriodEnd)
          : null,
      } satisfies AdminTransaction
    })

    transactions.sort((a, b) => (b.date || "").localeCompare(a.date || ""))

    return { transactions, error: null }
  } catch (error) {
    console.error("Failed to load admin transactions:", error)

    return {
      transactions: [],
      error:
        "We couldn't load transactions right now. Please refresh the page and try again.",
    }
  }
}
