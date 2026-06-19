import { toNumber } from '@/lib/utils/number'
import { CURRENCY_TO_GBP } from '@/lib/types/currency'
import type { BullionHoldingRow } from '../types'

export const buildBullionSnapshot = (bullionHoldings: BullionHoldingRow[]) => {
    const bullionHoldingsSummary = bullionHoldings.map((holding) => {
        const currency = holding.purchase_currency || 'GBP'
        const rate = CURRENCY_TO_GBP[currency] ?? 1
        const amount = toNumber(holding.amount)
        const parsedAmount = Number.isFinite(amount) ? amount : 0
        const weightPerItemGrams = toNumber(holding.weight_per_item_grams)
        const parsedWeight = Number.isFinite(weightPerItemGrams) ? weightPerItemGrams : 0

        let investedPerUnit = 0
        const totalInclTax = toNumber(holding.total_price_incl_tax)
        if (Number.isFinite(totalInclTax) && totalInclTax > 0) {
            investedPerUnit = totalInclTax * rate
        } else {
            const value = toNumber(holding.purchase_value)
            const taxPct = toNumber(holding.tax_rate_pct)
            const taxMultiplier = Number.isFinite(taxPct) && taxPct > 0 ? 1 + taxPct / 100 : 1
            investedPerUnit = value * rate * taxMultiplier
        }

        return {
            id: holding.id,
            title: (holding.title ?? '').trim() || null,
            description: (holding.description ?? '').trim() || null,
            metal: holding.metal === 'GOLD' || holding.metal === 'SILVER' ? holding.metal : 'GOLD',
            type: (holding.type ?? '').trim() || null,
            country: (holding.country ?? '').trim() || null,
            amount: parsedAmount,
            weightPerItemGrams: parsedWeight,
            investedGbp: investedPerUnit * parsedAmount,
            marketPremiumPct: toNumber(holding.market_premium_pct ?? 0),
        }
    })

    const totalBullionInvested = bullionHoldingsSummary.reduce((sum, holding) => sum + holding.investedGbp, 0)

    return {
        holdings: bullionHoldingsSummary,
        totalInvested: totalBullionInvested,
    }
}
