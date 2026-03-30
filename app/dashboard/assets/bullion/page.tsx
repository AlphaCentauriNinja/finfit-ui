'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowDownRight, ArrowUpRight, ChevronRight, Coins, LayoutGrid, Minus, Pencil, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { usePrivacy } from '@/app/dashboard/components/providers/PrivacyProvider'
import AddBullionButton from './AddBullionButton'
import AddBullionModal from './AddBullionModal'
import type { BullionCurrencyCode, BullionHoldingDbRow, BullionRow, BullionType } from './types'

type CurrencyCode = 'GBP' | 'EUR' | 'USD' | 'CHF' | 'CAD'

type BullionGroupKey = 'gold-coins' | 'gold-bars' | 'silver-coins' | 'silver-bars'

type BullionGroup = {
    key: BullionGroupKey
    title: string
    metal: 'GOLD' | 'SILVER'
    type: 'COIN' | 'BAR'
    rows: BullionRow[]
    holdingCount: number
    totalUnits: number
    marketTotalGbp: number
    intrinsicTotalGbp: number
    pnlGbp: number
    pnlPct: number
    allocationPct: number
    iconToneClassName: string
    progressClassName: string
    accentBorderClassName: string
}

const GBP_TO_CURRENCY_RATE: Record<CurrencyCode, number> = {
    GBP: 1,
    EUR: 1.17,
    USD: 1.28,
    CHF: 1.13,
    CAD: 1.74,
}

const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
    GBP: 'en-GB',
    EUR: 'de-DE',
    USD: 'en-US',
    CHF: 'de-CH',
    CAD: 'en-CA',
}

function normalizeCurrency(value: string | null | undefined): CurrencyCode {
    if (value === 'GBP' || value === 'EUR' || value === 'USD' || value === 'CHF' || value === 'CAD') {
        return value
    }
    return 'GBP'
}

function convertFromGbp(valueGbp: number, currency: CurrencyCode): number {
    return valueGbp * GBP_TO_CURRENCY_RATE[currency]
}

function formatCurrency(value: number, currency: CurrencyCode): string {
    return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)
}

function formatSignedCurrency(value: number, currency: CurrencyCode): string {
    return `${value >= 0 ? '+' : '-'}${formatCurrency(Math.abs(value), currency)}`
}

function formatWeight(value: number): string {
    return value.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 3 })
}

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
    const description = row.description?.trim() ?? ''
    const amount = toNumber(row.amount)
    const weightPerItemGrams = toNumber(row.weight_per_item_grams)

    if (!row.id || !metal || !type || !description) return null
    if (amount <= 0 || weightPerItemGrams <= 0) return null

    return {
        id: row.id,
        metal,
        description,
        amount,
        weightPerItemGrams,
        totalWeightGrams: amount * weightPerItemGrams,
        intrinsicPriceGbp: 0,
        marketPriceGbp: 0,
        marketTotalGbp: 0,
        intrinsicTotalGbp: 0,
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
    }
}

const BULLION_GROUP_CONFIG: Array<Pick<BullionGroup, 'key' | 'title' | 'metal' | 'type' | 'iconToneClassName' | 'progressClassName' | 'accentBorderClassName'>> = [
    {
        key: 'gold-coins',
        title: 'Gold Coins',
        metal: 'GOLD',
        type: 'COIN',
        iconToneClassName: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
        progressClassName: 'bg-amber-400',
        accentBorderClassName: 'hover:border-amber-500/30',
    },
    {
        key: 'gold-bars',
        title: 'Gold Bars',
        metal: 'GOLD',
        type: 'BAR',
        iconToneClassName: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
        progressClassName: 'bg-yellow-400',
        accentBorderClassName: 'hover:border-yellow-500/30',
    },
    {
        key: 'silver-coins',
        title: 'Silver Coins',
        metal: 'SILVER',
        type: 'COIN',
        iconToneClassName: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
        progressClassName: 'bg-sky-400',
        accentBorderClassName: 'hover:border-sky-500/30',
    },
    {
        key: 'silver-bars',
        title: 'Silver Bars',
        metal: 'SILVER',
        type: 'BAR',
        iconToneClassName: 'bg-slate-500/10 text-slate-200 border-slate-400/20',
        progressClassName: 'bg-slate-300',
        accentBorderClassName: 'hover:border-slate-400/30',
    },
]

function BullionGroupIcon({ type, className }: { type: BullionType; className?: string }) {
    if (type === 'COIN') {
        return <Coins className={className} />
    }

    return <BarIcon className={className} />
}

function BullionHoldingsModal({
    group,
    isOpen,
    onClose,
    preferredCurrency,
    hideValues,
    onEditHolding,
}: {
    group: BullionGroup | null
    isOpen: boolean
    onClose: () => void
    preferredCurrency: CurrencyCode
    hideValues: boolean
    onEditHolding: (row: BullionRow) => void
}) {
    if (!isOpen || !group) return null

    const pnlClassName = group.pnlGbp > 0
        ? 'text-emerald-400'
        : group.pnlGbp < 0
            ? 'text-rose-400'
            : 'text-white'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${group.iconToneClassName}`}>
                            <BullionGroupIcon type={group.type} className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{group.title}</h2>
                            <p className="mt-1 text-xs text-white/60">
                                {group.holdingCount} {group.holdingCount === 1 ? 'holding' : 'holdings'} · {hideValues ? '****' : `${group.totalUnits.toLocaleString('en-GB')} units`}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 text-rose-300 transition-colors hover:text-rose-200">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-6 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-white/45">Current Value</p>
                            <p className="mt-2 text-2xl font-bold text-white">
                                {hideValues ? '****' : formatCurrency(convertFromGbp(group.marketTotalGbp, preferredCurrency), preferredCurrency)}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-white/45">Intrinsic Value</p>
                            <p className="mt-2 text-2xl font-bold text-white">
                                {hideValues ? '****' : formatCurrency(convertFromGbp(group.intrinsicTotalGbp, preferredCurrency), preferredCurrency)}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-white/45">PNL</p>
                            <p className={`mt-2 text-2xl font-bold ${pnlClassName}`}>
                                {hideValues ? '****' : formatSignedCurrency(convertFromGbp(group.pnlGbp, preferredCurrency), preferredCurrency)}
                            </p>
                            <p className={`mt-1 text-xs ${pnlClassName}`}>
                                {hideValues ? '****' : `${group.pnlGbp >= 0 ? '+' : ''}${group.pnlPct.toFixed(2)}%`}
                            </p>
                        </div>
                    </div>

                    {group.rows.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-white/50">
                            No holdings in this category yet.
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {group.rows.map((row) => {
                                const rowPnlGbp = row.marketTotalGbp - row.intrinsicTotalGbp
                                const rowPnlClassName = rowPnlGbp > 0
                                    ? 'text-emerald-400'
                                    : rowPnlGbp < 0
                                        ? 'text-rose-400'
                                        : 'text-white'

                                return (
                                    <div key={row.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 className="truncate font-bold text-white">{row.description}</h3>
                                                <p className="mt-1 text-xs text-white/50">
                                                    {row.country || 'Unknown'}{row.year ? ` · ${row.year}` : ''}
                                                </p>
                                            </div>
                                            <span className={`inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border ${group.iconToneClassName}`}>
                                                <BullionGroupIcon type={row.type} className="h-4 w-4" />
                                            </span>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                                                <p className="text-xs uppercase tracking-wider text-white/45">Units</p>
                                                <p className="mt-1 font-medium text-white/85">{hideValues ? '****' : row.amount.toLocaleString('en-GB')}</p>
                                            </div>
                                            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                                                <p className="text-xs uppercase tracking-wider text-white/45">Weight</p>
                                                <p className="mt-1 font-medium text-white/85">
                                                    {hideValues ? '****' : `${formatWeight(row.amount * row.weightPerItemGrams)} g`}
                                                </p>
                                            </div>
                                            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                                                <p className="text-xs uppercase tracking-wider text-white/45">Market Total</p>
                                                <p className="mt-1 font-medium text-white/85">
                                                    {hideValues ? '****' : formatCurrency(convertFromGbp(row.marketTotalGbp, preferredCurrency), preferredCurrency)}
                                                </p>
                                            </div>
                                            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                                                <p className="text-xs uppercase tracking-wider text-white/45">Intrinsic Total</p>
                                                <p className="mt-1 font-medium text-white/85">
                                                    {hideValues ? '****' : formatCurrency(convertFromGbp(row.intrinsicTotalGbp, preferredCurrency), preferredCurrency)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between gap-4">
                                            <p className={`text-sm font-semibold ${rowPnlClassName}`}>
                                                {hideValues ? '****' : `PNL ${formatSignedCurrency(convertFromGbp(rowPnlGbp, preferredCurrency), preferredCurrency)}`}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => onEditHolding(row)}
                                                className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                                Edit
                                            </button>
                                        </div>

                                        {row.metal === 'SILVER' && row.taxRatePct !== null && row.taxRatePct !== undefined ? (
                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                                    row.taxRatePct === 0
                                                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                                                        : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                                                }`}>
                                                    {row.taxRatePct === 0 ? 'VAT Free' : `VAT ${row.taxRatePct}%`}
                                                </span>
                                                {row.taxAmount !== null && row.taxAmount !== undefined && row.taxAmount > 0 ? (
                                                    <span className="text-xs text-white/50">
                                                        {hideValues ? '****' : `Tax: ${formatCurrency(row.taxAmount, preferredCurrency)}`}
                                                    </span>
                                                ) : null}
                                                {row.totalPriceInclTax !== null && row.totalPriceInclTax !== undefined ? (
                                                    <span className="text-xs text-white/50">
                                                        {hideValues ? '****' : `Total: ${formatCurrency(row.totalPriceInclTax, preferredCurrency)}`}
                                                    </span>
                                                ) : null}
                                            </div>
                                        ) : null}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="border-t border-white/10 bg-white/[0.02] p-6">
                    <button
                        onClick={onClose}
                        className="w-full rounded-xl border border-rose-500/35 px-4 py-3 text-sm font-semibold text-rose-300 transition-all hover:bg-rose-500/10"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

function BarIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M4 14.5L9 9.5H17L12 14.5H4Z" />
            <path d="M12 14.5L17 9.5H20L15 14.5H12Z" />
            <path d="M5 17.5L10 12.5H13L8 17.5H5Z" />
        </svg>
    )
}

export default function BullionPage() {
    const { hideValues } = usePrivacy()
    const [preferredCurrency, setPreferredCurrency] = useState<CurrencyCode>('GBP')
    const [bullionRows, setBullionRows] = useState<BullionRow[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [selectedGroupKey, setSelectedGroupKey] = useState<BullionGroupKey | null>(null)
    const [editingRow, setEditingRow] = useState<BullionRow | null>(null)

    useEffect(() => {
        let isMounted = true

        const loadPreferredCurrency = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from('user_settings')
                .select('preferred_currency')
                .maybeSingle()

            if (!isMounted) return

            setPreferredCurrency(normalizeCurrency(data?.preferred_currency))
        }

        void loadPreferredCurrency()

        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        let isMounted = true

        const loadBullionHoldings = async () => {
            const supabase = createClient()
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser()

            if (!isMounted) return

            if (userError) {
                setLoadError(userError.message)
                setIsLoading(false)
                return
            }

            if (!user) {
                setBullionRows([])
                setLoadError(null)
                setIsLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('bullion_holdings')
                .select('id, metal, description, amount, weight_per_item_grams, type, manufacturer, country, mint_year, link_label, catalog_product_id, catalog_variant_id, purchase_date, purchase_value, purchase_currency, tax_rate_pct, tax_amount, total_price_incl_tax')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (!isMounted) return

            if (error) {
                setLoadError(error.message)
                setIsLoading(false)
                return
            }

            const rows = (data ?? [])
                .map((row) => mapBullionHoldingRow(row as BullionHoldingDbRow))
                .filter((row): row is BullionRow => Boolean(row))

            setBullionRows(rows)
            setLoadError(null)
            setIsLoading(false)
        }

        void loadBullionHoldings()

        return () => {
            isMounted = false
        }
    }, [])

    const totalMarketGbp = useMemo(
        () => bullionRows.reduce((sum, row) => sum + row.marketTotalGbp, 0),
        [bullionRows]
    )
    const totalIntrinsicGbp = useMemo(
        () => bullionRows.reduce((sum, row) => sum + row.intrinsicTotalGbp, 0),
        [bullionRows]
    )
    const totalPnlGbp = totalMarketGbp - totalIntrinsicGbp
    const totalPnlPct = totalIntrinsicGbp > 0 ? (totalPnlGbp / totalIntrinsicGbp) * 100 : 0
    const totalPnlClassName = totalPnlGbp > 0
        ? 'text-emerald-400'
        : totalPnlGbp < 0
            ? 'text-rose-400'
            : 'text-amber-400'
    const totalPnlPillClassName = totalPnlGbp > 0
        ? 'text-emerald-300 bg-emerald-500/10'
        : totalPnlGbp < 0
            ? 'text-rose-300 bg-rose-500/10'
            : 'text-amber-300 bg-amber-500/10'
    const groupedBullion = useMemo<BullionGroup[]>(() => {
        return BULLION_GROUP_CONFIG.map((config) => {
            const rows = bullionRows.filter((row) => row.metal === config.metal && row.type === config.type)
            const marketTotalGbp = rows.reduce((sum, row) => sum + row.marketTotalGbp, 0)
            const intrinsicTotalGbp = rows.reduce((sum, row) => sum + row.intrinsicTotalGbp, 0)
            const totalUnits = rows.reduce((sum, row) => sum + row.amount, 0)
            const pnlGbp = marketTotalGbp - intrinsicTotalGbp
            const pnlPct = intrinsicTotalGbp > 0 ? (pnlGbp / intrinsicTotalGbp) * 100 : 0
            const allocationPct = totalMarketGbp > 0 ? (marketTotalGbp / totalMarketGbp) * 100 : 0

            return {
                ...config,
                rows,
                holdingCount: rows.length,
                totalUnits,
                marketTotalGbp,
                intrinsicTotalGbp,
                pnlGbp,
                pnlPct,
                allocationPct,
            }
        }).filter((group) => group.holdingCount > 0)
    }, [bullionRows, totalMarketGbp])
    const selectedGroup = useMemo(
        () => groupedBullion.find((group) => group.key === selectedGroupKey) ?? null,
        [groupedBullion, selectedGroupKey]
    )
    const hasBullionHoldings = bullionRows.length > 0

    return (
        <div className="w-full">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Bullion Portfolio</h1>
                    <p className="mt-1 text-sm text-white/65">
                        Gold and silver holdings. Pricing is synced separately by the backend.
                    </p>
                </div>
                <AddBullionButton
                    onCreated={(row) => {
                        setBullionRows((previous) => [row, ...previous])
                    }}
                />
            </div>

            {loadError ? (
                <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    Bullion holdings could not load right now: {loadError}
                </div>
            ) : null}

            {isLoading ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-white/65">
                    Loading bullion holdings...
                </div>
            ) : !hasBullionHoldings ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-emerald-300" />
                        <span>No bullion holdings yet. Add gold or silver bars/coins to get started.</span>
                    </div>
                </div>
            ) : (
                <>
                    <div className="mb-8 grid gap-6 md:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-sm">
                            <p className="text-sm font-medium text-white/60">Current Value</p>
                            <p className="mt-2 text-3xl font-bold text-white">
                                {hideValues ? '****' : formatCurrency(convertFromGbp(totalMarketGbp, preferredCurrency), preferredCurrency)}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-sm">
                            <p className="text-sm font-medium text-white/60">Intrinsic Value</p>
                            <p className="mt-2 text-3xl font-bold text-white">
                                {hideValues ? '****' : formatCurrency(convertFromGbp(totalIntrinsicGbp, preferredCurrency), preferredCurrency)}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-sm">
                            <p className="text-sm font-medium text-white/60">PNL</p>
                            <div className="mt-2 flex items-center gap-2">
                                <p className={`text-3xl font-bold ${totalPnlClassName}`}>
                                    {hideValues ? '****' : formatSignedCurrency(convertFromGbp(totalPnlGbp, preferredCurrency), preferredCurrency)}
                                </p>
                                <span className={`rounded-md px-2 py-1 text-xs ${totalPnlPillClassName}`}>
                                    {hideValues ? '****' : `${totalPnlPct >= 0 ? '+' : ''}${totalPnlPct.toFixed(2)}%`}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {groupedBullion.map((group) => {
                            const pnlState = group.pnlGbp > 0 ? 'positive' : group.pnlGbp < 0 ? 'negative' : 'neutral'
                            const PnlIcon = pnlState === 'positive' ? ArrowUpRight : pnlState === 'negative' ? ArrowDownRight : Minus
                            const pnlPillTone = pnlState === 'positive'
                                ? 'border-green-500 bg-green-500/20 text-green-200'
                                : pnlState === 'negative'
                                    ? 'border-red-500 bg-red-500/20 text-red-200'
                                    : 'border-amber-500 bg-amber-500/20 text-amber-200'

                            return (
                                <div
                                    key={group.key}
                                    className="group/card flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/10"
                                >
                                    <div className="mb-2 flex items-start justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-white/60">{group.title}</h3>
                                            <p className="mt-1 text-2xl font-bold text-white">
                                                {hideValues ? '****' : formatCurrency(convertFromGbp(group.marketTotalGbp, preferredCurrency), preferredCurrency)}
                                            </p>
                                        </div>
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border transition-transform group-hover/card:scale-110 ${group.iconToneClassName}`}>
                                            <BullionGroupIcon type={group.type} className="h-5 w-5" />
                                        </div>
                                    </div>

                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${pnlPillTone}`}>
                                            <PnlIcon className="mr-1 h-3.5 w-3.5" />
                                            PNL {hideValues ? '****' : formatSignedCurrency(convertFromGbp(group.pnlGbp, preferredCurrency), preferredCurrency)}
                                        </span>
                                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${pnlPillTone}`}>
                                            {hideValues ? '****' : `${group.pnlGbp >= 0 ? '+' : ''}${group.pnlPct.toFixed(2)}%`}
                                        </span>
                                    </div>

                                    <div className="mb-6 mt-4 w-full rounded-full bg-white/5 h-1.5">
                                        <div
                                            className={`h-1.5 rounded-full transition-all duration-500 ${group.progressClassName}`}
                                            style={{ width: hideValues ? '0%' : `${group.allocationPct}%` }}
                                        />
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedGroupKey(group.key)}
                                            className="w-full text-left group/holdings"
                                        >
                                            <div className={`rounded-xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:bg-white/10 ${group.accentBorderClassName}`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`rounded-lg border p-2 ${group.iconToneClassName}`}>
                                                            <LayoutGrid className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Holdings</p>
                                                            <p className="mt-0.5 text-sm font-medium text-white">
                                                                {group.holdingCount} {group.holdingCount === 1 ? 'Holding' : 'Holdings'} · {hideValues ? '****' : `${group.totalUnits.toLocaleString('en-GB')} units`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-white/20 transition-all group-hover/holdings:translate-x-1 group-hover/holdings:text-white/60" />
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}

            <BullionHoldingsModal
                group={selectedGroup}
                isOpen={selectedGroup !== null}
                onClose={() => setSelectedGroupKey(null)}
                preferredCurrency={preferredCurrency}
                hideValues={hideValues}
                onEditHolding={(row) => {
                    setSelectedGroupKey(null)
                    setEditingRow(row)
                }}
            />

            {editingRow !== null ? (
                <AddBullionModal
                    isOpen={editingRow !== null}
                    onClose={() => setEditingRow(null)}
                    editHolding={editingRow}
                    onUpdated={(updatedRow) => {
                        setBullionRows((prev) => prev.map((r) => (r.id === updatedRow.id ? updatedRow : r)))
                    }}
                    onDeleted={(deletedId) => {
                        setBullionRows((prev) => prev.filter((r) => r.id !== deletedId))
                    }}
                />
            ) : null}
        </div>
    )
}
