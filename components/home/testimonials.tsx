import { QuoteIcon } from "lucide-react"

import { Reveal } from "@/components/home/reveal"
import { SectionHeading } from "@/components/home/section-heading"

const testimonials = [
  {
    quote:
      "We booked our photographer, décor and makeup in one evening. WedPlan took so much stress out of the months before our wedding.",
    name: "Ayesha & Imran",
    detail: "Dhaka",
  },
  {
    quote:
      "Comparing vendors side by side was a dream. Our florist turned the stage into a garden — exactly what we pictured.",
    name: "Nusrat & Farhan",
    detail: "Chattogram",
  },
  {
    quote:
      "Since going Premium our bookings have doubled. Managing requests from the dashboard is effortless.",
    name: "Lumière Studio",
    detail: "Vendor, Dhaka",
  },
]

export function Testimonials() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="bg-[#fdfaf5] px-5 py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <SectionHeading
            eyebrow="Love notes"
            title={
              <span id="testimonials-heading">Stories from our couples</span>
            }
          />
        </Reveal>

        <div className="mt-10 grid gap-5 sm:mt-12 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index * 0.08}>
              <figure className="flex h-full flex-col rounded-2xl border border-[#eee1d0] bg-white p-6 shadow-[0_2px_12px_rgba(60,40,25,0.04)] sm:p-7">
                <QuoteIcon
                  aria-hidden
                  className="size-7 fill-[#e9d6ae] text-[#e9d6ae]"
                />

                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-[#5c4a3f] sm:text-[0.95rem]">
                  “{testimonial.quote}”
                </blockquote>

                <figcaption className="mt-6 text-xs text-[#79685e]">
                  <span className="font-semibold text-[#2b2118]">
                    {testimonial.name}
                  </span>{" "}
                  · {testimonial.detail}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
