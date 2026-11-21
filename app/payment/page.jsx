
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Crown,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PaymentPage() {
  const features = [
    "Unlimited service listings",
    "Premium vendor profile badge",
    "Priority visibility in search results",
    "Featured promotional benefits",
    "Advanced booking management",
  ];

  return (
    <main className="min-h-screen bg-[#faf9f6] px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-10">
          <Link
            href="/dashboard/vendor/subscription"
            className="mb-7 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to subscription
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#f2dfb9]">
              <Crown className="size-6 text-[#8b641f]" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Complete your upgrade
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Upgrade your vendor account to WedPlan Premium.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* Left: Payment */}
          <div className="space-y-6">

            <Card className="rounded-2xl border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  Payment method
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  You will complete your payment securely through Stripe.
                </p>
              </CardHeader>

              <CardContent>
                <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-white shadow-sm">
                    <LockKeyhole className="size-5 text-[#635bff]" />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-semibold">
                      Stripe Secure Checkout
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Secure card payment powered by Stripe
                    </p>
                  </div>

                  <ShieldCheck className="size-5 text-emerald-600" />
                </div>

                <div className="mt-6 space-y-3">
                  <p className="text-sm font-semibold">
                    What happens next?
                  </p>

                  <div className="space-y-4">
                    {[
                      "Continue to Stripe's secure checkout.",
                      "Enter your payment details.",
                      "Complete your Premium subscription.",
                    ].map((step, index) => (
                      <div key={step} className="flex items-center gap-3">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#f2dfb9]/60 text-xs font-semibold text-[#8b641f]">
                          {index + 1}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-emerald-900">
                  Your payment is protected
                </p>
                <p className="mt-1 text-xs leading-relaxed text-emerald-800/80">
                  Your payment details are handled by Stripe.
                  WedPlan does not store your card information.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div>
            <Card className="overflow-hidden rounded-2xl border shadow-sm">
              <div className="bg-[#28251f] p-6 text-white">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-white/70">
                    Your selected plan
                  </span>
                  <span className="rounded-full bg-[#f2dfb9] px-3 py-1 text-xs font-semibold text-[#6b4a17]">
                    PREMIUM
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-white/10">
                    <Crown className="size-7 text-[#f2dfb9]" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">
                      WedPlan Premium
                    </h2>
                    <p className="text-sm text-white/60">
                      For growing wedding vendors
                    </p>
                  </div>
                </div>

                <div className="mt-7 flex items-end gap-2">
                  <span className="text-4xl font-bold">$9.99</span>
                  <span className="pb-1 text-sm text-white/60">
                    / month
                  </span>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Sparkles className="size-4 text-[#b58a3c]" />
                  <h3 className="text-sm font-semibold">
                    Premium benefits
                  </h3>
                </div>

                <div className="space-y-4">
                  {features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                        <Check className="size-3 text-emerald-700" />
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Subtotal
                    </span>
                    <span className="font-medium">$9.99</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Tax
                    </span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>
                </div>

                <Separator className="my-5" />

                <div className="mb-6 flex items-center justify-between">
                  <span className="font-semibold">Total per month</span>
                  <span className="text-2xl font-bold">$9.99</span>
                </div>

                {/* Stripe Checkout */}
                <form action="/api/stripe/checkout" method="POST">
                  <Button
                    type="submit"
                    className="h-12 w-full rounded-full bg-[#d8b875] font-semibold text-[#3d2c10] hover:bg-[#cba65d]"
                  >
                    Continue to secure checkout
                  </Button>
                </form>

                <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
                  By continuing, you agree to our Terms of Service
                  and Subscription Policy.
                </p>
              </CardContent>
            </Card>

            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <LockKeyhole className="size-3.5" />
              Secure checkout powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
