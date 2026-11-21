import { Reveal } from "@/components/home/reveal"
import { SectionHeading } from "@/components/home/section-heading"

const steps = [
  {
    number: "01",
    title: "Discover",
    description: "Browse services by category, location and budget.",
  },
  {
    number: "02",
    title: "Request",
    description: "Pick your date and send a booking request to the vendor.",
  },
  {
    number: "03",
    title: "Celebrate",
    description: "Track replies in your dashboard and enjoy the big day.",
  },
]

export function HowItWorks() {
  return (
    <section className="bg-[#2a1812] px-5 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <SectionHeading
            eyebrow="How WedPlan works"
            title='Three steps to "I do"'
            tone="dark"
          />
        </Reveal>

        <div className="mt-12 grid gap-10 sm:mt-14 sm:grid-cols-3 sm:gap-8">
          {steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.1}>
              <div className="border-t border-[#b08a3e]/40 pt-6 sm:pt-7">
                <p className="font-display text-2xl text-gold sm:text-3xl">
                  {step.number}
                </p>
                <h3 className="mt-3 font-display text-xl text-[#f8f2e7] sm:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#e6d8c4]/60">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
