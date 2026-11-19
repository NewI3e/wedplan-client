import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  /**
   * Optional when the client and API share an origin.
   * Set NEXT_PUBLIC_APP_URL when they don't (it must be public to reach the browser).
   */
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
})

export const { signIn, signUp, signOut, useSession } = authClient
