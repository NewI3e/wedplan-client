import { Categories } from "@/components/home/categories"
import { FeaturedServices } from "@/components/home/featured-services"
import { Hero } from "@/components/home/hero"
import { HowItWorks } from "@/components/home/how-it-works"
import { Testimonials } from "@/components/home/testimonials"
import { VendorCta } from "@/components/home/vendor-cta"
import { WhyChoose } from "@/components/home/why-choose"
import { getFeaturedServices } from "@/lib/home-data"

// Services change as vendors publish and admins approve, so render per request.
export const dynamic = "force-dynamic"

export default async function HomePage() {
  const featuredServices = await getFeaturedServices()

  return (
    <main>
      <Hero />
      <FeaturedServices services={featuredServices} />
      <Categories />
      <WhyChoose />
      <HowItWorks />
      <Testimonials />
      <VendorCta />
    </main>
  )
}
