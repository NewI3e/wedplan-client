import { NextResponse } from "next/server"
import type Stripe from "stripe"

import { stripe } from "@/lib/stripe"
import {
  saveCheckoutSessionSubscription,
  upsertStripeSubscription,
} from "@/lib/subscriptions"

export const runtime = "nodejs"

/**
 * Stripe webhook endpoint.
 *
 * Local testing:
 *   stripe listen --forward-to localhost:3000/api/webhooks/stripe
 * and put the printed signing secret in `STRIPE_WEBHOOK_SECRET`.
 *
 * The `/payment_success` page also syncs the subscription, so a missing
 * webhook doesn't block a vendor — but the webhook is what keeps renewals,
 * failed payments and cancellations accurate over time.
 */
export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set")
    return NextResponse.json(
      { error: "Webhook secret is not configured" },
      { status: 500 }
    )
  }

  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature"

    console.error("Stripe webhook signature verification failed:", message)

    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object

        if (
          session.payment_status === "paid" ||
          session.status === "complete"
        ) {
          await saveCheckoutSessionSubscription(session)
        }

        break
      }

      case "checkout.session.async_payment_succeeded": {
        await saveCheckoutSessionSubscription(event.data.object)
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await upsertStripeSubscription(event.data.object)
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error(`Stripe webhook handler failed for ${event.type}:`, err)

    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}
