import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "List Your Business",
}

export default function ListBusinessPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-16">
      <h1 className="font-display text-4xl font-semibold text-brand">
        List Your Business
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Vendor onboarding and listing plans go here.
      </p>
    </main>
  )
}
