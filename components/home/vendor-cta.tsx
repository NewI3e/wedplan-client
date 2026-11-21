import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Reveal } from "@/components/home/reveal"
import { routes } from "@/lib/routes"

export function VendorCta() {
  return (
    <section className="bg-[#fdfaf5] px-5 pb-16 sm:pb-20 lg:pb-24">
      <Reveal className="mx-auto w-full max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6e1c38] via-[#7a1f3d] to-[#8f2547] px-6 py-14 text-center shadow-[0_24px_60px_rgba(90,24,48,0.28)] sm:px-10 sm:py-16 lg:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-20 size-64 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-16 size-64 rounded-full bg-[#e2b96b]/20 blur-3xl"
          />

          <div className="relative mx-auto max-w-2xl">
            <p className="text-[0.62rem] font-medium tracking-[0.3em] text-[#f0d9a8] uppercase">
              For wedding professionals
            </p>

            <h2 className="mt-4 font-display text-[clamp(1.9rem,4.5vw,3rem)] leading-[1.12] font-medium text-[#fdf8f0]">
              Grow your wedding business with WedPlan
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[#f6e3dd]/80 sm:text-base">
              Publish services for free, then go Premium for unlimited listings
              and a gold vendor badge.
            </p>

            <Link
              href={routes.signUp}
              className="group mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#f0d9a8] px-7 text-sm font-medium text-[#4a2418] transition-colors hover:bg-[#e8cb8f] focus-visible:ring-3 focus-visible:ring-white/40 focus-visible:outline-none"
            >
              Join as a vendor
              <ArrowRightIcon
                aria-hidden
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
