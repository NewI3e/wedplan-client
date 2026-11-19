import type { Metadata } from "next"

import { AuthShell } from "@/components/auth/auth-shell"
import { SignUpForm } from "@/components/auth/sign-up-form"

export const metadata: Metadata = {
  title: "Create Account",
}

export default function SignUpPage() {
  return (
    <AuthShell
      imageSrc="/images/cat-decor.jpg"
      imageAlt="A blush floral centerpiece with taper candles on a wedding table"
      quote="Bring your vision to life with vendors who care."
    >
      <SignUpForm />
    </AuthShell>
  )
}
