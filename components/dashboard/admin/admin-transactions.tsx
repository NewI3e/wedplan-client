"use client"

import * as React from "react"
import {
  CircleCheckIcon,
  CircleXIcon,
  DownloadIcon,
  ReceiptTextIcon,
  RotateCcwIcon,
  SearchIcon,
  WalletIcon,
  XIcon,
} from "lucide-react"

import type {
  AdminTransaction,
  AdminTransactionStatus,
} from "@/lib/admin-transactions"
import { cn } from "@/lib/utils"

const CARD =
  "rounded-xl border border-[#e8decd] bg-[#fffdf9] shadow-[0_2px_12px_rgba(60,40,25,0.04)]"

const STATUS_META: Record<
  AdminTransactionStatus,
  { label: string; className: string; dot: string }
> = {
  paid: {
    label: "Paid",
    className: "bg-[#eaf7ef] text-[#2f7a4b]",
    dot: "bg-[#3f9b63]",
  },
  failed: {
    label: "Failed",
    className: "bg-[#fbe9ec] text-[#b23a52]",
    dot: "bg-[#c94a63]",
  },
  refunded: {
    label: "Refunded",
    className: "bg-[#f3ece0] text-[#8a6a22]",
    dot: "bg-[#a98a4b]",
  },
  canceled: {
    label: "Canceled",
    className: "bg-[#f1eee9] text-[#6b6258]",
    dot: "bg-[#8b8175]",
  },
}

const STATUS_OPTIONS: Array<{
  value: "all" | AdminTransactionStatus
  label: string
}> = [
  { value: "all", label: "All statuses" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
  { value: "canceled", label: "Canceled" },
]

function planLabel(plan: string) {
  if (!plan) return "Premium"
  return plan.charAt(0).toUpperCase() + plan.slice(1)
}

function currencySymbol(currency: string) {
  const code = (currency || "usd").toUpperCase()

  try {
    return (
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: code,
        currencyDisplay: "narrowSymbol",
      })
        .formatToParts(0)
        .find((part) => part.type === "currency")?.value ?? code
    )
  } catch {
    return code
  }
}

function formatCurrency(amount: number, currency: string) {
  const code = (currency || "usd").toUpperCase()
  const whole = Number.isInteger(amount)

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
    }).format(amount)
  } catch {
    return `${code} ${amount.toFixed(2)}`
  }
}

function formatCompactCurrency(amount: number, currency: string) {
  const symbol = currencySymbol(currency)

  if (amount >= 1_000_000) return `${symbol}${(amount / 1_000_000).toFixed(1)}m`
  if (amount >= 1_000) return `${symbol}${(amount / 1_000).toFixed(1)}k`
  return `${symbol}${amount}`
}

function formatDate(value: string | null) {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function getMonthBuckets(transactions: AdminTransaction[]) {
  const now = new Date()
  const buckets: Array<{
    key: string
    label: string
    total: number
    current: boolean
  }> = []

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1)
    )

    buckets.push({
      key: `${date.getUTCFullYear()}-${date.getUTCMonth()}`,
      label: new Intl.DateTimeFormat("en-GB", {
        month: "short",
        timeZone: "UTC",
      }).format(date),
      total: 0,
      current: offset === 0,
    })
  }

  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]))

  for (const transaction of transactions) {
    if (transaction.status !== "paid" || !transaction.date) continue

    const date = new Date(transaction.date)
    if (Number.isNaN(date.getTime())) continue

    const bucket = byKey.get(`${date.getUTCFullYear()}-${date.getUTCMonth()}`)

    if (bucket) bucket.total += transaction.amount
  }

  return buckets
}

function buildCsv(transactions: AdminTransaction[]) {
  const header = [
    "Transaction",
    "Vendor",
    "Email",
    "Plan",
    "Amount",
    "Currency",
    "Date",
    "Status",
    "Stripe subscription",
  ]

  const escape = (value: unknown) => {
    const text = String(value ?? "")
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }

  const rows = transactions.map((transaction) => [
    transaction.code,
    transaction.vendorName,
    transaction.vendorEmail,
    planLabel(transaction.plan),
    transaction.amount.toFixed(2),
    (transaction.currency || "usd").toUpperCase(),
    transaction.date ? transaction.date.slice(0, 10) : "",
    STATUS_META[transaction.status].label,
    transaction.stripeSubscriptionId,
  ])

  return [header, ...rows].map((row) => row.map(escape).join(",")).join("\n")
}

function downloadCsv(transactions: AdminTransaction[]) {
  const blob = new Blob([buildCsv(transactions)], {
    type: "text/csv;charset=utf-8;",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = `wedplan-transactions-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function StatusBadge({ status }: { status: AdminTransactionStatus }) {
  const meta = STATUS_META[status]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-medium",
        meta.className
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  )
}

function PlanBadge({ plan }: { plan: string }) {
  return (
    <span className="inline-flex rounded-full bg-[#f6ecd3] px-2.5 py-1 text-[0.68rem] font-medium text-[#8a6a22]">
      {planLabel(plan)}
    </span>
  )
}

function StatCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string
  value: string | number
  hint: string
  icon: React.ReactNode
  tone: "gold" | "green" | "rose" | "neutral"
}) {
  const tones = {
    gold: "bg-[#f6ecd3] text-[#a87b26]",
    green: "bg-[#eaf7ef] text-[#2f7a4b]",
    rose: "bg-[#fbe9ec] text-[#b23a52]",
    neutral: "bg-[#f3ece0] text-[#8a6a22]",
  }

  return (
    <div className={cn(CARD, "p-4 sm:p-5")}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[0.68rem] font-medium tracking-[0.12em] text-[#2b2118]/45 uppercase">
          {label}
        </p>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md",
            tones[tone]
          )}
        >
          {icon}
        </span>
      </div>

      <p className="mt-5 font-display text-3xl leading-none text-[#2b2118]">
        {value}
      </p>
      <p className="mt-2 truncate text-xs text-[#2b2118]/45">{hint}</p>
    </div>
  )
}

export function ExportTransactionsButton({
  transactions,
}: {
  transactions: AdminTransaction[]
}) {
  return (
    <button
      type="button"
      onClick={() => downloadCsv(transactions)}
      disabled={transactions.length === 0}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#e0d5c4] bg-white px-4 text-sm font-medium text-[#2b2118]/75 transition-colors hover:border-[#c9b79c] hover:bg-[#fbf7ef] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
    >
      <DownloadIcon aria-hidden className="size-4" />
      Export CSV
    </button>
  )
}

export function AdminTransactionsPanel({
  transactions,
  error,
}: {
  transactions: AdminTransaction[]
  error: string | null
}) {
  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | AdminTransactionStatus
  >("all")
  const [selected, setSelected] = React.useState<AdminTransaction | null>(null)

  const currency = transactions[0]?.currency || "usd"

  const stats = React.useMemo(() => {
    const paid = transactions.filter(
      (transaction) => transaction.status === "paid"
    )
    const failed = transactions.filter(
      (transaction) => transaction.status === "failed"
    )
    const refunded = transactions.filter(
      (transaction) => transaction.status === "refunded"
    )

    return {
      revenue: paid.reduce((sum, transaction) => sum + transaction.amount, 0),
      paid: paid.length,
      failed: failed.length,
      refunded: refunded.length,
    }
  }, [transactions])

  const filtered = React.useMemo(() => {
    const search = query.trim().toLowerCase()

    return transactions.filter((transaction) => {
      const matchesStatus =
        statusFilter === "all" || transaction.status === statusFilter

      if (!matchesStatus) return false
      if (!search) return true

      return [
        transaction.code,
        transaction.vendorName,
        transaction.vendorEmail,
        transaction.stripeSubscriptionId,
      ].some((value) => value.toLowerCase().includes(search))
    })
  }, [transactions, query, statusFilter])

  const months = React.useMemo(
    () => getMonthBuckets(transactions),
    [transactions]
  )
  const maxMonthTotal = Math.max(1, ...months.map((month) => month.total))

  if (error) {
    return (
      <div className={cn(CARD, "px-6 py-12 text-center")}>
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f5e8e4] text-[#b33a3a]">
          <ReceiptTextIcon aria-hidden className="size-5" />
        </span>
        <h2 className="mt-4 font-display text-2xl text-[#2b2118]">
          Transactions unavailable
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#2b2118]/55">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={formatCurrency(stats.revenue, currency)}
          hint="Paid only — refunds excluded"
          icon={<WalletIcon aria-hidden className="size-4" />}
          tone="gold"
        />
        <StatCard
          label="Successful"
          value={stats.paid}
          hint="Payments completed"
          icon={<CircleCheckIcon aria-hidden className="size-4" />}
          tone="green"
        />
        <StatCard
          label="Failed"
          value={stats.failed}
          hint="Card declined or abandoned"
          icon={<CircleXIcon aria-hidden className="size-4" />}
          tone="rose"
        />
        <StatCard
          label="Refunded"
          value={stats.refunded}
          hint="Returned to vendor"
          icon={<RotateCcwIcon aria-hidden className="size-4" />}
          tone="neutral"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.9fr)_minmax(280px,1fr)]">
        <section className={cn(CARD, "overflow-hidden")}>
          <div className="flex flex-col gap-3 border-b border-[#eee5d6] p-4 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <SearchIcon
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#2b2118]/35"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search vendor, email or transaction ID"
                aria-label="Search transactions"
                className="h-10 w-full rounded-lg border border-[#ddd2c2] bg-white pr-3 pl-9 text-sm text-[#2b2118] transition-colors outline-none placeholder:text-[#2b2118]/35 focus:border-[#7a1f3d] focus:ring-3 focus:ring-[#7a1f3d]/15"
              />
            </div>

            <label className="sr-only" htmlFor="transaction-status">
              Filter by status
            </label>
            <select
              id="transaction-status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as "all" | AdminTransactionStatus
                )
              }
              className="h-10 shrink-0 rounded-lg border border-[#ddd2c2] bg-white px-3 text-sm text-[#2b2118]/75 transition-colors outline-none focus:border-[#7a1f3d] focus:ring-3 focus:ring-[#7a1f3d]/15"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-[#efe6d6] text-[#7a1f3d]">
                <ReceiptTextIcon aria-hidden className="size-5" />
              </span>
              <h3 className="mt-3 font-display text-xl text-[#2b2118]">
                No transactions yet
              </h3>
              <p className="mt-1 max-w-sm text-sm leading-relaxed text-[#2b2118]/50">
                When a vendor subscribes to Premium, their Stripe payment will
                appear here.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="font-display text-xl text-[#2b2118]">
                No matching transactions
              </p>
              <p className="mt-1 text-sm text-[#2b2118]/50">
                Try a different search term or status.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#eee5d6] text-[0.62rem] font-medium tracking-[0.14em] text-[#2b2118]/45 uppercase">
                    <th className="px-5 py-3 font-medium">Transaction</th>
                    <th className="px-5 py-3 font-medium">Vendor</th>
                    <th className="px-5 py-3 font-medium">Plan</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#eee5d6]">
                  {filtered.map((transaction) => (
                    <tr
                      key={transaction.id}
                      tabIndex={0}
                      onClick={() => setSelected(transaction)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault()
                          setSelected(transaction)
                        }
                      }}
                      className="cursor-pointer transition-colors hover:bg-[#fbf7ef] focus-visible:bg-[#fbf7ef] focus-visible:outline-none"
                    >
                      <td className="px-5 py-4 font-mono text-[0.78rem] font-medium text-[#2b2118]">
                        {transaction.code}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-[#2b2118]">
                          {transaction.vendorName}
                        </p>
                        <p className="mt-0.5 text-xs text-[#2b2118]/45">
                          {transaction.vendorEmail}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <PlanBadge plan={transaction.plan} />
                      </td>
                      <td className="px-5 py-4 font-medium whitespace-nowrap text-[#2b2118]">
                        {formatCurrency(
                          transaction.amount,
                          transaction.currency
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-[#2b2118]/55">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={transaction.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-[#eee5d6] px-5 py-3 text-xs text-[#2b2118]/45">
            Showing {filtered.length} of {transactions.length} transactions
            <span className="hidden sm:inline">
              {" "}
              · click a row for the receipt
            </span>
          </div>
        </section>

        <section className={cn(CARD, "p-5")}>
          <h2 className="font-display text-xl text-[#2b2118]">
            Revenue by month
          </h2>
          <p className="mt-1 text-xs text-[#2b2118]/45">
            Paid transactions over the last 6 months
          </p>

          <div className="mt-6 flex items-end gap-2 sm:gap-3">
            {months.map((month) => {
              const height =
                month.total === 0
                  ? 4
                  : Math.max(
                      10,
                      Math.round((month.total / maxMonthTotal) * 100)
                    )

              return (
                <div
                  key={month.key}
                  className="flex min-w-0 flex-1 flex-col items-center"
                >
                  <span className="truncate text-[0.66rem] font-medium text-[#2b2118]/55">
                    {formatCompactCurrency(month.total, currency)}
                  </span>

                  <div className="mt-2 flex h-32 w-full items-end justify-center">
                    <span
                      className={cn(
                        "block w-full max-w-10 rounded-t-md transition-[height]",
                        month.current ? "bg-[#7a1f3d]" : "bg-[#f2dfe1]"
                      )}
                      style={{ height: `${height}%` }}
                    />
                  </div>

                  <span
                    className={cn(
                      "mt-2 text-[0.68rem]",
                      month.current
                        ? "font-medium text-[#2b2118]"
                        : "text-[#2b2118]/55"
                    )}
                  >
                    {month.label}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-6 rounded-lg bg-[#fbf7ef] px-3.5 py-3">
            <p className="text-xs leading-relaxed text-[#2b2118]/55">
              Total revenue counts paid subscriptions only. Refunds and failed
              payments are excluded.
            </p>
          </div>
        </section>
      </div>

      {selected ? (
        <ReceiptModal
          transaction={selected}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  )
}

function ReceiptRow({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-[#2b2118]/50">{label}</dt>
      <dd
        className={cn(
          "min-w-0 truncate text-right font-medium text-[#2b2118]",
          mono && "font-mono text-xs"
        )}
        title={value}
      >
        {value}
      </dd>
    </div>
  )
}

function ReceiptModal({
  transaction,
  onClose,
}: {
  transaction: AdminTransaction
  onClose: () => void
}) {
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="my-auto w-full max-w-md overflow-hidden rounded-2xl border border-[#e8decd] bg-[#fdfaf5] shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#eee5d6] px-5 py-4">
          <div className="min-w-0">
            <p className="text-[0.62rem] font-medium tracking-[0.2em] text-[#a98a4b] uppercase">
              Receipt
            </p>
            <h2
              id="receipt-title"
              className="mt-1 truncate font-mono text-lg font-medium text-[#2b2118]"
            >
              {transaction.code}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close receipt"
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#2b2118]/45 transition-colors hover:bg-[#efe6d6] hover:text-[#2b2118] focus-visible:ring-2 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none"
          >
            <XIcon aria-hidden className="size-4" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-[#2b2118]/55">Status</span>
            <StatusBadge status={transaction.status} />
          </div>

          <div className="flex items-end justify-between gap-3">
            <span className="text-sm text-[#2b2118]/55">Amount</span>
            <span className="font-display text-3xl leading-none text-[#2b2118]">
              {formatCurrency(transaction.amount, transaction.currency)}
            </span>
          </div>

          <dl className="space-y-2.5 border-t border-[#eee5d6] pt-4 text-sm">
            <ReceiptRow label="Vendor" value={transaction.vendorName} />
            <ReceiptRow label="Email" value={transaction.vendorEmail} />
            <ReceiptRow label="Plan" value={planLabel(transaction.plan)} />
            <ReceiptRow
              label="Billing"
              value={
                transaction.interval
                  ? `Every ${transaction.interval}`
                  : "One-time"
              }
            />
            <ReceiptRow label="Date" value={formatDate(transaction.date)} />
            {transaction.currentPeriodEnd ? (
              <ReceiptRow
                label={transaction.cancelAtPeriodEnd ? "Access ends" : "Renews"}
                value={formatDate(transaction.currentPeriodEnd)}
              />
            ) : null}
            <ReceiptRow
              label="Subscription"
              value={transaction.stripeSubscriptionId}
              mono
            />
            {transaction.stripeCustomerId ? (
              <ReceiptRow
                label="Customer"
                value={transaction.stripeCustomerId}
                mono
              />
            ) : null}
          </dl>
        </div>

        <div className="border-t border-[#eee5d6] px-5 py-3">
          <p className="text-center text-xs text-[#2b2118]/45">
            Payments are processed securely by Stripe.
          </p>
        </div>
      </div>
    </div>
  )
}
