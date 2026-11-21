"use client"

import { CrownIcon } from "lucide-react"
import { toast } from "sonner"

/**
 * Placeholder CTA until Stripe Checkout is connected.
 * Keeps the design's active look while giving the vendor feedback.
 */
export function UpgradeButton() {
  return (
    <button
      type="button"
      onClick={() =>
        toast.info("Stripe checkout is coming soon.", {
          description: "Premium upgrades will be available here shortly.",
        })
      }
      className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#f2dfb9] text-sm font-medium text-[#6b4a17] transition-colors hover:bg-[#edd6a9] focus-visible:ring-3 focus-visible:ring-[#f8f2e7]/40 focus-visible:outline-none"
    >
      <CrownIcon aria-hidden className="size-4" />
      Upgrade to Premium
    </button>
  )
}
