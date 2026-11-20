"use client"

import * as React from "react"
import Link from "next/link"
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  CircleAlertIcon,
  CrownIcon,
  ImagePlusIcon,
  LoaderCircleIcon,
  XIcon,
} from "lucide-react"

import { dashboardPaths } from "@/lib/dashboard"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  "Photography",
  "Venue",
  "Catering",
  "Decor & Styling",
  "Makeup & Beauty",
  "Fashion & Attire",
] as const

const LOCATIONS = [
  "Dhaka",
  "Chattogram",
  "Sylhet",
  "Khulna",
  "Rajshahi",
  "Barishal",
  "Rangpur",
  "Mymensingh",
] as const

const MAX_PHOTO_BYTES = 5 * 1024 * 1024

type FormValues = {
  name: string
  category: string
  location: string
  price: string
  description: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>
type SubmitStatus = "idle" | "submitting" | "submitted"

const initialValues: FormValues = {
  name: "",
  category: "",
  location: "",
  price: "",
  description: "",
}

// text-base on mobile keeps iOS Safari from zooming into focused fields.
const inputClasses =
  "h-11 w-full min-w-0 rounded-lg border border-[#ddd2c2] bg-white px-3.5 text-base text-[#2b2118] outline-none transition-colors placeholder:text-[#2b2118]/35 focus:border-[#7a1f3d] focus:ring-3 focus:ring-[#7a1f3d]/15 aria-invalid:border-red-400 aria-invalid:ring-red-200/60 sm:text-sm"

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  const price = Number(values.price)

  if (!values.name.trim()) errors.name = "Give your service a name."
  if (!values.category) errors.category = "Choose a category."
  if (!values.location) errors.location = "Choose where you work."
  if (!values.price.trim()) {
    errors.price = "Add a starting price."
  } else if (!Number.isFinite(price) || price <= 0) {
    errors.price = "Use a price greater than 0."
  }
  if (!values.description.trim()) {
    errors.description = "Tell customers what's included."
  }

  return errors
}

function SelectField({
  id,
  name,
  value,
  options,
  placeholder,
  invalid,
  onChange,
}: {
  id: string
  name: string
  value: string
  options: readonly string[]
  placeholder: string
  invalid: boolean
  onChange: (value: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLUListElement>(null)
  const listId = `${id}-listbox`

  // Close when clicking or tapping outside.
  React.useEffect(() => {
    if (!open) return
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [open])

  // Keep the highlighted option visible while using the keyboard.
  React.useEffect(() => {
    if (!open) return
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" })
  }, [open, activeIndex])

  function openList() {
    setActiveIndex(Math.max(options.indexOf(value), 0))
    setOpen(true)
  }

  function choose(option: string) {
    onChange(option)
    setOpen(false)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        if (!open) openList()
        else setActiveIndex((i) => Math.min(i + 1, options.length - 1))
        break
      case "ArrowUp":
        event.preventDefault()
        if (!open) openList()
        else setActiveIndex((i) => Math.max(i - 1, 0))
        break
      case "Enter":
      case " ":
        event.preventDefault()
        if (!open) openList()
        else choose(options[activeIndex])
        break
      case "Escape":
        if (open) {
          event.preventDefault()
          setOpen(false)
        }
        break
      case "Tab":
        setOpen(false)
        break
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={invalid}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleKeyDown}
        className={cn(
          inputClasses,
          "flex items-center justify-between gap-2 text-left"
        )}
      >
        <span className={cn("truncate", !value && "text-[#2b2118]/40")}>
          {value || placeholder}
        </span>
        <ChevronDownIcon
          aria-hidden
          className={cn(
            "size-4 shrink-0 text-[#2b2118]/40 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className="absolute top-full right-0 left-0 z-30 mt-1 max-h-60 overflow-auto rounded-lg border border-[#ddd2c2] bg-white py-1 shadow-lg"
        >
          {options.map((option, index) => (
            <li
              key={option}
              role="option"
              aria-selected={option === value}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => choose(option)}
              className={cn(
                "cursor-pointer px-3.5 py-2.5 text-base text-[#2b2118] sm:py-2 sm:text-sm",
                index === activeIndex && "bg-[#f7efe4]",
                option === value && "font-medium text-[#7a1f3d]"
              )}
            >
              {option}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function AddServiceForm() {
  const [values, setValues] = React.useState(initialValues)
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(null)
  const [photoName, setPhotoName] = React.useState<string | null>(null)
  const [photoError, setPhotoError] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [status, setStatus] = React.useState<SubmitStatus>("idle")

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const objectUrlRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
    // Editing after a submit lets the vendor send it again.
    setStatus((current) => (current === "submitted" ? "idle" : current))
  }

  function handleFile(file: File | undefined) {
    if (!file) return

    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      setPhotoError("Please choose a JPG or PNG image.")
      return
    }

    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("Please choose an image under 5 MB.")
      return
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(file)
    objectUrlRef.current = url
    setPhotoUrl(url)
    setPhotoName(file.name)
    setPhotoError(null)
    setStatus((current) => (current === "submitted" ? "idle" : current))
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    handleFile(event.target.files?.[0])
    // Reset so choosing the same file again still fires onChange.
    event.target.value = ""
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    handleFile(event.dataTransfer.files?.[0])
  }

  function removePhoto() {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    objectUrlRef.current = null
    setPhotoUrl(null)
    setPhotoName(null)
    setPhotoError(null)
    setStatus((current) => (current === "submitted" ? "idle" : current))
  }

  const [submitError, setSubmitError] = React.useState<string | null>(null)

async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault()
  if (status !== "idle") return

  const nextErrors = validate(values)
  setErrors(nextErrors)
  if (Object.keys(nextErrors).length > 0) return

  setStatus("submitting")
  setSubmitError(null)

  // Remove trailing slashes so "http://localhost:5000/" doesn't become "//services".
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "")

  try {
    const res = await fetch(`${apiUrl}/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name.trim(),
        category: values.category,
        location: values.location,
        price: Number(values.price),
        description: values.description.trim(),
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error("Status:", res.status, "Body:", body)
      throw new Error(`Request failed: ${res.status}`)
    }

    const result = await res.json()
    console.log("Inserted:", result)
    setStatus("submitted")
  } catch (error) {
    console.error(error)
    setSubmitError("Could not submit your service. Please try again.")
    setStatus("idle")
  }
}

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-6">
      {/* Plan banner: stacked on mobile, inline from sm up */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#e6cda2] bg-gradient-to-r from-[#f8efdd] via-[#f3e3c6] to-[#e9cfa3] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
        <p className="flex items-start gap-3 text-sm leading-relaxed text-[#5b4425] sm:items-center">
          <CrownIcon
            aria-hidden
            className="mt-0.5 size-5 shrink-0 text-[#7a5a22] sm:mt-0"
          />
          <span className="min-w-0">
            You have 3 of 3 active services. This one will be saved as paused
            unless you upgrade.
          </span>
        </p>
        <Link
          href={dashboardPaths.vendor.subscription}
          className="inline-flex h-10 w-full shrink-0 items-center justify-center rounded-full bg-[#7a1f3d] px-5 text-xs font-medium text-[#f8f2e7] transition-colors hover:bg-[#671a33] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none sm:h-9 sm:w-auto"
        >
          Upgrade
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] lg:gap-6"
      >
        <section className="min-w-0 rounded-xl border border-[#e8decd] bg-white shadow-sm">
          <header className="border-b border-[#eee4d5] px-4 py-3.5 sm:px-6 sm:py-4">
            <h2 className="font-display text-xl font-medium text-[#2b2118] sm:text-2xl">
              Service details
            </h2>
          </header>

          <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
            <div className="space-y-1.5">
              <label
                htmlFor="service-name"
                className="block text-sm font-medium text-[#2b2118]"
              >
                Service name
              </label>
              <input
                id="service-name"
                name="name"
                type="text"
                autoComplete="off"
                value={values.name}
                onChange={(event) => update("name", event.target.value)}
                placeholder="e.g. Garden Ceremony Florals"
                aria-invalid={Boolean(errors.name)}
                className={inputClasses}
              />
              {errors.name ? (
                <p className="text-xs text-red-600">{errors.name}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <div className="min-w-0 space-y-1.5">
                <label
                  htmlFor="service-category"
                  className="block text-sm font-medium text-[#2b2118]"
                >
                  Category
                </label>
                <SelectField
                  id="service-category"
                  name="category"
                  value={values.category}
                  options={CATEGORIES}
                  placeholder="Choose a category"
                  invalid={Boolean(errors.category)}
                  onChange={(next) => update("category", next)}
                />
                {errors.category ? (
                  <p className="text-xs text-red-600">{errors.category}</p>
                ) : null}
              </div>

              <div className="min-w-0 space-y-1.5">
                <label
                  htmlFor="service-location"
                  className="block text-sm font-medium text-[#2b2118]"
                >
                  Location
                </label>
                <SelectField
                  id="service-location"
                  name="location"
                  value={values.location}
                  options={LOCATIONS}
                  placeholder="Where do you work?"
                  invalid={Boolean(errors.location)}
                  onChange={(next) => update("location", next)}
                />
                {errors.location ? (
                  <p className="text-xs text-red-600">{errors.location}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="service-price"
                className="block text-sm font-medium text-[#2b2118]"
              >
                Price (৳)
              </label>
              <input
                id="service-price"
                name="price"
                type="number"
                inputMode="numeric"
                min={0}
                step={100}
                value={values.price}
                onChange={(event) => update("price", event.target.value)}
                placeholder="65000"
                aria-invalid={Boolean(errors.price)}
                className={inputClasses}
              />
              {errors.price ? (
                <p className="text-xs text-red-600">{errors.price}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="service-description"
                className="block text-sm font-medium text-[#2b2118]"
              >
                Description
              </label>
              <textarea
                id="service-description"
                name="description"
                rows={5}
                value={values.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="What's included, how many hours, team size, delivery time..."
                aria-invalid={Boolean(errors.description)}
                className={cn(
                  inputClasses,
                  "h-auto min-h-28 resize-y py-3 leading-relaxed sm:min-h-36"
                )}
              />
              {errors.description ? (
                <p className="text-xs text-red-600">{errors.description}</p>
              ) : null}
            </div>
          </div>
        </section>

        {/*
          Right column:
          - mobile: stacked
          - md (tablet): photo + submit side by side
          - lg: stacked sidebar next to the details card
        */}
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:items-start lg:flex lg:flex-col lg:items-stretch lg:gap-6">
          <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#e8decd] bg-white shadow-sm lg:flex-1">
            <header className="border-b border-[#eee4d5] px-4 py-3.5 sm:px-6 sm:py-4">
              <h2 className="font-display text-xl font-medium text-[#2b2118] sm:text-2xl">
                Service photo
              </h2>
            </header>

            <div className="flex flex-1 flex-col p-4 sm:p-6">
              <div
                role="button"
                tabIndex={0}
                aria-label={
                  photoUrl ? "Change service photo" : "Upload a service photo"
                }
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    fileInputRef.current?.click()
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                  // Shorter 4:3 box on phones, fills the column on desktop.
                  "group relative flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed px-4 text-center transition-colors focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/20 focus-visible:outline-none sm:aspect-[16/10] md:aspect-[4/3] lg:aspect-auto lg:min-h-[360px] lg:flex-1",
                  isDragging
                    ? "border-[#7a1f3d] bg-[#f7efe4]"
                    : "border-[#cfbda4] bg-[#fbf8f3] hover:border-[#7a1f3d]/50 hover:bg-[#faf4ea]"
                )}
              >
                {photoUrl ? (
                  <>
                    {/* Object URLs can't go through next/image. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoUrl}
                      alt="Selected service photo preview"
                      className="absolute inset-0 size-full object-cover"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10"
                    />

                    <span className="relative z-10 rounded-full bg-white/90 px-4 py-1.5 text-xs font-medium text-[#2b2118] shadow-sm">
                      <span className="sm:hidden">Tap to change photo</span>
                      <span className="hidden sm:inline">
                        Click to change photo
                      </span>
                    </span>

                    {photoName ? (
                      <span className="absolute inset-x-4 bottom-3 z-10 truncate text-xs text-white/85">
                        {photoName}
                      </span>
                    ) : null}

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        removePhoto()
                      }}
                      aria-label="Remove photo"
                      className="absolute top-2.5 right-2.5 z-20 flex size-9 items-center justify-center rounded-full bg-black/45 text-white transition-colors hover:bg-[#7a1f3d] focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none sm:top-3 sm:right-3 sm:size-8"
                    >
                      <XIcon aria-hidden className="size-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <ImagePlusIcon
                      aria-hidden
                      className="size-8 text-[#b08a3e] sm:size-9"
                    />
                    <p className="mt-3 text-sm font-medium text-[#2b2118] sm:mt-4">
                      <span className="sm:hidden">Tap to upload a photo</span>
                      <span className="hidden sm:inline">
                        Click to upload a photo
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-[#2b2118]/45">
                      JPG or PNG, up to 5 MB
                    </p>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handlePhotoChange}
                className="sr-only"
              />

              {photoError ? (
                <p className="mt-2 text-xs text-red-600">{photoError}</p>
              ) : null}
            </div>
          </section>

          <section className="min-w-0 rounded-xl border border-[#e8decd] bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start gap-3">
              <CircleAlertIcon
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-[#b08a3e]"
              />
              <p className="text-sm leading-relaxed text-[#2b2118]/70">
                Your service starts as{" "}
                <span className="font-semibold text-[#2b2118]">Pending</span>.
                Once approved, it appears on Browse Services.
              </p>
            </div>

            <button
              type="submit"
              disabled={status !== "idle"}
              className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#7a1f3d] text-sm font-medium text-[#f8f2e7] transition-colors hover:bg-[#671a33] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "submitting" ? (
                <LoaderCircleIcon aria-hidden className="size-4 animate-spin" />
              ) : null}
              {status === "submitted" ? (
                <CheckCircle2Icon aria-hidden className="size-4" />
              ) : null}
              {status === "submitting"
                ? "Submitting..."
                : status === "submitted"
                  ? "Submitted for review"
                  : "Submit for review"}
            </button>

            {status === "submitted" ? (
              <p
                role="status"
                className="mt-3 text-center text-xs leading-relaxed text-[#3f7a52]"
              >
                Thanks! Our team will review your service and email you once
                it&apos;s live.
              </p>
            ) : null}
          </section>
        </div>
      </form>
    </div>
  )
}