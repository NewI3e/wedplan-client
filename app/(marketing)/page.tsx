import { Categories } from "@/components/home/categories"
import { FeaturedServices } from "@/components/home/featured-services"
import { Hero } from "@/components/home/hero"
import { HowItWorks } from "@/components/home/how-it-works"
import { Testimonials } from "@/components/home/testimonials"
import { VendorCta } from "@/components/home/vendor-cta"
import { WhyChoose } from "@/components/home/why-choose"
import { getServerSession, resolveDashboardRole } from "@/lib/auth-server"
import { getFeaturedServices } from "@/lib/home-data"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [featuredServices, session] = await Promise.all([
    getFeaturedServices(),
    getServerSession(),
  ])

  const isVendor = session
    ? resolveDashboardRole(session.user.role) === "vendor"
    : false

  return (
    <main>
      <Hero isVendor={isVendor} />
      <FeaturedServices services={featuredServices} />
      <Categories />
      <WhyChoose />
      <HowItWorks />
      <Testimonials />
      <VendorCta />
    </main>
  )
}
