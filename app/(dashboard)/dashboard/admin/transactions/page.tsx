import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard/dashboard-page"
import {
  AdminTransactionsPanel,
  ExportTransactionsButton,
} from "@/components/dashboard/admin/admin-transactions"
import { getAdminTransactions } from "@/lib/admin-transactions"

export const metadata: Metadata = {
  title: "Transactions",
}

export default async function AdminTransactionsPage() {
  const { transactions, error } = await getAdminTransactions()

  return (
    <DashboardPage
      eyebrow="Admin Dashboard"
      title="Transactions"
      description="Premium subscription payments made through Stripe Checkout."
      action={<ExportTransactionsButton transactions={transactions} />}
    >
      <AdminTransactionsPanel transactions={transactions} error={error} />
    </DashboardPage>
  )
}
