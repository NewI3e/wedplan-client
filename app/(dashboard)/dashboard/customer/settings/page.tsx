import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { ProfileSettingsForm } from "@/components/dashboard/profile-settings-form"
import { requireDashboardRole } from "@/lib/auth-server"

export const metadata: Metadata = {
  title: "Profile Settings",
}

export default async function CustomerSettingsPage() {
  const { session } = await requireDashboardRole("customer")

  return (
    <DashboardPage
      eyebrow="Customer Dashboard"
      title="Profile Settings"
      description="Manage your account details, photo and password."
    >
      <ProfileSettingsForm
        role="customer"
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          phone: session.user.phone,
          city: session.user.city,
          bio: session.user.bio,
          weddingDate: session.user.weddingDate,
          createdAt: session.user.createdAt?.toISOString() ?? null,
        }}
      />
    </DashboardPage>
  )
}
