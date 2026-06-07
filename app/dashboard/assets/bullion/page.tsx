/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ArrowDownRight, ArrowUpRight, ChevronRight, Coins, LayoutGrid, Minus, X, Database, TrendingUp, Wifi, WifiOff } from 'lucide-react'
import { useSpotPrices } from './useSpotPrices'
import { useCurrencyContext } from '@/app/dashboard/components/providers/DashboardDataProvider'
import { createClient } from '@/lib/supabase/client'
import { usePrivacy } from '@/app/dashboard/components/providers/PrivacyProvider'
import EmptyStateAlert from '@/app/dashboard/components/EmptyStateAlert'
import AssetOnboardingHero from '@/app/dashboard/components/AssetOnboardingHero'
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
    investedTotalGbp: number
    pnlGbp: number
    pnlPct: number
    allocationPct: number
    iconToneClassName: string
    progressClassName: string
    accentBorderClassName: string
}

// GBP_TO_CURRENCY_RATE moved to CurrencyProvider

const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
    GBP: 'en-GB',
    EUR: 'de-DE',
    USD: 'en-US',
    CHF: 'de-CH',
    CAD: 'en-CA',
}

const BULLION_IMAGES_BUCKET = 'bullion_images'

function normalizeCurrency(value: string | null | undefined): CurrencyCode {
    if (value === 'GBP' || value === 'EUR' || value === 'USD' || value === 'CHF' || value === 'CAD') {
        return value
    }
    return 'GBP'
}

function buildBullionImagePublicUrl(imagePath: string | null | undefined): string | null {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const normalizedPath = imagePath?.trim() ?? ''

    if (!supabaseUrl || !normalizedPath) return null

    const encodedPath = normalizedPath
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/')

    return `${supabaseUrl}/storage/v1/object/public/${BULLION_IMAGES_BUCKET}/${encodedPath}`
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

function BullionHoldingImage({
    imagePath,
    label,
    className,
}: {
    imagePath: string | null
    label: string
    className?: string
}) {
    const [hasLoadError, setHasLoadError] = useState(false)
    const imageUrl = useMemo(() => buildBullionImagePublicUrl(imagePath), [imagePath])
    const resolvedClassName = className ?? 'h-36 w-full rounded-lg border border-white/10 object-cover'
    const fallbackClassName = className
        ? `${className.replace('object-cover', '')} flex items-center justify-center border-dashed bg-slate-900/40 text-xs text-white/45`
        : 'flex h-36 items-center justify-center rounded-lg border border-dashed border-white/15 bg-slate-900/40 text-xs text-white/45'

    if (!imageUrl || hasLoadError) {
        return (
            <div className={fallbackClassName}>
                No image uploaded
            </div>
        )
    }

    return (
        <img
            src={imageUrl}
            alt={`${label} holding image`}
            loading="lazy"
            onError={() => setHasLoadError(true)}
            className={resolvedClassName}
        />
    )
}

function BullionHoldingsListModal({
    group,
    isOpen,
    onClose,
    preferredCurrency,
    rates,
    hideValues,
}: {
    group: BullionGroup | null
    isOpen: boolean
    onClose: () => void
    preferredCurrency: CurrencyCode
    hideValues: boolean
}) {
    const router = useRouter()

    if (!isOpen || !group) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 p-5">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${group.iconToneClassName}`}>
                            <BullionGroupIcon type={group.type} className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">{group.title}</h2>
                            <p className="mt-0.5 text-xs text-white/50">
                                {group.holdingCount} {group.holdingCount === 1 ? 'holding' : 'holdings'} · {hideValues ? '****' : `${group.totalUnits.toLocaleString('en-GB')} units`}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 text-white/40 transition-colors hover:text-white/70">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {group.rows.length === 0 ? (
                        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-white/50">
                            No holdings in this category yet.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {group.rows.map((row) => {
                                const rowDisplayTitle = row.title?.trim() || row.description
                                const holdingRoute = `/dashboard/assets/bullion/${row.metal.toLowerCase()}/${row.type.toLowerCase()}/${row.id}`

                                return (
                                    <button
                                        key={row.id}
                                        type="button"
                                        onClick={() => {
                                            onClose()
                                            router.push(holdingRoute)
                                        }}
                                        className="group/row w-full text-left"
                                    >
                                        <div className={`flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5 transition-all duration-200 hover:border-white/15 hover:bg-white/[0.07]`}>
                                            <BullionHoldingImage
                                                imagePath={row.imagePath}
                                                label={rowDisplayTitle}
                                                className="h-11 w-11 rounded-lg border border-white/10 object-cover"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-white">{rowDisplayTitle}</p>
                                                <p className="mt-0.5 text-xs text-white/45">
                                                    {hideValues ? '****' : `${row.amount.toLocaleString('en-GB')} units · ${formatCurrency(row.marketTotalGbp, preferredCurrency)}`}
                                                </p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 shrink-0 text-white/15 transition-all group-hover/row:translate-x-0.5 group-hover/row:text-white/40" />
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="border-t border-white/10 bg-white/[0.02] p-4">
                    <button
                        onClick={onClose}
                        className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/50 transition-all hover:bg-white/5 hover:text-white/70"
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
    const router = useRouter()
    const { hideValues } = usePrivacy()
    const { preferredCurrency, usdToPreferredCurrencyRate } = useCurrencyContext()
    const [bullionRows, setBullionRows] = useState<BullionRow[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [selectedGroupKey, setSelectedGroupKey] = useState<BullionGroupKey | null>(null)


    // Live spot prices — uses the user's preferred currency
    const spotPrices = useSpotPrices(preferredCurrency)

    // Enrich bullion rows with live intrinsic values from spot prices
    const enrichedBullionRows = useMemo<BullionRow[]>(() => {
        if (spotPrices.goldPricePerGram === null || spotPrices.silverPricePerGram === null) {
            return bullionRows
        }

        return bullionRows.map((row) => {
            const spotPricePerGram = row.metal === 'GOLD'
                ? spotPrices.goldPricePerGram!
                : spotPrices.silverPricePerGram!

            const intrinsicPriceGbp = spotPricePerGram * row.weightPerItemGrams
            const intrinsicTotalGbp = intrinsicPriceGbp * row.amount
            const marketPremiumPct = Number.isFinite(row.marketPremiumPct) ? row.marketPremiumPct : 0
            const marketMultiplier = 1 + marketPremiumPct / 100
            const marketPriceGbp = intrinsicPriceGbp * marketMultiplier
            const marketTotalGbp = intrinsicTotalGbp * marketMultiplier

            const rawInvestedPerUnit = row.totalPriceInclTax ?? row.purchaseValue ?? 0
            const rawInvestedTotal = rawInvestedPerUnit * row.amount
            const investedCurrency = row.purchaseCurrency ?? 'USD'
            const investedGbp = investedCurrency === 'USD' ? rawInvestedTotal * usdToPreferredCurrencyRate : rawInvestedTotal

            return {
                ...row,
                marketPriceGbp,
                marketTotalGbp,
                intrinsicPriceGbp,
                intrinsicTotalGbp,
                investedTotalGbp: investedGbp,
            }
        })
    }, [bullionRows, spotPrices.goldPricePerGram, spotPrices.silverPricePerGram, usdToPreferredCurrencyRate])

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
                .select('id, metal, title, description, amount, weight_per_item_grams, type, manufacturer, country, mint_year, link_label, catalog_product_id, catalog_variant_id, purchase_date, purchase_value, purchase_currency, tax_rate_pct, tax_amount, total_price_incl_tax, market_premium_pct, notes, image_path')
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
        () => enrichedBullionRows.reduce((sum, row) => sum + row.marketTotalGbp, 0),
        [enrichedBullionRows]
    )
    const totalIntrinsicGbp = useMemo(
        () => enrichedBullionRows.reduce((sum, row) => sum + row.intrinsicTotalGbp, 0),
        [enrichedBullionRows]
    )
    const totalInvestedGbp = useMemo(
        () => enrichedBullionRows.reduce((sum, row) => sum + row.investedTotalGbp, 0),
        [enrichedBullionRows]
    )
    const totalPnlGbp = totalMarketGbp - totalInvestedGbp
    const totalPnlPct = totalInvestedGbp > 0 ? (totalPnlGbp / totalInvestedGbp) * 100 : 0
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
            const rows = enrichedBullionRows.filter((row) => row.metal === config.metal && row.type === config.type)
            const marketTotalGbp = rows.reduce((sum, row) => sum + row.marketTotalGbp, 0)
            const intrinsicTotalGbp = rows.reduce((sum, row) => sum + row.intrinsicTotalGbp, 0)
            const investedTotalGbp = rows.reduce((sum, row) => sum + row.investedTotalGbp, 0)
            const totalUnits = rows.reduce((sum, row) => sum + row.amount, 0)
            const pnlGbp = marketTotalGbp - investedTotalGbp
            const pnlPct = investedTotalGbp > 0 ? (pnlGbp / investedTotalGbp) * 100 : 0
            const allocationPct = totalMarketGbp > 0 ? (marketTotalGbp / totalMarketGbp) * 100 : 0

            return {
                ...config,
                rows,
                holdingCount: rows.length,
                totalUnits,
                marketTotalGbp,
                intrinsicTotalGbp,
                investedTotalGbp,
                pnlGbp,
                pnlPct,
                allocationPct,
            }
        }).filter((group) => group.holdingCount > 0)
    }, [enrichedBullionRows, totalMarketGbp])
    const selectedGroup = useMemo(
        () => groupedBullion.find((group) => group.key === selectedGroupKey) ?? null,
        [groupedBullion, selectedGroupKey]
    )

    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const hasBullionHoldings = enrichedBullionRows.length > 0

    return (
        <div className="w-full">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Bullion Portfolio</h1>
                    <div className="mt-1 flex items-center gap-3">
                        <p className="text-sm text-white/65">
                            Gold and silver holdings with live spot prices.
                        </p>
                        <div className="flex items-center gap-1.5">
                            {spotPrices.isConnected ? (
                                <>
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                    </span>
                                    <span className="text-xs text-emerald-400/80">Live</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff className="h-3.5 w-3.5 text-rose-400" />
                                    <span className="text-xs font-medium text-rose-400">Connection Failed</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <AddBullionButton
                    onCreated={(row) => {
                        setBullionRows((previous) => [row, ...previous])
                    }}
                />
            </div>

            {/* Spot price ticker */}
            {spotPrices.isConnected && spotPrices.goldPricePerOz !== null && spotPrices.silverPricePerOz !== null ? (
                <div className="mb-6 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/70">Gold</span>
                        <span className="text-sm font-bold text-amber-300">
                            {formatCurrency(spotPrices.goldPricePerOz ?? 0, preferredCurrency)}/oz
                        </span>
                        <span className="text-xs font-medium text-amber-500/70">
                            ({formatCurrency(spotPrices.goldPricePerGram ?? 0, preferredCurrency)}/g)
                        </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-sky-400/70">Silver</span>
                        <span className="text-sm font-bold text-sky-300">
                            {formatCurrency(spotPrices.silverPricePerOz ?? 0, preferredCurrency)}/oz
                        </span>
                        <span className="text-xs font-medium text-sky-500/70">
                            ({formatCurrency(spotPrices.silverPricePerGram ?? 0, preferredCurrency)}/g)
                        </span>
                    </div>
                    {spotPrices.lastUpdated ? (
                        <span className="text-xs text-white/35">
                            Updated {spotPrices.lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    ) : null}
                </div>
            ) : null}

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
                <div className="space-y-6">
                    <EmptyStateAlert 
                        description="No bullion holdings yet. Add gold or silver bars/coins to get started."
                    />

                    <AssetOnboardingHero
                        title="Track Your Bullion Portfolio"
                        description="Monitor your physical gold and silver assets. FinFit automatically calculates the intrinsic and market values based on live spot prices."
                        items={[
                            {
                                icon: Coins,
                                title: "Gold & Silver",
                                description: "Track coins, bars, and Sovereigns. Supports various weights and manufacturers for accurate portfolio management.",
                                colorClass: "bg-amber-500/10 border-amber-500/20 text-amber-300"
                            },
                            {
                                icon: TrendingUp,
                                title: "Live Market Sync",
                                description: "Values are automatically updated based on current gold and silver spot prices, keeping your net worth data accurate.",
                                colorClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            }
                        ]}
                        actionText="Add Bullion Holding"
                        onAction={() => setIsAddModalOpen(true)}
                    />
                </div>
            ) : (
                <>
                    <div className="mb-8 grid gap-4 md:grid-cols-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-sm">
                            <p className="text-sm font-medium text-white/60">Market Value</p>
                            <p className="mt-2 text-3xl font-bold text-white">
                                {hideValues ? '****' : formatCurrency(totalMarketGbp * usdToPreferredCurrencyRate, preferredCurrency)}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-sm">
                            <p className="text-sm font-medium text-white/60">Total Invested</p>
                            <p className="mt-2 text-3xl font-bold text-white">
                                {hideValues ? '****' : formatCurrency(totalInvestedGbp * usdToPreferredCurrencyRate, preferredCurrency)}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-sm">
                            <p className="text-sm font-medium text-white/60">Intrinsic Value</p>
                            <p className="mt-2 text-3xl font-bold text-white">
                                {hideValues ? '****' : formatCurrency(totalIntrinsicGbp * usdToPreferredCurrencyRate, preferredCurrency)}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-sm">
                            <p className="text-sm font-medium text-white/60">PNL</p>
                            <div className="mt-2 flex items-center gap-2">
                                <p className={`text-3xl font-bold ${totalPnlClassName}`}>
                                    {hideValues ? '****' : formatSignedCurrency(totalPnlGbp * usdToPreferredCurrencyRate, preferredCurrency)}
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
                                                {hideValues ? '****' : formatCurrency(group.marketTotalGbp, preferredCurrency)}
                                            </p>
                                        </div>
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border transition-transform group-hover/card:scale-110 ${group.iconToneClassName}`}>
                                            <BullionGroupIcon type={group.type} className="h-5 w-5" />
                                        </div>
                                    </div>

                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${pnlPillTone}`}>
                                            <PnlIcon className="mr-1 h-3.5 w-3.5" />
                                            PNL {hideValues ? '****' : formatSignedCurrency(group.pnlGbp, preferredCurrency)}
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

                                    <div className="flex-1">
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

            <BullionHoldingsListModal
                group={selectedGroup}
                isOpen={selectedGroup !== null}
                onClose={() => setSelectedGroupKey(null)}
                preferredCurrency={preferredCurrency}
                hideValues={hideValues}
            />

            {isAddModalOpen ? (
                <AddBullionModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onCreated={(newRow) => {
                        setBullionRows((prev) => [newRow, ...prev])
                    }}
                />
            ) : null}
        </div>
    )
}
