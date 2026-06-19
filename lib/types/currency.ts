/**
 * Single source of truth for currency types and constants.
 *
 * Previously duplicated across lib/crypto-data.ts, bullion/page.tsx,
 * AddBullionModal.tsx, bullion/[metal]/[type]/[id]/page.tsx, crypto/page.tsx,
 * investments/page.tsx, and more.
 */

export type CurrencyCode = 'GBP' | 'EUR' | 'USD' | 'CHF' | 'CAD'

/** Locale strings for Intl.NumberFormat by currency. */
export const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
    GBP: 'en-GB',
    EUR: 'de-DE',
    USD: 'en-US',
    CHF: 'de-CH',
    CAD: 'en-CA',
}

/** Approximate GBP → currency conversion factors (static fallback). */
export const GBP_TO_CURRENCY_RATE: Record<CurrencyCode, number> = {
    GBP: 1,
    EUR: 1.17,
    USD: 1.28,
    CHF: 1.13,
    CAD: 1.74,
}

/** Approximate currency → GBP conversion factors (static fallback). */
export const CURRENCY_TO_GBP: Record<string, number> = {
    GBP: 1,
    EUR: 1 / 1.17,
    USD: 0.746,
    CHF: 1 / 1.13,
    CAD: 1 / 1.74,
}

/** Fallback USD → GBP rate used when live rates are unavailable. */
export const USD_TO_GBP = 0.746

/** All supported currency codes as an array. */
export const SUPPORTED_CURRENCIES: CurrencyCode[] = ['GBP', 'EUR', 'USD', 'CHF', 'CAD']

/**
 * Validate and normalize a raw string into a CurrencyCode.
 * Returns 'GBP' as default for unrecognized values.
 */
export function normalizeCurrency(value: string | null | undefined): CurrencyCode {
    if (
        value === 'GBP' ||
        value === 'EUR' ||
        value === 'USD' ||
        value === 'CHF' ||
        value === 'CAD'
    ) {
        return value
    }
    return 'GBP'
}

/**
 * Check if a value is a valid CurrencyCode.
 */
export function isCurrencyCode(value: unknown): value is CurrencyCode {
    return (
        value === 'GBP' ||
        value === 'EUR' ||
        value === 'USD' ||
        value === 'CHF' ||
        value === 'CAD'
    )
}
