import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, hideValues: boolean = false, currency?: string): string {
    if (hideValues) {
        return "****"
    }
    if (currency) {
        const locales: Record<string, string> = {
            GBP: 'en-GB',
            EUR: 'de-DE',
            USD: 'en-US',
            CHF: 'de-CH',
            CAD: 'en-CA',
        }
        return new Intl.NumberFormat(locales[currency] || 'en-GB', {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value)
    }
    return `£${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
