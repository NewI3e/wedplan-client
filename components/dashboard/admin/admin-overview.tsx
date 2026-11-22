"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowRightIcon,
  CheckIcon,
  Clock3Icon,
  CreditCardIcon,
  ImageIcon,
  LayoutGridIcon,
  LoaderCircleIcon,
  UsersIcon,
  XIcon,
} from "lucide-react"

import { setServiceStatusAction } from "@/app/(dashboard)/dashboard/admin/services/actions"
import type { AdminOverview } from "@/lib/admin-overview"
import { dashboardPaths } from "@/lib/dashboard"
import { cn } from "@/lib/utils"

const CARD =
  "rounded-xl border border-[#e8decd] bg-[#fffdf9] shadow-[0_2px_12px_rgba(60,40,25,0.04)]"

const PRIMARY_BUTTON =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#7a1f3d] px-3.5 text-xs font-medium text-[#f8f2e7] transition-colors hover:bg-[#65203a] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"

const DANGER_OUTLINE_BUTTON =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#f0cdd4] bg-white px-3.5 text-xs font-medium text-[#b23a52] transition-colors hover:border-[#e3aebb] hover:bg-[#fdf1f3] focus-visible:ring-3 focus-visible:ring-[#b23a52]/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"

const LINK_CLASS =
  "inline-flex items-center gap-1 text-xs font-medium text-[#7a1f3d] transition-colors hover:text-[#65203a] focus-visible:ring-2 focus-visible:ring-[#7a1f3d]/25 focus-visible:outline-none"

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

  if (amount >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(1)}m`
  }

  if (amount >= 1_000) {
    return `${symbol}${(amount / 1_000).toFixed(1)}k`
  }

  return `${symbol}${amount}`
}

function formatPrice(price: number) {
  return `৳${Math.round(price).toLocaleString("en-BD")}`
}

function formatDate(value: string) {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

function planLabel(plan: string) {
  if (!plan) return "Premium"
  return `${plan.charAt(0).toUpperCase()}${plan.slice(1)}`
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
  tone: "neutral" | "green" | "gold" | "plum"
}) {
  const tones = {
    neutral: "bg-[#f3ece0] text-[#8a6a22]",
    green: "bg-[#eaf2ec] text-[#2f7a4b]",
    gold: "bg-[#f6ecd3] text-[#a87b26]",
    plum: "bg-[#f7e4e6] text-[#7a1f3d]",
  }

  return (
    <div className={cn(CARD, "p-5")}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-[#2b2118]/60">{label}</p>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            tones[tone]
          )}
        >
          {icon}
        </span>
      </div>

      <p className="mt-7 font-display text-4xl leading-none text-[#2b2118]">
        {value}
      </p>
      <p className="mt-2.5 truncate text-xs text-[#2b2118]/45">{hint}</p>
    </div>
  )
}

function ServiceThumb({
  photoUrl,
  className,
}: {
  photoUrl: string | null
  className?: string
}) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt=""
        className={cn("size-full object-cover", className)}
      />
    )
  }

  return (
    <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#f3e6df] via-[#f7f1e7] to-[#efe6d6]">
      <ImageIcon aria-hidden className="size-4 text-[#b08a3e]/70" />
    </div>
  )
}

export function AdminOverviewPanel({ overview }: { overview: AdminOverview }) {
  const router = useRouter()

  const [resolvedIds, setResolvedIds] = React.useState<string[]>([])
  const [busyId, setBusyId] = React.useState<string | null>(null)

  const pending = overview.pendingServices.filter(
    (service) => !resolvedIds.includes(service.id)
  )

  const maxMonthTotal = Math.max(1, ...overview.months.map((m) => m.total))
  const maxAudience = Math.max(
    1,
    overview.users.customers,
    overview.users.vendors,
    overview.users.blocked
  )

  async function moderate(
    serviceId: string,
    name: string,
    status: "approved" | "rejected"
  ) {
    setBusyId(serviceId)

    try {
      const result = await setServiceStatusAction(serviceId, status)

      if (!result.ok) {
        toast.error(result.message)
        return
      }

      setResolvedIds((current) => [...current, serviceId])
      toast.success(
        status === "approved"
          ? `“${name}” is now live on the marketplace.`
          : `“${name}” was rejected.`
      )
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Could not update this service. Please try again.")
    } finally {
      setBusyId(null)
    }
  }

  const audience = [
    {
      label: "Customers",
      value: overview.users.customers,
      bar: "bg-[#7a1f3d]",
    },
    {
      label: "Vendors",
      value: overview.users.vendors,
      bar: "bg-[#9c5568]",
    },
    {
      label: "Blocked",
      value: overview.users.blocked,
      bar: "bg-[#c94a63]",
    },
  ]

  return (
    <div className="space-y-5">
      {overview.error ? (
        <p className="rounded-lg border border-[#f0cdd4] bg-[#fdf1f3] px-4 py-3 text-sm text-[#b23a52]">
          {overview.error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Registered users"
          value={overview.users.total}
          hint={`${overview.users.customers} customers · ${overview.users.vendors} vendors`}
          icon={<UsersIcon aria-hidden className="size-4" />}
          tone="neutral"
        />
        <StatCard
          label="Live services"
          value={overview.services.live}
          hint={`${overview.services.total} listed in total`}
          icon={<LayoutGridIcon aria-hidden className="size-4" />}
          tone="green"
        />
        <StatCard
          label="Awaiting review"
          value={overview.services.pending}
          hint="New services to check"
          icon={<Clock3Icon aria-hidden className="size-4" />}
          tone="gold"
        />
        <StatCard
          label="Total revenue"
          value={formatCurrency(
            overview.revenue.total,
            overview.revenue.currency
          )}
          hint="Paid Premium subscriptions"
          icon={<CreditCardIcon aria-hidden className="size-4" />}
          tone="plum"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className={cn(CARD, "flex flex-col p-5")}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-[#2b2118]">
              Awaiting review
            </h2>
            <Link href={dashboardPaths.admin.services} className={LINK_CLASS}>
              Manage services
              <ArrowRightIcon aria-hidden className="size-3.5" />
            </Link>
          </div>

          {pending.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-14 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-[#efe6d6] text-[#7a1f3d]">
                <CheckIcon aria-hidden className="size-5" />
              </span>
              <p className="mt-3 font-display text-lg text-[#2b2118]">
                You&apos;re all caught up
              </p>
              <p className="mt-1 max-w-xs text-sm text-[#2b2118]/50">
                No services are waiting for approval right now.
              </p>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-[#eee5d6]">
              {pending.map((service) => {
                const busy = busyId === service.id

                return (
                  <li
                    key={service.id}
                    className="flex flex-col gap-3 py-3.5 first:pt-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="size-11 shrink-0 overflow-hidden rounded-lg bg-[#efe6d6]">
                        <ServiceThumb photoUrl={service.photoUrl} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#2b2118]">
                          {service.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-[#2b2118]/50">
                          {[
                            service.vendorBusiness || service.vendorName,
                            service.category,
                            formatPrice(service.price),
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          moderate(service.id, service.name, "rejected")
                        }
                        disabled={busy}
                        className={DANGER_OUTLINE_BUTTON}
                      >
                        <XIcon aria-hidden className="size-3.5" />
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          moderate(service.id, service.name, "approved")
                        }
                        disabled={busy}
                        className={PRIMARY_BUTTON}
                      >
                        {busy ? (
                          <LoaderCircleIcon
                            aria-hidden
                            className="size-3.5 animate-spin"
                          />
                        ) : (
                          <CheckIcon aria-hidden className="size-3.5" />
                        )}
                        Approve
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className={cn(CARD, "flex flex-col p-5")}>
          <h2 className="font-display text-2xl text-[#2b2118]">
            Who&apos;s on WedPlan
          </h2>

          <div className="mt-5 space-y-4">
            {audience.map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[#2b2118]/70">{row.label}</span>
                  <span className="font-medium text-[#2b2118]">
                    {row.value}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#f0e3e5]">
                  <span
                    className={cn("block h-full rounded-full", row.bar)}
                    style={{
                      width: `${Math.round((row.value / maxAudience) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <Link
            href={dashboardPaths.admin.users}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg border border-[#e0d5c4] bg-white text-sm font-medium text-[#2b2118]/75 transition-colors hover:border-[#c9b79c] hover:bg-[#fbf7ef] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/20 focus-visible:outline-none"
          >
            Manage users
          </Link>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className={cn(CARD, "p-5")}>
          <h2 className="font-display text-2xl text-[#2b2118]">
            Revenue by month
          </h2>
          <p className="mt-1 text-xs text-[#2b2118]/45">
            Paid Premium subscriptions over the last 3 months
          </p>

          <div className="mt-7 flex items-end gap-3">
            {overview.months.map((month) => {
              const height =
                month.total === 0
                  ? 4
                  : Math.max(
                      12,
                      Math.round((month.total / maxMonthTotal) * 100)
                    )

              return (
                <div
                  key={month.key}
                  className="flex min-w-0 flex-1 flex-col items-center"
                >
                  <span className="truncate text-[0.66rem] font-medium text-[#2b2118]/55">
                    {formatCompactCurrency(
                      month.total,
                      overview.revenue.currency
                    )}
                  </span>

                  <div className="mt-2 flex h-28 w-full items-end justify-center">
                    <span
                      className={cn(
                        "block w-full max-w-16 rounded-t-md",
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
        </section>

        <section className={cn(CARD, "p-5")}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-[#2b2118]">
              Recent payments
            </h2>
            <Link
              href={dashboardPaths.admin.transactions}
              className={LINK_CLASS}
            >
              All transactions
              <ArrowRightIcon aria-hidden className="size-3.5" />
            </Link>
          </div>

          {overview.recentPayments.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-14 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-[#efe6d6] text-[#7a1f3d]">
                <CreditCardIcon aria-hidden className="size-5" />
              </span>
              <p className="mt-3 font-display text-lg text-[#2b2118]">
                No payments yet
              </p>
              <p className="mt-1 max-w-xs text-sm text-[#2b2118]/50">
                Premium subscription payments will show up here.
              </p>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-[#eee5d6]">
              {overview.recentPayments.map((payment) => (
                <li
                  key={payment.id}
                  className="flex items-center justify-between gap-3 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#2b2118]">
                      {payment.vendorName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-[#2b2118]/50">
                      {planLabel(payment.plan)} plan ·{" "}
                      {formatDate(payment.date)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-medium whitespace-nowrap text-[#2b2118]">
                      {formatCurrency(payment.amount, payment.currency)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf7ef] px-2.5 py-1 text-[0.68rem] font-medium text-[#2f7a4b]">
                      <span className="size-1.5 rounded-full bg-[#3f9b63]" />
                      Paid
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
