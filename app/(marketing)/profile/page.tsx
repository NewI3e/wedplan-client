import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Profile Settings",
}

export default function ProfilePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-16">
      <h1 className="font-display text-4xl font-semibold text-brand">
        Profile Settings
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Account details, avatar and password management go here.
      </p>
    </main>
  )
}
