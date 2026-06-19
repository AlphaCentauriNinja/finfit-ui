import { toNumber } from '@/lib/utils/number'
import type { DebtEntryRow } from '../types'

export const buildDebtSnapshot = (debtEntries: DebtEntryRow[]) => {
    const normalizedDebtAmounts = debtEntries
        .map((entry) => toNumber(entry.amount))
        .filter((amount) => Number.isFinite(amount))
        .map((amount) => Math.max(0, amount))

    const totalDebt = normalizedDebtAmounts.reduce((sum, amount) => sum + amount, 0)
    const debtCount = normalizedDebtAmounts.filter((amount) => amount > 0).length

    return {
        totalDebt,
        debtCount,
    }
}
