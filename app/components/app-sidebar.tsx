"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3Icon,
  BriefcaseIcon,
  CalendarCheckIcon,
  CreditCardIcon,
  CrownIcon,
  HomeIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  PlusCircleIcon,
  SettingsIcon,
  StoreIcon,
  UsersIcon,
  XIcon,
} from "lucide-react"

import { getDisplayName, UserAvatar } from "@/components/layout/user-avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { useSignOut } from "@/hooks/use-sign-out"
import { useSession } from "@/lib/auth-client"
import { dashboardPaths, roleMeta, type DashboardRole } from "@/lib/dashboard"
import { routes } from "@/lib/routes"

type NavItem = {
  label: string
  href: string
  icon: typeof LayoutDashboardIcon
}

const navByRole: Record<DashboardRole, NavItem[]> = {
  admin: [
    {
      label: "Overview",
      href: dashboardPaths.admin.overview,
      icon: BarChart3Icon,
    },
    {
      label: "Manage Users",
      href: dashboardPaths.admin.users,
      icon: UsersIcon,
    },
    {
      label: "Manage Services",
      href: dashboardPaths.admin.services,
      icon: BriefcaseIcon,
    },
    {
      label: "Transactions",
      href: dashboardPaths.admin.transactions,
      icon: CreditCardIcon,
    },
    {
      label: "Profile Settings",
      href: dashboardPaths.admin.settings,
      icon: SettingsIcon,
    },
  ],
  vendor: [
    {
      label: "Overview",
      href: dashboardPaths.vendor.overview,
      icon: BarChart3Icon,
    },
    {
      label: "My Services",
      href: dashboardPaths.vendor.services,
      icon: LayoutDashboardIcon,
    },
    {
      label: "Add Service",
      href: dashboardPaths.vendor.newService,
      icon: PlusCircleIcon,
    },
    {
      label: "Booking Requests",
      href: dashboardPaths.vendor.bookings,
      icon: CalendarCheckIcon,
    },
    {
      label: "Subscription",
      href: dashboardPaths.vendor.subscription,
      icon: CreditCardIcon,
    },
    {
      label: "Profile Settings",
      href: dashboardPaths.vendor.settings,
      icon: SettingsIcon,
    },
  ],
  customer: [
    {
      label: "Overview",
      href: dashboardPaths.customer.overview,
      icon: BarChart3Icon,
    },
    {
      label: "My Bookings",
      href: dashboardPaths.customer.bookings,
      icon: CalendarCheckIcon,
    },
    {
      label: "Profile Settings",
      href: dashboardPaths.customer.settings,
      icon: SettingsIcon,
    },
  ],
}

/** Picks the most specific matching nav item so nested routes highlight once. */
function useActiveHref(navItems: NavItem[]) {
  const pathname = usePathname()

  return React.useMemo(() => {
    const matches = navItems
      .map((item) => item.href)
      .filter((href) => pathname === href || pathname.startsWith(`${href}/`))

    return matches.sort((a, b) => b.length - a.length)[0] ?? null
  }, [navItems, pathname])
}

export function DashboardSidebar({ role }: { role: DashboardRole }) {
  const navItems = navByRole[role]
  const activeHref = useActiveHref(navItems)

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-[#e8decd]!"
    >
      <SidebarHeader className="h-[5.5rem] shrink-0 flex-row items-center justify-between px-6">
        <Link
          href={routes.home}
          aria-label="WedPlan home"
          className="flex w-fit items-baseline gap-0.5"
        >
          <span className="font-display text-2xl font-semibold tracking-tight text-[#7a1f3d]">
            WedPlan
          </span>
          <span aria-hidden className="mb-2.5 text-[0.55rem] text-gold">
            ✦
          </span>
        </Link>

        <MobileMenuClose />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-3 pt-2">
          <SidebarGroupLabel className="mb-1 h-auto px-3 text-[0.62rem] font-medium tracking-[0.22em] text-[#a98a4b] uppercase">
            {roleMeta[role].label}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = item.href === activeHref

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      aria-current={active ? "page" : undefined}
                      tooltip={item.label}
                      className="h-11! gap-3 rounded-lg px-4 text-sm font-medium text-[#2b2118]/70 transition-colors hover:bg-[#efe6d6] hover:text-[#2b2118] data-active:bg-[#7a1f3d] data-active:text-[#f8f2e7] data-active:shadow-sm data-active:hover:bg-[#7a1f3d] data-active:hover:text-[#f8f2e7]"
                    >
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-2 px-3">
          <SidebarSeparator className="mx-3 mb-3 bg-[#e8decd]" />

          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href={routes.home} />}
                  className="h-10! gap-3 rounded-lg px-4 text-[0.8rem] text-[#2b2118]/55 transition-colors hover:bg-[#efe6d6] hover:text-[#2b2118]"
                >
                  <HomeIcon className="size-4" />
                  <span>Back to site</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href={routes.services} />}
                  className="h-10! gap-3 rounded-lg px-4 text-[0.8rem] text-[#2b2118]/55 transition-colors hover:bg-[#efe6d6] hover:text-[#2b2118]"
                >
                  <StoreIcon className="size-4" />
                  <span>Browse services</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-3 p-4">
        {role === "vendor" ? <PremiumCard /> : null}

        <AccountCard role={role} />
      </SidebarFooter>
    </Sidebar>
  )
}

function MobileMenuClose() {
  const { setOpenMobile } = useSidebar()

  return (
    <button
      type="button"
      onClick={() => setOpenMobile(false)}
      aria-label="Close dashboard menu"
      className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#2b2118]/50 transition-colors hover:bg-[#efe6d6] hover:text-[#2b2118] focus-visible:ring-2 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none md:hidden"
    >
      <XIcon className="size-4" />
    </button>
  )
}

function AccountCard({ role }: { role: DashboardRole }) {
  const { data: session } = useSession()
  const { signOut, isPending } = useSignOut()
  const user = session?.user

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#e8decd] bg-white/85 px-3 py-2.5 shadow-sm">
      {user ? (
        <UserAvatar user={user} className="size-9 shrink-0" />
      ) : (
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#efe6d6] font-display text-sm text-[#7a1f3d]"
        >
          {roleMeta[role].shortLabel.slice(0, 1)}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#2b2118]">
          {user ? getDisplayName(user) : roleMeta[role].fallbackName}
        </p>
        <p className="truncate text-xs text-[#2b2118]/50">
          {user?.email ?? roleMeta[role].fallbackDescription}
        </p>
      </div>

      <button
        type="button"
        onClick={() => void signOut()}
        disabled={isPending}
        aria-label="Sign out"
        title="Sign out"
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-[#2b2118]/45 transition-colors hover:bg-[#efe6d6] hover:text-[#7a1f3d] focus-visible:ring-2 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none disabled:opacity-50"
      >
        <LogOutIcon className="size-4" />
      </button>
    </div>
  )
}

function PremiumCard() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#7a1f3d] to-[#5c1730] p-4 text-[#f8f2e7] shadow-sm">
      <CrownIcon aria-hidden className="size-4 text-gold" />
      <p className="mt-2 font-display text-lg leading-tight">Go Premium</p>
      <p className="mt-1 text-[0.7rem] leading-snug text-[#f8f2e7]/70">
        Unlimited services &amp; a gold badge.
      </p>
      <Link
        href={dashboardPaths.vendor.subscription}
        className="mt-3 flex h-8 items-center justify-center rounded-md bg-gold text-xs font-medium text-[#2b2118] transition-colors hover:bg-gold/90 focus-visible:ring-2 focus-visible:ring-[#f8f2e7]/60 focus-visible:outline-none"
      >
        Upgrade
      </Link>
    </div>
  )
}
