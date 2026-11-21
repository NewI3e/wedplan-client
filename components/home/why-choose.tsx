import {
  BadgeCheckIcon,
  CalendarCheckIcon,
  HeartHandshakeIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { Reveal } from "@/components/home/reveal"

const benefits = [
  {
    icon: BadgeCheckIcon,
    title: "Verified vendors",
    description: "Every service is reviewed by our team before it goes live.",
  },
  {
    icon: HeartHandshakeIcon,
    title: "Direct requests",
    description:
      "Send booking requests and hear back right inside your dashboard.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Secure payments",
    description: "Vendor subscriptions handled safely with Stripe checkout.",
  },
  {
    icon: CalendarCheckIcon,
    title: "Track everything",
    description: "See pending, accepted and past requests at a glance.",
  },
]

export function WhyChoose() {
  return (
    <section className="bg-[#fdfaf5] px-5 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-16">
        <Reveal>
          <p className="text-[0.62rem] font-medium tracking-[0.3em] text-[#b08a3e] uppercase">
            Why choose WedPlan?
          </p>

          <h2 className="mt-4 font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.12] font-medium text-[#2b2118]">
            Less planning stress.{" "}
            <em className="font-normal text-[#7a1f3d] italic">More moments.</em>
          </h2>

          <p className="mt-5 max-w-md text-sm leading-relaxed text-[#79685e] sm:text-base">
            We bring every wedding service into one calm, trusted place — so you
            can spend your energy on the people, not the paperwork.
          </p>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon

            return (
              <Reveal key={benefit.title} delay={index * 0.06}>
                <div className="h-full rounded-2xl border border-[#eee1d0] bg-white p-5 shadow-[0_2px_12px_rgba(60,40,25,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_30px_rgba(60,40,25,0.1)] sm:p-6">
                  <span className="flex size-10 items-center justify-center rounded-full bg-[#f6e9cf] text-[#8a6a2a]">
                    <Icon aria-hidden className="size-5" />
                  </span>

                  <h3 className="mt-4 font-display text-lg text-[#2b2118] sm:text-xl">
                    {benefit.title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-[#79685e] sm:text-sm">
                    {benefit.description}
                  </p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
