import "server-only"

import { MongoClient } from "mongodb"
import type Stripe from "stripe"

import { stripe } from "@/lib/stripe"

/**
 * Vendor subscriptions live in the shared `wedplandb` database so the
 * Express API (`wedplan-server`) can read the same records when it enforces
 * the free-plan service limit.
 *
 * The server looks for `{ vendorEmail, status: "active", currentPeriodEnd }`
 * — keep those field names in sync with `getVendorPlan()` there.
 */

export const PREMIUM_PLAN = "premium"

export type VendorSubscription = {
  vendorEmail: string
  userId: string | null
  plan: string
  /** Normalised status used by the API: `active` also covers `trialing`. */
  status: string
  /** Raw Stripe status, kept for support/debugging. */
  stripeStatus: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string
  stripePriceId: string | null
  /** Price details copied from Stripe for reporting/support. */
  amount: number | null
  currency: string | null
  interval: string | null
  quantity: number | null
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  canceledAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const globalForSubscriptions = globalThis as unknown as {
  subscriptionsClient?: MongoClient
  subscriptionsIndexes?: Promise<unknown>
}

function getClient() {
  if (!globalForSubscriptions.subscriptionsClient) {
    globalForSubscriptions.subscriptionsClient = new MongoClient(
      process.env.DB_URI as string
    )
  }

  return globalForSubscriptions.subscriptionsClient
}

export function subscriptionsCollection() {
  return getClient()
    .db("wedplandb")
    .collection<VendorSubscription>("subscriptions")
}

/** One index per process is enough; failures are logged, not fatal. */
function ensureSubscriptionIndexes() {
  if (!globalForSubscriptions.subscriptionsIndexes) {
    globalForSubscriptions.subscriptionsIndexes = subscriptionsCollection()
      .createIndexes([
        {
          key: { stripeSubscriptionId: 1 },
          name: "stripeSubscriptionId_unique",
          unique: true,
          partialFilterExpression: {
            stripeSubscriptionId: { $type: "string" },
          },
        },
        { key: { vendorEmail: 1, status: 1 }, name: "vendor_status" },
      ])
      .catch((error) => {
        globalForSubscriptions.subscriptionsIndexes = undefined
        console.error("Failed to create subscription indexes:", error)
      })
  }

  return globalForSubscriptions.subscriptionsIndexes
}

export function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : ""
}

function toDate(seconds: number | null | undefined): Date | null {
  return typeof seconds === "number" && Number.isFinite(seconds)
    ? new Date(seconds * 1000)
    : null
}

function subscriptionPeriod(subscription: Stripe.Subscription) {
  const item = subscription.items?.data?.[0]

  return {
    start: toDate(item?.current_period_start),
    end: toDate(item?.current_period_end),
  }
}

function priceDetails(subscription: Stripe.Subscription) {
  const item = subscription.items?.data?.[0]
  const price = item?.price

  return {
    priceId: price?.id ?? null,
    amount:
      typeof price?.unit_amount === "number" ? price.unit_amount / 100 : null,
    currency: price?.currency ?? null,
    interval: price?.recurring?.interval ?? null,
    quantity: item?.quantity ?? null,
  }
}

function customerIdOf(subscription: Stripe.Subscription): string | null {
  const { customer } = subscription
  if (!customer) return null
  return typeof customer === "string" ? customer : customer.id
}

/** `trialing` vendors get the same privileges as `active` ones. */
function normalizeStatus(status: Stripe.Subscription.Status): string {
  return status === "trialing" ? "active" : status
}

async function customerEmailOf(subscription: Stripe.Subscription) {
  const { customer } = subscription
  if (!customer || typeof customer === "string") {
    if (!customer) return ""
    try {
      const retrieved = await stripe.customers.retrieve(customer)
      return "deleted" in retrieved ? "" : (retrieved.email ?? "")
    } catch (error) {
      console.error("Failed to retrieve Stripe customer:", error)
      return ""
    }
  }

  return "deleted" in customer ? "" : (customer.email ?? "")
}

export type StripeSubscriptionContext = {
  vendorEmail?: string | null
  userId?: string | null
  plan?: string | null
}

/**
 * Writes (or updates) a Stripe subscription in the `subscriptions` collection.
 * Returns the stored document, or `null` when we can't identify the vendor.
 */
export async function upsertStripeSubscription(
  subscription: Stripe.Subscription,
  context: StripeSubscriptionContext = {}
): Promise<VendorSubscription | null> {
  const collection = subscriptionsCollection()

  const existing = await collection.findOne({
    stripeSubscriptionId: subscription.id,
  })

  const metadata = subscription.metadata ?? {}

  let vendorEmail = normalizeEmail(
    metadata.vendorEmail || context.vendorEmail || existing?.vendorEmail
  )

  if (!vendorEmail) {
    vendorEmail = normalizeEmail(await customerEmailOf(subscription))
  }

  if (!vendorEmail) {
    console.error(
      `Cannot store subscription ${subscription.id}: no vendor email in metadata.`
    )
    return null
  }

  await ensureSubscriptionIndexes()

  const period = subscriptionPeriod(subscription)
  const price = priceDetails(subscription)
  const now = new Date()

  const document: VendorSubscription = {
    vendorEmail,
    userId: metadata.userId || context.userId || existing?.userId || null,
    plan: metadata.plan || context.plan || existing?.plan || PREMIUM_PLAN,
    status: normalizeStatus(subscription.status),
    stripeStatus: subscription.status,
    stripeCustomerId: customerIdOf(subscription),
    stripeSubscriptionId: subscription.id,
    stripePriceId: price.priceId,
    amount: price.amount,
    currency: price.currency,
    interval: price.interval,
    quantity: price.quantity,
    currentPeriodStart: period.start,
    currentPeriodEnd: period.end,
    cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
    canceledAt: toDate(subscription.canceled_at),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }

  const { createdAt, ...fields } = document

  await collection.updateOne(
    { stripeSubscriptionId: subscription.id },
    { $set: fields, $setOnInsert: { createdAt } },
    { upsert: true }
  )

  return document
}

/** Returns the vendor's current paid plan, if the period has not lapsed. */
export async function getActiveSubscription(
  email: string
): Promise<VendorSubscription | null> {
  const vendorEmail = normalizeEmail(email)
  if (!vendorEmail) return null

  const now = new Date()

  return subscriptionsCollection().findOne(
    {
      vendorEmail,
      status: "active",
      $or: [
        { currentPeriodEnd: { $exists: false } },
        { currentPeriodEnd: null },
        { currentPeriodEnd: { $gt: now } },
      ],
    },
    { sort: { currentPeriodEnd: -1 } }
  )
}

/** The newest subscription for a vendor, whatever its status. */
export async function getLatestSubscription(
  email: string
): Promise<VendorSubscription | null> {
  const vendorEmail = normalizeEmail(email)
  if (!vendorEmail) return null

  return subscriptionsCollection().findOne(
    { vendorEmail },
    { sort: { updatedAt: -1 } }
  )
}

/**
 * Saves the subscription attached to a completed Checkout Session.
 * Used by both the webhook and the success page (as a fallback).
 */
export async function saveCheckoutSessionSubscription(
  session: Stripe.Checkout.Session
): Promise<VendorSubscription | null> {
  if (session.mode !== "subscription" || !session.subscription) return null

  const subscription =
    typeof session.subscription === "string"
      ? await stripe.subscriptions.retrieve(session.subscription)
      : session.subscription

  return upsertStripeSubscription(subscription, {
    vendorEmail:
      session.metadata?.vendorEmail ||
      session.customer_details?.email ||
      session.customer_email,
    userId: session.metadata?.userId || session.client_reference_id,
    plan: session.metadata?.plan,
  })
}

/** Retrieves a Checkout Session from Stripe and stores its subscription. */
export async function syncCheckoutSession(
  sessionId: string
): Promise<VendorSubscription | null> {
  if (!sessionId) return null

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  })

  if (session.status !== "complete") return null

  return saveCheckoutSessionSubscription(session)
}
