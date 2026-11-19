import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up",
}

export default function SignUpPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-16">
      <h1 className="font-display text-4xl font-semibold text-brand">
        Sign Up
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Drop your registration form here and call{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
          signUp.email()
        </code>{" "}
        from <code className="text-sm">@/lib/auth-client</code>.
      </p>
    </main>
  )
}
