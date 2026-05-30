'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AddBullionModal from '@/app/dashboard/assets/bullion/AddBullionModal'
import { createClient } from '@/lib/supabase/client'
import type { BullionCurrencyCode, BullionHoldingDbRow, BullionRow } from '@/app/dashboard/assets/bullion/types'

function toNumber(value: number | string | null | undefined): number {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
        const parsed = Number(value)
        if (Number.isFinite(parsed)) return parsed
    }
    return 0
}

function normalizeStoredCurrency(value: string | null | undefined): BullionCurrencyCode | null {
    if (value === 'GBP' || value === 'EUR' || value === 'USD' || value === 'CHF' || value === 'CAD') {
        return value
    }

    return null
}

function mapBullionHoldingRow(row: BullionHoldingDbRow): BullionRow | null {
    const metal = row.metal === 'GOLD' || row.metal === 'SILVER' ? row.metal : null
    const type = row.type === 'COIN' || row.type === 'BAR' ? row.type : null
    const title = row.title?.trim() ? row.title.trim() : null
    const description = row.description?.trim() ?? ''
    const amount = toNumber(row.amount)
    const weightPerItemGrams = toNumber(row.weight_per_item_grams)

    if (!row.id || !metal || !type || !description) return null
    if (amount <= 0 || weightPerItemGrams <= 0) return null

    return {
        id: row.id,
        metal,
        title,
        description,
        amount,
        weightPerItemGrams,
        totalWeightGrams: amount * weightPerItemGrams,
        intrinsicPriceGbp: 0,
        marketPriceGbp: 0,
        marketTotalGbp: 0,
        intrinsicTotalGbp: 0,
        investedTotalGbp: 0,
        type,
        manufacturer: row.manufacturer?.trim() ?? '',
        country: row.country?.trim() ?? '',
        year: row.mint_year?.trim() ?? '',
        linkLabel: row.link_label ?? null,
        catalogProductId: row.catalog_product_id,
        catalogVariantId: row.catalog_variant_id,
        purchaseDate: row.purchase_date,
        purchaseValue: row.purchase_value === null ? null : toNumber(row.purchase_value),
        purchaseCurrency: normalizeStoredCurrency(row.purchase_currency),
        taxRatePct: row.tax_rate_pct === null || row.tax_rate_pct === undefined ? null : toNumber(row.tax_rate_pct),
        taxAmount: row.tax_amount === null || row.tax_amount === undefined ? null : toNumber(row.tax_amount),
        totalPriceInclTax: row.total_price_incl_tax === null || row.total_price_incl_tax === undefined ? null : toNumber(row.total_price_incl_tax),
        marketPremiumPct: row.market_premium_pct === null || row.market_premium_pct === undefined ? 0 : toNumber(row.market_premium_pct),
        notes: row.notes?.trim() ? row.notes.trim() : null,
        imagePath: row.image_path?.trim() ? row.image_path.trim() : null,
    }
}

const BULLION_LIST_ROUTE = '/dashboard/assets/bullion'

export default function BullionHoldingEditRoutePage() {
    const router = useRouter()
    const params = useParams<{ metal?: string; type?: string; id?: string }>()

    const routeMetal = typeof params?.metal === 'string' ? params.metal.toLowerCase() : ''
    const routeType = typeof params?.type === 'string' ? params.type.toLowerCase() : ''
    const holdingId = typeof params?.id === 'string' ? params.id : ''
    const isRouteValidMetal = routeMetal === 'gold' || routeMetal === 'silver'
    const isRouteValidType = routeType === 'coin' || routeType === 'bar'
    const isRouteValid = Boolean(holdingId) && isRouteValidMetal && isRouteValidType

    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [holding, setHolding] = useState<BullionRow | null>(null)

    useEffect(() => {
        let active = true

        if (!isRouteValid) return

        const loadHolding = async () => {
            setIsLoading(true)
            setLoadError(null)

            const supabase = createClient()
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser()

            if (!active) return

            if (userError || !user) {
                setLoadError(userError?.message || 'Session not found. Please sign in again.')
                setIsLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('bullion_holdings')
                .select('id, metal, title, description, amount, weight_per_item_grams, type, manufacturer, country, mint_year, link_label, catalog_product_id, catalog_variant_id, purchase_date, purchase_value, purchase_currency, tax_rate_pct, tax_amount, total_price_incl_tax, market_premium_pct, notes, image_path')
                .eq('id', holdingId)
                .eq('user_id', user.id)
                .maybeSingle()

            if (!active) return

            if (error || !data) {
                setLoadError(error?.message || 'Bullion holding not found.')
                setIsLoading(false)
                return
            }

            const mappedHolding = mapBullionHoldingRow(data as BullionHoldingDbRow)
            if (!mappedHolding) {
                setLoadError('Unable to load this bullion holding.')
                setIsLoading(false)
                return
            }

            const canonicalMetal = mappedHolding.metal.toLowerCase()
            const canonicalType = mappedHolding.type.toLowerCase()
            if (canonicalMetal !== routeMetal || canonicalType !== routeType) {
                router.replace(`/dashboard/asset/bullion/${canonicalMetal}/${canonicalType}/${mappedHolding.id}`)
            }

            setHolding(mappedHolding)
            setIsLoading(false)
        }

        void loadHolding()

        return () => {
            active = false
        }
    }, [holdingId, isRouteValid, routeMetal, routeType, router])

    if (!isRouteValid) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center p-4">
                <div className="w-full max-w-lg rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-center">
                    <p className="text-sm text-rose-200">Invalid bullion edit route.</p>
                    <button
                        type="button"
                        onClick={() => router.push(BULLION_LIST_ROUTE)}
                        className="mt-4 rounded-xl border border-rose-500/35 px-4 py-2 text-sm font-semibold text-rose-200 transition-colors hover:bg-rose-500/10"
                    >
                        Back to Bullion
                    </button>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
                    Loading bullion holding...
                </div>
            </div>
        )
    }

    if (loadError || !holding) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center p-4">
                <div className="w-full max-w-lg rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-center">
                    <p className="text-sm text-rose-200">{loadError || 'Bullion holding not found.'}</p>
                    <button
                        type="button"
                        onClick={() => router.push(BULLION_LIST_ROUTE)}
                        className="mt-4 rounded-xl border border-rose-500/35 px-4 py-2 text-sm font-semibold text-rose-200 transition-colors hover:bg-rose-500/10"
                    >
                        Back to Bullion
                    </button>
                </div>
            </div>
        )
    }

    return (
        <AddBullionModal
            isOpen={true}
            onClose={() => router.push(BULLION_LIST_ROUTE)}
            editHolding={holding}
            onUpdated={(updatedRow) => {
                setHolding(updatedRow)
            }}
            onDeleted={() => {
                router.push(BULLION_LIST_ROUTE)
            }}
        />
    )
}
