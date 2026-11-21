export type HomeCategory = {
  /** Label shown on the homepage. */
  label: string
  /** Category value used by the services API and the browse page. */
  value: string
  description: string
  image: string
}

export const homeCategories: HomeCategory[] = [
  {
    label: "Photography & Videography",
    value: "Photography",
    description: "Every glance, kept forever",
    image: "/images/cat-photography.jpg",
  },
  {
    label: "Wedding Venues",
    value: "Venue",
    description: "Halls, gardens and rooftops",
    image: "/images/cat-venue.jpg",
  },
  {
    label: "Decoration & Florist",
    value: "Decor & Styling",
    description: "Blooms, drapes and candlelight",
    image: "/images/cat-decor.jpg",
  },
  {
    label: "Catering Services",
    value: "Catering",
    description: "Menus your guests will remember",
    image: "/images/cat-catering.jpg",
  },
  {
    label: "Makeup & Styling",
    value: "Makeup & Beauty",
    description: "Bridal glow, perfected",
    image: "/images/cat-makeup.jpg",
  },
  {
    label: "Wedding Fashion",
    value: "Fashion & Attire",
    description: "Gowns, lehengas and sherwanis",
    image: "/images/cat-fashion.jpg",
  },
]

/** Fallback image for a service card that has no uploaded photo. */
export const categoryImages: Record<string, string> = Object.fromEntries(
  homeCategories.map((category) => [category.value, category.image])
)

export function serviceImage(category: string, photoUrl?: string | null) {
  return photoUrl || categoryImages[category] || "/images/hero-wedding.jpg"
}
