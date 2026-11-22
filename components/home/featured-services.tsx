"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRightIcon, MapPinIcon, StarIcon, StoreIcon } from "lucide-react"

import { Reveal } from "@/components/home/reveal"
import { SectionHeading } from "@/components/home/section-heading"
import { useSession } from "@/lib/auth-client"
import type { HomeService } from "@/lib/home-data"
import { routes } from "@/lib/routes"

export function FeaturedServices({ services }: { services: HomeService[] }) {
  return (
    <section
      aria-labelledby="featured-services-heading"
      className="bg-[#fdfaf5] px-5 py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <SectionHeading
            eyebrow="Handpicked for you"
            title={
              <span id="featured-services-heading">
                Featured Wedding Services
              </span>
            }
            description="Approved, top-rated vendors couples are booking this season."
          />
        </Reveal>

        {services.length > 0 ? (
          <>
            <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <Reveal key={service.id || index} delay={index * 0.05}>
                  <ServiceCard service={service} />
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-10 flex justify-center">
              <Link
                href={routes.services}
                className="group inline-flex h-11 items-center gap-2 rounded-full border border-[#d9c7a4] bg-white px-6 text-sm font-medium text-[#7a1f3d] shadow-sm transition-colors hover:border-[#7a1f3d]/50 hover:bg-[#fdf8f0] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/20 focus-visible:outline-none"
              >
                View all services
                <ArrowRightIcon
                  aria-hidden
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </Reveal>
          </>
        ) : (
          <Reveal className="mt-10">
            <div className="rounded-3xl border border-dashed border-[#d9cbb9] bg-white/60 px-6 py-14 text-center">
              <StoreIcon
                aria-hidden
                className="mx-auto size-9 text-[#b08a3e]"
              />
              <h3 className="mt-4 font-display text-2xl text-[#2b2118]">
                New vendors are being reviewed
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#79685e]">
                Approved services will appear here soon. In the meantime you can
                browse every listing.
              </p>
              <Link
                href={routes.services}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-[#7a1f3d] px-6 text-sm font-medium text-[#f8f2e7] transition-colors hover:bg-[#671a33]"
              >
                Browse services
                <ArrowRightIcon aria-hidden className="size-4" />
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}

function ServiceCard({ service }: { service: HomeService }) {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  const vendorName = service.vendor?.businessName || service.vendor?.name
  const vendorInitial = vendorName?.charAt(0).toUpperCase() || "W"

  function viewDetails() {
    if (isPending) return

    if (!session?.user) {
      router.push(routes.signIn)
      return
    }

    router.push(`${routes.services}/${service.id}`)
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#e8decd] bg-white shadow-[0_2px_12px_rgba(60,40,25,0.05)] transition-shadow duration-300 hover:shadow-[0_18px_45px_rgba(60,40,25,0.14)]">
      {/* Only show a photo when the service actually has one saved in the DB. */}
      {service.photoUrl ? (
        <div className="relative aspect-[4/3] overflow-hidden bg-[#eee5d9]">
          {/* Service photos may come from any host, so next/image can't be used. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={service.photoUrl}
            alt={service.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <span className="absolute top-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-semibold tracking-[0.16em] text-[#7a1f3d] uppercase shadow-sm">
            {service.category}
          </span>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-5">
        {service.photoUrl ? null : (
          <span className="mb-3 self-start rounded-full bg-[#f7ece7] px-3 py-1.5 text-[9px] font-semibold tracking-[0.16em] text-[#7a1f3d] uppercase">
            {service.category}
          </span>
        )}

        <h3 className="font-display text-xl leading-snug text-[#2b2118]">
          {service.name}
        </h3>

        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#79685e]">
          <MapPinIcon aria-hidden className="size-3.5 shrink-0" />
          <span className="truncate">{service.location}</span>
        </p>

        <div className="mt-4 flex items-center gap-2.5">
          {service.vendor?.image ? (
            <img
              src={service.vendor.image}
              alt=""
              className="size-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f6e7e1] font-display text-sm text-[#7a1f3d]">
              {vendorInitial}
            </span>
          )}

          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-[#2b2118]">
              {vendorName || "WedPlan vendor"}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#a08a6a]">
              <StarIcon
                aria-hidden
                className="size-3 fill-[#c9a45c] text-[#c9a45c]"
              />
              New
            </p>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-[#eee4d5] pt-4">
          <div>
            <p className="text-[9px] font-semibold tracking-[0.2em] text-[#a08a6a] uppercase">
              Starting at
            </p>
            <p className="mt-0.5 font-display text-xl font-semibold text-[#7a1f3d]">
              ৳{service.price.toLocaleString("en-BD")}
            </p>
          </div>

          <button
            type="button"
            onClick={viewDetails}
            disabled={isPending}
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-[#7a1f3d] px-4 text-xs font-medium text-[#f8f2e7] transition-colors hover:bg-[#671a33] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70"
          >
            View Details
          </button>
        </div>
      </div>
    </article>
  )
}
