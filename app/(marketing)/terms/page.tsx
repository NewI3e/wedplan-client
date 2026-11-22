
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | WedPlan",
  description: "Read the terms and conditions for using WedPlan.",
}

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-16">
      <h1 className="font-display text-4xl font-semibold text-brand">
        Terms of Service
      </h1>

      <p className="mt-3 text-sm text-muted-foreground">
        Last updated: November 22, 2026
      </p>

      <p className="mt-6 leading-7 text-muted-foreground">
        Welcome to WedPlan! These Terms of Service explain the rules and
        conditions for using our platform. By accessing or using WedPlan,
        you agree to follow these terms.
      </p>

      <div className="mt-10 space-y-8">
        <section>
          <h2 className="text-xl font-semibold">1. About WedPlan</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            WedPlan is an online wedding planning platform that connects
            customers with wedding service providers. Users can explore
            services, contact vendors, and submit booking requests.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. User Accounts</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            Users must provide accurate information when creating an account.
            You are responsible for keeping your login credentials secure
            and for all activities performed through your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. Customer Responsibilities</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            Customers agree to provide correct booking information, communicate
            respectfully with vendors, and avoid submitting false or misleading
            booking requests.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Vendor Responsibilities</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            Vendors must provide accurate business information, publish
            genuine services, maintain updated service details, and respond
            to customer booking requests honestly and professionally.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Bookings and Payments</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            Submitting a booking request does not automatically guarantee
            a confirmed booking. Bookings depend on vendor acceptance.
            Customers should confirm service details and payment arrangements
            with the vendor before proceeding.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Premium Subscriptions</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            WedPlan may offer paid subscription plans for vendors.
            Premium features, pricing, and subscription conditions will
            be displayed before payment. Users are responsible for managing
            their subscriptions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Prohibited Activities</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            Users must not use WedPlan for fraudulent activities, share
            misleading information, harass other users, or attempt to
            damage, disrupt, or misuse the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Account Suspension</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            WedPlan reserves the right to suspend or terminate accounts
            that violate these terms or misuse the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">9. Changes to These Terms</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            We may update these Terms of Service from time to time.
            Any changes will be published on this page. Continued use
            of WedPlan means you accept the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">10. Contact Us</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            If you have questions about these Terms of Service, please
            contact our support team through the WedPlan platform.
          </p>
        </section>
      </div>

      <div className="mt-12 border-t pt-6">
        <p className="text-sm text-muted-foreground">
          Thank you for choosing WedPlan. We are happy to be part of
          your wedding planning journey!
        </p>
      </div>
    </main>
  )
}
