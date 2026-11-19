import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
}

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-16">
      <h1 className="font-display text-4xl font-semibold text-brand">
        Terms of Service
      </h1>
      <p className="mt-3 text-muted-foreground">
        The full terms for using WedPlan will live here.
      </p>
    </main>
  )
}
