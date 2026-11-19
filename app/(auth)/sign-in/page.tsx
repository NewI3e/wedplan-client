import type { Metadata } from "next"

import { AuthShell } from "@/components/auth/auth-shell"
import { SignInForm } from "@/components/auth/sign-in-form"

export const metadata: Metadata = {
  title: "Sign In",
}

export default function SignInPage() {
  return (
    <AuthShell
      imageSrc="/images/cat-venue.jpg"
      imageAlt="A candlelit wedding reception in a grand ballroom"
      quote="The best love stories start with a little planning."
    >
      <SignInForm />
    </AuthShell>
  )
}
