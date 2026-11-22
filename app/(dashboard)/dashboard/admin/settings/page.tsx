import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { AdminAccountSettings } from "@/components/dashboard/admin/admin-account-settings"
import { requireDashboardRole } from "@/lib/auth-server"

export const metadata: Metadata = {
  title: "Profile Settings",
}

export default async function AdminSettingsPage() {
  const { session } = await requireDashboardRole("admin")

  return (
    <DashboardPage
      eyebrow="Admin Dashboard"
      title="Profile Settings"
      description="Change the email and password you use to sign in to the admin dashboard."
    >
      <AdminAccountSettings email={session.user.email} />
    </DashboardPage>
  )
}
