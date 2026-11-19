import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-16">
      <h1 className="font-display text-4xl font-semibold text-brand">
        Dashboard
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        The signed-in landing page.
      </p>
    </main>
  )
}
