"use server"

import { revalidatePath } from "next/cache"
import { ObjectId } from "mongodb"

import { getServerSession, resolveDashboardRole } from "@/lib/auth-server"
import { dashboardPaths } from "@/lib/dashboard"
import { appDb } from "@/lib/subscriptions"

export type AdminServiceActionResult =
  { ok: true } | { ok: false; message: string }

async function assertAdmin(): Promise<AdminServiceActionResult | null> {
  const session = await getServerSession()

  if (!session) {
    return { ok: false, message: "Please sign in again to continue." }
  }

  if (resolveDashboardRole(session.user.role) !== "admin") {
    return {
      ok: false,
      message: "Only admin accounts can moderate services.",
    }
  }

  return null
}

function serviceCollection() {
  return appDb().collection("services")
}

function parseServiceId(serviceId: string): ObjectId | null {
  const id = serviceId.trim()
  return ObjectId.isValid(id) ? new ObjectId(id) : null
}

/** Approves or rejects a service so it does (or doesn't) appear publicly. */
export async function setServiceStatusAction(
  serviceId: string,
  status: "approved" | "rejected"
): Promise<AdminServiceActionResult> {
  const denied = await assertAdmin()
  if (denied) return denied

  const id = parseServiceId(serviceId)

  if (!id) {
    return { ok: false, message: "This service could not be identified." }
  }

  try {
    const result = await serviceCollection().updateOne(
      { _id: id },
      { $set: { status, updatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return { ok: false, message: "This service no longer exists." }
    }

    revalidatePath(dashboardPaths.admin.services)

    return { ok: true }
  } catch (error) {
    console.error("Update service status error:", error)

    return {
      ok: false,
      message: "We couldn't update this service. Please try again.",
    }
  }
}

/** Permanently removes  service from the marketplace. */
export async function deleteServiceAction(
  serviceId: string
): Promise<AdminServiceActionResult> {
  const denied = await assertAdmin()
  if (denied) return denied

  const id = parseServiceId(serviceId)

  if (!id) {
    return { ok: false, message: "This service could not be identified." }
  }

  try {
    const result = await serviceCollection().deleteOne({ _id: id })

    if (result.deletedCount === 0) {
      return { ok: false, message: "This service no longer exists." }
    }

    revalidatePath(dashboardPaths.admin.services)

    return { ok: true }
  } catch (error) {
    console.error("Delete service error:", error)

    return {
      ok: false,
      message: "We couldn't delete this service. Please try again.",
    }
  }
}
