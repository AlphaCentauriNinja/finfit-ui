'use client'

type Props = {
    label: string
    value: string
    onChange: (value: string) => void
    disabled?: boolean
}

const toDisplayDate = (isoDate: string): string => {
    if (!isoDate) return ''
    const [year, month, day] = isoDate.split('-')
    if (!year || !month || !day) return isoDate
    return `${day}/${month}/${year}`
}

export default function NativeDatePickerField({ label, value, onChange, disabled = false }: Props) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">{label}</label>
            <div className="rounded-xl border border-white/15 bg-slate-900/90 px-4 py-3 focus-within:border-indigo-400/60 focus-within:ring-2 focus-within:ring-indigo-500/35 transition-all">
                <input
                    type="date"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    disabled={disabled}
                    className="w-full appearance-none bg-transparent text-sm text-white outline-none [color-scheme:dark] disabled:cursor-not-allowed disabled:opacity-60"
                />
            </div>
            {value ? (
                <p className="text-xs text-white/55">Selected: {toDisplayDate(value)}</p>
            ) : null}
        </div>
    )
}
