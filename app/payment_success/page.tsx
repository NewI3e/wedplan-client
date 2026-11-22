import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  CrownIcon,
  ReceiptTextIcon,
} from "lucide-react"

import { dashboardPaths } from "@/lib/dashboard"
import {
  syncCheckoutSession,
  type VendorSubscription,
} from "@/lib/subscriptions"

export const metadata: Metadata = {
  title: "Payment successful",
}

export const dynamic = "force-dynamic"

type PaymentSuccessPageProps = {
  searchParams: Promise<{ session_id?: string | string[] }>
}

function formatDate(value: Date | null | undefined) {
  if (!value) return null

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  }).format(value)
}

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const params = await searchParams
  const sessionId = Array.isArray(params.session_id)
    ? params.session_id[0]
    : params.session_id

  let subscription: VendorSubscription | null = null
  let syncFailed = false

  if (sessionId) {
    try {
      subscription = await syncCheckoutSession(sessionId)
    } catch (error) {
      console.error("Failed to sync Stripe checkout session:", error)
      syncFailed = true
    }
  }

  const renewalDate = formatDate(subscription?.currentPeriodEnd)
  const confirmed = Boolean(subscription)

  const heading = confirmed
    ? "Payment successful"
    : sessionId
      ? "Payment processing"
      : "Payment status"

  const description = confirmed
    ? "Your WedPlan Premium plan is active. You can now publish unlimited services."
    : sessionId
      ? "We're confirming your payment with Stripe. Refresh this page in a moment."
      : "We couldn't find a checkout session. If you just paid, open your subscription page to check the status."

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf9f6] px-4 py-12 sm:px-6">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#e8decd] bg-[#fdfaf5] shadow-[0_12px_32px_rgba(60,40,25,0.08)]">
        <div className="bg-gradient-to-br from-[#7a1f3d] to-[#5c1730] px-6 py-10 text-center text-[#f8f2e7] sm:px-10">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#f2dfb9] text-[#6b4a17]">
            <CheckCircle2Icon aria-hidden className="size-7" />
          </span>

          <h1 className="mt-5 font-display text-3xl leading-tight">
            {heading}
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-[#f8f2e7]/75">
            {description}
          </p>
        </div>

        <div className="space-y-6 px-6 py-8 sm:px-10">
          {confirmed ? (
            <>
              <div className="flex items-center gap-4 rounded-xl border border-[#e6cda2] bg-[#f8efdd] px-4 py-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#f2dfb9] text-[#7a5a22]">
                  <CrownIcon aria-hidden className="size-5" />
                </span>

                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-[0.16em] text-[#a98a4b] uppercase">
                    Current plan
                  </p>
                  <p className="font-display text-2xl leading-tight text-[#2b2118]">
                    Premium
                  </p>
                </div>
              </div>

              <ul className="space-y-2.5 text-sm text-[#2b2118]/70">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2Icon
                    aria-hidden
                    className="mt-0.5 size-4 shrink-0 text-[#3f7a52]"
                  />
                  Unlimited service listings
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2Icon
                    aria-hidden
                    className="mt-0.5 size-4 shrink-0 text-[#3f7a52]"
                  />
                  Premium vendor badge and priority placement
                </li>
                {renewalDate ? (
                  <li className="flex items-start gap-2.5">
                    <ReceiptTextIcon
                      aria-hidden
                      className="mt-0.5 size-4 shrink-0 text-[#a98a4b]"
                    />
                    Renews on {renewalDate}
                  </li>
                ) : null}
              </ul>
            </>
          ) : (
            <div className="rounded-xl border border-[#e0c07c] bg-[#fdf6e8] px-4 py-4">
              <p className="text-xs font-semibold tracking-[0.16em] text-[#a98a4b] uppercase">
                Subscription status
              </p>
              <p className="mt-1 font-display text-2xl leading-tight text-[#2b2118]">
                {sessionId ? "Processing" : "Not found"}
              </p>
            </div>
          )}

          {syncFailed ? (
            <p className="rounded-lg border border-[#e0c07c] bg-[#fdf6e8] px-3.5 py-3 text-xs leading-relaxed text-[#5b4425]">
              Your payment went through, but we could not save the subscription
              details yet. Stripe will retry automatically. If Premium is not
              showing in a few minutes, contact support.
            </p>
          ) : null}

          <div className="space-y-3">
            <Link
              href={dashboardPaths.vendor.services}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#7a1f3d] text-sm font-medium text-[#f8f2e7] transition-colors hover:bg-[#671a33] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none"
            >
              Manage your services
              <ArrowRightIcon aria-hidden className="size-4" />
            </Link>

            <Link
              href={dashboardPaths.vendor.subscription}
              className="flex h-11 w-full items-center justify-center rounded-full border border-[#e8decd] text-sm font-medium text-[#2b2118]/70 transition-colors hover:bg-[#f7efe4] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/20 focus-visible:outline-none"
            >
              View subscription
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
