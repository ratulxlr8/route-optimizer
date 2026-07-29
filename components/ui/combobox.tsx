"use client"

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// A select whose popup carries its own filter input — Base UI's documented
// "input inside popup" Combobox arrangement. Styled to match ui/select.tsx so
// a searchable field is visually indistinguishable from a plain one.
const Combobox = ComboboxPrimitive.Root

function ComboboxTrigger({
  className,
  children,
  ...props
}: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn(
        // Deliberately matches ui/input.tsx's metrics (h-9, rounded-md, px-3,
        // transparent fill) so a district picker and a number field read as
        // the same class of control sitting on the same form grid.
        "flex h-9 w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-popup-open:border-ring [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.Icon
        render={
          <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground transition-transform duration-200 in-data-popup-open:rotate-180" />
        }
      />
    </ComboboxPrimitive.Trigger>
  )
}

// Combobox.Value renders no element of its own, so the truncation/layout
// styling has to live on a wrapper rather than being passed through.
function ComboboxValue({
  className,
  ...props
}: ComboboxPrimitive.Value.Props & { className?: string }) {
  return (
    <span
      data-slot="combobox-value"
      className={cn("line-clamp-1 flex-1 text-left", className)}
    >
      <ComboboxPrimitive.Value {...props} />
    </span>
  )
}

/** Popup shell: the filter input pinned above a scrolling result list. */
function ComboboxContent({
  className,
  children,
  searchPlaceholder,
  emptyMessage,
  sideOffset = 6,
  ...props
}: Omit<ComboboxPrimitive.Popup.Props, "children"> & {
  searchPlaceholder?: string
  emptyMessage?: string
  sideOffset?: ComboboxPrimitive.Positioner.Props["sideOffset"]
  /** Forwarded to Combobox.List, which also accepts an `(item) => node`
   *  render function for the filtered results. */
  children?: ComboboxPrimitive.List.Props["children"]
}) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        align="start"
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          className={cn(
            "relative isolate z-50 flex max-h-[min(20rem,var(--available-height))] w-(--anchor-width) min-w-56 origin-(--transform-origin) flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        >
          <div className="relative shrink-0 border-b border-border">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <ComboboxPrimitive.Input
              placeholder={searchPlaceholder}
              className="h-10 w-full bg-transparent pr-3 pl-8.5 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ComboboxPrimitive.Empty className="px-3 py-6 text-center text-sm text-muted-foreground empty:hidden">
            {emptyMessage}
          </ComboboxPrimitive.Empty>
          <ComboboxPrimitive.List className="flex-1 overflow-y-auto overscroll-contain p-1 empty:p-0">
            {children}
          </ComboboxPrimitive.List>
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

function ComboboxItem({
  className,
  children,
  ...props
}: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        // `data-highlighted` covers both keyboard and pointer, so the hovered
        // and arrow-key-focused row share one style.
        "relative flex w-full cursor-pointer items-center gap-1.5 rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="flex flex-1 shrink-0 gap-2">{children}</span>
      <ComboboxPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center text-primary dark:text-ring" />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  )
}

export { Combobox, ComboboxContent, ComboboxItem, ComboboxTrigger, ComboboxValue }
