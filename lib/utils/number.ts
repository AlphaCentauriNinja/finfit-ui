/**
 * Shared numeric parsing utilities.
 *
 * Consolidates the many copies of `toNumber` and `toNumberOrNull` that were
 * scattered across dashboard-data.ts, bullion/page.tsx, AddBullionModal.tsx,
 * PensionHistoryModal.tsx, CryptoTransactionModal.tsx, CryptoHistoryModal.tsx, etc.
 */

/**
 * Parse a value into a finite number. Returns `0` for invalid / null / undefined.
 *
 * Handles currency-formatted strings (strips `£`, commas, whitespace).
 */
export function toNumber(value: number | string | null | undefined): number {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0
    if (typeof value === 'string') {
        const normalized = value
            .trim()
            .replace(/£/g, '')
            .replace(/,/g, '')
            .replace(/\s+/g, '')

        const parsed = Number(normalized)
        if (Number.isFinite(parsed)) return parsed
    }
    return Number(value ?? 0)
}

/**
 * Parse a value into a finite number. Returns `null` for invalid / null / undefined.
 *
 * Use this variant in form processing where distinguishing "no value" from "zero" matters.
 */
export function toNumberOrNull(value: number | string | null | undefined): number | null {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null
    if (typeof value === 'string') {
        const normalized = value
            .trim()
            .replace(/£/g, '')
            .replace(/,/g, '')
            .replace(/\s+/g, '')

        const parsed = Number(normalized)
        if (Number.isFinite(parsed)) return parsed
    }
    return null
}
