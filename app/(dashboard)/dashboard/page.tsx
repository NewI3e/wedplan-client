import { redirect } from "next/navigation"

import { getServerSession, resolveDashboardRole } from "@/lib/auth-server"
import { dashboardPaths } from "@/lib/dashboard"
import { routes } from "@/lib/routes"

/**
 * Role-based entry point: the sidebars/pages are picked from the signed-in
 * user's role instead of the URL.
 */
export default async function DashboardIndexPage() {
  const session = await getServerSession()

  if (!session) {
    redirect(routes.signIn)
  }

  const role = resolveDashboardRole(session.user.role)

  redirect(dashboardPaths[role].overview)
}
