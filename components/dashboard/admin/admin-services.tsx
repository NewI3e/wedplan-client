"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  BriefcaseIcon,
  CheckIcon,
  Clock3Icon,
  CrownIcon,
  EyeIcon,
  ImageIcon,
  LoaderCircleIcon,
  MapPinIcon,
  SearchIcon,
  StoreIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"

import {
  deleteServiceAction,
  setServiceStatusAction,
} from "@/app/(dashboard)/dashboard/admin/services/actions"
import type { AdminService, AdminServiceStatus } from "@/lib/admin-services"
import { cn } from "@/lib/utils"

const CARD =
  "rounded-xl border border-[#e8decd] bg-[#fffdf9] shadow-[0_2px_12px_rgba(60,40,25,0.04)]"

const STATUS_META: Record<
  AdminServiceStatus,
  { label: string; className: string; dot: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-[#fbf1d9] text-[#96721f]",
    dot: "bg-[#c79a35]",
  },
  approved: {
    label: "Approved",
    className: "bg-[#eaf7ef] text-[#2f7a4b]",
    dot: "bg-[#3f9b63]",
  },
  rejected: {
    label: "Rejected",
    className: "bg-[#fbe9ec] text-[#b23a52]",
    dot: "bg-[#c94a63]",
  },
}

const FILTERS: Array<{ value: "all" | AdminServiceStatus; label: string }> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

const PRIMARY_BUTTON =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#7a1f3d] px-3 text-xs font-medium text-[#f8f2e7] transition-colors hover:bg-[#65203a] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"

const OUTLINE_BUTTON =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#e0d5c4] bg-white px-3 text-xs font-medium text-[#2b2118]/75 transition-colors hover:border-[#c9b79c] hover:bg-[#fbf7ef] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"

const DANGER_OUTLINE_BUTTON =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#f0cdd4] bg-white px-3 text-xs font-medium text-[#b23a52] transition-colors hover:border-[#e3aebb] hover:bg-[#fdf1f3] focus-visible:ring-3 focus-visible:ring-[#b23a52]/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"

const ICON_BUTTON =
  "inline-flex size-9 items-center justify-center rounded-lg text-[#2b2118]/40 transition-colors hover:bg-[#fdf1f3] hover:text-[#b23a52] focus-visible:ring-3 focus-visible:ring-[#b23a52]/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"

function formatPrice(price: number) {
  return `৳${Math.round(price).toLocaleString("en-BD")}`
}

function formatDate(value: string) {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function StatusBadge({ status }: { status: AdminServiceStatus }) {
  const meta = STATUS_META[status]

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.66rem] font-medium",
        meta.className
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  )
}

function ServiceThumb({
  service,
  className,
}: {
  service: AdminService
  className?: string
}) {
  if (service.photoUrl) {
    return (
      <img
        src={service.photoUrl}
        alt=""
        className={cn("size-full object-cover", className)}
      />
    )
  }

  return (
    <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#f3e6df] via-[#f7f1e7] to-[#efe6d6]">
      <ImageIcon aria-hidden className="size-5 text-[#b08a3e]/70" />
    </div>
  )
}

function ServiceDetails({
  service,
  busy,
  onApprove,
  onReject,
  onDelete,
}: {
  service: AdminService
  busy: boolean
  onApprove: () => void
  onReject: () => void
  onDelete: () => void
}) {
  const rows: Array<{ label: string; value: string }> = [
    { label: "Vendor", value: service.vendorBusiness || service.vendorName },
    { label: "Email", value: service.vendorEmail || "—" },
    {
      label: "Plan",
      value: service.vendorPlan === "premium" ? "Premium" : "Free",
    },
    { label: "Category", value: service.category || "—" },
    { label: "Location", value: service.location || "—" },
    { label: "Price", value: formatPrice(service.price) },
    {
      label: "Availability",
      value: service.available ? "Available" : "Paused",
    },
    { label: "Submitted", value: formatDate(service.createdAt) },
  ]

  return (
    <div className="space-y-5">
      <div className="relative h-40 w-full overflow-hidden rounded-xl bg-[#efe6d6]">
        <ServiceThumb service={service} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3
          id="service-details-title"
          className="font-display text-xl leading-tight text-[#2b2118]"
        >
          {service.name}
        </h3>
        <StatusBadge status={service.status} />
      </div>

      <p className="text-sm leading-relaxed text-[#2b2118]/60">
        {service.description || "No description was provided for this service."}
      </p>

      <dl className="space-y-2.5 border-t border-[#eee5d6] pt-4 text-sm">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-4"
          >
            <dt className="shrink-0 text-[#2b2118]/50">{row.label}</dt>
            <dd
              className="min-w-0 truncate text-right font-medium text-[#2b2118]"
              title={row.value}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap items-center gap-2 border-t border-[#eee5d6] pt-4">
        {service.status !== "approved" ? (
          <button
            type="button"
            onClick={onApprove}
            disabled={busy}
            className={PRIMARY_BUTTON}
          >
            {busy ? (
              <LoaderCircleIcon aria-hidden className="size-3.5 animate-spin" />
            ) : (
              <CheckIcon aria-hidden className="size-3.5" />
            )}
            Approve
          </button>
        ) : null}

        {service.status !== "rejected" ? (
          <button
            type="button"
            onClick={onReject}
            disabled={busy}
            className={DANGER_OUTLINE_BUTTON}
          >
            <XIcon aria-hidden className="size-3.5" />
            Reject
          </button>
        ) : null}

        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className={cn(DANGER_OUTLINE_BUTTON, "ml-auto")}
        >
          <Trash2Icon aria-hidden className="size-3.5" />
          Delete
        </button>
      </div>
    </div>
  )
}

export function AdminServicesPanel({
  services,
  categories,
  error,
}: {
  services: AdminService[]
  categories: string[]
  error: string | null
}) {
  const router = useRouter()
  const listRef = React.useRef<HTMLDivElement>(null)

  const [statusOverrides, setStatusOverrides] = React.useState<
    Record<string, AdminServiceStatus>
  >({})
  const [removedIds, setRemovedIds] = React.useState<string[]>([])
  const [filter, setFilter] = React.useState<"all" | AdminServiceStatus>("all")
  const [category, setCategory] = React.useState("all")
  const [query, setQuery] = React.useState("")

  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [viewing, setViewing] = React.useState<AdminService | null>(null)
  const [deleting, setDeleting] = React.useState<AdminService | null>(null)
  const [deleteBusy, setDeleteBusy] = React.useState(false)

  /**
   * Optimistic overlay on the server data: a successful moderation action
   * updates the row immediately, then `router.refresh()` re-syncs props.
   */
  const rows = React.useMemo(
    () =>
      services
        .filter((service) => !removedIds.includes(service.id))
        .map((service) => {
          const status = statusOverrides[service.id]
          return status ? { ...service, status } : service
        }),
    [services, removedIds, statusOverrides]
  )

  const counts = React.useMemo(() => {
    const base = { all: rows.length, pending: 0, approved: 0, rejected: 0 }
    for (const row of rows) base[row.status] += 1
    return base
  }, [rows])

  const filtered = React.useMemo(() => {
    const search = query.trim().toLowerCase()

    return rows.filter((row) => {
      if (filter !== "all" && row.status !== filter) return false
      if (category !== "all" && row.category !== category) return false
      if (!search) return true

      return [
        row.name,
        row.vendorName,
        row.vendorBusiness ?? "",
        row.vendorEmail,
        row.category,
        row.location,
      ].some((value) => value.toLowerCase().includes(search))
    })
  }, [rows, filter, category, query])

  function applyStatus(id: string, status: AdminServiceStatus) {
    setStatusOverrides((current) => ({ ...current, [id]: status }))
    setViewing((current) =>
      current && current.id === id ? { ...current, status } : current
    )
  }

  async function changeStatus(
    service: AdminService,
    status: "approved" | "rejected"
  ) {
    setBusyId(service.id)

    try {
      const result = await setServiceStatusAction(service.id, status)

      if (!result.ok) {
        toast.error(result.message)
        return
      }

      applyStatus(service.id, status)
      toast.success(
        status === "approved"
          ? `“${service.name}” is now live on the marketplace.`
          : `“${service.name}” was rejected.`
      )
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Could not update this service. Please try again.")
    } finally {
      setBusyId(null)
    }
  }

  async function confirmDelete() {
    if (!deleting) return

    setDeleteBusy(true)

    try {
      const result = await deleteServiceAction(deleting.id)

      if (!result.ok) {
        toast.error(result.message)
        return
      }

      const name = deleting.name
      setRemovedIds((current) => [...current, deleting.id])
      setViewing((current) =>
        current && current.id === deleting.id ? null : current
      )
      setDeleting(null)
      toast.success(`“${name}” was deleted.`)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Could not delete this service. Please try again.")
    } finally {
      setDeleteBusy(false)
    }
  }

  function reviewPending() {
    setFilter("pending")
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  if (error) {
    return (
      <div className={cn(CARD, "px-6 py-12 text-center")}>
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f5e8e4] text-[#b33a3a]">
          <BriefcaseIcon aria-hidden className="size-5" />
        </span>
        <h2 className="mt-4 font-display text-2xl text-[#2b2118]">
          Services unavailable
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#2b2118]/55">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {counts.pending > 0 ? (
        <div className="flex flex-col gap-3 rounded-xl border border-[#ecdfc3] bg-[#fdf6e6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Clock3Icon
              aria-hidden
              className="size-4 shrink-0 text-[#a9822e]"
            />
            <p className="text-sm text-[#5c4a25]">
              <span className="font-semibold">
                {counts.pending}{" "}
                {counts.pending === 1 ? "service is" : "services are"}
              </span>{" "}
              waiting for your review.
            </p>
          </div>

          <button
            type="button"
            onClick={reviewPending}
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-[#dcc9a0] bg-white px-3.5 text-xs font-medium text-[#6b5320] transition-colors hover:border-[#c9b17c] hover:bg-[#fffdf6] focus-visible:ring-3 focus-visible:ring-[#a9822e]/20 focus-visible:outline-none"
          >
            Review now
          </button>
        </div>
      ) : null}

      <div ref={listRef} className={cn(CARD, "scroll-mt-6 overflow-hidden")}>
        <div className="flex flex-col gap-3 border-b border-[#eee5d6] p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex w-full min-w-0 items-center gap-1 overflow-x-auto rounded-lg border border-[#e8decd] bg-[#fbf7ef] p-1 xl:w-auto">
            {FILTERS.map((option) => {
              const active = filter === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#7a1f3d]/25 focus-visible:outline-none",
                    active
                      ? "bg-white text-[#7a1f3d] shadow-[0_1px_2px_rgba(60,40,25,0.08)]"
                      : "text-[#2b2118]/55 hover:text-[#2b2118]/80"
                  )}
                >
                  {option.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[0.6rem] tabular-nums",
                      active
                        ? "bg-[#f3ece0] text-[#7a1f3d]"
                        : "bg-[#efe6d6] text-[#2b2118]/50"
                    )}
                  >
                    {counts[option.value]}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="sr-only" htmlFor="service-category">
              Filter by category
            </label>
            <select
              id="service-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-10 w-full shrink-0 rounded-lg border border-[#ddd2c2] bg-white px-3 text-sm text-[#2b2118]/75 transition-colors outline-none focus:border-[#7a1f3d] focus:ring-3 focus:ring-[#7a1f3d]/15 sm:w-44"
            >
              <option value="all">All categories</option>
              {categories.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>

            <div className="relative min-w-0 sm:w-64">
              <SearchIcon
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#2b2118]/35"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search service or vendor"
                aria-label="Search services"
                className="h-10 w-full rounded-lg border border-[#ddd2c2] bg-white pr-3 pl-9 text-sm text-[#2b2118] transition-colors outline-none placeholder:text-[#2b2118]/35 focus:border-[#7a1f3d] focus:ring-3 focus:ring-[#7a1f3d]/15"
              />
            </div>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-[#efe6d6] text-[#7a1f3d]">
              <BriefcaseIcon aria-hidden className="size-5" />
            </span>
            <h3 className="mt-3 font-display text-xl text-[#2b2118]">
              No services yet
            </h3>
            <p className="mt-1 max-w-sm text-sm leading-relaxed text-[#2b2118]/50">
              When a vendor publishes a service it will appear here for review.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-display text-xl text-[#2b2118]">
              No matching services
            </p>
            <p className="mt-1 text-sm text-[#2b2118]/50">
              Try a different search term, status or category.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#eee5d6]">
            {filtered.map((service) => {
              const busy = busyId === service.id

              return (
                <li
                  key={service.id}
                  className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-[#fdfbf6] sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-[#efe6d6]">
                      <ServiceThumb service={service} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-display text-lg leading-tight text-[#2b2118]">
                          {service.name}
                        </h3>
                        <StatusBadge status={service.status} />
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#2b2118]/55">
                        <span className="inline-flex min-w-0 items-center gap-1">
                          <StoreIcon
                            aria-hidden
                            className="size-3.5 shrink-0 text-[#b08a3e]"
                          />
                          <span className="truncate">
                            {service.vendorBusiness || service.vendorName}
                          </span>
                          {service.vendorPlan === "premium" ? (
                            <CrownIcon
                              aria-label="Premium vendor"
                              className="size-3.5 shrink-0 text-[#b08a3e]"
                            />
                          ) : null}
                        </span>

                        {service.category ? (
                          <span className="truncate">{service.category}</span>
                        ) : null}

                        {service.location ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPinIcon
                              aria-hidden
                              className="size-3.5 shrink-0"
                            />
                            {service.location}
                          </span>
                        ) : null}

                        <span className="font-medium text-[#2b2118]/80">
                          {formatPrice(service.price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewing(service)}
                      className={OUTLINE_BUTTON}
                    >
                      <EyeIcon aria-hidden className="size-3.5" />
                      View
                    </button>

                    {service.status !== "approved" ? (
                      <button
                        type="button"
                        onClick={() => changeStatus(service, "approved")}
                        disabled={busy}
                        className={PRIMARY_BUTTON}
                      >
                        {busy ? (
                          <LoaderCircleIcon
                            aria-hidden
                            className="size-3.5 animate-spin"
                          />
                        ) : (
                          <CheckIcon aria-hidden className="size-3.5" />
                        )}
                        Approve
                      </button>
                    ) : null}

                    {service.status !== "rejected" ? (
                      <button
                        type="button"
                        onClick={() => changeStatus(service, "rejected")}
                        disabled={busy}
                        className={DANGER_OUTLINE_BUTTON}
                      >
                        <XIcon aria-hidden className="size-3.5" />
                        Reject
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => setDeleting(service)}
                      disabled={busy}
                      aria-label={`Delete ${service.name}`}
                      className={ICON_BUTTON}
                    >
                      <Trash2Icon aria-hidden className="size-4" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        <div className="border-t border-[#eee5d6] px-5 py-3 text-xs text-[#2b2118]/45">
          Showing {filtered.length} of {rows.length} services
        </div>
      </div>

      {viewing ? (
        <Modal
          titleId="service-details-title"
          eyebrow="Service details"
          onClose={() => setViewing(null)}
        >
          <ServiceDetails
            service={viewing}
            busy={busyId === viewing.id}
            onApprove={() => changeStatus(viewing, "approved")}
            onReject={() => changeStatus(viewing, "rejected")}
            onDelete={() => setDeleting(viewing)}
          />
        </Modal>
      ) : null}

      {deleting ? (
        <Modal
          titleId="delete-service-title"
          eyebrow="Delete service"
          onClose={() => (deleteBusy ? undefined : setDeleting(null))}
        >
          <div className="space-y-4">
            <h3
              id="delete-service-title"
              className="font-display text-2xl text-[#2b2118]"
            >
              Delete “{deleting.name}”?
            </h3>
            <p className="text-sm leading-relaxed text-[#2b2118]/60">
              This permanently removes the service from the marketplace and
              cannot be undone. The vendor will need to publish it again.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                disabled={deleteBusy}
                className={OUTLINE_BUTTON}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteBusy}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#b23a52] px-3.5 text-xs font-medium text-white transition-colors hover:bg-[#9c3147] focus-visible:ring-3 focus-visible:ring-[#b23a52]/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteBusy ? (
                  <LoaderCircleIcon
                    aria-hidden
                    className="size-3.5 animate-spin"
                  />
                ) : (
                  <Trash2Icon aria-hidden className="size-3.5" />
                )}
                Delete service
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

function Modal({
  eyebrow,
  titleId,
  onClose,
  children,
}: {
  eyebrow: string
  titleId: string
  onClose: () => void
  children: React.ReactNode
}) {
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-[#e8decd] bg-[#fdfaf5] shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#eee5d6] px-5 py-4">
          <p className="text-[0.62rem] font-medium tracking-[0.2em] text-[#a98a4b] uppercase">
            {eyebrow}
          </p>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#2b2118]/45 transition-colors hover:bg-[#efe6d6] hover:text-[#2b2118] focus-visible:ring-2 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none"
          >
            <XIcon aria-hidden className="size-4" />
          </button>
        </div>

        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  )
}
