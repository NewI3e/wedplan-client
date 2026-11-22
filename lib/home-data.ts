const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "")

export type HomeServiceVendor = {
  name: string
  businessName: string | null
  image: string | null
}

export type HomeService = {
  id: string
  name: string
  category: string
  location: string
  price: number
  photoUrl: string | null
  vendor: HomeServiceVendor | null
}

type ApiService = {
  _id?: string
  id?: string
  name?: string
  serviceName?: string
  category?: string
  location?: string
  price?: number
  photoUrl?: string | null
  images?: string[]
  vendorEmail?: string
  status?: string
  available?: boolean
  isActive?: boolean
  createdAt?: string
}

type ApiUser = {
  email?: string
  name?: string
  businessName?: string | null
  image?: string | null
  role?: string
}

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) return null

    return (await response.json()) as T
  } catch {
    return null
  }
}

function isApprovedAndActive(service: ApiService) {
  return (
    String(service.status ?? "").toLowerCase() === "approved" &&
    service.available !== false &&
    service.isActive !== false
  )
}

/**
 * Approved, active services for the homepage, newest first.
 *
 * Unapproved listings are never featured: a service only becomes public after
 * an admin approves it in the dashboard.
 */
export async function getFeaturedServices(limit = 6): Promise<HomeService[]> {
  const [services, users] = await Promise.all([
    getJson<ApiService[]>("/services"),
    getJson<ApiUser[]>("/users"),
  ])

  if (!Array.isArray(services)) return []

  const vendorsByEmail = new Map<string, ApiUser>()

  for (const user of Array.isArray(users) ? users : []) {
    if (user?.email) vendorsByEmail.set(user.email.toLowerCase(), user)
  }

  const featured = services
    .filter(isApprovedAndActive)
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bTime - aTime
    })
    .slice(0, limit)

  return featured.map((service) => {
    const vendor = service.vendorEmail
      ? vendorsByEmail.get(service.vendorEmail.toLowerCase())
      : undefined

    return {
      id: service._id ?? service.id ?? "",
      name: service.serviceName || service.name || "Wedding Service",
      category: service.category || "Wedding Services",
      location: service.location || "Bangladesh",
      price: Number(service.price) || 0,
      photoUrl: service.photoUrl ?? service.images?.[0] ?? null,
      vendor: vendor
        ? {
            name: vendor.businessName || vendor.name || "Wedding Vendor",
            businessName: vendor.businessName ?? null,
            image: vendor.image ?? null,
          }
        : null,
    }
  })
}
