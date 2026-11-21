import { cn } from "@/lib/utils"

export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = "light",
  className,
}: {
  eyebrow: string
  title: React.ReactNode
  description?: string
  tone?: "light" | "dark"
  className?: string
}) {
  const dark = tone === "dark"

  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      <p
        className={cn(
          "flex items-center justify-center gap-3 text-[0.62rem] font-medium tracking-[0.3em] uppercase",
          dark ? "text-gold" : "text-[#b08a3e]"
        )}
      >
        <span
          aria-hidden
          className={cn(
            "h-px w-8 sm:w-12",
            dark ? "bg-gold/50" : "bg-[#d9c7a4]"
          )}
        />
        {eyebrow}
        <span
          aria-hidden
          className={cn(
            "h-px w-8 sm:w-12",
            dark ? "bg-gold/50" : "bg-[#d9c7a4]"
          )}
        />
      </p>

      <h2
        className={cn(
          "mt-4 font-display text-[clamp(1.75rem,4vw,2.6rem)] leading-[1.12] font-medium",
          dark ? "text-[#f8f2e7]" : "text-[#2b2118]"
        )}
      >
        {title}
      </h2>

      {description ? (
        <p
          className={cn(
            "mx-auto mt-4 max-w-xl text-sm leading-relaxed sm:text-base",
            dark ? "text-[#e6d8c4]/65" : "text-[#79685e]"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}
