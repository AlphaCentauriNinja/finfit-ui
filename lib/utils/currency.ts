/**
 * Shared currency formatting utilities.
 *
 * Consolidates the various formatCurrency implementations from lib/utils.ts,
 * bullion/page.tsx, and inline £-formatting in DashboardWidgets.tsx.
 */

import { type CurrencyCode, CURRENCY_LOCALE } from '@/lib/types/currency'

/**
 * Format a numeric value as a currency string.
 *
 * @param value     - The amount to format
 * @param currency  - ISO 4217 currency code (defaults to 'GBP')
 * @param hideValues - When true, returns '****' (privacy mode)
 */
export function formatCurrency(
    value: number,
    currency: CurrencyCode = 'GBP',
    hideValues: boolean = false,
): string {
    if (hideValues) return '****'

    return new Intl.NumberFormat(CURRENCY_LOCALE[currency] ?? 'en-GB', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)
}

/**
 * Format a numeric value with an explicit sign (e.g. +£1,200.00 or -£300.00).
 */
export function formatSignedCurrency(
    value: number,
    currency: CurrencyCode = 'GBP',
    hideValues: boolean = false,
): string {
    if (hideValues) return '****'
    const sign = value >= 0 ? '+' : '-'
    return `${sign}${formatCurrency(Math.abs(value), currency)}`
}

/**
 * Format a weight value in grams.
 */
export function formatWeight(value: number): string {
    return value.toLocaleString('en-GB', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
    })
}
