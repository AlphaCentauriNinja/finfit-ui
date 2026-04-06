'use client'

import { format, parseISO, isValid } from "date-fns"
import { CalendarIcon } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type Props = {
    label: string
    value: string // ISO yyyy-MM-dd
    onChange: (value: string) => void
    disabled?: boolean
}

export default function DatePickerField({ label, value, onChange, disabled = false }: Props) {
    const [isOpen, setIsOpen] = React.useState(false)

    // Convert string ISO value to Date object for the Calendar
    const date = React.useMemo(() => {
        if (!value) return undefined
        const parsed = parseISO(value)
        return isValid(parsed) ? parsed : undefined
    }, [value])

    const handleSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            // Convert Date object back to ISO string yyyy-MM-dd
            onChange(format(selectedDate, "yyyy-MM-dd"))
        } else {
            onChange("")
        }
        setIsOpen(false)
    }

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">{label}</label>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        disabled={disabled}
                        style={{ backgroundColor: "#020617", opacity: 1 }}
                        className={cn(
                            "datepicker-trigger w-full justify-start text-left font-normal !bg-[#020617] border-white/15 h-[46px] rounded-xl hover:!bg-[#0b1220] hover:border-indigo-400/60 focus:!bg-[#020617] focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/35 transition-all text-white",
                            isOpen && "!bg-[#020617] border-indigo-400/60",
                            !date && "text-white/40"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4 text-white/50" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="datepicker-popover z-[120] w-[360px] max-w-[calc(100vw-2rem)] p-0 !bg-[#020617] border-white/10 shadow-2xl rounded-xl"
                    style={{ backgroundColor: "#020617", opacity: 1 }}
                    align="start"
                    side="bottom"
                    sideOffset={8}
                >
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleSelect}
                        initialFocus
                        className="bg-[#020617] text-white"
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
