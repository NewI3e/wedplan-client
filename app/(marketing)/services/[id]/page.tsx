"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  MapPin,
  ShieldAlert,
  Star,
  Crown,
  Loader2,
  CalendarCheck,
} from "lucide-react"

import { useSession } from "@/lib/auth-client"

interface Vendor {
  name?: string
  businessName?: string
  image?: string
  logo?: string
  rating?: number
  totalReviews?: number
  completedWeddings?: number
  isPremium?: boolean
}

interface Service {
  _id?: string
  id?: string
  name?: string
  serviceName?: string
  category: string
  description: string
  price: number
  location: string
  images?: string[]
  photoUrl?: string | null
  vendorId?: string
  vendor?: Vendor
  vendorEmail?: string
  status: string
  isActive?: boolean
  available?: boolean
}

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "")

export default function ServiceDetailsPage() {
  const params = useParams()
  const serviceId = params.id as string

  const { data: session, isPending } = useSession()

  const [service, setService] = useState<Service | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const role = session?.user?.role?.toLowerCase()

  useEffect(() => {
    if (!serviceId) return

    const fetchService = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await fetch(`${API_URL}/services`)
        if (!response.ok) throw new Error("Failed to fetch services")

        const data = await response.json()
        const services: Service[] = Array.isArray(data)
          ? data
          : (data.data ?? [])

        const foundService = services.find(
          (item) => item._id === serviceId || item.id === serviceId
        )

        if (!foundService) throw new Error("Service not found.")

        const isPublic =
          foundService.status?.toLowerCase() === "approved" &&
          foundService.available !== false &&
          foundService.isActive !== false

        if (!isPublic) {
          throw new Error("This service isn't available right now.")
        }

        setService(foundService)
      } catch (err) {
        console.error("Service fetch error:", err)
        setError(err instanceof Error ? err.message : "Unable to load service.")
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [serviceId])

  if (isPending || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F0]">
        <Loader2 className="h-8 w-8 animate-spin text-[#85323B]" />
      </div>
    )
  }

  if (!session?.user) return null

  if (error || !service) {
    return (
      <div className="min-h-screen bg-[#FAF7F0]">
        <div className="mx-auto max-w-5xl px-5 py-24 text-center">
          <h2 className="font-serif text-3xl text-[#432D29]">
            {error || "Service not found"}
          </h2>
          <Link
            href="/services"
            className="mt-6 inline-flex items-center gap-2 text-[#85323B]"
          >
            <ArrowLeft size={17} />
            Back to services
          </Link>
        </div>
      </div>
    )
  }

  const serviceName = service.serviceName || service.name || "Wedding Service"

  const images = service.images?.length
    ? service.images
    : service.photoUrl
      ? [service.photoUrl]
      : []

  const vendorName =
    service.vendor?.businessName ||
    service.vendor?.name ||
    "Wedding Service Provider"

  const isVendor = role === "vendor"
  const isAdmin = role === "admin"
  const canBook = role === "customer"

  const price = new Intl.NumberFormat("en-BD").format(service.price)

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#382925]">
      <main className="mx-auto max-w-7xl px-5 pt-9 pb-20 lg:px-8">
        <Link
          href="/services"
          className="mb-7 inline-flex items-center gap-2 text-sm text-[#806D65] transition hover:text-[#85323B]"
        >
          <ArrowLeft size={16} />
          Back to services
        </Link>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.55fr_1fr] lg:gap-9">
          {/* LEFT SIDE */}
          <div className="min-w-0">
            <div className="space-y-3">
              <div className="relative aspect-[1.55/1] w-full overflow-hidden rounded-2xl bg-[#EDE5D9] shadow-sm">
                {images.length > 0 ? (
                  <Image
                    src={images[selectedImage] ?? images[0]}
                    alt={`${serviceName} - service gallery image`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover transition-opacity duration-300"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-[#9A8174]">
                    No image available
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      aria-label={`View image ${index + 1}`}
                      className={`relative aspect-[1.3/1] w-28 shrink-0 overflow-hidden rounded-lg border-2 transition sm:w-36 ${
                        selectedImage === index
                          ? "border-[#85323B]"
                          : "border-transparent opacity-75 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${serviceName} ${index + 1}`}
                        fill
                        sizes="144px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8">
              <span className="inline-flex items-center rounded-full border border-[#EAC3BC] bg-[#FCE5E1] px-3 py-1 text-xs text-[#85323B]">
                {service.category}
              </span>

              <h1 className="mt-4 font-serif text-4xl leading-tight text-[#332421] sm:text-5xl lg:text-[52px]">
                {serviceName}
              </h1>

              <div className="mt-4 flex items-center gap-2 text-sm text-[#806D65]">
                <MapPin size={17} />
                {service.location}
              </div>

              <div className="mt-7 border-t border-[#E7DDD1] pt-7">
                <h2 className="mb-3 font-serif text-2xl">About this service</h2>
                <p className="text-[15px] leading-7 whitespace-pre-line text-[#76645C]">
                  {service.description}
                </p>
              </div>

              {/* Vendor Information */}
              <div className="mt-9">
                <div className="flex items-center gap-4 rounded-xl border border-[#E8DDD1] bg-white/80 p-5 shadow-sm">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#85323B] font-serif text-lg text-white">
                    {service.vendor?.logo || service.vendor?.image ? (
                      <Image
                        src={service.vendor.logo || service.vendor.image || ""}
                        alt={vendorName}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      vendorName.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] tracking-[2px] text-[#9A8174] uppercase">
                      Offered by
                    </p>

                    <div className="mt-0.5 flex flex-wrap items-center gap-2">
                      <h3 className="font-serif text-lg">{vendorName}</h3>

                      {service.vendor?.isPremium && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#F6DDB8] px-2 py-0.5 text-[10px] font-semibold text-[#79521C]">
                          <Crown size={11} />
                          Premium
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-1 text-sm text-[#947B68]">
                      <Star
                        size={14}
                        fill="#C18B3C"
                        className="text-[#C18B3C]"
                      />
                      {service.vendor?.rating ?? "New"}
                      {service.vendor?.completedWeddings != null && (
                        <span>
                          · {service.vendor.completedWeddings}+ weddings
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - PRICE + BOOK BUTTON */}
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-[#E7DCCE] bg-white p-5 shadow-[0_4px_12px_rgba(60,40,25,0.10)] sm:p-6">
              <p className="text-[10px] tracking-[2px] text-[#9A8174] uppercase">
                Starting from
              </p>
              <p className="mt-1 font-serif text-3xl text-[#382925]">
                ৳{price}
              </p>

              <p className="mt-3 text-sm leading-relaxed text-[#806D65]">
                Reserve this vendor for your wedding date and share celebration
                details.
              </p>

              {canBook && (
                <Link
                  href={`/services/${serviceId}/book`}
                  className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#85323B] text-sm font-medium text-white transition hover:bg-[#6E2730]"
                >
                  <CalendarCheck size={17} />
                  Book this service
                </Link>
              )}

              {isVendor && (
                <div className="mt-5 rounded-xl bg-[#F3ECE3] px-5 py-5 text-center">
                  <ShieldAlert
                    size={24}
                    className="mx-auto mb-3 text-[#D88712]"
                  />
                  <p className="text-sm leading-6 text-[#79665B]">
                    Vendors can’t book services. Switch to a customer account to
                    request bookings.
                  </p>
                </div>
              )}

              {isAdmin && (
                <div className="mt-5 rounded-xl bg-[#F3ECE3] px-5 py-5 text-center">
                  <ShieldAlert
                    size={24}
                    className="mx-auto mb-3 text-[#D88712]"
                  />
                  <p className="text-sm leading-6 text-[#79665B]">
                    Admin accounts cannot submit service bookings.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
