import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon, SearchIcon, SparkleIcon } from "lucide-react"

import { dashboardPaths } from "@/lib/dashboard"
import { routes } from "@/lib/routes"

export function Hero({ isVendor = false }: { isVendor?: boolean }) {
  const listBusinessHref = isVendor
    ? dashboardPaths.vendor.overview
    : routes.signUp

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-[calc(100svh-4rem)] w-full items-center overflow-hidden sm:min-h-[calc(100svh-4.5rem)]"
    >
      <Image
        src="/images/hero-wedding.jpg"
        alt="A flower-covered wedding arch overlooking the sea at sunset"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[62%_center] motion-safe:animate-hero-zoom sm:object-center"
      />

      {/* Darker overall on phones (the crop is tighter); left-to-right at sm+. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/35 sm:bg-gradient-to-r sm:from-black/80 sm:via-black/45 sm:to-black/10"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10"
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 py-14 sm:py-20 lg:py-24">
        <div className="max-w-3xl">
          <p
            className="flex items-center gap-2 text-[0.65rem] font-medium tracking-[0.16em] text-gold uppercase motion-safe:animate-hero-rise sm:text-xs sm:tracking-[0.22em]"
            style={{ animationDelay: "60ms" }}
          >
            <SparkleIcon
              aria-hidden
              className="size-3.5 shrink-0 motion-safe:animate-hero-sparkle"
            />
            1,200+ Trusted Wedding Vendors
          </p>

          <h1
            id="hero-heading"
            className="mt-6 font-display text-[clamp(1.8rem,9vw,2.25rem)] leading-[1.06] font-medium text-[#f8f2e7] sm:text-6xl lg:text-7xl"
          >
            <span
              className="block motion-safe:animate-hero-rise"
              style={{ animationDelay: "150ms" }}
            >
              Every detail of your
            </span>
            <span
              className="block motion-safe:animate-hero-rise"
              style={{ animationDelay: "250ms" }}
            >
              <em className="font-normal text-gold italic">forever,</em>{" "}
              beautifully
            </span>
            <span
              className="block motion-safe:animate-hero-rise"
              style={{ animationDelay: "350ms" }}
            >
              planned.
            </span>
          </h1>

          <p
            className="mt-6 max-w-xl text-base leading-relaxed text-white/80 motion-safe:animate-hero-rise sm:text-lg"
            style={{ animationDelay: "460ms" }}
          >
            Discover photographers, venues, florists and stylists — compare them
            side by side and request bookings in minutes.
          </p>

          <div
            className="mt-8 flex flex-col gap-3 motion-safe:animate-hero-rise sm:mt-10 sm:flex-row sm:items-center"
            style={{ animationDelay: "570ms" }}
          >
            <Link
              href={routes.services}
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand px-7 text-sm font-medium text-brand-foreground shadow-lg shadow-black/25 transition-[background-color,transform] hover:bg-brand/90 focus-visible:ring-3 focus-visible:ring-white/40 focus-visible:outline-none motion-safe:hover:-translate-y-0.5"
            >
              Explore Wedding Services
              <ArrowRightIcon
                aria-hidden
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href={listBusinessHref}
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/45 px-7 text-sm font-medium text-white/90 backdrop-blur-sm transition-[background-color,border-color,transform] hover:border-white/70 hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-white/40 focus-visible:outline-none motion-safe:hover:-translate-y-0.5"
            >
              List your business
            </Link>
          </div>

          <form
            action={routes.services}
            role="search"
            aria-label="Search wedding services"
            className="mt-10 flex w-full max-w-2xl items-center gap-2 rounded-full bg-[#f9f4ea]/95 p-1.5 pl-4 shadow-xl shadow-black/20 backdrop-blur transition-shadow focus-within:shadow-2xl motion-safe:animate-hero-rise sm:mt-14 sm:p-2 sm:pl-5"
            style={{ animationDelay: "680ms" }}
          >
            <SearchIcon
              aria-hidden
              className="size-4 shrink-0 text-[#5c5145]"
            />
            <label htmlFor="hero-search" className="sr-only">
              Search photographers, venues and more
            </label>
            <input
              id="hero-search"
              name="q"
              type="search"
              autoComplete="off"
              placeholder="Search photographers, venues, décor..."
              className="h-9 min-w-0 flex-1 bg-transparent text-sm text-[#241f19] outline-none placeholder:text-[#5c5145]/70 sm:h-10 sm:text-base"
            />
            <button
              type="submit"
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-brand px-4 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand/90 focus-visible:ring-3 focus-visible:ring-brand/30 focus-visible:outline-none sm:h-10 sm:px-5"
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
