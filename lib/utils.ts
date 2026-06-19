import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Re-export shared utilities for backward compatibility.
// New code should import directly from the specific modules.
export { toNumber, toNumberOrNull } from '@/lib/utils/number'
export { formatCurrency, formatSignedCurrency, formatWeight } from '@/lib/utils/currency'
export { type CurrencyCode, normalizeCurrency, CURRENCY_LOCALE, CURRENCY_TO_GBP, USD_TO_GBP, GBP_TO_CURRENCY_RATE } from '@/lib/types/currency'
