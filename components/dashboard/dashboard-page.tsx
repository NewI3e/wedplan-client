import { cn } from "@/lib/utils"

type DashboardPageProps = {
  /** Small uppercase label above the title, e.g. "ADMIN DASHBOARD". */
  eyebrow: string
  title: string
  description?: string
  /** Optional action rendered to the right of the heading, e.g. "Add service". */
  action?: React.ReactNode
  /** Replace the placeholder card once the API data is ready. */
  children?: React.ReactNode
  placeholder?: string
}

/**
 * Page frame shared by every dashboard screen. Keeps the heading, spacing and
 * empty-state card identical while the real API-driven content is built.
 */
export function DashboardPage({
  eyebrow,
  title,
  description,
  action,
  children,
  placeholder = "This screen's design is not finished yet.",
}: DashboardPageProps) {
  return (
    <div className="w-full px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[0.68rem] font-medium tracking-[0.22em] text-[#a98a4b] uppercase">
            {eyebrow}
          </p>

          <h1 className="mt-2 font-display text-4xl leading-[1.1] font-medium text-[#2b2118] sm:text-5xl">
            {title}
          </h1>

          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#2b2118]/55">
              {description}
            </p>
          ) : null}
        </div>

        {action ? <div className="shrink-0 sm:pt-7">{action}</div> : null}
      </div>

      <div className="mt-8">
        {children ?? <DashboardPlaceholder message={placeholder} />}
      </div>
    </div>
  )
}

export function DashboardPlaceholder({
  message,
  className,
}: {
  message: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex min-h-36 items-center justify-center rounded-xl border border-[#e8decd] bg-[#fdfaf5] px-6 py-10 text-center text-sm text-[#2b2118]/45",
        className
      )}
    >
      {message}
    </div>
  )
}
