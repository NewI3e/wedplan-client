"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  BanIcon,
  LoaderCircleIcon,
  SearchIcon,
  ShieldCheckIcon,
  StoreIcon,
  UserCheckIcon,
  UserIcon,
  UsersIcon,
  UserXIcon,
} from "lucide-react"

import {
  setUserBlockedAction,
  setUserRoleAction,
} from "@/app/(dashboard)/dashboard/admin/users/actions"
import type { AdminUser, AdminUserRole } from "@/lib/admin-users"
import { cn } from "@/lib/utils"

const CARD =
  "rounded-xl border border-[#e8decd] bg-[#fffdf9] shadow-[0_2px_12px_rgba(60,40,25,0.04)]"

const OUTLINE_BUTTON =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#e0d5c4] bg-white px-3 text-xs font-medium text-[#2b2118]/75 transition-colors hover:border-[#c9b79c] hover:bg-[#fbf7ef] focus-visible:ring-3 focus-visible:ring-[#7a1f3d]/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"

const BLOCK_BUTTON =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#f0cdd4] bg-white px-3 text-xs font-medium text-[#b23a52] transition-colors hover:border-[#e3aebb] hover:bg-[#fdf1f3] focus-visible:ring-3 focus-visible:ring-[#b23a52]/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"

type UserFilter = "all" | "customers" | "vendors" | "admins" | "blocked"

const FILTERS: Array<{ value: UserFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "customers", label: "Customers" },
  { value: "vendors", label: "Vendors" },
  { value: "admins", label: "Admins" },
  { value: "blocked", label: "Blocked" },
]

const ROLE_LABEL: Record<AdminUserRole, string> = {
  admin: "Admin",
  vendor: "Vendor",
  customer: "Customer",
}

function initials(name: string, email: string) {
  const source = name.trim() || email.split("@")[0] || "W"
  const parts = source.split(/\s+/).filter(Boolean).slice(0, 2)

  return parts.map((part) => part[0]?.toUpperCase()).join("") || "W"
}

function formatJoined(value: string) {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

function UserCell({ user }: { user: AdminUser }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f7e4e6] text-[0.7rem] font-semibold text-[#7a1f3d]">
        {user.image ? (
          <img src={user.image} alt="" className="size-full object-cover" />
        ) : (
          initials(user.name, user.email)
        )}
      </span>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[#2b2118]">
          {user.name}
        </p>
        <p className="truncate text-xs text-[#2b2118]/45">{user.email}</p>
      </div>
    </div>
  )
}

function StatusPill({ blocked }: { blocked: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-medium",
        blocked ? "bg-[#fbe9ec] text-[#b23a52]" : "bg-[#eaf7ef] text-[#2f7a4b]"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          blocked ? "bg-[#c94a63]" : "bg-[#3f9b63]"
        )}
      />
      {blocked ? "Blocked" : "Active"}
    </span>
  )
}

function AdminRoleBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f7e4e6] px-2.5 py-1 text-[0.68rem] font-medium text-[#7a1f3d]">
      <ShieldCheckIcon aria-hidden className="size-3" />
      Admin
    </span>
  )
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: number
  icon: React.ReactNode
  tone: "neutral" | "rose" | "gold" | "plum"
}) {
  const tones = {
    neutral: "bg-[#f3ece0] text-[#8a6a22]",
    rose: "bg-[#fbe9ec] text-[#b23a52]",
    gold: "bg-[#f6ecd3] text-[#a87b26]",
    plum: "bg-[#f7e4e6] text-[#7a1f3d]",
  }

  return (
    <div className={cn(CARD, "p-5")}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-[#2b2118]/60">{label}</p>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            tones[tone]
          )}
        >
          {icon}
        </span>
      </div>

      <p className="mt-8 font-display text-4xl leading-none text-[#2b2118]">
        {value}
      </p>
    </div>
  )
}

export function AdminUsersPanel({
  users,
  error,
}: {
  users: AdminUser[]
  error: string | null
}) {
  const router = useRouter()

  const [roleOverrides, setRoleOverrides] = React.useState<
    Record<string, AdminUserRole>
  >({})
  const [blockedOverrides, setBlockedOverrides] = React.useState<
    Record<string, boolean>
  >({})

  const [filter, setFilter] = React.useState<UserFilter>("all")
  const [query, setQuery] = React.useState("")
  const [busy, setBusy] = React.useState<string | null>(null)

  /**
   * Optimistic overlay on the server data: a successful action updates the row
   * immediately, then `router.refresh()` re-syncs props.
   */
  const rows = React.useMemo(
    () =>
      users.map((user) => {
        const role = roleOverrides[user.id]
        const blocked = blockedOverrides[user.id]

        return {
          ...user,
          role: role ?? user.role,
          blocked: blocked ?? user.blocked,
        }
      }),
    [users, roleOverrides, blockedOverrides]
  )

  const counts = React.useMemo(() => {
    return {
      all: rows.length,
      customers: rows.filter((user) => user.role === "customer").length,
      vendors: rows.filter((user) => user.role === "vendor").length,
      admins: rows.filter((user) => user.role === "admin").length,
      blocked: rows.filter((user) => user.blocked).length,
    }
  }, [rows])

  const filtered = React.useMemo(() => {
    const search = query.trim().toLowerCase()

    return rows.filter((user) => {
      if (filter === "blocked") {
        if (!user.blocked) return false
      } else if (filter === "customers") {
        if (user.role !== "customer") return false
      } else if (filter === "vendors") {
        if (user.role !== "vendor") return false
      } else if (filter === "admins") {
        if (user.role !== "admin") return false
      }

      if (!search) return true

      return [user.name, user.email, user.businessName ?? ""].some((value) =>
        value.toLowerCase().includes(search)
      )
    })
  }, [rows, filter, query])

  async function changeRole(user: AdminUser, role: AdminUserRole) {
    if (role === user.role) return

    const key = `${user.id}:role`
    setBusy(key)

    try {
      const result = await setUserRoleAction(user.id, role)

      if (!result.ok) {
        toast.error(result.message)
        return
      }

      setRoleOverrides((current) => ({ ...current, [user.id]: role }))
      toast.success(`${user.name} is now a ${ROLE_LABEL[role].toLowerCase()}.`)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Could not update this account. Please try again.")
    } finally {
      setBusy(null)
    }
  }

  async function toggleBlocked(user: AdminUser) {
    const nextBlocked = !user.blocked
    const key = `${user.id}:block`
    setBusy(key)

    try {
      const result = await setUserBlockedAction(user.id, nextBlocked)

      if (!result.ok) {
        toast.error(result.message)
        return
      }

      setBlockedOverrides((current) => ({
        ...current,
        [user.id]: nextBlocked,
      }))
      toast.success(
        nextBlocked
          ? `${user.name} was blocked and signed out.`
          : `${user.name} can sign in again.`
      )
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Could not update this account. Please try again.")
    } finally {
      setBusy(null)
    }
  }

  if (error) {
    return (
      <div className={cn(CARD, "px-6 py-12 text-center")}>
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f5e8e4] text-[#b33a3a]">
          <UsersIcon aria-hidden className="size-5" />
        </span>
        <h2 className="mt-4 font-display text-2xl text-[#2b2118]">
          Users unavailable
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#2b2118]/55">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="All users"
          value={counts.all}
          icon={<UsersIcon aria-hidden className="size-4" />}
          tone="neutral"
        />
        <StatCard
          label="Customers"
          value={counts.customers}
          icon={<UserIcon aria-hidden className="size-4" />}
          tone="rose"
        />
        <StatCard
          label="Vendors"
          value={counts.vendors}
          icon={<StoreIcon aria-hidden className="size-4" />}
          tone="gold"
        />
        <StatCard
          label="Blocked"
          value={counts.blocked}
          icon={<UserXIcon aria-hidden className="size-4" />}
          tone="plum"
        />
      </div>

      <div className={cn(CARD, "overflow-hidden")}>
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

          <div className="relative min-w-0 sm:w-64">
            <SearchIcon
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#2b2118]/35"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name or email"
              aria-label="Search users"
              className="h-10 w-full rounded-lg border border-[#ddd2c2] bg-white pr-3 pl-9 text-sm text-[#2b2118] transition-colors outline-none placeholder:text-[#2b2118]/35 focus:border-[#7a1f3d] focus:ring-3 focus:ring-[#7a1f3d]/15"
            />
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-[#efe6d6] text-[#7a1f3d]">
              <UsersIcon aria-hidden className="size-5" />
            </span>
            <h3 className="mt-3 font-display text-xl text-[#2b2118]">
              No accounts yet
            </h3>
            <p className="mt-1 max-w-sm text-sm leading-relaxed text-[#2b2118]/50">
              Registered customers and vendors will appear here.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-display text-xl text-[#2b2118]">
              No matching users
            </p>
            <p className="mt-1 text-sm text-[#2b2118]/50">
              Try a different search term or filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-[#eee5d6] text-[0.62rem] font-medium tracking-[0.14em] text-[#2b2118]/45 uppercase">
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#eee5d6]">
                {filtered.map((user) => {
                  const isAdmin = user.role === "admin"
                  const roleBusy = busy === `${user.id}:role`
                  const blockBusy = busy === `${user.id}:block`

                  return (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-[#fdfbf6]"
                    >
                      <td className="px-5 py-3.5">
                        <UserCell user={user} />
                      </td>

                      <td className="px-5 py-3.5">
                        {isAdmin ? (
                          <AdminRoleBadge />
                        ) : (
                          <div className="relative w-36">
                            <label
                              className="sr-only"
                              htmlFor={`role-${user.id}`}
                            >
                              Role for {user.name}
                            </label>
                            <select
                              id={`role-${user.id}`}
                              value={user.role}
                              disabled={roleBusy}
                              onChange={(event) =>
                                changeRole(
                                  user,
                                  event.target.value as AdminUserRole
                                )
                              }
                              className="h-9 w-full appearance-none rounded-lg border border-[#ddd2c2] bg-white px-3 pr-8 text-xs font-medium text-[#2b2118]/75 transition-colors outline-none focus:border-[#7a1f3d] focus:ring-3 focus:ring-[#7a1f3d]/15 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <option value="customer">Customer</option>
                              <option value="vendor">Vendor</option>
                            </select>
                            <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[#2b2118]/40">
                              {roleBusy ? (
                                <LoaderCircleIcon
                                  aria-hidden
                                  className="size-3.5 animate-spin"
                                />
                              ) : (
                                <svg
                                  aria-hidden
                                  viewBox="0 0 12 12"
                                  className="size-3 fill-none stroke-current stroke-[1.6]"
                                >
                                  <path d="M3 4.5 6 7.5 9 4.5" />
                                </svg>
                              )}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-sm whitespace-nowrap text-[#2b2118]/60">
                        {formatJoined(user.createdAt)}
                      </td>

                      <td className="px-5 py-3.5">
                        <StatusPill blocked={user.blocked} />
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex justify-end">
                          {isAdmin ? (
                            <span className="text-xs text-[#2b2118]/40">
                              Protected
                            </span>
                          ) : user.blocked ? (
                            <button
                              type="button"
                              onClick={() => toggleBlocked(user)}
                              disabled={blockBusy}
                              className={OUTLINE_BUTTON}
                            >
                              {blockBusy ? (
                                <LoaderCircleIcon
                                  aria-hidden
                                  className="size-3.5 animate-spin"
                                />
                              ) : (
                                <UserCheckIcon
                                  aria-hidden
                                  className="size-3.5"
                                />
                              )}
                              Unblock
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => toggleBlocked(user)}
                              disabled={blockBusy}
                              className={BLOCK_BUTTON}
                            >
                              {blockBusy ? (
                                <LoaderCircleIcon
                                  aria-hidden
                                  className="size-3.5 animate-spin"
                                />
                              ) : (
                                <BanIcon aria-hidden className="size-3.5" />
                              )}
                              Block
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-[#eee5d6] px-5 py-3 text-xs text-[#2b2118]/45">
          Showing {filtered.length} of {rows.length} users
        </div>
      </div>
    </div>
  )
}
