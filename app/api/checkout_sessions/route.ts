import { NextResponse } from "next/server"
import { headers } from "next/headers"

import { getServerSession, resolveDashboardRole } from "@/lib/auth-server"
import { dashboardPaths } from "@/lib/dashboard"
import { routes } from "@/lib/routes"
import { stripe } from "@/lib/stripe"
import { getActiveSubscription } from "@/lib/subscriptions"

const PREMIUM_PRICE_ID =
  process.env.STRIPE_PREMIUM_PRICE_ID || "price_1UeM5lLrUHMOJHtMYqCA7Q2G"

function appOrigin(fallback: string) {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL
  return (configured || fallback).replace(/\/+$/, "")
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.redirect(new URL(routes.signIn, request.url), 303)
    }

    const role = resolveDashboardRole(session.user.role)
    const headersList = await headers()
    const origin = appOrigin(
      headersList.get("origin") || new URL(request.url).origin
    )

    if (role !== "vendor") {
      return NextResponse.redirect(
        new URL(dashboardPaths[role].overview, origin),
        303
      )
    }

    const existing = await getActiveSubscription(session.user.email)
    if (existing) {
      return NextResponse.redirect(
        new URL(dashboardPaths.vendor.subscription, origin),
        303
      )
    }

    const vendorEmail = session.user.email.trim().toLowerCase()
    const metadata = {
      vendorEmail,
      userId: session.user.id,
      plan: "premium",
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: PREMIUM_PRICE_ID, quantity: 1 }],
      customer_email: session.user.email,
      client_reference_id: session.user.id,
      metadata,
      subscription_data: { metadata },
      success_url: `${origin}/payment_success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${dashboardPaths.vendor.subscription}?canceled=1`,
      allow_promotion_codes: true,
      integration_identifier: "WedPlan_web_001",
    })

    if (!checkoutSession.url) {
      throw new Error("Stripe did not return a checkout URL")
    }

    return NextResponse.redirect(checkoutSession.url, 303)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))

    console.error("Stripe checkout session error:", error)

    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
