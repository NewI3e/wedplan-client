import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import {
  dashboardPaths,
  isDashboardRole,
  type DashboardRole,
} from "@/lib/dashboard"
import { routes } from "@/lib/routes"

/** Reads the Better Auth session on the server. */
export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() })
}

/** Users created before roles existed (or with a bad value) are customers. */
export function resolveDashboardRole(value: unknown): DashboardRole {
  return isDashboardRole(value) ? value : "customer"
}

/**
 * Guards a dashboard segment.
 * - Signed out → sign-in page.
 * - Wrong role → that user's own dashboard.
 *
 * Call this from every dashboard layout so child pages inherit the check.
 */
export async function requireDashboardRole(role: DashboardRole) {
  const session = await getServerSession()

  if (!session) {
    redirect(routes.signIn)
  }

  const actualRole = resolveDashboardRole(session.user.role)

  if (actualRole !== role) {
    redirect(dashboardPaths[actualRole].overview)
  }

  return { session, role: actualRole }
}
