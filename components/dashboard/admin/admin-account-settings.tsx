"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  EyeIcon,
  EyeOffIcon,
  LoaderCircleIcon,
  LockKeyholeIcon,
  MailIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { authClient, useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

const CARD =
  "rounded-xl border border-[#e8decd] bg-[#fffdf9] p-5 shadow-[0_2px_12px_rgba(60,40,25,0.04)] sm:p-6"

const LABEL = "block text-sm font-medium text-[#2b2118]"

const INPUT =
  "h-11 w-full rounded-lg border border-[#d9cfc0] bg-white px-3.5 text-sm text-[#2b2118] outline-none transition-colors placeholder:text-[#2b2118]/35 focus:border-[#7a1f3d] focus:ring-3 focus:ring-[#7a1f3d]/15 disabled:cursor-not-allowed disabled:bg-[#f4eee3] disabled:text-[#2b2118]/50"

const PRIMARY_BUTTON =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#7a1f3d] px-5 text-sm font-medium text-[#f8f2e7] transition-colors hover:bg-[#65203a] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function PasswordInput({
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

function CardHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <header className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#f7e4e6] text-[#7a1f3d]">
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="font-display text-2xl leading-tight text-[#2b2118]">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-[#2b2118]/50">
          {description}
        </p>
      </div>
    </header>
  )
}

export function AdminAccountSettings({ email }: { email: string }) {
  const router = useRouter()
  const { refetch } = useSession()

  const [newEmail, setNewEmail] = React.useState("")
  const [updatingEmail, setUpdatingEmail] = React.useState(false)

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
  const [updatingPassword, setUpdatingPassword] = React.useState(false)

  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const value = newEmail.trim().toLowerCase()

    if (!value) {
      toast.error("Enter your new email address.")
      return
    }

    if (!EMAIL_PATTERN.test(value)) {
      toast.error("Enter a valid email address.")
      return
    }

    if (value === email.trim().toLowerCase()) {
      toast.error("That's already your email address.")
      return
    }

    setUpdatingEmail(true)

    try {
      const { error } = await authClient.changeEmail({ newEmail: value })

      if (error) {
        toast.error(error.message ?? "Could not update your email address.")
        return
      }

      toast.success("Email updated. Use it the next time you sign in.")
      setNewEmail("")
      await refetch()
      router.refresh()
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setUpdatingEmail(false)
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

    setUpdatingPassword(true)

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
      setUpdatingPassword(false)
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <section className={CARD}>
        <CardHeader
          icon={<MailIcon aria-hidden className="size-4" />}
          title="Email address"
          description="The email you use to sign in to the admin dashboard."
        />

        <div className="mt-5 rounded-lg bg-[#fbf7ef] px-3.5 py-3">
          <p className="text-[0.62rem] font-medium tracking-[0.14em] text-[#2b2118]/45 uppercase">
            Current email
          </p>
          <p className="mt-1 truncate text-sm font-medium text-[#2b2118]">
            {email}
          </p>
        </div>

        <form onSubmit={handleEmailSubmit} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="new-email" className={LABEL}>
              New email
            </label>
            <input
              id="new-email"
              type="email"
              autoComplete="email"
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              placeholder="you@example.com"
              className={INPUT}
            />
          </div>

          <button
            type="submit"
            disabled={updatingEmail}
            className={PRIMARY_BUTTON}
          >
            {updatingEmail ? (
              <LoaderCircleIcon aria-hidden className="size-4 animate-spin" />
            ) : (
              <MailIcon aria-hidden className="size-4" />
            )}
            {updatingEmail ? "Updating..." : "Update email"}
          </button>
        </form>

        <p className="mt-3 text-xs leading-relaxed text-[#2b2118]/45">
          Your dashboard and vendor records stay linked to this account. Use the
          new address the next time you sign in.
        </p>
      </section>

      <section className={CARD}>
        <CardHeader
          icon={<LockKeyholeIcon aria-hidden className="size-4" />}
          title="Password"
          description="Choose a new password for your admin account."
        />

        <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
          <PasswordInput
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

          <PasswordInput
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

          <PasswordInput
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
            disabled={updatingPassword}
            className={PRIMARY_BUTTON}
          >
            {updatingPassword ? (
              <LoaderCircleIcon aria-hidden className="size-4 animate-spin" />
            ) : (
              <ShieldCheckIcon aria-hidden className="size-4" />
            )}
            {updatingPassword ? "Updating..." : "Update password"}
          </button>
        </form>

        <p className="mt-3 text-xs leading-relaxed text-[#2b2118]/45">
          Use at least 6 characters. Other signed-in sessions will be signed
          out.
        </p>
      </section>
    </div>
  )
}
