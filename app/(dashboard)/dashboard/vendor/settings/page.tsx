import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { ProfileSettingsForm } from "@/components/dashboard/profile-settings-form"
import { requireDashboardRole } from "@/lib/auth-server"

export const metadata: Metadata = {
  title: "Profile Settings",
}

export default async function VendorSettingsPage() {
  const { session } = await requireDashboardRole("vendor")

  return (
    <DashboardPage
      eyebrow="Vendor Dashboard"
      title="Profile Settings"
      description="Manage your business details, photo and password."
    >
      <ProfileSettingsForm
        role="vendor"
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          phone: session.user.phone,
          city: session.user.city,
          bio: session.user.bio,
          businessName: session.user.businessName,
          website: session.user.website,
          createdAt: session.user.createdAt?.toISOString() ?? null,
        }}
      />
    </DashboardPage>
  )
}
