"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  HeartIcon,
  ImagePlusIcon,
  LoaderCircleIcon,
  StoreIcon,
  XIcon,
} from "lucide-react"

import { signIn, signUp } from "@/lib/auth-client"
import { routes } from "@/lib/routes"

type Role = "customer" | "vendor"

const inputClasses =
  "h-11 w-full rounded-lg border border-[#d9cfc0] bg-white/70 px-3.5 text-sm text-[#2b2118] outline-none transition-colors placeholder:text-[#2b2118]/35 focus:border-[#7a1f3d] focus:ring-3 focus:ring-[#7a1f3d]/15"

const roles: {
  value: Role
  title: string
  description: string
  icon: typeof HeartIcon
}[] = [
  {
    value: "customer",
    title: "I'm planning",
    description: "Find and book trusted vendors",
    icon: HeartIcon,
  },
  {
    value: "vendor",
    title: "I'm a vendor",
    description: "Grow your wedding business",
    icon: StoreIcon,
  },
]

const MAX_PHOTO_BYTES = 4 * 1024 * 1024

export function SignUpForm() {
  const router = useRouter()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const objectUrlRef = React.useRef<string | null>(null)

  const [role, setRole] = React.useState<Role>("customer")
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(null)
  const [photoError, setPhotoError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  const passwordChecks = [
    { label: "At least 6 characters", met: password.length >= 6 },
    { label: "One number or symbol", met: /[0-9\W_]/.test(password) },
  ]
  const passwordValid = passwordChecks.every((check) => check.met)

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose an image file.")
      return
    }

    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("Please choose an image under 4 MB.")
      return
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(file)
    objectUrlRef.current = url
    setPhotoUrl(url)
    setPhotoError(null)
  }

  function removePhoto() {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    objectUrlRef.current = null
    setPhotoUrl(null)
    setPhotoError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!passwordValid) {
      setError(
        "Please use at least 6 characters with one number or symbol in your password."
      )
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      }

      const { error: signUpError } = await signUp.email(payload)

      if (signUpError) {
        setError(
          signUpError.message ??
            "We couldn't create your account. Please try again."
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

  async function handleGoogleSignUp() {
    setError(null)
    setIsGoogleLoading(true)

    try {
      await signIn.social({
        provider: "google",
        callbackURL: routes.dashboard,
      })
    } catch {
      setError("Google sign-up is unavailable right now.")
      setIsGoogleLoading(false)
    }
  }

  return (
    <div>
      <p className="text-[0.7rem] font-medium tracking-[0.22em] text-[#b08a3e] uppercase">
        Join WedPlan
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium text-[#2b2118] sm:text-[2.75rem]">
        Create account
      </h1>
      <p className="mt-2 text-sm text-[#2b2118]/60">
        Already have an account?{" "}
        <Link
          href={routes.signIn}
          className="font-medium text-[#7a1f3d] underline-offset-2 hover:underline"
        >
          Sign in
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        ) : null}

        <fieldset>
          <legend className="mb-2 text-sm font-medium">
            How will you use WedPlan?
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {roles.map((option) => {
              const Icon = option.icon
              const selected = role === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setRole(option.value)}
                  className={`relative flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-colors focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/15 focus-visible:outline-none ${
                    selected
                      ? "border-[#7a1f3d] bg-[#7a1f3d]/[0.06]"
                      : "border-[#d9cfc0] bg-white/50 hover:border-[#7a1f3d]/40 hover:bg-white/80"
                  }`}
                >
                  <span
                    className={`flex size-8 items-center justify-center rounded-lg ${
                      selected
                        ? "bg-[#7a1f3d] text-[#fdf8f0]"
                        : "bg-[#e8dfd1] text-[#7a1f3d]"
                    }`}
                  >
                    <Icon aria-hidden className="size-4" />
                  </span>
                  <span className="block">
                    <span className="block text-sm font-medium">
                      {option.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-[#2b2118]/55">
                      {option.description}
                    </span>
                  </span>
                  {selected ? (
                    <span className="absolute top-2.5 right-2.5 flex size-4 items-center justify-center rounded-full bg-[#7a1f3d] text-[#fdf8f0]">
                      <CheckIcon aria-hidden className="size-2.5" />
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </fieldset>

        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <span className="flex size-14 items-center justify-center overflow-hidden rounded-full border border-dashed border-[#c9bcaa] bg-white/60 text-[#2b2118]/45">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt="Your profile photo preview"
                  className="size-full object-cover"
                />
              ) : (
                <ImagePlusIcon aria-hidden className="size-5" />
              )}
            </span>
            {photoUrl ? (
              <button
                type="button"
                onClick={removePhoto}
                aria-label="Remove profile photo"
                className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[#2b2118] text-[#f8f4ec] transition-colors hover:bg-[#7a1f3d] focus-visible:ring-2 focus-visible:ring-[#7a1f3d]/40 focus-visible:outline-none"
              >
                <XIcon aria-hidden className="size-3" />
              </button>
            ) : null}
          </div>

          <div className="min-w-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-medium text-[#7a1f3d] underline-offset-2 hover:underline focus-visible:outline-none"
            >
              {photoUrl ? "Change photo" : "Add a profile photo"}
            </button>
            <p className="mt-0.5 text-xs text-[#2b2118]/50">
              Optional. JPG or PNG, up to 4 MB.
            </p>
            {photoError ? (
              <p className="mt-0.5 text-xs text-red-600">{photoError}</p>
            ) : null}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handlePhotoChange}
            className="sr-only"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-sm font-medium">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Amara Okafor"
            className={inputClasses}
          />
        </div>

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
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
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

          <ul className="flex flex-wrap gap-x-4 gap-y-1 pt-0.5">
            {passwordChecks.map((check) => (
              <li
                key={check.label}
                className={`flex items-center gap-1.5 text-xs transition-colors ${
                  check.met ? "text-[#3f7a52]" : "text-[#2b2118]/45"
                }`}
              >
                <span
                  className={`flex size-3.5 items-center justify-center rounded-full border ${
                    check.met
                      ? "border-[#3f7a52] bg-[#3f7a52] text-white"
                      : "border-[#c9bcaa]"
                  }`}
                >
                  {check.met ? (
                    <CheckIcon aria-hidden className="size-2" />
                  ) : null}
                </span>
                {check.label}
              </li>
            ))}
          </ul>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#7a1f3d] text-sm font-medium text-[#fdf8f0] transition-colors hover:bg-[#671a33] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <LoaderCircleIcon className="size-4 animate-spin" />
          ) : null}
          {isSubmitting
            ? "Creating account..."
            : role === "vendor"
              ? "Create vendor account"
              : "Create customer account"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span aria-hidden className="h-px flex-1 bg-[#d9cfc0]" />
        <span className="text-xs text-[#2b2118]/45">or</span>
        <span aria-hidden className="h-px flex-1 bg-[#d9cfc0]" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={isGoogleLoading}
        className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-[#d9cfc0] bg-white/60 text-sm font-medium text-[#2b2118] transition-colors hover:bg-white focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/15 focus-visible:outline-none disabled:opacity-60"
      >
        {isGoogleLoading ? (
          <LoaderCircleIcon className="size-4 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        Sign up with Google
      </button>

      <p className="mt-6 text-center text-xs leading-relaxed text-[#2b2118]/45">
        By creating an account you agree to our{" "}
        <Link
          href={routes.terms}
          className="underline underline-offset-2 hover:text-[#7a1f3d]"
        >
          Terms
        </Link>{" "}
        and{" "}
        <Link
          href={routes.privacy}
          className="underline underline-offset-2 hover:text-[#7a1f3d]"
        >
          Privacy Policy
        </Link>
        .
      </p>
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
