"use server"

import { revalidatePath } from "next/cache"
import { ObjectId } from "mongodb"

import type { AdminUserRole } from "@/lib/admin-users"
import { getServerSession, resolveDashboardRole } from "@/lib/auth-server"
import { dashboardPaths } from "@/lib/dashboard"
import { appDb } from "@/lib/subscriptions"

export type AdminUserActionResult =
  { ok: true } | { ok: false; message: string }

const EDITABLE_ROLES: AdminUserRole[] = ["customer", "vendor"]

type TargetUser = {
  _id: ObjectId
  role?: unknown
  email?: unknown
}

async function requireAdmin(): Promise<
  { ok: true; email: string } | { ok: false; message: string }
> {
  const session = await getServerSession()

  if (!session) {
    return { ok: false, message: "Please sign in again to continue." }
  }

  if (resolveDashboardRole(session.user.role) !== "admin") {
    return {
      ok: false,
      message: "Only admin accounts can manage users.",
    }
  }

  return { ok: true, email: session.user.email.trim().toLowerCase() }
}

function usersCollection() {
  return appDb().collection<TargetUser>("user")
}

function parseUserId(userId: string): ObjectId | null {
  const id = userId.trim()
  return ObjectId.isValid(id) ? new ObjectId(id) : null
}

/**
 * Shared guard for every mutation: the account must exist and must not be an
 * admin. Admin accounts are protected from role changes and blocking.
 */
async function loadManageableUser(
  userId: string,
  adminEmail: string
): Promise<{ ok: true; user: TargetUser } | { ok: false; message: string }> {
  const id = parseUserId(userId)

  if (!id) {
    return { ok: false, message: "This account could not be identified." }
  }

  const user = await usersCollection().findOne({ _id: id })

  if (!user) {
    return { ok: false, message: "This account no longer exists." }
  }

  if (
    String(user.role ?? "")
      .trim()
      .toLowerCase() === "admin"
  ) {
    return {
      ok: false,
      message: "Admin accounts are protected and can't be modified.",
    }
  }

  if (
    String(user.email ?? "")
      .trim()
      .toLowerCase() === adminEmail
  ) {
    return {
      ok: false,
      message: "You can't change your own account here.",
    }
  }

  return { ok: true, user }
}

/** Switches an account between the customer and vendor dashboards. */
export async function setUserRoleAction(
  userId: string,
  role: AdminUserRole
): Promise<AdminUserActionResult> {
  const admin = await requireAdmin()
  if (!admin.ok) return admin

  if (!EDITABLE_ROLES.includes(role)) {
    return {
      ok: false,
      message: "That role can't be assigned from this screen.",
    }
  }

  const target = await loadManageableUser(userId, admin.email)
  if (!target.ok) return target

  try {
    await usersCollection().updateOne(
      { _id: target.user._id },
      { $set: { role, updatedAt: new Date() } }
    )

    revalidatePath(dashboardPaths.admin.users)

    return { ok: true }
  } catch (error) {
    console.error("Update user role error:", error)

    return {
      ok: false,
      message: "We couldn't update this account. Please try again.",
    }
  }
}

/**
 * Blocks or unblocks an account. Blocking also revokes every active session so
 * the user is signed out immediately and can't sign in again.
 */
export async function setUserBlockedAction(
  userId: string,
  blocked: boolean
): Promise<AdminUserActionResult> {
  const admin = await requireAdmin()
  if (!admin.ok) return admin

  const target = await loadManageableUser(userId, admin.email)
  if (!target.ok) return target

  try {
    await usersCollection().updateOne(
      { _id: target.user._id },
      { $set: { blocked, updatedAt: new Date() } }
    )

    if (blocked) {
      await appDb()
        .collection("session")
        .deleteMany({
          userId: { $in: [target.user._id, target.user._id.toString()] },
        })
    }

    revalidatePath(dashboardPaths.admin.users)

    return { ok: true }
  } catch (error) {
    console.error("Update user blocked state error:", error)

    return {
      ok: false,
      message: "We couldn't update this account. Please try again.",
    }
  }
}
