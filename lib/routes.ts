/**
 * Single source of truth for app routes.
 * Add new pages here and the navbar picks them up automatically.
 */
export const routes = {
  home: "/",
  services: "/services",
  signIn: "/sign-in",
  signUp: "/sign-up",
  forgotPassword: "/forgot-password",
  dashboard: "/dashboard",
  profile: "/profile",
  listBusiness: "/list-your-business",
  terms: "/terms",
  privacy: "/privacy",
} as const

export type NavItem = {
  label: string
  href: string
}

/** Links shown to every visitor (signed in or not). */
export const publicNav: NavItem[] = [
  { label: "Home", href: routes.home },
  { label: "Browse Services", href: routes.services },
]

/** Unauthenticated call-to-action links. */
export const authNav = {
  signIn: { label: "Sign In", href: routes.signIn },
  signUp: { label: "Sign Up", href: routes.signUp },
} satisfies Record<string, NavItem>

/** Links shown inside the profile dropdown / mobile menu once signed in. */
export const accountNav: NavItem[] = [
  { label: "Dashboard", href: routes.dashboard },
  { label: "Profile Settings", href: routes.profile },
]

/** True when `href` is the current page (or a parent of it). */
export function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}
