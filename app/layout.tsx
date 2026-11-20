import type { Metadata } from "next"
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

import { Toaster } from "@/components/ui/sonner"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
})

export const metadata: Metadata = {
  title: {
    default: "WedPlan — Every detail of your forever, beautifully planned",
    template: "%s | WedPlan",
  },
  description:
    "Discover photographers, venues, florists and stylists — compare them side by side and request bookings in minutes.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable,
        playfair.variable
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3000}
        />

      </body>
    </html>
  )
}
