import Image from "next/image"
import Link from "next/link"
import { CirclePlayIcon } from "lucide-react"

import { routes } from "@/lib/routes"

type AuthShellProps = {
  /** Photo shown in the left panel on large screens. */
  imageSrc: string
  imageAlt: string
  /** Quote shown over the photo. */
  quote: string
  children: React.ReactNode
}

export function AuthShell({
  imageSrc,
  imageAlt,
  quote,
  children,
}: AuthShellProps) {
  return (
    <div className="grid min-h-svh bg-[#f8f4ec] lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-[#2b2118] lg:sticky lg:top-0 lg:block lg:h-svh lg:self-start">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30"
        />
        {/* Keeps the logo readable on lighter photos. */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/55 to-transparent"
        />

        <div className="relative flex h-full flex-col justify-between p-10 xl:p-12">
          <Link
            href={routes.home}
            className="flex w-fit items-baseline gap-0.5"
            aria-label="WedPlan home"
          >
            <span className="font-display text-2xl font-semibold tracking-tight text-[#f8f2e7]">
              WedPlan
            </span>
            <span aria-hidden className="mb-2.5 text-[0.55rem] text-gold">
              ✦
            </span>
          </Link>

          <div>
            <blockquote className="max-w-md font-display text-3xl leading-[1.25] text-[#f8f2e7] xl:text-[2.1rem]">
              “{quote}”
            </blockquote>
      
          </div>
        </div>
      </aside>

      <div className="flex min-h-svh flex-col bg-[#f8f4ec] text-[#2b2118]">
        <div className="flex items-center justify-between px-5 py-5 lg:hidden">
          <Link
            href={routes.home}
            className="flex items-baseline gap-0.5"
            aria-label="WedPlan home"
          >
            <span className="font-display text-xl font-semibold tracking-tight text-[#7a1f3d]">
              WedPlan
            </span>
            <span aria-hidden className="mb-2 text-[0.5rem] text-gold">
              ✦
            </span>
          </Link>
          <Link
            href={routes.home}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2b2118]/60 transition-colors hover:text-[#2b2118]"
          >
            <CirclePlayIcon aria-hidden className="size-3.5" />
            Preview as:{" "}
            <span className="underline underline-offset-2">Visitor</span>
          </Link>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 sm:px-8 lg:py-12">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
      </div>
    </div>
  )
}
