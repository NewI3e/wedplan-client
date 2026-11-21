"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowUpRightIcon } from "lucide-react"

import { Reveal } from "@/components/home/reveal"
import { SectionHeading } from "@/components/home/section-heading"
import { homeCategories } from "@/lib/categories"
import { routes } from "@/lib/routes"

export function Categories() {
  return (
    <section
      aria-labelledby="categories-heading"
      className="bg-[#f7eee9] px-5 py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <SectionHeading
            eyebrow="Explore by category"
            title={
              <span id="categories-heading">Everything your day needs</span>
            }
            description="From the first photograph to the final dance — find trusted specialists for every part of your wedding."
          />
        </Reveal>

        <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {homeCategories.map((category, index) => (
            <Reveal key={category.value} delay={index * 0.05}>
              <Link
                href={`${routes.services}?category=${encodeURIComponent(
                  category.value
                )}`}
                className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-[#2b2118] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/40 focus-visible:outline-none sm:aspect-[16/11]"
              >
                <Image
                  src={category.image}
                  alt={category.label}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 transition-opacity duration-300 group-hover:from-black/85"
                />

                <span className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white/90 backdrop-blur-sm transition-colors group-hover:border-white/60 group-hover:bg-white/20">
                  <ArrowUpRightIcon aria-hidden className="size-4" />
                </span>

                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <h3 className="font-display text-[1.35rem] leading-tight text-white sm:text-2xl">
                    {category.label}
                  </h3>
                  <p className="mt-1.5 text-xs text-white/70 sm:text-sm">
                    {category.description}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
