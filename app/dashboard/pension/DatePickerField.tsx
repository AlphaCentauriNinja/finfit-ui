'use client'

import React from 'react'
import Datepicker, { DateValueType } from 'react-tailwindcss-datepicker'

type Props = {
    label: string
    value: string // ISO yyyy-MM-dd
    onChange: (value: string) => void
    disabled?: boolean
}

export default function DatePickerField({ label, value, onChange, disabled = false }: Props) {
    // The datepicker expects an object with startDate and endDate
    const dateValue: DateValueType = value ? ({ startDate: value, endDate: value } as unknown as DateValueType) : null

    const handleValueChange = (newValue: any) => {
        // newValue.startDate will be yyyy-MM-dd format from the picker
        if (newValue?.startDate) {
            onChange(newValue.startDate)
        } else {
            onChange('')
        }
    }

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">{label}</label>
            <div className={`relative rounded-xl border border-white/15 bg-slate-900/90 focus-within:border-indigo-400/60 focus-within:ring-2 focus-within:ring-indigo-500/35 transition-all ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
                <Datepicker
                    useRange={false}
                    asSingle={true}
                    value={dateValue}
                    onChange={handleValueChange}
                    disabled={disabled}
                    displayFormat="DD/MM/YYYY"
                    placeholder="DD/MM/YYYY"
                    primaryColor="indigo"
                    inputClassName="w-full appearance-none bg-transparent text-sm text-white outline-none px-4 py-3 placeholder:text-white/40 border-0 focus:ring-0 disabled:cursor-not-allowed"
                    toggleClassName="absolute bg-transparent rounded-r-lg text-white/50 right-0 h-full px-4 focus:outline-none focus:text-indigo-400"
                    popoverDirection="down"
                />
            </div>
        </div>
    )
}
