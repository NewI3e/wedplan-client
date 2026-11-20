"use client"

import * as React from "react"

import { DashboardSidebar } from "@/app/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { roleMeta, type DashboardRole } from "@/lib/dashboard"

/**
 * Chrome shared by every dashboard: the sticky site header lives above this
 * (marketing layout), so the sidebar starts underneath it.
 */
export function DashboardShell({
  role,
  children,
}: {
  role: DashboardRole
  children: React.ReactNode
}) {
  return (
    <SidebarProvider
      className="dashboard-shell"
      style={{ "--sidebar-width": "18rem" } as React.CSSProperties}
    >
      <DashboardSidebar role={role} />

      <SidebarInset className="min-h-svh bg-[#f7f2e9]">
        {/* Mobile only: the desktop sidebar is always visible from md up. */}
        <div className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-[#e8decd] bg-[#f7f2e9]/95 px-4 backdrop-blur md:hidden">
          <SidebarTrigger className="-ml-1 text-[#2b2118]/70" />
          <span className="text-[0.62rem] font-medium tracking-[0.22em] text-[#a98a4b] uppercase">
            {roleMeta[role].label}
          </span>
        </div>

        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
