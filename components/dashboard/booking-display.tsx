import { cn } from "@/lib/utils"

const STATUS_META: Record<
  string,
  { label: string; badge: string; dot: string; bar: string }
> = {
  accepted: {
    label: "Accepted",
    badge: "border-[#cfe9d7] bg-[#eaf7ef] text-[#2f7a4b]",
    dot: "bg-[#4caf72]",
    bar: "bg-[#4caf72]",
  },
  pending: {
    label: "Pending",
    badge: "border-[#f1e2c0] bg-[#fbf3e2] text-[#8a6a22]",
    dot: "bg-[#d8a93d]",
    bar: "bg-[#d8a93d]",
  },
  rejected: {
    label: "Rejected",
    badge: "border-[#f6d4da] bg-[#fdecef] text-[#b23a52]",
    dot: "bg-[#d95c74]",
    bar: "bg-[#d95c74]",
  },
  cancelled: {
    label: "Cancelled",
    badge: "border-[#e3ddd1] bg-[#f2efe9] text-[#6f665b]",
    dot: "bg-[#a99a86]",
    bar: "bg-[#a99a86]",
  },
}

export function getBookingStatusMeta(status: string) {
  return (
    STATUS_META[status] ?? {
      label: status
        ? status.charAt(0).toUpperCase() + status.slice(1)
        : "Unknown",
      badge: "border-[#e8decd] bg-[#f4efe6] text-[#6f665b]",
      dot: "bg-[#a99a86]",
      bar: "bg-[#a99a86]",
    }
  )
}

export function BookingStatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const meta = getBookingStatusMeta(status)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        meta.badge,
        className
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  )
}

export function formatBookingDate(value: string, fallback = "—") {
  if (!value) return fallback

  const date = new Date(value.length <= 10 ? `${value}T00:00:00.000Z` : value)

  if (Number.isNaN(date.getTime())) return fallback

  // UTC keeps the server-rendered HTML and the browser in sync.
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

export function formatBookingPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(price)
}
