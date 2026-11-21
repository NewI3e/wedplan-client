import Link from "next/link"
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react"

import { routes } from "@/lib/routes"

const exploreLinks = [
  { label: "Home", href: routes.home },
  { label: "Browse Services", href: routes.services },
  { label: "Become a Vendor", href: routes.listBusiness },
]

const accountLinks = [
  { label: "Sign In", href: routes.signIn },
  { label: "Create Account", href: routes.signUp },
  { label: "Profile Settings", href: routes.profile },
]

// lucide-react no longer ships brand icons, so these are inline SVG paths.
const socials = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    path: "M13.5 21v-7h2.4l.4-2.8h-2.8V9.4c0-.8.2-1.4 1.4-1.4h1.5V5.5c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2H8v2.8h2.5V21h3Z",
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    path: "M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Zm0 5.9a2.3 2.3 0 1 1 0-4.6 2.3 2.3 0 0 1 0 4.6Zm4.6-6a.84.84 0 1 1-1.7 0 .84.84 0 0 1 1.7 0ZM12 5.5c-1.8 0-2 0-2.7.1-.7 0-1.2.2-1.6.3-.4.2-.8.4-1.1.7-.3.3-.5.7-.7 1.1-.1.4-.3.9-.3 1.6-.1.7-.1.9-.1 2.7s0 2 .1 2.7c0 .7.2 1.2.3 1.6.2.4.4.8.7 1.1.3.3.7.5 1.1.7.4.1.9.3 1.6.3.7.1.9.1 2.7.1s2 0 2.7-.1c.7 0 1.2-.2 1.6-.3.4-.2.8-.4 1.1-.7.3-.3.5-.7.7-1.1.1-.4.3-.9.3-1.6.1-.7.1-.9.1-2.7s0-2-.1-2.7c0-.7-.2-1.2-.3-1.6-.2-.4-.4-.8-.7-1.1-.3-.3-.7-.5-1.1-.7-.4-.1-.9-.3-1.6-.3-.7-.1-.9-.1-2.7-.1Z",
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    path: "M21 8.2s-.2-1.4-.8-2c-.7-.8-1.6-.8-2-.9C15.4 5.1 12 5.1 12 5.1s-3.4 0-6.2.2c-.4.1-1.3.1-2 .9-.6.6-.8 2-.8 2S2.8 9.8 2.8 11.5v1c0 1.7.2 3.3.2 3.3s.2 1.4.8 2c.7.8 1.7.8 2.1.9 1.5.1 5.9.2 5.9.2s3.4 0 6.2-.2c.4-.1 1.3-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.3v-1c0-1.7-.2-3.3-.2-3.3ZM10 14.6V9.4l5.2 2.6-5.2 2.6Z",
  },
]

export function SiteFooter() {
  return (
    <footer className="bg-[#241610] text-[#f5ecdd]">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-8">
          {/* Brand */}
          <div className="max-w-sm">
            <Link
              href={routes.home}
              aria-label="WedPlan home"
              className="group inline-flex items-baseline gap-0.5"
            >
              <span className="font-display text-2xl font-semibold tracking-tight text-[#f8f2e7]">
                WedPlan
              </span>
              <span
                aria-hidden
                className="mb-2.5 text-[0.55rem] text-gold transition-transform duration-300 group-hover:rotate-90"
              >
                ✦
              </span>
            </Link>

            <p className="mt-4 text-sm leading-relaxed text-[#f5ecdd]/55">
              Discover trusted wedding vendors, compare services and request
              bookings — all in one beautifully simple place.
            </p>

            <div className="mt-6 flex items-center gap-2.5">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-full border border-[#f5ecdd]/20 text-[#f5ecdd]/70 transition-colors hover:border-gold/60 hover:text-gold focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:outline-none"
                >
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="size-4 fill-current"
                  >
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <FooterColumn title="Explore">
            {exploreLinks.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          {/* Account */}
          <FooterColumn title="Account">
            {accountLinks.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          {/* Contact */}
          <FooterColumn title="Contact">
            <li>
              <a
                href="mailto:hello@wedplan.com"
                className="flex items-start gap-2.5 text-sm text-[#f5ecdd]/55 transition-colors hover:text-gold"
              >
                <MailIcon
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-gold"
                />
                hello@wedplan.com
              </a>
            </li>
            <li>
              <a
                href="tel:+8801700000000"
                className="flex items-start gap-2.5 text-sm text-[#f5ecdd]/55 transition-colors hover:text-gold"
              >
                <PhoneIcon
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-gold"
                />
                +880 1700 000 000
              </a>
            </li>
            <li className="flex items-start gap-2.5 text-sm text-[#f5ecdd]/55">
              <MapPinIcon
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-gold"
              />
              Gulshan Avenue, Dhaka
            </li>
          </FooterColumn>
        </div>
      </div>

      <div className="border-t border-[#f5ecdd]/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-5 text-center text-xs text-[#f5ecdd]/40 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>© {new Date().getFullYear()} WedPlan. All rights reserved.</p>
          <p>Made with love for every love story.</p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h2 className="text-[0.62rem] font-semibold tracking-[0.28em] text-gold uppercase">
        {title}
      </h2>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  )
}

function FooterLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-[#f5ecdd]/55 transition-colors hover:text-gold focus-visible:text-gold focus-visible:outline-none"
      >
        {children}
      </Link>
    </li>
  )
}
