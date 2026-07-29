"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"

import { cn } from "@/lib/utils"

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        // The track is tinted from the ink colour rather than `bg-muted`:
        // muted (#f0f0f0) sits within a few points of the page background, so
        // the switch read as floating text. The ring gives it a defined edge.
        "relative inline-flex h-10 w-fit items-center gap-1 rounded-full bg-foreground/7 p-1 ring-1 ring-foreground/8 dark:bg-white/8 dark:ring-white/10",
        className
      )}
      {...props}
    />
  )
}

function TabsTab({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-tab"
      className={cn(
        // Selected state keys off `aria-selected`, which Base UI's Tab does
        // set. It does NOT set `data-selected` — the variant this file used
        // before never matched, so the active label never actually darkened.
        // Icons also dim when inactive and turn primary green when selected,
        // so the current tab is legible from the icon alone.
        "relative z-10 inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 text-sm font-medium text-muted-foreground outline-none transition-colors select-none hover:text-foreground/80 focus-visible:ring-2 focus-visible:ring-ring/50 aria-selected:text-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground/70 [&_svg]:transition-colors aria-selected:[&_svg]:text-primary dark:aria-selected:[&_svg]:text-ring",
        className
      )}
      {...props}
    />
  )
}

function TabsIndicator({
  className,
  ...props
}: TabsPrimitive.Indicator.Props) {
  return (
    <TabsPrimitive.Indicator
      data-slot="tabs-indicator"
      className={cn(
        "absolute top-1/2 left-0 z-0 h-(--active-tab-height) w-(--active-tab-width) -translate-y-1/2 translate-x-(--active-tab-left) rounded-full bg-card shadow-md ring-1 ring-foreground/8 transition-all duration-200 ease-in-out dark:bg-white/18 dark:shadow-none dark:ring-white/12",
        className
      )}
      {...props}
    />
  )
}

function TabsPanel({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-panel"
      className={cn("outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTab, TabsIndicator, TabsPanel }
