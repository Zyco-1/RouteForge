"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Zap,
  Settings,
  Github,
  Triangle,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Projects",
      url: "/dashboard/projects",
      icon: Zap,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-zinc-950" {...props}>
      <SidebarHeader className="h-20 flex items-center px-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent cursor-default px-2">
              <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-white text-black shadow-lg shadow-white/10">
                <Triangle className="size-5 fill-current" />
              </div>
              <div className={cn("grid flex-1 text-left ml-3 transition-opacity duration-200", isCollapsed && "opacity-0")}>
                <span className="truncate text-base font-black tracking-tight text-white">RouteForge</span>
                <span className="truncate text-[10px] font-bold text-zinc-500 uppercase tracking-widest">SaaS Builder</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-8">
        <SidebarMenu className="px-3 space-y-2">
          {data.navMain.map((item) => (
            <SidebarMenuItem key={item.title}>
              <a href={item.url} className="block w-full no-underline">
                <SidebarMenuButton
                  tooltip={item.title}
                  className="hover:bg-zinc-900 hover:text-white transition-all rounded-xl h-12 px-3 cursor-pointer w-full justify-start group"
                >
                  <item.icon className={cn("size-5 transition-colors", "text-zinc-400 group-hover:text-white")} />
                  <span className={cn("ml-4 text-sm font-bold tracking-tight transition-opacity duration-200", isCollapsed ? "opacity-0" : "opacity-100")}>
                    {item.title}
                  </span>
                </SidebarMenuButton>
              </a>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-4">
         <SidebarMenu className="px-2">
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="h-12 px-3 hover:bg-zinc-900 rounded-xl transition-all cursor-pointer group">
                <Github className="size-5 text-zinc-400 group-hover:text-white" />
                <span className={cn("ml-4 text-sm font-bold tracking-tight transition-opacity duration-200", isCollapsed ? "opacity-0" : "opacity-100")}>
                    GitHub Support
                </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className={cn("px-2 transition-opacity duration-200", isCollapsed && "opacity-0")}>
            <button
                onClick={toggleSidebar}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-border/50 hover:bg-zinc-900 transition-colors cursor-pointer group"
            >
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300">Collapse Sidebar</span>
                <PanelLeftClose size={14} className="text-zinc-500 group-hover:text-zinc-300" />
            </button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
