import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard/dashboard-page"

export const metadata: Metadata = {
  title: "Transactions",
}

export default function AdminTransactionsPage() {
  return <DashboardPage eyebrow="Admin Dashboard" title="Transactions" />
}
