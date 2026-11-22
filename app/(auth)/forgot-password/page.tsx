import type { Metadata } from "next"
import Link from "next/link"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { AuthShell } from "@/components/auth/auth-shell"
import { routes } from "@/lib/routes"

export const metadata: Metadata = {
  title: "Forgot Password",
}

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      imageSrc="/images/cat-venue.jpg"
      imageAlt="A candlelit wedding reception in a grand ballroom"
      quote="The best love stories start with a little planning."
    >
      <div>
        <p className="text-[0.7rem] font-medium tracking-[0.22em] text-[#b08a3e] uppercase">
          Reset access
        </p>
        <h1 className="mt-2 font-display text-4xl font-medium text-[#2b2118] sm:text-[2.75rem]">
          Forgot password?
        </h1>
        <p className="mt-2 text-sm text-[#2b2118]/60">
          Enter your email and we&apos;ll send you a link to reset it.
        </p>

        <ForgotPasswordForm />

        <Link
          href={routes.signIn}
          className="mt-6 inline-flex text-sm font-medium text-[#7a1f3d] underline-offset-2 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  )
}
