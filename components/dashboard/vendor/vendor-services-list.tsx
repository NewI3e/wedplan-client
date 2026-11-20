"use client"

import * as React from "react"
import Link from "next/link"
import {
  CircleAlertIcon,
  CirclePlusIcon,
  CrownIcon,
  ImageIcon,
  LoaderCircleIcon,
  MapPinIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"

import { dashboardPaths } from "@/lib/dashboard"
import { cn } from "@/lib/utils"

// Remove trailing slashes so "http://localhost:5000/" never becomes "//services".
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "")

// TODO: read this from the vendor's real subscription instead of a constant.
const PLAN_LIMIT = 3
const NEW_SERVICE_HREF = "/dashboard/vendor/services/new"

type ServiceStatus = "pending" | "approved" | "rejected"

type Service = {
  _id: string
  name: string
  category: string
  location: string
  price: number
  description: string
  photoUrl?: string | null
  status: ServiceStatus
  available?: boolean
}

type EditValues = {
  name: string
  price: number
  description: string
}

const priceFormatter = new Intl.NumberFormat("en-BD")

const inputClasses =
  "h-11 w-full min-w-0 rounded-lg border border-[#ddd2c2] bg-white px-3.5 text-base text-[#2b2118] outline-none transition-colors placeholder:text-[#2b2118]/35 focus:border-[#7a1f3d] focus:ring-3 focus:ring-[#7a1f3d]/15 aria-invalid:border-red-400 aria-invalid:ring-red-200/60 sm:text-sm"

const iconButtonClasses =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#e8decd] bg-white text-[#2b2118]/70 transition-colors hover:bg-[#faf4ea] hover:text-[#2b2118] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/25 focus-visible:outline-none"

async function request(path: string, init?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })

  if (!res.ok) {
    const body = await res.text()
    console.error("Status:", res.status, "Body:", body)
    throw new Error(`Request failed: ${res.status}`)
  }

  return res
}

const isActive = (service: Service) => service.available !== false

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: ServiceStatus }) {
  const styles: Record<ServiceStatus, string> = {
    approved: "bg-[#e6f2ea] text-[#3f7a52]",
    pending: "bg-[#f8efdd] text-[#8a6a1f]",
    rejected: "bg-red-50 text-red-600",
  }
  const labels: Record<ServiceStatus, string> = {
    approved: "Approved",
    pending: "Pending",
    rejected: "Rejected",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status]
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {labels[status]}
    </span>
  )
}

function Switch({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean
  disabled?: boolean
  label: string
  onChange: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-[#7a1f3d]" : "bg-[#ddd2c2]"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform",
          checked && "translate-x-5"
        )}
      />
    </button>
  )
}

// Native <dialog>: focus trap, Escape to close and backdrop come for free.
function Modal({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
}) {
  const ref = React.useRef<HTMLDialogElement>(null)

  React.useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        // Only a click on the backdrop itself closes it.
        if (event.target === event.currentTarget) onClose()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-[#e8decd] bg-[#fbf8f3] p-0 text-[#2b2118] shadow-xl backdrop:bg-black/50"
    >
      {open ? (
        <div className="relative p-5 sm:p-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-full text-[#2b2118]/60 transition-colors hover:bg-[#2b2118]/5 focus-visible:ring-2 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none"
          >
            <XIcon aria-hidden className="size-4" />
          </button>

          <h2 className="font-display pr-8 text-xl font-medium sm:text-2xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-1.5 text-sm text-[#2b2118]/65">{description}</p>
          ) : null}

          <div className="mt-5">{children}</div>
        </div>
      ) : null}
    </dialog>
  )
}

function EditServiceForm({
  service,
  saving,
  error,
  onCancel,
  onSave,
}: {
  service: Service
  saving: boolean
  error: string | null
  onCancel: () => void
  onSave: (values: EditValues) => void
}) {
  const [name, setName] = React.useState(service.name)
  const [price, setPrice] = React.useState(String(service.price))
  const [description, setDescription] = React.useState(service.description)
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof EditValues, string>>
  >({})

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return

    const nextErrors: typeof errors = {}
    const priceNumber = Number(price)

    if (!name.trim()) nextErrors.name = "Give your service a name."
    if (!price.trim() || !Number.isFinite(priceNumber) || priceNumber <= 0) {
      nextErrors.price = "Use a price greater than 0."
    }
    if (!description.trim()) {
      nextErrors.description = "Tell customers what's included."
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSave({
      name: name.trim(),
      price: priceNumber,
      description: description.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor="edit-name"
          className="block text-sm font-medium text-[#2b2118]"
        >
          Service name
        </label>
        <input
          id="edit-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={Boolean(errors.name)}
          className={inputClasses}
        />
        {errors.name ? (
          <p className="text-xs text-red-600">{errors.name}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="edit-price"
          className="block text-sm font-medium text-[#2b2118]"
        >
          Price (৳)
        </label>
        <input
          id="edit-price"
          type="number"
          inputMode="numeric"
          min={0}
          step={100}
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          aria-invalid={Boolean(errors.price)}
          className={inputClasses}
        />
        {errors.price ? (
          <p className="text-xs text-red-600">{errors.price}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="edit-description"
          className="block text-sm font-medium text-[#2b2118]"
        >
          Description
        </label>
        <textarea
          id="edit-description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          aria-invalid={Boolean(errors.description)}
          className={cn(inputClasses, "h-auto resize-y py-3 leading-relaxed")}
        />
        {errors.description ? (
          <p className="text-xs text-red-600">{errors.description}</p>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2.5 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-[#e8decd] bg-white px-4 text-sm font-medium text-[#2b2118] transition-colors hover:bg-[#faf4ea] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/25 focus-visible:outline-none"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#7a1f3d] px-4 text-sm font-medium text-[#f8f2e7] transition-colors hover:bg-[#671a33] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? (
            <LoaderCircleIcon aria-hidden className="size-4 animate-spin" />
          ) : null}
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  )
}

function ServiceRow({
  service,
  onToggle,
  onEdit,
  onDelete,
}: {
  service: Service
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const active = isActive(service)

  return (
    <li className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5">
      <div className="flex min-w-0 items-start gap-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-[#f1e9dc]">
          {service.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={service.photoUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center text-[#b08a3e]">
              <ImageIcon aria-hidden className="size-6" />
            </span>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h3 className="font-display text-lg leading-tight font-medium text-[#2b2118] sm:text-xl">
              {service.name}
            </h3>
            <StatusBadge status={service.status} />
          </div>

          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#2b2118]/60">
            <span>{service.category}</span>
            <span className="inline-flex items-center gap-1">
              <MapPinIcon aria-hidden className="size-3.5" />
              {service.location}
            </span>
            <span className="font-medium text-[#2b2118]">
              ৳{priceFormatter.format(service.price)}
            </span>
          </p>

          {service.status === "pending" ? (
            <p className="mt-1 text-xs text-[#2b2118]/55">
              Waiting for admin review — not visible to customers yet.
            </p>
          ) : null}
          {service.status === "rejected" ? (
            <p className="mt-1 text-xs text-red-600">
              Rejected by admin — hidden from customers. Edit and resubmit.
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
        <div className="flex items-center gap-2.5">
          <Switch
            checked={active}
            disabled={service.status === "rejected"}
            label={`${active ? "Pause" : "Activate"} ${service.name}`}
            onChange={onToggle}
          />
          <span className="min-w-[4.25rem] text-sm text-[#2b2118]/65">
            {active ? "Available" : "Paused"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${service.name}`}
            className={iconButtonClasses}
          >
            <PencilIcon aria-hidden className="size-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${service.name}`}
            className={cn(
              iconButtonClasses,
              "border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700"
            )}
          >
            <Trash2Icon aria-hidden className="size-4" />
          </button>
        </div>
      </div>
    </li>
  )
}

function ListSkeleton() {
  return (
    <ul
      aria-busy
      aria-label="Loading services"
      className="divide-y divide-[#eee4d5]"
    >
      {[0, 1, 2].map((item) => (
        <li key={item} className="flex animate-pulse items-center gap-4 p-5">
          <div className="size-16 shrink-0 rounded-lg bg-[#f1e9dc]" />
          <div className="flex-1 space-y-2.5">
            <div className="h-4 w-1/2 rounded bg-[#f1e9dc]" />
            <div className="h-3 w-1/3 rounded bg-[#f1e9dc]" />
          </div>
        </li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export function VendorServicesList({ vendorEmail }: { vendorEmail?: string }) {
  const [services, setServices] = React.useState<Service[] | null>(null)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [actionError, setActionError] = React.useState<string | null>(null)
  const [reloadKey, setReloadKey] = React.useState(0)

  const [editing, setEditing] = React.useState<Service | null>(null)
  const [deleting, setDeleting] = React.useState<Service | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [dialogError, setDialogError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const controller = new AbortController()
    const query = vendorEmail
      ? `?email=${encodeURIComponent(vendorEmail)}`
      : ""

    fetch(`${API_URL}/services`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) {
          console.error("Status:", res.status, "Body:", await res.text())
          throw new Error(`Request failed: ${res.status}`)
        }
        return (await res.json()) as Service[]
      })
      .then(setServices)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return
        console.error(error)
        setLoadError("Could not load your services.")
      })

    return () => controller.abort()
  }, [vendorEmail, reloadKey])

  function retry() {
    setServices(null)
    setLoadError(null)
    setReloadKey((key) => key + 1)
  }

  function patchLocal(id: string, changes: Partial<Service>) {
    setServices((current) =>
      current
        ? current.map((item) =>
            item._id === id ? { ...item, ...changes } : item
          )
        : current
    )
  }

  const activeCount = services?.filter(isActive).length ?? 0
  const atLimit = activeCount >= PLAN_LIMIT

  async function toggleAvailable(service: Service) {
    const nextActive = !isActive(service)
    setActionError(null)

    if (nextActive && atLimit) {
      setActionError(
        `The Free plan allows ${PLAN_LIMIT} active services. Upgrade to activate more.`
      )
      return
    }

    // Optimistic update, rolled back if the server says no.
    patchLocal(service._id, { available: nextActive })
    try {
      await request(`/services/${service._id}`, {
        method: "PATCH",
        body: JSON.stringify({ available: nextActive }),
      })
    } catch (error) {
      console.error(error)
      patchLocal(service._id, { available: !nextActive })
      setActionError("Could not update availability. Please try again.")
    }
  }

  async function saveEdit(values: EditValues) {
    if (!editing) return
    setSaving(true)
    setDialogError(null)

    try {
      const res = await request(`/services/${editing._id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      })
      const updated = (await res.json()) as Service
      patchLocal(editing._id, updated)
      setEditing(null)
    } catch (error) {
      console.error(error)
      setDialogError("Could not save your changes. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    setSaving(true)
    setDialogError(null)

    try {
      await request(`/services/${deleting._id}`, { method: "DELETE" })
      const id = deleting._id
      setServices((current) =>
        current ? current.filter((item) => item._id !== id) : current
      )
      setDeleting(null)
    } catch (error) {
      console.error(error)
      setDialogError("Could not delete this service. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  function openEdit(service: Service) {
    setDialogError(null)
    setEditing(service)
  }

  function openDelete(service: Service) {
    setDialogError(null)
    setDeleting(service)
  }

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#2b2118]/65">
          {services
            ? `${activeCount} of ${PLAN_LIMIT} active services used on the Free plan`
            : "Loading your services..."}
        </p>
        <Link
          href={NEW_SERVICE_HREF}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#7a1f3d] px-5 text-sm font-medium text-[#f8f2e7] transition-colors hover:bg-[#671a33] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none sm:w-auto"
        >
          <CirclePlusIcon aria-hidden className="size-4" />
          Add service
        </Link>
      </div>

      {services && atLimit ? (
        <div className="flex flex-col gap-3 rounded-xl border border-[#e6cda2] bg-gradient-to-r from-[#f8efdd] via-[#f3e3c6] to-[#e9cfa3] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
          <p className="flex items-start gap-3 text-sm leading-relaxed text-[#5b4425] sm:items-center">
            <CrownIcon
              aria-hidden
              className="mt-0.5 size-5 shrink-0 text-[#7a5a22] sm:mt-0"
            />
            <span className="min-w-0">
              You&apos;ve reached the Free plan limit. New or paused services
              can&apos;t go live until you upgrade.
            </span>
          </p>
          <Link
            href={dashboardPaths.vendor.subscription}
            className="inline-flex h-10 w-full shrink-0 items-center justify-center rounded-full bg-[#7a1f3d] px-5 text-xs font-medium text-[#f8f2e7] transition-colors hover:bg-[#671a33] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none sm:h-9 sm:w-auto"
          >
            See Premium
          </Link>
        </div>
      ) : null}

      {actionError ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
        >
          <CircleAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
          {actionError}
        </p>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-[#e8decd] bg-white shadow-sm">
        {loadError ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <p className="text-sm text-[#2b2118]/70">{loadError}</p>
            <button
              type="button"
              onClick={retry}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[#e8decd] bg-white px-4 text-sm font-medium text-[#2b2118] transition-colors hover:bg-[#faf4ea] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/25 focus-visible:outline-none"
            >
              Try again
            </button>
          </div>
        ) : services === null ? (
          <ListSkeleton />
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <h3 className="font-display text-xl font-medium text-[#2b2118]">
              No services yet
            </h3>
            <p className="max-w-sm text-sm text-[#2b2118]/65">
              Add your first service and it will appear on Browse Services once
              our team approves it.
            </p>
            <Link
              href={NEW_SERVICE_HREF}
              className="mt-1 inline-flex h-10 items-center justify-center rounded-lg bg-[#7a1f3d] px-5 text-sm font-medium text-[#f8f2e7] transition-colors hover:bg-[#671a33] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none"
            >
              Add service
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-[#eee4d5]">
            {services.map((service) => (
              <ServiceRow
                key={service._id}
                service={service}
                onToggle={() => toggleAvailable(service)}
                onEdit={() => openEdit(service)}
                onDelete={() => openDelete(service)}
              />
            ))}
          </ul>
        )}
      </section>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Edit service"
        description={
          editing?.status === "approved"
            ? "Changes to an approved service go live right away."
            : editing?.status === "rejected"
              ? "Saving sends this service back to our team for review."
              : "Your service is still waiting for review."
        }
      >
        {editing ? (
          <EditServiceForm
            key={editing._id}
            service={editing}
            saving={saving}
            error={dialogError}
            onCancel={() => setEditing(null)}
            onSave={saveEdit}
          />
        ) : null}
      </Modal>

      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={deleting ? `Delete “${deleting.name}”?` : "Delete service?"}
        description="This removes the service and its photos. Existing booking requests stay in your history."
      >
        {dialogError ? (
          <p role="alert" className="mb-3 text-xs text-red-600">
            {dialogError}
          </p>
        ) : null}
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={() => setDeleting(null)}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#e8decd] bg-white px-4 text-sm font-medium text-[#2b2118] transition-colors hover:bg-[#faf4ea] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/25 focus-visible:outline-none"
          >
            Keep it
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            disabled={saving}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:ring-3 focus-visible:ring-red-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? (
              <LoaderCircleIcon aria-hidden className="size-4 animate-spin" />
            ) : null}
            {saving ? "Deleting..." : "Delete service"}
          </button>
        </div>
      </Modal>
    </div>
  )
}
