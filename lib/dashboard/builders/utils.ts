export const getTodayIso = (): string => new Date().toISOString().slice(0, 10)

export const formatMonthLabel = (monthKey: string, multiYear: boolean): string => {
    const [yearPart, monthPart] = monthKey.split('-')
    const year = Number(yearPart)
    const month = Number(monthPart)
    const date = new Date(year, month - 1, 1)
    if (Number.isNaN(date.getTime())) return monthKey
    const monthStr = new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(date).toUpperCase()
    if (!multiYear) return monthStr
    // Include short year suffix when data spans multiple calendar years
    return `${monthStr} '${String(year).slice(2)}`
}

export const parseDayKey = (value: string): string | null => {
    const normalized = value.trim()

    const directMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (directMatch) {
        const year = Number(directMatch[1])
        const month = Number(directMatch[2])
        const day = Number(directMatch[3])
        if (year >= 1900 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            return `${directMatch[1]}-${directMatch[2]}-${directMatch[3]}`
        }
    }

    const slashMatch = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (slashMatch) {
        const day = Number(slashMatch[1])
        const month = Number(slashMatch[2])
        const year = Number(slashMatch[3])
        if (year >= 1900 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            return `${slashMatch[3]}-${slashMatch[2]}-${slashMatch[1]}`
        }
    }

    const monthMap: Record<string, string> = {
        jan: '01', feb: '02', mar: '03', apr: '04',
        may: '05', jun: '06', jul: '07', aug: '08',
        sep: '09', oct: '10', nov: '11', dec: '12',
    }
    const longMatch = normalized.match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})$/)
    if (longMatch) {
        const day = String(Number(longMatch[1])).padStart(2, '0')
        const monthToken = longMatch[2].slice(0, 3).toLowerCase()
        const month = monthMap[monthToken]
        const year = longMatch[3]
        if (month) {
            return `${year}-${month}-${day}`
        }
    }

    const parsed = new Date(normalized)
    if (Number.isNaN(parsed.getTime())) return null

    const year = parsed.getUTCFullYear()
    const month = String(parsed.getUTCMonth() + 1).padStart(2, '0')
    const day = String(parsed.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export const formatDayLabel = (dayKey: string, multiYear: boolean): string => {
    const [yearPart, monthPart, dayPart] = dayKey.split('-')
    const year = Number(yearPart)
    const month = Number(monthPart)
    const day = Number(dayPart)
    const date = new Date(year, month - 1, day)
    if (Number.isNaN(date.getTime())) return dayKey
    const monthStr = new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(date)
    if (!multiYear) return `${dayPart} ${monthStr}`
    return `${dayPart} ${monthStr} '${String(year).slice(2)}`
}
