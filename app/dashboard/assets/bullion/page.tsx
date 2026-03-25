'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, ChevronRight, Coins, LayoutGrid, Minus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { usePrivacy } from '@/app/dashboard/components/providers/PrivacyProvider'

type CurrencyCode = 'GBP' | 'EUR' | 'USD' | 'CHF' | 'CAD'

type BullionRow = {
    id: string
    metal: 'GOLD' | 'SILVER'
    description: string
    amount: number
    weightPerItemGrams: number
    totalWeightGrams: number
    intrinsicPriceGbp: number
    marketPriceGbp: number
    marketTotalGbp: number
    intrinsicTotalGbp: number
    type: 'COIN' | 'BAR'
    manufacturer: string
    country: string
    year: string
    linkLabel: string | null
}

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

const bullionRows: BullionRow[] = [
    {
        id: 'G.1',
        metal: 'GOLD',
        description: 'Gold Sovereign',
        amount: 1,
        weightPerItemGrams: 7.988,
        totalWeightGrams: 7.988,
        intrinsicPriceGbp: 984.67,
        marketPriceGbp: 973.90,
        marketTotalGbp: 973.90,
        intrinsicTotalGbp: 984.67,
        type: 'COIN',
        manufacturer: 'Royal Mint',
        country: 'UK',
        year: '2022',
        linkLabel: null,
    },
    {
        id: 'G.2',
        metal: 'GOLD',
        description: '5 Canadian Dollar (1/10 Ounce)',
        amount: 1,
        weightPerItemGrams: 3.11,
        totalWeightGrams: 3.11,
        intrinsicPriceGbp: 383.37,
        marketPriceGbp: 449.80,
        marketTotalGbp: 449.80,
        intrinsicTotalGbp: 383.37,
        type: 'COIN',
        manufacturer: '',
        country: 'Canada',
        year: '',
        linkLabel: null,
    },
    {
        id: 'G.3',
        metal: 'GOLD',
        description: '10 Canadian Dollar',
        amount: 1,
        weightPerItemGrams: 7.78,
        totalWeightGrams: 7.78,
        intrinsicPriceGbp: 959.03,
        marketPriceGbp: 973.90,
        marketTotalGbp: 973.90,
        intrinsicTotalGbp: 959.03,
        type: 'COIN',
        manufacturer: '',
        country: 'Canada',
        year: '',
        linkLabel: null,
    },
    {
        id: 'G.4',
        metal: 'GOLD',
        description: '1 Tola Bar',
        amount: 1,
        weightPerItemGrams: 11.6,
        totalWeightGrams: 11.6,
        intrinsicPriceGbp: 1429.92,
        marketPriceGbp: 1607.00,
        marketTotalGbp: 1607.00,
        intrinsicTotalGbp: 1429.92,
        type: 'BAR',
        manufacturer: '',
        country: 'Swiss',
        year: '',
        linkLabel: null,
    },
    {
        id: 'G.5',
        metal: 'GOLD',
        description: '1 Gram Bar',
        amount: 1,
        weightPerItemGrams: 1,
        totalWeightGrams: 1,
        intrinsicPriceGbp: 123.27,
        marketPriceGbp: 158.50,
        marketTotalGbp: 158.50,
        intrinsicTotalGbp: 123.27,
        type: 'BAR',
        manufacturer: '',
        country: 'Germany',
        year: '',
        linkLabel: null,
    },
    {
        id: 'G.6',
        metal: 'GOLD',
        description: '10 Gram Bar',
        amount: 1,
        weightPerItemGrams: 10,
        totalWeightGrams: 1,
        intrinsicPriceGbp: 123.27,
        marketPriceGbp: 1356.00,
        marketTotalGbp: 1356.00,
        intrinsicTotalGbp: 123.27,
        type: 'BAR',
        manufacturer: '',
        country: 'Germany',
        year: '',
        linkLabel: null,
    },
    {
        id: 'G.7',
        metal: 'GOLD',
        description: '1/10 Ounce Bar',
        amount: 1,
        weightPerItemGrams: 2.83,
        totalWeightGrams: 2.83,
        intrinsicPriceGbp: 348.85,
        marketPriceGbp: 364.40,
        marketTotalGbp: 364.40,
        intrinsicTotalGbp: 348.85,
        type: 'BAR',
        manufacturer: '',
        country: 'Germany',
        year: '',
        linkLabel: null,
    },
    {
        id: 'S.1',
        metal: 'SILVER',
        description: 'Canada 5 Dollar',
        amount: 54,
        weightPerItemGrams: 31.1,
        totalWeightGrams: 31.1,
        intrinsicPriceGbp: 62.96,
        marketPriceGbp: 100.92,
        marketTotalGbp: 5449.68,
        intrinsicTotalGbp: 3400.00,
        type: 'COIN',
        manufacturer: '',
        country: 'Canada',
        year: '2022',
        linkLabel: 'LINK',
    },
    {
        id: 'S.2',
        metal: 'SILVER',
        description: 'British 2 Pounds',
        amount: 1,
        weightPerItemGrams: 31.1,
        totalWeightGrams: 31.1,
        intrinsicPriceGbp: 62.96,
        marketPriceGbp: 100.56,
        marketTotalGbp: 100.56,
        intrinsicTotalGbp: 62.96,
        type: 'COIN',
        manufacturer: '',
        country: 'UK',
        year: '',
        linkLabel: null,
    },
    {
        id: 'S.3',
        metal: 'SILVER',
        description: 'British Queens Beast',
        amount: 2,
        weightPerItemGrams: 2,
        totalWeightGrams: 62.21,
        intrinsicPriceGbp: 125.95,
        marketPriceGbp: 103.80,
        marketTotalGbp: 207.60,
        intrinsicTotalGbp: 251.89,
        type: 'COIN',
        manufacturer: '',
        country: 'UK',
        year: '',
        linkLabel: null,
    },
    {
        id: 'S.4',
        metal: 'SILVER',
        description: 'British Queens Beast Completer',
        amount: 1,
        weightPerItemGrams: 62.21,
        totalWeightGrams: 62.21,
        intrinsicPriceGbp: 125.95,
        marketPriceGbp: 194.88,
        marketTotalGbp: 194.88,
        intrinsicTotalGbp: 125.95,
        type: 'COIN',
        manufacturer: '',
        country: 'UK',
        year: '',
        linkLabel: 'LINK',
    },
    {
        id: 'S.5',
        metal: 'SILVER',
        description: 'Sharps Pixkey 100 GRAM',
        amount: 4,
        weightPerItemGrams: 100,
        totalWeightGrams: 100,
        intrinsicPriceGbp: 202.45,
        marketPriceGbp: 378.96,
        marketTotalGbp: 1515.84,
        intrinsicTotalGbp: 809.81,
        type: 'BAR',
        manufacturer: '',
        country: 'Swiss',
        year: '',
        linkLabel: null,
    },
    {
        id: 'S.6',
        metal: 'SILVER',
        description: 'Pamp 100 GRAM',
        amount: 1,
        weightPerItemGrams: 100,
        totalWeightGrams: 100,
        intrinsicPriceGbp: 202.45,
        marketPriceGbp: 378.96,
        marketTotalGbp: 378.96,
        intrinsicTotalGbp: 202.45,
        type: 'BAR',
        manufacturer: '',
        country: 'Swiss',
        year: '',
        linkLabel: null,
    },
    {
        id: 'S.7',
        metal: 'SILVER',
        description: 'Sharps Pixley 500 GRAM',
        amount: 1,
        weightPerItemGrams: 100,
        totalWeightGrams: 100,
        intrinsicPriceGbp: 202.45,
        marketPriceGbp: 1563.60,
        marketTotalGbp: 1563.60,
        intrinsicTotalGbp: 202.45,
        type: 'BAR',
        manufacturer: '',
        country: 'Swiss',
        year: '',
        linkLabel: null,
    },
    {
        id: 'S.8',
        metal: 'SILVER',
        description: 'James Bond 007 Bar No Time To Die',
        amount: 1,
        weightPerItemGrams: 31.1,
        totalWeightGrams: 31.1,
        intrinsicPriceGbp: 62.96,
        marketPriceGbp: 102.12,
        marketTotalGbp: 102.12,
        intrinsicTotalGbp: 62.96,
        type: 'BAR',
        manufacturer: '',
        country: 'UK',
        year: '',
        linkLabel: null,
    },
]

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

function BullionGroupIcon({ type, className }: { type: 'COIN' | 'BAR'; className?: string }) {
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
}: {
    group: BullionGroup | null
    isOpen: boolean
    onClose: () => void
    preferredCurrency: CurrencyCode
    hideValues: boolean
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

                                        <p className={`mt-4 text-sm font-semibold ${rowPnlClassName}`}>
                                            {hideValues ? '****' : `PNL ${formatSignedCurrency(convertFromGbp(rowPnlGbp, preferredCurrency), preferredCurrency)}`}
                                        </p>
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
    const [selectedGroupKey, setSelectedGroupKey] = useState<BullionGroupKey | null>(null)

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

    const totalMarketGbp = useMemo(
        () => bullionRows.reduce((sum, row) => sum + row.marketTotalGbp, 0),
        []
    )
    const totalIntrinsicGbp = useMemo(
        () => bullionRows.reduce((sum, row) => sum + row.intrinsicTotalGbp, 0),
        []
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
        })
    }, [totalMarketGbp])
    const selectedGroup = useMemo(
        () => groupedBullion.find((group) => group.key === selectedGroupKey) ?? null,
        [groupedBullion, selectedGroupKey]
    )

    return (
        <div className="w-full">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Bullion Portfolio</h1>
                    <p className="mt-1 text-sm text-white/65">
                        Static gold and silver holdings with intrinsic and market values.
                    </p>
                </div>
            </div>

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

                            <div className="mt-8 flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedGroupKey(group.key)}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                                >
                                    <LayoutGrid className="h-3.5 w-3.5" />
                                    View Holdings
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            <BullionHoldingsModal
                group={selectedGroup}
                isOpen={selectedGroup !== null}
                onClose={() => setSelectedGroupKey(null)}
                preferredCurrency={preferredCurrency}
                hideValues={hideValues}
            />
        </div>
    )
}
