import type { Metadata } from "next"
import { CheckIcon, CrownIcon, LockIcon, SparklesIcon } from "lucide-react"

import Link from "next/link";

import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { UpgradeButton } from "@/components/dashboard/vendor/upgrade-button"
import { requireDashboardRole } from "@/lib/auth-server"
import { getVendorServiceUsage } from "@/lib/vendor-overview"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Subscription",
}

const CARD =
  "rounded-2xl border border-[#e8decd] bg-[#fdfaf5] shadow-[0_2px_12px_rgba(60,40,25,0.04)]"

const FREE_FEATURES = [
  "Up to 3 active services",
  "Basic vendor dashboard",
  "Booking request management",
]

const PREMIUM_FEATURES = [
  "Unlimited active services",
  "Gold Premium vendor badge",
  "Priority placement in search",
  "All Free plan features",
]

// Placeholder until the Stripe Price is connected.
const PREMIUM_MONTHLY_PRICE = "৳2,500"

function FeatureList({
  features,
  tone,
}: {
  features: string[]
  tone: "light" | "dark"
}) {
  return (
    <ul className="mt-6 space-y-3 text-sm leading-relaxed">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-2.5">
          <CheckIcon
            aria-hidden
            className={cn(
              "mt-0.5 size-4 shrink-0",
              tone === "dark" ? "text-[#e6cda2]" : "text-[#3f7a52]"
            )}
          />
          <span
            className={
              tone === "dark" ? "text-[#f8f2e7]/85" : "text-[#2b2118]/75"
            }
          >
            {feature}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default async function VendorSubscriptionPage() {
  const { session } = await requireDashboardRole("vendor")
  const usage = await getVendorServiceUsage(session.user.email)

  const isPremium = usage.plan !== "free"

  return (
    <DashboardPage
      eyebrow="Vendor Dashboard"
      title="Subscription"
      description="Grow your wedding business with the plan that fits."
    >
      <div className="space-y-6">
        {/* Current plan */}
        <section
          className={cn(
            CARD,
            "flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7"
          )}
        >
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#f0e7d7] text-[#7a1f3d]">
              <CrownIcon aria-hidden className="size-5" />
            </span>
            <div>
              <p className="text-sm text-[#2b2118]/55">Current plan</p>
              <p className="font-display text-3xl leading-tight text-[#2b2118]">
                {isPremium ? "Premium" : "Free"}
              </p>
            </div>
          </div>

          <p className="text-sm text-[#2b2118]/45 sm:text-right">
            {isPremium ? "Managed with Stripe" : "No payment method on file"}
          </p>
        </section>

        {/* Plans */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Free */}
          <section className={cn(CARD, "flex flex-col p-6 sm:p-8")}>
            <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-[#a98a4b] uppercase">
              Free
            </p>

            <p className="mt-4 flex items-baseline gap-1.5 font-display text-5xl leading-none text-[#2b2118]">
              ৳0
              <span className="font-sans text-sm font-normal text-[#2b2118]/45">
                / month
              </span>
            </p>

            <p className="mt-2 text-sm leading-relaxed text-[#2b2118]/55">
              Everything you need to get started.
            </p>

            <FeatureList features={FREE_FEATURES} tone="light" />

            <div className="mt-auto pt-8">
              <button
                type="button"
                disabled
                className="flex h-12 w-full cursor-not-allowed items-center justify-center rounded-full border border-[#e8decd] bg-transparent text-sm font-medium text-[#2b2118]/40"
              >
                {isPremium ? "Included in Premium" : "Your current plan"}
              </button>
            </div>
          </section>

          {/* Premium */}
          <section className="relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#7a1f3d] to-[#5c1730] p-6 text-[#f8f2e7] shadow-[0_12px_32px_rgba(92,23,48,0.18)] sm:p-8">
            <span className="absolute top-5 right-5 inline-flex items-center gap-1.5 rounded-full bg-[#f2dfb9] px-3 py-1 text-[0.65rem] font-medium text-[#6b4a17]">
              <SparklesIcon aria-hidden className="size-3" />
              Most popular
            </span>

            <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-[#e6cda2] uppercase">
              Premium
            </p>

            <p className="mt-4 flex items-baseline gap-1.5 font-display text-5xl leading-none text-[#f8f2e7]">
              {PREMIUM_MONTHLY_PRICE}
              <span className="font-sans text-sm font-normal text-[#f8f2e7]/55">
                / month
              </span>
            </p>

            <p className="mt-2 text-sm leading-relaxed text-[#f8f2e7]/70">
              For vendors ready to be seen by every couple.
            </p>

            <FeatureList features={PREMIUM_FEATURES} tone="dark" />

            <div className="mt-auto pt-8">
              {isPremium ? (
                <Link
                  href="/payment"
                  className="flex h-12 w-full items-center justify-center rounded-full bg-[#f2dfb9]/60 text-sm font-medium text-[#6b4a17] transition hover:bg-[#f2dfb9]"
                >
                  Your current plan
                </Link>
              ) : (
                <UpgradeButton />
              )}

              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#f8f2e7]/55">
                <LockIcon aria-hidden className="size-3.5" />
                Secure payment with Stripe
              </p>

              <p className="mt-1 text-center text-xs text-[#f8f2e7]/40 underline decoration-[#f8f2e7]/20 underline-offset-2">
                Preview: what if payment is cancelled?
              </p>
            </div>
          </section>
        </div>
      </div>
    </DashboardPage>
  )
}
