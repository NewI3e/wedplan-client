import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { AdminUsersPanel } from "@/components/dashboard/admin/admin-users"
import { getAdminUsers } from "@/lib/admin-users"

export const metadata: Metadata = {
  title: "Manage Users",
}

export default async function AdminUsersPage() {
  const { users, error } = await getAdminUsers()

  return (
    <DashboardPage
      eyebrow="Admin Dashboard"
      title="Manage Users"
      description="Change account types or block anyone who breaks the rules. Admin accounts are protected."
    >
      <AdminUsersPanel users={users} error={error} />
    </DashboardPage>
  )
}
