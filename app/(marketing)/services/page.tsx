import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Browse Services",
}

export default function ServicesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-16">
      <h1 className="font-display text-4xl font-semibold text-brand">
        Browse Services
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Vendor listings will live here. Add the search and filter experience in
        this route.
      </p>
    </main>
  )
}
