import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { getServerSession, resolveDashboardRole } from "@/lib/auth-server"
import { dashboardPaths } from "@/lib/dashboard"
import { routes } from "@/lib/routes"

export const metadata: Metadata = {
  title: "Profile Settings",
}

/**
 * The header account menu points here. Send each role to the settings page
 * inside their own dashboard so there is a single settings UI per role.
 */
export default async function ProfilePage() {
  const session = await getServerSession()

  if (!session) {
    redirect(routes.signIn)
  }

  const role = resolveDashboardRole(session.user.role)
  redirect(dashboardPaths[role].settings)
}
