import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-16">
      <h1 className="font-display text-4xl font-semibold text-brand">
        Privacy Policy
      </h1>
      <p className="mt-3 text-muted-foreground">
        How WedPlan handles your data will be explained here.
      </p>
    </main>
  )
}
