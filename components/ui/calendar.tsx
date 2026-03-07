"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    styles,
    ...props
}: CalendarProps) {
    const mergedStyles: CalendarProps["styles"] = {
        root: { backgroundColor: "#020617", opacity: 1, ...(styles?.root ?? {}) },
        months: { backgroundColor: "#020617", ...(styles?.months ?? {}) },
        month: { backgroundColor: "#020617", ...(styles?.month ?? {}) },
        month_grid: { backgroundColor: "#020617", ...(styles?.month_grid ?? {}) },
        weekdays: { backgroundColor: "#020617", ...(styles?.weekdays ?? {}) },
        weeks: { backgroundColor: "#020617", ...(styles?.weeks ?? {}) },
        week: { backgroundColor: "#020617", ...(styles?.week ?? {}) },
        day_button: { backgroundColor: "#020617", opacity: 1, ...(styles?.day_button ?? {}) },
    }

    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("bg-[#020617] p-3 text-white", className)}
            styles={mergedStyles}
            classNames={{
                root: "relative bg-[#020617] text-white",
                months: "flex flex-col gap-4 sm:flex-row",
                month: "space-y-4 bg-[#020617]",
                month_caption: "relative flex h-9 items-center justify-center",
                caption_label: "text-sm font-semibold text-white",
                nav: "absolute inset-x-0 top-0 flex items-center justify-between",
                button_previous: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 border-white/15 bg-[#020617] p-0 text-white/80 hover:bg-white/10 hover:text-white"
                ),
                button_next: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 border-white/15 bg-[#020617] p-0 text-white/80 hover:bg-white/10 hover:text-white"
                ),
                month_grid: "w-full border-collapse bg-[#020617]",
                weekdays: "flex bg-[#020617]",
                weekday: "w-9 text-center text-[0.75rem] font-medium text-white/55",
                weeks: "space-y-1 bg-[#020617]",
                week: "flex w-full bg-[#020617]",
                day: cn(
                    "h-9 w-9 p-0 text-center text-sm",
                    props.mode === "range"
                        ? "[&:has([aria-selected])]:bg-indigo-500/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                        : ""
                ),
                day_button: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-9 w-9 rounded-md border border-transparent bg-[#020617] p-0 font-normal text-white hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-500/60"
                ),
                selected: "[&>button]:bg-indigo-600 [&>button]:text-white [&>button]:hover:bg-indigo-500",
                today: "[&>button]:border [&>button]:border-white/30 [&>button]:bg-white/10",
                outside: "[&>button]:text-white/35",
                disabled: "[&>button]:text-white/30 [&>button]:opacity-40",
                range_start: "[&>button]:bg-indigo-600 [&>button]:text-white [&>button]:rounded-l-md",
                range_end: "[&>button]:bg-indigo-600 [&>button]:text-white [&>button]:rounded-r-md",
                range_middle: "[&>button]:bg-indigo-500/25 [&>button]:rounded-none",
                hidden: "invisible",
                ...classNames,
            }}
            components={{
                Chevron: ({ ...props }) => {
                    if (props.orientation === 'left') {
                        return <ChevronLeft className="h-4 w-4" />
                    }
                    return <ChevronRight className="h-4 w-4" />
                }
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
