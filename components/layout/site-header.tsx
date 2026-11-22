"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MenuIcon, XIcon } from "lucide-react"

import { UserMenu } from "@/components/layout/user-menu"
import {
  getDisplayName,
  UserAvatar,
  type SessionUser,
} from "@/components/layout/user-avatar"
import { useSignOut } from "@/hooks/use-sign-out"
import { useSession } from "@/lib/auth-client"
import {
  accountNav,
  authNav,
  isActivePath,
  publicNav,
  routes,
} from "@/lib/routes"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const pathname = usePathname()
  const { data: session, isPending } = useSession()
  const [openOnPath, setOpenOnPath] = React.useState<string | null>(null)
  const mobileOpen = openOnPath === pathname

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-cream/90 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center px-5 sm:h-18">
        <Link
          href={routes.home}
          aria-label="WedPlan home"
          className="group flex shrink-0 items-baseline gap-0.5"
        >
          <span className="font-display text-2xl font-semibold tracking-tight text-brand">
            WedPlan
          </span>
          <span
            aria-hidden
            className="mb-2.5 text-[0.55rem] text-gold transition-transform duration-300 group-hover:rotate-90"
          >
            ✦
          </span>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 md:flex">
          {publicNav.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              active={isActivePath(pathname, item.href)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {/*
            Auth actions live in exactly one place per breakpoint:
            below md they are inside the mobile drawer, at md+ they are here.
          */}
          {isPending ? (
            <div className="hidden items-center gap-2 md:flex">
              <AuthActionsSkeleton />
            </div>
          ) : session ? (
            <div className="hidden md:block">
              <UserMenu user={session.user} />
            </div>
          ) : (
            <div className="hidden items-center gap-1 md:flex">
              <AuthLinks />
            </div>
          )}

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() =>
              setOpenOnPath((current) => (current === pathname ? null : pathname))
            }
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-foreground/80 transition-colors outline-none hover:bg-muted hover:text-brand focus-visible:ring-3 focus-visible:ring-ring/50 md:hidden"
          >
            {mobileOpen ? (
              <XIcon className="size-5" />
            ) : (
              <MenuIcon className="size-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <MobileNav
          pathname={pathname}
          isPending={isPending}
          user={session?.user}
          onNavigate={() => setOpenOnPath(null)}
        />
      ) : null}
    </header>
  )
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "text-sm font-medium transition-colors hover:text-brand",
        active ? "text-brand" : "text-foreground/70"
      )}
    >
      {children}
    </Link>
  )
}

function AuthLinks() {
  return (
    <>
      <Link
        href={authNav.signIn.href}
        className="shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap text-foreground/80 transition-colors hover:text-brand"
      >
        {authNav.signIn.label}
      </Link>
      <Link
        href={authNav.signUp.href}
        className="shrink-0 rounded-full bg-brand px-5 py-2.5 text-sm font-medium whitespace-nowrap text-brand-foreground shadow-sm transition-colors hover:bg-brand/90 focus-visible:ring-3 focus-visible:ring-brand/30 focus-visible:outline-none"
      >
        {authNav.signUp.label}
      </Link>
    </>
  )
}

function AuthActionsSkeleton() {
  return (
    <div aria-hidden className="flex items-center gap-2">
      <div className="h-9 w-16 animate-pulse rounded-full bg-muted" />
      <div className="h-9 w-20 animate-pulse rounded-full bg-muted" />
    </div>
  )
}

function MobileNav({
  pathname,
  isPending,
  user,
  onNavigate,
}: {
  pathname: string
  isPending: boolean
  user?: SessionUser
  onNavigate: () => void
}) {
  const { signOut, isPending: isSigningOut } = useSignOut()

  return (
    <div
      id="mobile-nav"
      className="border-t border-border/60 bg-cream md:hidden"
    >
      <nav className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-5 py-4">
        {publicNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
            onClick={onNavigate}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActivePath(pathname, item.href)
                ? "bg-brand/10 text-brand"
                : "text-foreground/80 hover:bg-muted"
            )}
          >
            {item.label}
          </Link>
        ))}

        <div className="my-2 h-px bg-border" />

        {isPending ? (
          <div className="px-3 py-2">
            <div className="h-9 w-40 animate-pulse rounded-full bg-muted" />
          </div>
        ) : user ? (
          <>
            <div className="flex items-center gap-3 px-3 py-2">
              <UserAvatar user={user} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {getDisplayName(user)}
                </p>
                {user.email ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                ) : null}
              </div>
            </div>

            {accountNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActivePath(pathname, item.href)
                    ? "bg-brand/10 text-brand"
                    : "text-foreground/80 hover:bg-muted"
                )}
              >
                {item.label}
              </Link>
            ))}

            <button
              type="button"
              disabled={isSigningOut}
              onClick={() => {
                onNavigate()
                void signOut()
              }}
              className="rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
            >
              Logout
            </button>
          </>
        ) : (
          <div className="flex flex-col gap-2 px-1 pt-1">
            <Link
              href={authNav.signIn.href}
              onClick={onNavigate}
              className="rounded-full px-4 py-2.5 text-center text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-brand"
            >
              {authNav.signIn.label}
            </Link>
            <Link
              href={authNav.signUp.href}
              onClick={onNavigate}
              className="rounded-full bg-brand px-5 py-2.5 text-center text-sm font-medium text-brand-foreground shadow-sm transition-colors hover:bg-brand/90"
            >
              {authNav.signUp.label}
            </Link>
          </div>
        )}
      </nav>
    </div>
  )
}
