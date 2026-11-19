import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In",
}

export default function SignInPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-16">
      <h1 className="font-display text-4xl font-semibold text-brand">
        Sign In
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Drop your sign-in form here and call{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
          signIn.email()
        </code>{" "}
        from <code className="text-sm">@/lib/auth-client</code>.
      </p>
    </main>
  )
}
