"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Zap,
  Settings,
  Github,
  Triangle,
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
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
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
  return (
    <Sidebar collapsible="icon" className="border-r border-border/50" {...props}>
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent cursor-default">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Triangle className="size-4 fill-current" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                <span className="truncate font-bold text-foreground">RouteForge</span>
                <span className="truncate text-xs text-muted-foreground">SaaS Builder</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="py-4">
        <SidebarMenu className="px-2 space-y-1">
          {data.navMain.map((item) => (
            <SidebarMenuItem key={item.title}>
              <a href={item.url} className="block w-full no-underline">
                <SidebarMenuButton
                  tooltip={item.title}
                  className="hover:bg-accent hover:text-accent-foreground transition-colors rounded-md h-10 px-3 cursor-pointer w-full justify-start"
                >
                  {item.icon && <item.icon className="size-4" />}
                  <span className="ml-3 font-medium">{item.title}</span>
                </SidebarMenuButton>
              </a>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border/50">
         <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="h-10 px-3 hover:bg-accent rounded-md transition-colors cursor-pointer">
                <Github className="size-4" />
                <span className="ml-3 text-sm font-medium">GitHub Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
