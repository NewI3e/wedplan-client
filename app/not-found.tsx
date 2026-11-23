import Link from "next/link"
import { ArrowLeftIcon, CompassIcon } from "lucide-react"

const PRIMARY_LINK =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#7a1f3d] px-5 text-sm font-medium text-[#f8f2e7] transition-colors hover:bg-[#65203a] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none"

const SECONDARY_LINK =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#d9cfc0] bg-white px-5 text-sm font-medium text-[#2b2118] transition-colors hover:border-[#7a1f3d]/40 hover:bg-white/80 focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/15 focus-visible:outline-none"

export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#f7f2e9] px-5 py-16">
      <section className="w-full max-w-lg rounded-xl border border-[#e8decd] bg-[#fffdf9] p-7 text-center shadow-[0_2px_12px_rgba(60,40,25,0.04)] sm:p-10">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f7e4e6] text-[#7a1f3d]">
          <CompassIcon aria-hidden className="size-5" />
        </span>

        <p className="mt-6 text-[0.68rem] font-medium tracking-[0.22em] text-[#b08a3e] uppercase">
          Error 404
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#2b2118] sm:text-4xl">
          This page took a wrong turn
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#2b2118]/60">
          The page you&apos;re looking for doesn&apos;t exist, or it may have
          moved. Let&apos;s get you back on track.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className={PRIMARY_LINK}>
            <ArrowLeftIcon aria-hidden className="size-4" />
            Back to home
          </Link>
          <Link href="/services" className={SECONDARY_LINK}>
            Browse services
          </Link>
        </div>
      </section>
    </main>
  )
}
