import { ObjectId } from "mongodb"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { dashboardPaths } from "@/lib/dashboard"
import { routes } from "@/lib/routes"
import { appDb } from "@/lib/subscriptions"

export const runtime = "nodejs"

/**
 * Google OAuth can't carry the role chosen on the sign-up form through the
 * provider redirect. Better Auth calls this URL for brand-new social users,
 * so we apply the role that was picked before sending them to the dashboard.
 *
 * Admins are deliberately excluded — they are promoted directly in MongoDB.
 */
export async function GET(request: Request) {
  const requestedRole = new URL(request.url).searchParams.get("role")
  const role = requestedRole === "vendor" ? "vendor" : "customer"

  const session = await auth.api.getSession({ headers: request.headers })

  if (!session) {
    return NextResponse.redirect(new URL(routes.signIn, request.url))
  }

  try {
    await appDb()
      .collection("user")
      .updateOne({ _id: new ObjectId(session.user.id) }, { $set: { role } })
  } catch (error) {
    console.error("Could not assign role after social sign-up:", error)
  }

  return NextResponse.redirect(
    new URL(dashboardPaths[role].overview, request.url)
  )
}
