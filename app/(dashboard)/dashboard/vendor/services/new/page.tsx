import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { AddServiceForm } from "@/components/dashboard/vendor/add-service-form"

export const metadata: Metadata = {
  title: "Add a Service",
}

export default function VendorAddServicePage() {
  
  
  return (
    <DashboardPage
      eyebrow="Vendor Dashboard"
      title="Add a Service"
      description="New services are reviewed by our team before customers can see them."
    >
      <AddServiceForm />
    </DashboardPage>
    
  )
}
