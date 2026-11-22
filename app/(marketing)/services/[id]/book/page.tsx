"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MapPin,
  ShieldAlert,
} from "lucide-react"

import { useSession } from "@/lib/auth-client"
import { createBooking } from "@/lib/bookings"

interface Service {
  _id?: string
  name?: string
  serviceName?: string
  category?: string
  price?: number
  location?: string
  status?: string
  isActive?: boolean
  available?: boolean
}

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "")

export default function BookServicePage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.id as string

  const { data: session, isPending } = useSession()
  const role = session?.user?.role?.toLowerCase()

  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)

  const [eventDate, setEventDate] = useState("")
  const [eventLocation, setEventLocation] = useState("")
  const [message, setMessage] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isPending && !session?.user) router.push("/login")
  }, [isPending, session, router])

  useEffect(() => {
    if (!serviceId) return
    ;(async () => {
      try {
        const res = await fetch(`${API_URL}/services`)
        const data = await res.json()
        const list: Service[] = Array.isArray(data) ? data : (data.data ?? [])
        const found = list.find((s) => s._id === serviceId) ?? null

        const isPublic =
          !!found &&
          found.status?.toLowerCase() === "approved" &&
          found.available !== false &&
          found.isActive !== false

        setService(isPublic ? found : null)
      } catch (err) {
        console.error("Service load error:", err)
      } finally {
        setLoading(false)
      }
    })()
  }, [serviceId])

  if (isPending || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F0]">
        <Loader2 className="h-8 w-8 animate-spin text-[#85323B]" />
      </div>
    )
  }

  if (!session?.user) return null

  if (!service) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] text-[#382925]">
        <main className="mx-auto max-w-xl px-5 pt-9 pb-20">
          <Link
            href="/services"
            className="mb-7 inline-flex items-center gap-2 text-sm text-[#806D65] transition hover:text-[#85323B]"
          >
            <ArrowLeft size={16} />
            Back to services
          </Link>

          <div className="rounded-2xl border border-[#E7DCCE] bg-white p-8 text-center shadow-[0_4px_12px_rgba(60,40,25,0.10)]">
            <ShieldAlert size={28} className="mx-auto mb-4 text-[#D88712]" />
            <h1 className="font-serif text-2xl font-semibold">
              Service unavailable
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#79665B]">
              This service is not available for booking. It may be awaiting
              admin approval or has been removed.
            </p>
            <Link
              href="/services"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[#85323B] px-5 text-sm font-medium text-white transition hover:bg-[#6E2730]"
            >
              Browse approved services
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const serviceName = service?.serviceName || service?.name || "this service"

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    try {
      setSubmitting(true)
      await createBooking({
        serviceId,
        customerEmail: session.user.email,
        eventDate,
        eventLocation,
        message,
      })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#382925]">
      <main className="mx-auto max-w-xl px-5 pt-9 pb-20">
        <Link
          href={`/services/${serviceId}`}
          className="mb-7 inline-flex items-center gap-2 text-sm text-[#806D65] transition hover:text-[#85323B]"
        >
          <ArrowLeft size={16} />
          Back to service
        </Link>

        <div className="rounded-2xl border border-[#E7DCCE] bg-white p-6 shadow-[0_4px_12px_rgba(60,40,25,0.10)]">
          <h1 className="font-serif text-2xl font-semibold">
            Request a Booking
          </h1>
          <p className="mt-1 text-sm text-[#806D65]">
            You are booking{" "}
            <span className="font-medium text-[#382925]">{serviceName}</span>.
          </p>

          {role !== "customer" ? (
            <div className="mt-5 rounded-xl bg-[#F3ECE3] px-5 py-5 text-center">
              <ShieldAlert size={24} className="mx-auto mb-3 text-[#D88712]" />
              <p className="text-sm leading-6 text-[#79665B]">
                Only customer accounts can request bookings.
              </p>
            </div>
          ) : submitted ? (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-[#ECFDF5] px-4 py-6 text-center">
              <CheckCircle2
                size={36}
                className="mx-auto mb-4 text-emerald-600"
              />
              <h3 className="font-serif text-lg font-semibold text-emerald-900">
                Booking Request Submitted
              </h3>
              <p className="mt-3 text-xs leading-5 text-emerald-800">
                Your request is now Pending vendor review. You can track it
                anytime from your Customer Dashboard.
              </p>
              <Link
                href="/dashboard/customer/bookings"
                className="mt-5 flex h-10 w-full items-center justify-center rounded-xl bg-[#85323B] text-sm font-medium text-white transition hover:bg-[#6E2730]"
              >
                View My Bookings
              </Link>
              <Link
                href="/services"
                className="mt-2 flex h-10 w-full items-center justify-center rounded-xl border border-[#E7DCCE] bg-white text-sm font-medium transition hover:bg-[#FAF7F0]"
              >
                Browse more services
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="eventDate"
                  className="mb-2 block text-sm font-medium"
                >
                  Event Date
                </label>
                <input
                  id="eventDate"
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="h-11 w-full rounded-xl border border-[#E7DCCE] px-3 text-sm outline-none focus:border-[#85323B]"
                />
              </div>

              <div>
                <label
                  htmlFor="eventLocation"
                  className="mb-2 block text-sm font-medium"
                >
                  Event Location / Venue
                </label>
                <div className="relative">
                  <MapPin
                    size={17}
                    className="absolute top-1/2 left-3 -translate-y-1/2 text-[#907C6E]"
                  />
                  <input
                    id="eventLocation"
                    type="text"
                    required
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="e.g. Hotel Radisson, Dhaka"
                    className="h-11 w-full rounded-xl border border-[#E7DCCE] pr-3 pl-10 text-sm outline-none focus:border-[#85323B]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="bookingMessage"
                  className="mb-2 block text-sm font-medium"
                >
                  Additional Message (Optional)
                </label>
                <textarea
                  id="bookingMessage"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your guest count, timeline, or special preferences..."
                  className="w-full resize-y rounded-xl border border-[#E7DCCE] px-3 py-3 text-sm outline-none focus:border-[#85323B]"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#85323B] text-sm font-medium text-white transition hover:bg-[#6E2730] disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  "Send Booking Request"
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
