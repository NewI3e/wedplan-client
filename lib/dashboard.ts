/**
 * Dashboard roles + route map.
 * Nav labels and icons live next to the sidebar in
 * `app/components/app-sidebar.tsx`; paths live here so pages and
 * redirects share one source of truth.
 */
export type DashboardRole = "admin" | "vendor" | "customer"

export const dashboardPaths = {
  admin: {
    overview: "/dashboard/admin",
    users: "/dashboard/admin/users",
    services: "/dashboard/admin/services",
    transactions: "/dashboard/admin/transactions",
    settings: "/dashboard/admin/settings",
  },
  vendor: {
    overview: "/dashboard/vendor",
    services: "/dashboard/vendor/services",
    newService: "/dashboard/vendor/services/new",
    bookings: "/dashboard/vendor/bookings",
    subscription: "/dashboard/vendor/subscription",
    settings: "/dashboard/vendor/settings",
  },
  customer: {
    overview: "/dashboard/customer",
    bookings: "/dashboard/customer/bookings",
    settings: "/dashboard/customer/settings",
  },
} as const

export const roleMeta: Record<
  DashboardRole,
  {
    /** Shown in the sidebar group label, e.g. "ADMIN DASHBOARD". */
    label: string
    /** Short label used by compact UI such as the avatar fallback. */
    shortLabel: string
    /** Fallbacks while the session/data layer is not wired up. */
    fallbackName: string
    fallbackDescription: string
  }
> = {
  admin: {
    label: "Admin Dashboard",
    shortLabel: "Admin",
    fallbackName: "Admin Desk",
    fallbackDescription: "Administrator",
  },
  vendor: {
    label: "Vendor Dashboard",
    shortLabel: "Vendor",
    fallbackName: "Vendor Studio",
    fallbackDescription: "Vendor account",
  },
  customer: {
    label: "Customer Dashboard",
    shortLabel: "Customer",
    fallbackName: "Customer Account",
    fallbackDescription: "Customer",
  },
}

export function isDashboardRole(value: unknown): value is DashboardRole {
  return value === "admin" || value === "vendor" || value === "customer"
}
