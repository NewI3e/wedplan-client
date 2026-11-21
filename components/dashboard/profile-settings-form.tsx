"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CameraIcon,
  EyeIcon,
  EyeOffIcon,
  LoaderCircleIcon,
  LockKeyholeIcon,
  SaveIcon,
  UserRoundIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"
import { uploadImage } from "@/lib/upload-image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type Role = "customer" | "vendor"

export type ProfileSettingsUser = {
  name?: string | null
  email?: string | null
  image?: string | null
  phone?: string | null
  city?: string | null
  bio?: string | null
  businessName?: string | null
  website?: string | null
  weddingDate?: string | null
  createdAt?: string | null
}

type ProfileValues = {
  name: string
  image: string
  phone: string
  city: string
  bio: string
  businessName: string
  website: string
  weddingDate: string
}

const CARD =
  "rounded-2xl border border-[#e8decd] bg-[#fdfaf5] shadow-[0_2px_12px_rgba(60,40,25,0.04)]"

const LABEL = "block text-sm font-medium text-[#2b2118]"

const INPUT =
  "h-11 w-full rounded-lg border border-[#d9cfc0] bg-white px-3.5 text-sm text-[#2b2118] outline-none transition-colors placeholder:text-[#2b2118]/35 focus:border-[#7a1f3d] focus:ring-3 focus:ring-[#7a1f3d]/15 disabled:cursor-not-allowed disabled:bg-[#f4eee3] disabled:text-[#2b2118]/50"

const PRIMARY_BUTTON =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#7a1f3d] px-6 text-sm font-medium text-[#f8f2e7] transition-colors hover:bg-[#671a33] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70"

const MAX_PHOTO_BYTES = 4 * 1024 * 1024

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"]

const PROFILE_PHOTO_ENDPOINT = "/api/profile-photo"

function getInitials(name: string, email?: string | null) {
  const source = name.trim() || email?.split("@")[0] || "W"
  const initials = source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")

  return initials || "W"
}

function formatJoined(value?: string | null) {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(date)
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-[#2b2118]/45">{hint}</p> : null}
    </div>
  )
}

function PasswordField({
  id,
  label,
  value,
  visible,
  autoComplete,
  onChange,
  onToggle,
}: {
  id: string
  label: string
  value: string
  visible: boolean
  autoComplete: string
  onChange: (value: string) => void
  onToggle: () => void
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(INPUT, "pr-11")}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#2b2118]/40 transition-colors hover:text-[#7a1f3d] focus-visible:text-[#7a1f3d] focus-visible:outline-none"
        >
          {visible ? (
            <EyeOffIcon aria-hidden className="size-4" />
          ) : (
            <EyeIcon aria-hidden className="size-4" />
          )}
        </button>
      </div>
    </div>
  )
}

export function ProfileSettingsForm({
  role,
  user,
}: {
  role: Role
  user: ProfileSettingsUser
}) {
  const router = useRouter()

  const [values, setValues] = React.useState<ProfileValues>({
    name: user.name ?? "",
    image: user.image ?? "",
    phone: user.phone ?? "",
    city: user.city ?? "",
    bio: user.bio ?? "",
    businessName: user.businessName ?? "",
    website: user.website ?? "",
    weddingDate: user.weddingDate ?? "",
  })
  const [saving, setSaving] = React.useState(false)

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const objectUrlRef = React.useRef<string | null>(null)
  const [pendingPhoto, setPendingPhoto] = React.useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null)
  const [photoError, setPhotoError] = React.useState<string | null>(null)
  const [isDraggingPhoto, setIsDraggingPhoto] = React.useState(false)

  React.useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  const [passwords, setPasswords] = React.useState({
    current: "",
    next: "",
    confirm: "",
  })
  const [visible, setVisible] = React.useState({
    current: false,
    next: false,
    confirm: false,
  })
  const [changingPassword, setChangingPassword] = React.useState(false)

  function update<K extends keyof ProfileValues>(
    key: K,
    value: ProfileValues[K]
  ) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const avatarSrc = photoPreview ?? values.image.trim()
  const displayName =
    values.name.trim() || user.email?.split("@")[0] || "Your profile"

  function clearObjectUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }

  function selectPhoto(file: File | undefined) {
    if (!file) return

    if (!PHOTO_TYPES.includes(file.type)) {
      setPhotoError("Please choose a JPG, PNG or WebP image.")
      return
    }

    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("Please choose an image under 4 MB.")
      return
    }

    clearObjectUrl()

    const url = URL.createObjectURL(file)
    objectUrlRef.current = url

    setPendingPhoto(file)
    setPhotoPreview(url)
    setPhotoError(null)
  }

  function removePhoto() {
    clearObjectUrl()
    setPendingPhoto(null)
    setPhotoPreview(null)
    setPhotoError(null)
    update("image", "")

    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!values.name.trim()) {
      toast.error("Please add your name.")
      return
    }

    const website = values.website.trim()

    if (role === "vendor" && website && !/^https?:\/\//i.test(website)) {
      toast.error("Website must start with http:// or https://.")
      return
    }

    setSaving(true)

    try {
      let image = values.image.trim()

      if (pendingPhoto) {
        image = await uploadImage(pendingPhoto, PROFILE_PHOTO_ENDPOINT)
      }

      const { error } = await authClient.updateUser({
        name: values.name.trim(),
        image: image || null,
        phone: values.phone.trim(),
        city: values.city.trim(),
        bio: values.bio.trim(),
        ...(role === "vendor"
          ? {
              businessName: values.businessName.trim(),
              website,
            }
          : {
              weddingDate: values.weddingDate,
            }),
      })

      if (error) {
        toast.error(error.message ?? "Could not save your profile.")
        return
      }

      clearObjectUrl()
      setPendingPhoto(null)
      setPhotoPreview(null)
      update("image", image)

      toast.success("Profile updated.")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      )
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!passwords.current) {
      toast.error("Enter your current password.")
      return
    }

    if (passwords.next.length < 6) {
      toast.error("New password must be at least 6 characters.")
      return
    }

    if (passwords.next !== passwords.confirm) {
      toast.error("New passwords do not match.")
      return
    }

    setChangingPassword(true)

    try {
      const { error } = await authClient.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.next,
        revokeOtherSessions: true,
      })

      if (error) {
        toast.error(error.message ?? "Could not update your password.")
        return
      }

      toast.success("Password updated. Other sessions were signed out.")
      setPasswords({ current: "", next: "", confirm: "" })
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
      {/* Profile details */}
      <section className={cn(CARD, "p-5 sm:p-6 lg:p-8")}>
        <header>
          <h2 className="font-display text-2xl leading-tight text-[#2b2118]">
            Profile details
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-[#2b2118]/50">
            {role === "vendor"
              ? "This is how couples see your business across WedPlan."
              : "Keep your account details up to date for a smoother planning experience."}
          </p>
        </header>

        <form onSubmit={handleProfileSubmit} className="mt-6 space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault()
                  setIsDraggingPhoto(true)
                }}
                onDragLeave={() => setIsDraggingPhoto(false)}
                onDrop={(event) => {
                  event.preventDefault()
                  setIsDraggingPhoto(false)
                  selectPhoto(event.dataTransfer.files?.[0])
                }}
                disabled={saving}
                aria-label={
                  avatarSrc ? "Change profile photo" : "Add a profile photo"
                }
                className={cn(
                  "group relative flex size-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-colors focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70",
                  isDraggingPhoto
                    ? "border-[#7a1f3d] bg-[#7a1f3d]/10"
                    : "border-[#d9cfc0] bg-[#f0e7d7] hover:border-[#7a1f3d]/60"
                )}
              >
                <Avatar className="size-full bg-[#f0e7d7]">
                  {avatarSrc ? (
                    <AvatarImage src={avatarSrc} alt={displayName} />
                  ) : null}
                  <AvatarFallback className="bg-[#f0e7d7] font-display text-2xl text-[#7a1f3d]">
                    {getInitials(displayName, user.email)}
                  </AvatarFallback>
                </Avatar>
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-0 flex items-center justify-center bg-[#2b2118]/45 text-[#fdf8f0] transition-opacity",
                    avatarSrc
                      ? "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                      : "opacity-100"
                  )}
                >
                  <CameraIcon className="size-5" />
                </span>
              </button>

              {avatarSrc ? (
                <button
                  type="button"
                  onClick={removePhoto}
                  disabled={saving}
                  aria-label="Remove profile photo"
                  className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-[#2b2118] text-[#f8f4ec] transition-colors hover:bg-[#7a1f3d] focus-visible:ring-2 focus-visible:ring-[#7a1f3d]/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <XIcon aria-hidden className="size-3.5" />
                </button>
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={saving}
                className="text-sm font-medium text-[#7a1f3d] underline-offset-2 hover:underline focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70"
              >
                {avatarSrc ? "Change photo" : "Upload a photo"}
              </button>
              <p className="mt-0.5 text-xs leading-relaxed text-[#2b2118]/50">
                JPG, PNG or WebP, up to 4 MB. You can also drag and drop an
                image here.
              </p>
              {photoError ? (
                <p className="mt-0.5 text-xs text-red-600">{photoError}</p>
              ) : null}
              {pendingPhoto && !photoError ? (
                <p className="mt-0.5 text-xs text-[#2b2118]/45">
                  Your new photo will be saved with your profile.
                </p>
              ) : null}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                selectPhoto(event.target.files?.[0])
                // Reset so choosing the same file again still fires onChange.
                event.target.value = ""
              }}
              className="sr-only"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="profile-name" label="Full name">
              <input
                id="profile-name"
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={(event) => update("name", event.target.value)}
                placeholder="Your name"
                className={INPUT}
              />
            </Field>

            <Field id="profile-email" label="Email">
              <input
                id="profile-email"
                type="email"
                value={user.email ?? ""}
                disabled
                className={INPUT}
              />
            </Field>

            <Field id="profile-phone" label="Phone">
              <input
                id="profile-phone"
                type="tel"
                autoComplete="tel"
                value={values.phone}
                onChange={(event) => update("phone", event.target.value)}
                placeholder="+880 1XXX XXXXXX"
                className={INPUT}
              />
            </Field>

            <Field id="profile-city" label="City">
              <input
                id="profile-city"
                type="text"
                autoComplete="address-level2"
                value={values.city}
                onChange={(event) => update("city", event.target.value)}
                placeholder="Dhaka"
                className={INPUT}
              />
            </Field>

            {role === "vendor" ? (
              <>
                <Field id="profile-business" label="Business name">
                  <input
                    id="profile-business"
                    type="text"
                    autoComplete="organization"
                    value={values.businessName}
                    onChange={(event) =>
                      update("businessName", event.target.value)
                    }
                    placeholder="Petal & Vine"
                    className={INPUT}
                  />
                </Field>

                <Field id="profile-website" label="Website">
                  <input
                    id="profile-website"
                    type="text"
                    inputMode="url"
                    value={values.website}
                    onChange={(event) => update("website", event.target.value)}
                    placeholder="https://yourstudio.com"
                    className={INPUT}
                  />
                </Field>
              </>
            ) : (
              <Field id="profile-wedding-date" label="Wedding date">
                <input
                  id="profile-wedding-date"
                  type="date"
                  value={values.weddingDate}
                  onChange={(event) =>
                    update("weddingDate", event.target.value)
                  }
                  className={INPUT}
                />
              </Field>
            )}
          </div>

          <Field
            id="profile-bio"
            label={role === "vendor" ? "About your business" : "About you"}
            hint="Up to 500 characters."
          >
            <textarea
              id="profile-bio"
              rows={5}
              maxLength={500}
              value={values.bio}
              onChange={(event) => update("bio", event.target.value)}
              placeholder={
                role === "vendor"
                  ? "Tell couples what makes your studio special..."
                  : "Share a little about your wedding plans..."
              }
              className={cn(
                INPUT,
                "h-auto min-h-28 resize-y py-3 leading-relaxed"
              )}
            />
          </Field>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className={PRIMARY_BUTTON}>
              {saving ? (
                <LoaderCircleIcon aria-hidden className="size-4 animate-spin" />
              ) : (
                <SaveIcon aria-hidden className="size-4" />
              )}
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </section>

      {/* Sidebar */}
      <div className="space-y-5">
        <section className={cn(CARD, "p-5 sm:p-6")}>
          <div className="flex items-center gap-2">
            <UserRoundIcon aria-hidden className="size-4 text-[#a98a4b]" />
            <h2 className="font-display text-xl leading-tight text-[#2b2118]">
              Account
            </h2>
          </div>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#2b2118]/50">Role</dt>
              <dd>
                <span className="rounded-full bg-[#f0e7d7] px-2.5 py-1 text-xs font-medium text-[#7a1f3d] capitalize">
                  {role}
                </span>
              </dd>
            </div>

            <div className="flex items-center justify-between gap-3">
              <dt className="shrink-0 text-[#2b2118]/50">Email</dt>
              <dd className="truncate text-right text-[#2b2118]/75">
                {user.email ?? "—"}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-3">
              <dt className="shrink-0 text-[#2b2118]/50">Member since</dt>
              <dd className="text-right text-[#2b2118]/75">
                {formatJoined(user.createdAt)}
              </dd>
            </div>
          </dl>
        </section>

        <section className={cn(CARD, "p-5 sm:p-6")}>
          <div className="flex items-center gap-2">
            <LockKeyholeIcon aria-hidden className="size-4 text-[#a98a4b]" />
            <h2 className="font-display text-xl leading-tight text-[#2b2118]">
              Password
            </h2>
          </div>

          <p className="mt-1 text-sm leading-relaxed text-[#2b2118]/50">
            Update the password used to sign in.
          </p>

          <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
            <PasswordField
              id="current-password"
              label="Current password"
              value={passwords.current}
              visible={visible.current}
              autoComplete="current-password"
              onChange={(value) =>
                setPasswords((current) => ({ ...current, current: value }))
              }
              onToggle={() =>
                setVisible((current) => ({
                  ...current,
                  current: !current.current,
                }))
              }
            />

            <PasswordField
              id="new-password"
              label="New password"
              value={passwords.next}
              visible={visible.next}
              autoComplete="new-password"
              onChange={(value) =>
                setPasswords((current) => ({ ...current, next: value }))
              }
              onToggle={() =>
                setVisible((current) => ({ ...current, next: !current.next }))
              }
            />

            <PasswordField
              id="confirm-password"
              label="Confirm new password"
              value={passwords.confirm}
              visible={visible.confirm}
              autoComplete="new-password"
              onChange={(value) =>
                setPasswords((current) => ({ ...current, confirm: value }))
              }
              onToggle={() =>
                setVisible((current) => ({
                  ...current,
                  confirm: !current.confirm,
                }))
              }
            />

            <button
              type="submit"
              disabled={changingPassword}
              className={cn(PRIMARY_BUTTON, "w-full")}
            >
              {changingPassword ? (
                <LoaderCircleIcon aria-hidden className="size-4 animate-spin" />
              ) : (
                <LockKeyholeIcon aria-hidden className="size-4" />
              )}
              {changingPassword ? "Updating..." : "Update password"}
            </button>
          </form>

          <p className="mt-3 text-xs leading-relaxed text-[#2b2118]/45">
            Use at least 6 characters. Other sessions will be signed out after
            the change.
          </p>
        </section>
      </div>
    </div>
  )
}
