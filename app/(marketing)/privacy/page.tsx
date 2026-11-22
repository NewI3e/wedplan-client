
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | WedPlan",
  description: "Learn how WedPlan collects, uses, and protects your personal information.",
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-16">
      <h1 className="font-display text-4xl font-semibold text-brand">
        Privacy Policy
      </h1>

      <p className="mt-3 text-sm text-muted-foreground">
        Last updated: November 22, 2026
      </p>

      <p className="mt-6 leading-7 text-muted-foreground">
        At WedPlan, your privacy is important to us. This Privacy Policy
        explains what information we collect, how we use it, and how we
        protect your information when you use our platform.
      </p>

      <div className="mt-10 space-y-8">
        <section>
          <h2 className="text-xl font-semibold">1. Information We Collect</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            When you use WedPlan, we may collect the following information:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Name and email address.</li>
            <li>Account login information.</li>
            <li>Vendor business and service details.</li>
            <li>Booking details, event dates, and locations.</li>
            <li>Payment and subscription-related information.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            We use your information to:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Create and manage your account.</li>
            <li>Connect customers with wedding service providers.</li>
            <li>Process booking requests.</li>
            <li>Manage vendor subscriptions and payments.</li>
            <li>Improve our platform and user experience.</li>
            <li>Communicate important updates and notifications.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. Sharing of Information</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            We may share relevant information between customers and vendors
            to help manage booking requests. We may also share necessary
            information with trusted third-party services that help us
            operate the platform, such as payment providers.
          </p>
          <p className="mt-2 leading-7 text-muted-foreground">
            We do not sell your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Payment Security</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            Payments may be processed through third-party payment providers
            such as Stripe. We do not intend to store your complete card
            details on our servers. Payment information is handled according
            to the payment provider&apos;s security policies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Payment Security</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            Payments may be processed through third-party payment providers
            such as Stripe. We do not intend to store your complete card
            details on our servers. Payment information is handled according
            to the payment provider&apos;s security policies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Cookies</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            WedPlan may use cookies or similar technologies to maintain
            login sessions, remember preferences, and improve the overall
            user experience.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Your Privacy Rights</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            You may request access to, correction of, or deletion of your
            personal information, subject to applicable laws and legitimate
            business requirements. You can also contact us with questions
            about how your data is handled.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Third-Party Services</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            WedPlan may integrate with third-party services such as
            authentication and payment providers. Their privacy practices
            are governed by their own privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">9. Changes to This Policy</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            We may update this Privacy Policy when necessary. Any updates
            will be published on this page with a revised update date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">10. Contact Us</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            If you have any questions or concerns about this Privacy Policy
            or your personal information, please contact our support team
            through the WedPlan platform.
          </p>
        </section>
      </div>

      <div className="mt-12 border-t pt-6">
        <p className="text-sm text-muted-foreground">
          Your trust matters to us. Thank you for choosing WedPlan!
        </p>
      </div>
    </main>
  )
}
