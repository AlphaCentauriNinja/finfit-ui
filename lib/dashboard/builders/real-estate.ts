import { toNumber } from '@/lib/utils/number'
import type { RealEstatePropertyRow } from '../types'

export const buildRealEstateSnapshot = (realEstateProperties: RealEstatePropertyRow[]) => {
    const realEstatePropertiesSummary = realEstateProperties.map((prop) => {
        const value =
            toNumber(prop.current_value) ||
            toNumber(prop.estimated_value) ||
            toNumber(prop.market_value)
        const mortgage = toNumber(prop.mortgage_balance)
        const safeValue = Number.isFinite(value) ? value : 0
        const safeMortgage = Number.isFinite(mortgage) ? mortgage : 0
        const equity = safeValue - safeMortgage

        return {
            id: prop.id,
            name: (prop.name ?? '').trim() || 'Property',
            address: (prop.address ?? '').trim() || null,
            value: safeValue,
            mortgage: safeMortgage,
            equity,
        }
    })

    const totalRealEstateValue = realEstatePropertiesSummary.reduce((sum, prop) => sum + prop.value, 0)
    const totalRealEstateMortgage = realEstatePropertiesSummary.reduce((sum, prop) => sum + prop.mortgage, 0)
    const totalRealEstateEquity = realEstatePropertiesSummary.reduce((sum, prop) => sum + prop.equity, 0)

    return {
        properties: realEstatePropertiesSummary,
        totalValue: totalRealEstateValue,
        totalMortgage: totalRealEstateMortgage,
        totalEquity: totalRealEstateEquity,
    }
}
