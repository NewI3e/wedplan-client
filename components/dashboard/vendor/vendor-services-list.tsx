"use client"

import * as React from "react"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner"
import {
  ImageIcon,
  ImagePlusIcon,
  LoaderCircleIcon,
  MapPinIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"

import { uploadImage, UploadError } from "@/lib/upload-image"
import { cn } from "@/lib/utils"

type ServiceStatus = "pending" | "approved" | "rejected" | string

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

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "")

const SERVICE_PHOTO_ENDPOINT = "/api/service-photo"

const MAX_PHOTO_BYTES = 5 * 1024 * 1024

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"]

const emptyForm = {
  name: "",
  category: "",
  location: "",
  price: "",
  description: "",
  photoUrl: "",
}

export function VendorServicesList() {
  const { data: session, isPending } = useSession()

  const vendorEmail = session?.user?.email

  const [services, setServices] = React.useState<Service[] | null>(null)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [reloadKey, setReloadKey] = React.useState(0)

  const [editingService, setEditingService] = React.useState<Service | null>(
    null
  )
  const [deletingService, setDeletingService] = React.useState<Service | null>(
    null
  )

  const [form, setForm] = React.useState(emptyForm)
  const [saving, setSaving] = React.useState(false)
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const editFileInputRef = React.useRef<HTMLInputElement>(null)
  const editObjectUrlRef = React.useRef<string | null>(null)
  const [photoFile, setPhotoFile] = React.useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null)
  const [photoError, setPhotoError] = React.useState<string | null>(null)

  React.useEffect(() => {
    return () => {
      if (editObjectUrlRef.current) {
        URL.revokeObjectURL(editObjectUrlRef.current)
      }
    }
  }, [])

  function clearEditPhoto() {
    if (editObjectUrlRef.current) {
      URL.revokeObjectURL(editObjectUrlRef.current)
      editObjectUrlRef.current = null
    }

    setPhotoFile(null)
    setPhotoPreview(null)
    setPhotoError(null)

    if (editFileInputRef.current) editFileInputRef.current.value = ""
  }

  function selectEditPhoto(file: File | undefined) {
    if (!file) return

    if (!PHOTO_TYPES.includes(file.type)) {
      setPhotoError("Please choose a JPG, PNG or WebP image.")
      return
    }

    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("Please choose an image under 5 MB.")
      return
    }

    if (editObjectUrlRef.current) {
      URL.revokeObjectURL(editObjectUrlRef.current)
    }

    const url = URL.createObjectURL(file)
    editObjectUrlRef.current = url

    setPhotoFile(file)
    setPhotoPreview(url)
    setPhotoError(null)
  }

  function removeEditPhoto() {
    clearEditPhoto()
    setForm((current) => ({ ...current, photoUrl: "" }))
  }

  function closeEditModal() {
    clearEditPhoto()
    setEditingService(null)
    setForm(emptyForm)
  }

  const editPhotoSrc = photoPreview ?? (form.photoUrl.trim() || null)

  React.useEffect(() => {
    if (isPending || !vendorEmail || !API_URL) {
      return
    }

    const controller = new AbortController()

    const query = `?email=${encodeURIComponent(vendorEmail.trim().toLowerCase())}`

    console.log("Fetching services for:", vendorEmail)

    fetch(`${API_URL}/My-services${query}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.text()

          console.error("API Error:", res.status, body)

          throw new Error(`Request failed: ${res.status}`)
        }

        return (await res.json()) as Service[]
      })
      .then((data) => {
        console.log("Services received:", data)

        setServices(Array.isArray(data) ? data : [])
        setLoadError(null)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return
        }

        console.error("Failed to load services:", error)
        setLoadError("Could not load your services. Please try again.")
      })

    return () => controller.abort()
  }, [vendorEmail, reloadKey, isPending])

  const handleEdit = (service: Service) => {
    clearEditPhoto()
    setEditingService(service)

    setForm({
      name: service.name ?? "",
      category: service.category ?? "",
      location: service.location ?? "",
      price: String(service.price ?? ""),
      description: service.description ?? "",
      photoUrl: service.photoUrl ?? "",
    })
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!editingService) return

    if (!form.name.trim() || !form.category.trim() || !form.location.trim()) {
      toast.error("Please fill in all required fields.")
      return
    }

    const price = Number(form.price)

    if (!Number.isFinite(price) || price < 0) {
      toast.error("Please enter a valid price.")
      return
    }

    setSaving(true)

    try {
      const photoUrl = photoFile
        ? await uploadImage(photoFile, SERVICE_PHOTO_ENDPOINT)
        : form.photoUrl.trim() || null

      const res = await fetch(`${API_URL}/services/${editingService._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category.trim(),
          location: form.location.trim(),
          price,
          description: form.description.trim(),
          photoUrl,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to update service")
      }

      toast.success("Service updated successfully!")

      closeEditModal()
      setReloadKey((prev) => prev + 1)
    } catch (error) {
      console.error(error)
      toast.error(
        error instanceof UploadError
          ? error.message
          : "Could not update service."
      )
    } finally {
      setSaving(false)
    }
  }

  const handleAvailability = async (service: Service) => {
    const nextAvailable = !(service.available ?? true)

    setUpdatingId(service._id)

    try {
      const res = await fetch(`${API_URL}/services/${service._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          available: nextAvailable,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to update availability")
      }

      setServices(
        (prev) =>
          prev?.map((item) =>
            item._id === service._id
              ? { ...item, available: nextAvailable }
              : item
          ) ?? []
      )

      toast.success(
        nextAvailable
          ? "Service is now available."
          : "Service is now unavailable."
      )
    } catch (error) {
      console.error(error)
      toast.error("Could not update availability.")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deletingService) return

    setDeleting(true)

    try {
      const res = await fetch(`${API_URL}/services/${deletingService._id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete service")
      }

      toast.success("Service deleted successfully!")

      setDeletingService(null)
      setReloadKey((prev) => prev + 1)
    } catch (error) {
      console.error(error)
      toast.error("Could not delete service.")
    } finally {
      setDeleting(false)
    }
  }

  if (isPending) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <LoaderCircleIcon className="h-7 w-7 animate-spin text-primary" />
      </div>
    )
  }

  if (!vendorEmail) {
    return (
      <div className="rounded-xl border p-6 text-center">
        <h3 className="font-semibold">Please sign in</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          You need to sign in to view your services.
        </p>
      </div>
    )
  }

  if (!API_URL) {
    return (
      <div className="rounded-xl border border-destructive/30 p-6 text-center">
        <p className="text-sm text-destructive">
          API URL is missing. Please check your environment variables.
        </p>
      </div>
    )
  }

  if (services === null && !loadError) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <LoaderCircleIcon className="h-7 w-7 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">My Services</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the services you offer to customers.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          {services?.length ?? 0} services
        </p>
      </div>

      {/* Error */}
      {loadError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{loadError}</p>

          <button
            type="button"
            onClick={() => {
              setLoadError(null)
              setServices(null)
              setReloadKey((prev) => prev + 1)
            }}
            className="mt-3 text-sm font-medium text-destructive underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loadError && services?.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <ImageIcon className="h-7 w-7 text-muted-foreground" />
          </div>

          <h3 className="text-lg font-semibold">No services found</h3>

          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            You have not added any services yet. Add your first service to get
            started.
          </p>
        </div>
      )}

      {/* Services list */}
      {!loadError && services && services.length > 0 && (
        <div className="grid gap-4">
          {services.map((service) => {
            const isAvailable = service.available ?? true
            const isUpdating = updatingId === service._id

            return (
              <div
                key={service._id}
                className="overflow-hidden rounded-2xl border bg-card"
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  {/* Service image */}
                  <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-28">
                    {service.photoUrl ? (
                      <img
                        src={service.photoUrl}
                        alt={service.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Service information */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {service.name}
                      </h3>

                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground capitalize">
                        {service.status}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {service.category}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="h-4 w-4" />
                        {service.location}
                      </span>

                      <span className="font-semibold text-foreground">
                        ৳{service.price}
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleAvailability(service)}
                      className={cn(
                        "rounded-lg px-3 py-2 text-xs font-medium transition disabled:opacity-50",
                        isAvailable
                          ? "bg-green-500/10 text-green-700 hover:bg-green-500/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/70"
                      )}
                    >
                      {isUpdating
                        ? "Updating..."
                        : isAvailable
                          ? "Available"
                          : "Unavailable"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEdit(service)}
                      className="rounded-lg border p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      aria-label="Edit service"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingService(service)}
                      className="rounded-lg border p-2 text-destructive transition hover:bg-destructive/10"
                      aria-label="Delete service"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl border bg-background p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit Service</h3>

              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Service Name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Category
                  </label>
                  <input
                    required
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Price (৳)
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Location
                </label>
                <input
                  required
                  value={form.location}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      location: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-medium">
                  Service Photo
                </span>

                <div className="flex items-center gap-3">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-dashed bg-muted">
                    {editPhotoSrc ? (
                      <img
                        src={editPhotoSrc}
                        alt="Service photo preview"
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <ImagePlusIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {editPhotoSrc ? "Change photo" : "Upload photo"}
                      </button>

                      {editPhotoSrc ? (
                        <button
                          type="button"
                          onClick={removeEditPhoto}
                          className="text-sm text-muted-foreground hover:text-destructive"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      JPG, PNG or WebP, up to 5 MB.
                    </p>

                    {photoError ? (
                      <p className="mt-1 text-xs text-destructive">
                        {photoError}
                      </p>
                    ) : null}
                  </div>
                </div>

                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    selectEditPhoto(event.target.files?.[0])
                    event.target.value = ""
                  }}
                  className="sr-only"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  className="w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  {saving && (
                    <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deletingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl border bg-background p-6 shadow-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Trash2Icon className="h-6 w-6 text-destructive" />
            </div>

            <h3 className="text-lg font-semibold">Delete this service?</h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <strong>{deletingService.name}</strong>? This action cannot be
              undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeletingService(null)}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {deleting && (
                  <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
