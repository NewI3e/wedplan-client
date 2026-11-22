import "server-only"

import { getAdminServices, type AdminService } from "@/lib/admin-services"
import {
  getAdminTransactions,
  type AdminTransaction,
} from "@/lib/admin-transactions"
import { getAdminUsers } from "@/lib/admin-users"

export type AdminOverviewMonth = {
  key: string
  label: string
  total: number
  current: boolean
}

export type AdminOverview = {
  users: {
    total: number
    customers: number
    vendors: number
    admins: number
    blocked: number
  }
  services: {
    total: number
    live: number
    pending: number
    rejected: number
  }
  revenue: {
    total: number
    currency: string
    paidCount: number
  }
  pendingServices: AdminService[]
  recentPayments: AdminTransaction[]
  months: AdminOverviewMonth[]
  error: string | null
}

const MONTH_COUNT = 3
const PENDING_LIMIT = 4
const PAYMENT_LIMIT = 5

function buildMonths(transactions: AdminTransaction[]): AdminOverviewMonth[] {
  const now = new Date()
  const months: AdminOverviewMonth[] = []

  for (let offset = MONTH_COUNT - 1; offset >= 0; offset -= 1) {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1)
    )

    months.push({
      key: `${date.getUTCFullYear()}-${date.getUTCMonth()}`,
      label: new Intl.DateTimeFormat("en-GB", {
        month: "short",
        timeZone: "UTC",
      }).format(date),
      total: 0,
      current: offset === 0,
    })
  }

  const byKey = new Map(months.map((month) => [month.key, month]))

  for (const transaction of transactions) {
    if (transaction.status !== "paid" || !transaction.date) continue

    const date = new Date(transaction.date)
    if (Number.isNaN(date.getTime())) continue

    const bucket = byKey.get(`${date.getUTCFullYear()}-${date.getUTCMonth()}`)
    if (bucket) bucket.total += transaction.amount
  }

  return months
}

/**
 * Everything the admin overview needs, composed from the same loaders the
 * dedicated admin screens use so the numbers never disagree.
 */
export async function getAdminOverview(): Promise<AdminOverview> {
  const [usersResult, servicesResult, transactionsResult] = await Promise.all([
    getAdminUsers(),
    getAdminServices(),
    getAdminTransactions(),
  ])

  const error =
    usersResult.error ?? servicesResult.error ?? transactionsResult.error

  const users = usersResult.users
  const services = servicesResult.services
  const transactions = transactionsResult.transactions

  const paid = transactions.filter(
    (transaction) => transaction.status === "paid"
  )

  return {
    users: {
      total: users.length,
      customers: users.filter((user) => user.role === "customer").length,
      vendors: users.filter((user) => user.role === "vendor").length,
      admins: users.filter((user) => user.role === "admin").length,
      blocked: users.filter((user) => user.blocked).length,
    },
    services: {
      total: services.length,
      live: services.filter((service) => service.status === "approved").length,
      pending: services.filter((service) => service.status === "pending")
        .length,
      rejected: services.filter((service) => service.status === "rejected")
        .length,
    },
    revenue: {
      total: paid.reduce((sum, transaction) => sum + transaction.amount, 0),
      currency: paid[0]?.currency || transactions[0]?.currency || "usd",
      paidCount: paid.length,
    },
    pendingServices: services
      .filter((service) => service.status === "pending")
      .slice(0, PENDING_LIMIT),
    recentPayments: paid.slice(0, PAYMENT_LIMIT),
    months: buildMonths(transactions),
    error,
  }
}
