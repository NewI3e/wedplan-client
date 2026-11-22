# Next.js template

This is a Next.js template with shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```

## Vendor subscriptions (Stripe)

Premium subscriptions are stored in the `subscriptions` collection of the
`wedplandb` MongoDB database. The Express API (`wedplan-server`) reads the same
collection to decide whether a vendor can publish more than the 3 free services.

Required environment variables:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PREMIUM_PRICE_ID=price_...      # optional, defaults to the bundled price
STRIPE_WEBHOOK_SECRET=whsec_...        # from `stripe listen` or the Dashboard
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Local webhook forwarding:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Flow:

1. Vendor clicks **Upgrade to Premium** → `POST /api/checkout_sessions`.
2. The route tags the Checkout Session + Subscription with the vendor's email.
3. Stripe redirects to `/payment_success`, which saves the subscription
   immediately (fallback for local development).
4. `/api/webhooks/stripe` keeps renewals, failed payments and cancellations in
   sync via `customer.subscription.*` events.
5. While `status` is `active` and `currentPeriodEnd` is in the future, the API
   reports the `premium` plan and allows unlimited services.

