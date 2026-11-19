"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { EyeIcon, EyeOffIcon, LoaderCircleIcon } from "lucide-react"

import { signIn } from "@/lib/auth-client"
import { routes } from "@/lib/routes"

const inputClasses =
  "h-11 w-full rounded-lg border border-[#d9cfc0] bg-white/70 px-3.5 text-sm text-[#2b2118] outline-none transition-colors placeholder:text-[#2b2118]/35 focus:border-[#7a1f3d] focus:ring-3 focus:ring-[#7a1f3d]/15"

export function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const { error: signInError } = await signIn.email({ email, password })

      if (signInError) {
        setError(
          signInError.message ??
            "We couldn't sign you in. Check your email and password."
        )
        return
      }

      router.push(routes.dashboard)
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGoogleSignIn() {
    setError(null)
    setIsGoogleLoading(true)

    try {
      await signIn.social({
        provider: "google",
        callbackURL: routes.dashboard,
      })
    } catch {
      setError("Google sign-in is unavailable right now.")
      setIsGoogleLoading(false)
    }
  }

  return (
    <div>
      <p className="text-[0.7rem] font-medium tracking-[0.22em] text-[#b08a3e] uppercase">
        Welcome back
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium text-[#2b2118] sm:text-[2.75rem]">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-[#2b2118]/60">
        New to WedPlan?{" "}
        <Link
          href={routes.signUp}
          className="font-medium text-[#7a1f3d] underline-offset-2 hover:underline"
        >
          Create an account
        </Link>
      </p>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
        className="mt-8 flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-[#d9cfc0] bg-white/60 text-sm font-medium text-[#2b2118] transition-colors hover:bg-white focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/15 focus-visible:outline-none disabled:opacity-60"
      >
        {isGoogleLoading ? (
          <LoaderCircleIcon className="size-4 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </button>

      <div className="my-7 flex items-center gap-3">
        <span aria-hidden className="h-px flex-1 bg-[#d9cfc0]" />
        <span className="text-xs text-[#2b2118]/45">or with email</span>
        <span aria-hidden className="h-px flex-1 bg-[#d9cfc0]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        ) : null}

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className={inputClasses}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <Link
              href={routes.forgotPassword}
              className="text-xs text-[#2b2118]/55 underline-offset-2 hover:text-[#7a1f3d] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className={`${inputClasses} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#2b2118]/40 transition-colors hover:text-[#2b2118] focus-visible:text-[#2b2118] focus-visible:outline-none"
            >
              {showPassword ? (
                <EyeOffIcon className="size-4" />
              ) : (
                <EyeIcon className="size-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#7a1f3d] text-sm font-medium text-[#fdf8f0] transition-colors hover:bg-[#671a33] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <LoaderCircleIcon className="size-4 animate-spin" />
          ) : null}
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4 shrink-0">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.87c2.26-2.09 3.55-5.17 3.55-8.87Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.94-2.91l-3.87-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  )
}
