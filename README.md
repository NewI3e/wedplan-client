<div align="center">

<img src="./public/images/hero-wedding.jpg" alt="WedPlan — wedding planning platform" width="100%" />

# WedPlan

### Every detail of your forever, beautifully planned.

A full-stack wedding marketplace where couples discover trusted vendors, request bookings, and plan the big day — while vendors grow their business and admins keep the marketplace safe.

[![Live Site](https://img.shields.io/badge/Live_Site-wedplan--client--theta--khaki.vercel.app-7a1f3d?style=for-the-badge&logo=vercel&logoColor=white)](https://wedplan-client-theta-khaki.vercel.app)
[![Client Repo](https://img.shields.io/badge/Client-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/NewI3e/wedplan-client)
[![Server Repo](https://img.shields.io/badge/Server-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/NewI3e/wedplan-server)

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Better Auth](https://img.shields.io/badge/Better_Auth-1a1a1a?style=flat-square)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=flat-square&logo=stripe&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

</div>

---

## Table of Contents

- [What is WedPlan?](#what-is-wedplan)
- [Live Demo & Repositories](#live-demo--repositories)
- [Feature Highlights](#feature-highlights)
- [A Peek at the Experience](#a-peek-at-the-experience)
- [Technology Stack](#technology-stack)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Stripe Premium Subscription Setup](#stripe-premium-subscription-setup)
- [Data Model](#data-model)
- [API Reference](#api-reference)
- [Security Model](#security-model)
- [Available Scripts](#available-scripts)
- [Deployment Notes](#deployment-notes)
- [Evaluation Access](#evaluation-access)
- [Credits](#credits)

---

## What is WedPlan?

Planning a wedding means juggling photographers, venues, florists, caterers, makeup artists, and designers — usually across a dozen tabs and endless messages.

**WedPlan brings all of that into one calm, beautiful place.**

Couples can browse approved wedding services, compare prices and locations, and send booking requests in minutes. Vendors get a professional storefront, a booking inbox, and a premium plan for unlimited listings. Admins get a clear view of users, services, and subscription revenue.

> Think **The Knot** or **Zola**, rebuilt as a modern role-based web application.

The platform is split into two deployable apps:

| App | Responsibility | Stack |
| --- | --- | --- |
| **Client** | UI, authentication, dashboards, Stripe checkout | Next.js 16 App Router, TypeScript, Tailwind, shadcn/ui |
| **Server** | Business API for services and bookings | Express 5, MongoDB |

---

## Live Demo & Repositories

| Resource | Link |
| --- | --- |
| 🌐 **Live Website** | [wedplan-client-theta-khaki.vercel.app](https://wedplan-client-theta-khaki.vercel.app) |
| ⚙️ **Live API** | [wedplan-server-pddn.vercel.app](https://wedplan-server-pddn.vercel.app) |
| 💻 **Client Repository** | [github.com/NewI3e/wedplan-client](https://github.com/NewI3e/wedplan-client) |
| 🗄️ **Server Repository** | [github.com/NewI3e/wedplan-server](https://github.com/NewI3e/wedplan-server) |

**Try it with three roles:**

- **Customer** — browse services, send a booking request, track its status.
- **Vendor** — publish a service, manage booking requests, upgrade to Premium.
- **Admin** — approve listings, manage users, review transactions.

> Admin accounts cannot be created from the public sign-up form. Evaluation credentials are provided separately with the submission.

---

## Feature Highlights

### 💍 For Customers

- **Discover wedding services** across photography, venues, décor, catering, makeup, and fashion.
- **Search and filter** by name, category, and location.
- **Beautiful service pages** with image gallery, pricing, location, vendor details, and description.
- **Request a booking** with event date, location, and a personal message.
- **Track every request** — pending, accepted, rejected, or cancelled.
- **Cancel pending requests** while they are still awaiting a vendor decision.
- **Personal dashboard** with live booking statistics and profile settings.

### 🏪 For Vendors

- **Vendor profile** with business name, bio, website, and branding.
- **Publish wedding services** with photos, category, price, location, and description.
- **Manage listings** — view, edit, pause availability, or delete.
- **Approval workflow** — new services stay private until an admin approves them.
- **Booking inbox** with customer details, event information, and one-click accept/reject.
- **Free plan guardrails** — up to 3 active services, enforced by the API.
- **Premium upgrade** through Stripe Checkout for unlimited listings and a premium badge.
- **Vendor dashboard** with service counts, pending requests, accepted bookings, and plan status.

### 🛡️ For Admins

- **Platform overview** with users, vendors, customers, services, pending approvals, and revenue.
- **User management** — search, filter by role, inspect, block, and unblock accounts.
- **Service moderation** — review pending listings, approve, reject, pause, or delete.
- **Transaction ledger** built from verified Stripe subscription records.
- **Role-protected dashboard** — no URL editing gets you into another role's area.

### ✨ Experience & Polish

- **Wedding-themed design system** — deep burgundy, warm cream, and gold accents with Playfair Display headings.
- **Fully responsive** across desktop, tablet, and mobile.
- **Framer Motion animations** with reduced-motion support.
- **Loading, empty, and error states** on every data-driven screen.
- **Toast notifications** for actions and failures — no `alert()` popups.
- **SEO-friendly metadata** and custom error pages.

---

## A Peek at the Experience

<table>
  <tr>
    <td align="center"><img src="./public/images/cat-photography.jpg" width="150" alt="Photography" /><br /><sub><b>Photography & Videography</b></sub></td>
    <td align="center"><img src="./public/images/cat-venue.jpg" width="150" alt="Venues" /><br /><sub><b>Wedding Venues</b></sub></td>
    <td align="center"><img src="./public/images/cat-decor.jpg" width="150" alt="Decor" /><br /><sub><b>Decoration & Florist</b></sub></td>
  </tr>
  <tr>
    <td align="center"><img src="./public/images/cat-catering.jpg" width="150" alt="Catering" /><br /><sub><b>Catering Services</b></sub></td>
    <td align="center"><img src="./public/images/cat-makeup.jpg" width="150" alt="Makeup" /><br /><sub><b>Makeup & Styling</b></sub></td>
    <td align="center"><img src="./public/images/cat-fashion.jpg" width="150" alt="Fashion" /><br /><sub><b>Wedding Fashion</b></sub></td>
  </tr>
</table>

---

## Technology Stack

| Layer | Tools |
| --- | --- |
| **Framework** | Next.js 16 (App Router, Server Components, Server Actions) |
| **Language** | TypeScript |
| **UI** | Tailwind CSS v4, shadcn/ui components, Base UI primitives, Lucide icons |
| **Animation** | Framer Motion |
| **Authentication** | Better Auth — email/password + Google OAuth |
| **Database** | MongoDB (shared `wedplandb` database) |
| **API** | Express 5 + MongoDB driver |
| **Payments** | Stripe Checkout + Stripe Webhooks (subscription mode) |
| **Notifications** | Sonner |
| **Deployment** | Vercel (client + server) |

---

## How It Works

```mermaid
flowchart LR
    U[Customer / Vendor / Admin] -->|Browser| N[Next.js Client]
    N -->|Better Auth session| A[Auth API]
    A --> M[(MongoDB)]
    N -->|Server Components<br/>Server Actions| E[Express API]
    E --> M
    N -->|Stripe Checkout| S[Stripe]
    S -->|Signed Webhook| W[/api/webhooks/stripe/]
    W --> M
    M -->|Subscription status| E
```

1. **Better Auth** manages users, sessions, Google OAuth, and password hashing.
2. **Next.js server layouts** verify the session and role before rendering any dashboard.
3. **Server Components and Server Actions** read the signed-in user's identity and call the Express API.
4. **Express** owns services and bookings, enforces plan limits, and checks resource ownership.
5. **Stripe** handles Premium subscriptions. A verified webhook keeps plan status in sync.

---

## Project Structure

```text
wedplan-client/
├── app/
│   ├── (auth)/                  # Sign in / sign up
│   ├── (dashboard)/dashboard/
│   │   ├── admin/               # Overview, users, services, transactions
│   │   ├── customer/            # Overview, bookings, settings
│   │   └── vendor/              # Overview, services, bookings, subscription
│   ├── (marketing)/             # Home, browse, service details, booking
│   ├── api/
│   │   ├── auth/[...all]/       # Better Auth handler
│   │   ├── checkout_sessions/   # Stripe Checkout session
│   │   ├── profile-photo/       # Profile image upload + serve
│   │   ├── service-photo/       # Service image upload + serve
│   │   └── webhooks/stripe/     # Verified Stripe webhook
│   ├── payment_success/         # Post-checkout confirmation
│   └── error.tsx / not-found.tsx
├── components/
│   ├── auth/                    # Auth forms and shell
│   ├── dashboard/               # Role-specific dashboard UI
│   ├── home/                    # Hero, featured, categories, testimonials
│   ├── layout/                  # Navbar, footer, user menu
│   └── ui/                      # Reusable shadcn/ui primitives
├── lib/                         # Auth, data loaders, Stripe, routes, utils
└── public/images/               # Hero and category artwork
```

---

## Getting Started

### Prerequisites

- **Node.js 20+**
- **npm**
- A **MongoDB Atlas** cluster (or local MongoDB)
- A **Stripe** account (test mode)
- A **Google Cloud** OAuth client (for Google sign-in)

### 1. Clone both repositories

```bash
git clone https://github.com/NewI3e/wedplan-client.git
git clone https://github.com/NewI3e/wedplan-server.git
```

### 2. Start the API

```bash
cd wedplan-server
npm install
```

Create `.env`:

```bash
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
CLIENT_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

```bash
npm run dev
```

The API runs at **http://localhost:5000**.

### 3. Start the client

```bash
cd wedplan-client
npm install
```

Create `.env` (see the full reference below), then:

```bash
npm run dev
```

Open **http://localhost:3000** 🎉

### 4. Create your first accounts

1. Sign up as a **Customer** and as a **Vendor**.
2. Add a service from the vendor dashboard.
3. Promote an account to admin directly in MongoDB:

```js
db.user.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

4. Sign in as the admin and approve the pending service.

> Passwords must be at least 6 characters and include one uppercase and one lowercase letter.

---

## Environment Variables

> ⚠️ **Never commit `.env` files.** Every secret below belongs in your local `.env` or your Vercel project settings.

### Client — `wedplan-client/.env`

| Variable | Required | Description |
| --- | :---: | --- |
| `DB_URI` | ✅ | MongoDB connection string used by Better Auth and dashboard data loaders |
| `BETTER_AUTH_SECRET` | ✅ | Long random secret used to sign Better Auth sessions |
| `BETTER_AUTH_URL` | ✅ | Public URL of the client app (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | ✅ | Same app URL, exposed to the browser for the auth client |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth client secret |
| `NEXT_PUBLIC_API_URL` | ✅ | Express API base URL (e.g. `http://localhost:5000`) |
| `STRIPE_SECRET_KEY` | ✅ | Stripe secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe webhook signing secret (`whsec_...`) |
| `STRIPE_PREMIUM_PRICE_ID` | ➖ | Stripe Price ID for Premium; falls back to a bundled price |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ➖ | Stripe publishable key for client-side Stripe.js |

```bash
# Client example
DB_URI=mongodb+srv://user:password@cluster.mongodb.net/wedplandb
BETTER_AUTH_SECRET=replace-with-a-long-random-string
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_API_URL=http://localhost:5000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_PRICE_ID=price_...
```

**Google OAuth redirect URI**

Add this in Google Cloud Console → APIs & Services → Credentials:

```text
http://localhost:3000/api/auth/callback/google
https://your-production-domain.com/api/auth/callback/google
```

### Server — `wedplan-server/.env`

| Variable | Required | Description |
| --- | :---: | --- |
| `DB_USER` | ✅ | MongoDB username |
| `DB_PASS` | ✅ | MongoDB password |
| `CLIENT_ORIGINS` | ✅ | Comma-separated list of allowed browser origins for CORS |

```bash
# Server example
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
CLIENT_ORIGINS=http://localhost:3000,https://your-production-domain.com
```

---

## Stripe Premium Subscription Setup

WedPlan Premium is a **subscription** product. Vendors on the free plan can publish up to **3 active services**; Premium removes that limit.

### 1. Create the product

In the Stripe Dashboard (test mode), create a recurring product and copy its **Price ID** into `STRIPE_PREMIUM_PRICE_ID`.

### 2. Configure the webhook

Add an endpoint pointing to:

```text
https://your-client-domain.com/api/webhooks/stripe
```

Subscribe to these events:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

### 3. Test locally

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 4. The payment flow

1. Vendor clicks **Upgrade to Premium**.
2. `POST /api/checkout_sessions` verifies the vendor session and creates a Checkout Session tagged with the vendor's email.
3. Stripe redirects to `/payment_success?session_id=...`.
4. The webhook verifies the signature and stores the subscription in MongoDB.
5. The Express API reads the verified subscription before allowing more than 3 services.

> Premium status is never activated from the frontend redirect alone — the webhook is the source of truth.

---

## Data Model

WedPlan uses the shared `wedplandb` MongoDB database.

| Collection | Purpose | Key Fields |
| --- | --- | --- |
| `user` | Better Auth users + profile | `name`, `email`, `image`, `role`, `blocked`, `businessName` |
| `session` / `account` / `verification` | Managed by Better Auth | sessions, OAuth accounts, verification tokens |
| `services` | Vendor listings | `vendorEmail`, `name`, `category`, `description`, `price`, `location`, `photoUrl`, `images`, `status`, `available` |
| `bookings` | Customer booking requests | `serviceId`, `vendorEmail`, `customerEmail`, `eventDate`, `eventLocation`, `message`, `status` |
| `subscriptions` | Verified Stripe subscriptions | `vendorEmail`, `plan`, `status`, `stripeSubscriptionId`, `currentPeriodEnd`, `amount` |
| `imageUploads` | Uploaded profile/service images | `contentType`, `size`, `data`, `createdAt` |

**Booking statuses:** `pending` → `accepted` | `rejected` | `cancelled`

**Service statuses:** `pending` → `approved` | `rejected`

Only **approved + active** services appear on the public Browse Services page.

---

## API Reference

Base URL: `http://localhost:5000` (or your deployed API URL)

| Method | Endpoint | Description |
| :---: | --- | --- |
| `GET` | `/` | Health check |
| `GET` | `/users` | List users (used for vendor enrichment) |
| `GET` | `/services` | List all services |
| `POST` | `/services` | Create a service (free-plan limit enforced) |
| `PATCH` | `/services/:id` | Update a service |
| `DELETE` | `/services/:id` | Delete a service |
| `GET` | `/My-services?email=` | Services owned by a vendor |
| `GET` | `/services/usage?vendorEmail=` | Plan + active service usage |
| `GET` | `/services/count?vendorEmail=` | Service count for a vendor |
| `POST` | `/bookings` | Create a booking request |
| `GET` | `/bookings?email=` | Customer's booking requests |
| `GET` | `/bookings/vendor?email=` | Vendor's incoming requests |
| `PATCH` | `/bookings/:id/cancel` | Cancel a pending request (owner only) |
| `PATCH` | `/bookings/:id/decision` | Accept or reject a pending request (vendor only) |

**Example — create a booking**

```http
POST /bookings
Content-Type: application/json

{
  "serviceId": "66f1c2...",
  "customerEmail": "couple@example.com",
  "eventDate": "2027-02-14",
  "eventLocation": "Dhaka",
  "message": "We would love to discuss our reception."
}
```

---

## Security Model

- **Better Auth sessions** — HTTP-only cookies, secure password hashing, Google OAuth.
- **Server-side role guards** — every dashboard layout calls `requireDashboardRole()`. Hiding links is not enough.
- **No public admin registration** — the sign-up hook coerces roles to `vendor` or `customer`.
- **Role changes are blocked** — profile updates strip the `role` field before saving.
- **Blocked accounts** — blocked users cannot create a new session.
- **Ownership checks** — customers can only cancel their own bookings; vendors can only decide requests addressed to their business.
- **Plan enforcement** — the Express API checks verified subscription status before allowing more than 3 services.
- **Stripe webhook verification** — every event is signature-checked; Premium is never granted from a redirect alone.
- **Upload validation** — authenticated uploads only, JPG/PNG/WebP, max 5 MB.
- **CORS allowlist** — the API only accepts requests from configured origins.
- **Secrets in environment variables** — no credentials are committed to the repository.

---

## Available Scripts

### Client

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Create a production build |
| `npm start` | Run the production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type-check with TypeScript |
| `npm run format` | Format with Prettier |

### Server

| Command | What it does |
| --- | --- |
| `npm run dev` | Start Express with nodemon |
| `node index.js` | Start Express without nodemon |

---

## Deployment Notes

### Client → Vercel

1. Import the `wedplan-client` repository.
2. Add every client environment variable.
3. Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production URL.
4. Deploy.

### Server → Vercel

1. Import the `wedplan-server` repository.
2. Add `DB_USER`, `DB_PASS`, and `CLIENT_ORIGINS`.
3. Set `CLIENT_ORIGINS` to the deployed client URL (comma-separated for multiple).
4. Deploy.

### Post-deploy checklist

- [ ] Set the production Google OAuth redirect URI.
- [ ] Create the production Stripe webhook endpoint.
- [ ] Verify the webhook signing secret in Vercel.
- [ ] Test sign-up, sign-in, and Google sign-in.
- [ ] Test booking creation from a customer account.
- [ ] Test accept/reject from the vendor account.
- [ ] Test admin approval and user blocking.
- [ ] Test the Premium upgrade end-to-end.
- [ ] Refresh a private route and confirm the session persists.
- [ ] Confirm no `.env` file or secret is tracked by Git.

---

## Evaluation Access

**Admin credentials** are provided privately with the assignment submission and are **not** stored in this repository.

To test the full flow:

1. Sign in as **Admin** → approve a pending service.
2. Sign in as **Vendor** → view the booking inbox and upgrade to Premium.
3. Sign in as **Customer** → browse, book, and cancel a pending request.

---

## Credits

Built with care for **Programming Hero — Assignment 9, Category 004**.

**WedPlan** — because the best day of your life deserves more than a spreadsheet.

<div align="center">

Made with 🤍, Next.js, and a lot of chai.

</div>
