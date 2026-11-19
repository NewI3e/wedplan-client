"use client"

import Link from "next/link"
import {
  ChevronDownIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  SettingsIcon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getDisplayName,
  UserAvatar,
  type SessionUser,
} from "@/components/layout/user-avatar"
import { useSignOut } from "@/hooks/use-sign-out"
import { accountNav } from "@/lib/routes"

const accountIcons = {
  Dashboard: LayoutDashboardIcon,
  "Profile Settings": SettingsIcon,
} as const

export function UserMenu({ user }: { user: SessionUser }) {
  const { signOut, isPending } = useSignOut()
  const displayName = getDisplayName(user)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border/70 bg-background/70 py-1 pr-2 pl-1 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-muted">
        <UserAvatar user={user} />
        <span className="hidden max-w-32 truncate text-sm font-medium sm:block">
          {displayName}
        </span>
        <ChevronDownIcon className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 px-2 py-2">
            <span className="truncate text-sm font-medium text-foreground">
              {displayName}
            </span>
            {user.email ? (
              <span className="truncate text-xs font-normal text-muted-foreground">
                {user.email}
              </span>
            ) : null}
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {accountNav.map((item) => {
          const Icon = accountIcons[item.label as keyof typeof accountIcons]

          return (
            <DropdownMenuItem key={item.href} render={<Link href={item.href} />}>
              {Icon ? <Icon /> : null}
              {item.label}
            </DropdownMenuItem>
          )
        })}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          disabled={isPending}
          onClick={() => void signOut()}
        >
          <LogOutIcon />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
