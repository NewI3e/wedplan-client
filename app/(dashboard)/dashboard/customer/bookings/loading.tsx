import { DashboardPage } from "@/components/dashboard/dashboard-page"

function SkeletonBar({ className }: { className: string }) {
  return (
    <span className={`block animate-pulse rounded bg-[#ece2d2] ${className}`} />
  )
}

export default function CustomerBookingsLoading() {
  return (
    <DashboardPage
      eyebrow="Customer Dashboard"
      title="My Bookings"
      description="You can cancel a request while it's still pending."
    >
      <div className="flex gap-1 rounded-xl border border-[#e8decd] bg-[#efe7d8]/55 p-1">
        {["w-10", "w-16", "w-16", "w-16", "w-20"].map((width, index) => (
          <span
            key={index}
            className={`h-8 animate-pulse rounded-lg bg-[#e6dccb] ${width}`}
          />
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-[#e8decd] bg-[#fffdf9]">
        <div className="flex items-center gap-6 border-b border-[#eee5d6] px-5 py-3.5">
          <SkeletonBar className="h-3 w-16" />
          <SkeletonBar className="h-3 w-12" />
          <SkeletonBar className="h-3 w-16" />
          <SkeletonBar className="h-3 w-12" />
          <SkeletonBar className="ml-auto h-3 w-14" />
        </div>

        <div className="divide-y divide-[#eee5d6]">
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className="flex items-center gap-6 px-5 py-3.5">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="size-11 shrink-0 animate-pulse rounded-md bg-[#ece2d2]" />
                <span className="min-w-0 flex-1 space-y-2">
                  <SkeletonBar className="h-3 w-40 max-w-full" />
                  <SkeletonBar className="h-2.5 w-24 max-w-full" />
                </span>
              </div>
              <span className="hidden w-32 space-y-2 sm:block">
                <SkeletonBar className="h-3 w-24" />
                <SkeletonBar className="h-2.5 w-20" />
              </span>
              <SkeletonBar className="hidden h-3 w-20 sm:block" />
              <SkeletonBar className="h-6 w-20 rounded-full" />
              <SkeletonBar className="hidden h-8 w-16 rounded-md sm:block" />
            </div>
          ))}
        </div>
      </div>
    </DashboardPage>
  )
}
