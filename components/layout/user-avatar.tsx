import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export type SessionUser = {
  name?: string | null
  email?: string | null
  image?: string | null
}

export function getDisplayName(user: SessionUser) {
  return user.name?.trim() || user.email?.split("@")[0] || "Account"
}

export function getInitials(user: SessionUser) {
  const parts = getDisplayName(user).split(/\s+/).filter(Boolean).slice(0, 2)

  return parts.map((part) => part[0]?.toUpperCase()).join("") || "W"
}

export function UserAvatar({
  user,
  className,
}: {
  user: SessionUser
  className?: string
}) {
  return (
    <Avatar className={cn("size-8", className)}>
      {user.image ? (
        <AvatarImage src={user.image} alt={getDisplayName(user)} />
      ) : null}
      <AvatarFallback className="bg-brand text-xs font-medium text-brand-foreground">
        {getInitials(user)}
      </AvatarFallback>
    </Avatar>
  )
}
