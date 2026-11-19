"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { signOut } from "@/lib/auth-client"
import { routes } from "@/lib/routes"

/**
 * Signs the user out, clears cached server components and returns home.
 * Better Auth updates its session store, so the navbar re-renders immediately.
 */
export function useSignOut() {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)

  const handleSignOut = React.useCallback(async () => {
    setIsPending(true)

    try {
      await signOut()
      router.push(routes.home)
      router.refresh()
    } finally {
      setIsPending(false)
    }
  }, [router])

  return { signOut: handleSignOut, isPending }
}
