'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Coins, Pencil, Calendar, MapPin, Scale, TrendingUp, Banknote, Receipt, StickyNote, Layers, WifiOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useSpotPrices } from '@/app/dashboard/assets/bullion/useSpotPrices'
import { usePrivacy } from '@/app/dashboard/components/providers/PrivacyProvider'
import AddBullionModal from '@/app/dashboard/assets/bullion/AddBullionModal'
import type { BullionCurrencyCode, BullionHoldingDbRow, BullionRow } from '@/app/dashboard/assets/bullion/types'

type CurrencyCode = 'GBP' | 'EUR' | 'USD' | 'CHF' | 'CAD'

const BULLION_IMAGES_BUCKET = 'bullion_images'
const BULLION_LIST_ROUTE = '/dashboard/assets/bullion'

const GBP_TO_CURRENCY_RATE: Record<CurrencyCode, number> = {
    GBP: 1, EUR: 1.17, USD: 1.28, CHF: 1.13, CAD: 1.74,
}

const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
    GBP: 'en-GB', EUR: 'de-DE', USD: 'en-US', CHF: 'de-CH', CAD: 'en-CA',
}

function toNumber(value: number | string | null | undefined): number {
    if (typeof value === 'number') return value
    if (typeof value === 'string') { const p = Number(value); if (Number.isFinite(p)) return p }
    return 0
}

function normalizeStoredCurrency(value: string | null | undefined): BullionCurrencyCode | null {
    if (value === 'GBP' || value === 'EUR' || value === 'USD' || value === 'CHF' || value === 'CAD') return value
    return null
}

function normalizeCurrency(value: string | null | undefined): CurrencyCode {
    if (value === 'GBP' || value === 'EUR' || value === 'USD' || value === 'CHF' || value === 'CAD') return value
    return 'GBP'
}

function convertFromGbp(valueGbp: number, currency: CurrencyCode): number {
    return valueGbp * GBP_TO_CURRENCY_RATE[currency]
}

function formatCurrency(value: number, currency: CurrencyCode): string {
    return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
        style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(value)
}

function formatSignedCurrency(value: number, currency: CurrencyCode): string {
    return `${value >= 0 ? '+' : '-'}${formatCurrency(Math.abs(value), currency)}`
}

function formatWeight(value: number): string {
    return value.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 3 })
}

function buildBullionImagePublicUrl(imagePath: string | null | undefined): string | null {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const normalizedPath = imagePath?.trim() ?? ''
    if (!supabaseUrl || !normalizedPath) return null
    const encodedPath = normalizedPath.split('/').map((s) => encodeURIComponent(s)).join('/')
    return `${supabaseUrl}/storage/v1/object/public/${BULLION_IMAGES_BUCKET}/${encodedPath}`
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
        id: row.id, metal, title, description, amount, weightPerItemGrams,
        totalWeightGrams: amount * weightPerItemGrams,
        intrinsicPriceGbp: 0, marketPriceGbp: 0, marketTotalGbp: 0, intrinsicTotalGbp: 0, investedTotalGbp: 0,
        type, manufacturer: row.manufacturer?.trim() ?? '', country: row.country?.trim() ?? '',
        year: row.mint_year?.trim() ?? '', linkLabel: row.link_label ?? null,
        catalogProductId: row.catalog_product_id, catalogVariantId: row.catalog_variant_id,
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

function BarIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 14.5L9 9.5H17L12 14.5H4Z" />
            <path d="M12 14.5L17 9.5H20L15 14.5H12Z" />
            <path d="M5 17.5L10 12.5H13L8 17.5H5Z" />
        </svg>
    )
}

function HoldingImage({ imagePath, label }: { imagePath: string | null; label: string }) {
    const [hasLoadError, setHasLoadError] = useState(false)
    const imageUrl = useMemo(() => buildBullionImagePublicUrl(imagePath), [imagePath])

    if (!imageUrl || hasLoadError) {
        return (
            <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-dashed border-white/15 bg-slate-900/40 text-sm text-white/40">
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
            className="aspect-square w-full rounded-2xl border border-white/10 object-cover"
        />
    )
}

function DetailItem({ icon: Icon, label, value, className }: { icon: React.ElementType; label: string; value: React.ReactNode; className?: string }) {
    return (
        <div className={`flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 ${className ?? ''}`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                <Icon className="h-4 w-4 text-white/50" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-white/40">{label}</p>
                <div className="mt-1 text-sm font-medium text-white">{value}</div>
            </div>
        </div>
    )
}

export default function BullionHoldingDetailPage() {
    const router = useRouter()
    const params = useParams<{ metal?: string; type?: string; id?: string }>()
    const { hideValues } = usePrivacy()

    const routeMetal = typeof params?.metal === 'string' ? params.metal.toLowerCase() : ''
    const routeType = typeof params?.type === 'string' ? params.type.toLowerCase() : ''
    const holdingId = typeof params?.id === 'string' ? params.id : ''
    const isRouteValid = Boolean(holdingId) && (routeMetal === 'gold' || routeMetal === 'silver') && (routeType === 'coin' || routeType === 'bar')

    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [holding, setHolding] = useState<BullionRow | null>(null)
    const [preferredCurrency, setPreferredCurrency] = useState<CurrencyCode>('GBP')
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const spotPrices = useSpotPrices(preferredCurrency)

    const enrichedHolding = useMemo<BullionRow | null>(() => {
        if (!holding) return null
        if (spotPrices.goldPricePerGram === null || spotPrices.silverPricePerGram === null) return holding

        const spotPricePerGram = holding.metal === 'GOLD' ? spotPrices.goldPricePerGram! : spotPrices.silverPricePerGram!
        const intrinsicPriceGbp = spotPricePerGram * holding.weightPerItemGrams
        const intrinsicTotalGbp = intrinsicPriceGbp * holding.amount
        const marketPremiumPct = Number.isFinite(holding.marketPremiumPct) ? holding.marketPremiumPct : 0
        const marketMultiplier = 1 + marketPremiumPct / 100
        const marketPriceGbp = intrinsicPriceGbp * marketMultiplier
        const marketTotalGbp = intrinsicTotalGbp * marketMultiplier
        const rawInvestedPerUnit = holding.totalPriceInclTax ?? holding.purchaseValue ?? 0
        const rawInvestedTotal = rawInvestedPerUnit * holding.amount
        const investedCurrency = holding.purchaseCurrency ?? 'GBP'
        const investedGbp = rawInvestedTotal / (GBP_TO_CURRENCY_RATE[investedCurrency] || 1)

        return { ...holding, marketPriceGbp, marketTotalGbp, intrinsicPriceGbp, intrinsicTotalGbp, investedTotalGbp: investedGbp }
    }, [holding, spotPrices.goldPricePerGram, spotPrices.silverPricePerGram])

    useEffect(() => {
        let active = true
        if (!isRouteValid) return

        const load = async () => {
            setIsLoading(true)
            setLoadError(null)
            const supabase = createClient()

            const [userResult, settingsResult] = await Promise.all([
                supabase.auth.getUser(),
                supabase.from('user_settings').select('preferred_currency').maybeSingle(),
            ])

            if (!active) return
            if (userResult.error || !userResult.data.user) {
                setLoadError(userResult.error?.message || 'Session not found.')
                setIsLoading(false)
                return
            }

            setPreferredCurrency(normalizeCurrency(settingsResult.data?.preferred_currency))

            const { data, error } = await supabase
                .from('bullion_holdings')
                .select('id, metal, title, description, amount, weight_per_item_grams, type, manufacturer, country, mint_year, link_label, catalog_product_id, catalog_variant_id, purchase_date, purchase_value, purchase_currency, tax_rate_pct, tax_amount, total_price_incl_tax, market_premium_pct, notes, image_path')
                .eq('id', holdingId)
                .eq('user_id', userResult.data.user.id)
                .maybeSingle()

            if (!active) return
            if (error || !data) { setLoadError(error?.message || 'Bullion holding not found.'); setIsLoading(false); return }

            const mapped = mapBullionHoldingRow(data as BullionHoldingDbRow)
            if (!mapped) { setLoadError('Unable to load this bullion holding.'); setIsLoading(false); return }

            const canonicalMetal = mapped.metal.toLowerCase()
            const canonicalType = mapped.type.toLowerCase()
            if (canonicalMetal !== routeMetal || canonicalType !== routeType) {
                router.replace(`/dashboard/assets/bullion/${canonicalMetal}/${canonicalType}/${mapped.id}`)
            }

            setHolding(mapped)
            setIsLoading(false)
        }

        void load()
        return () => { active = false }
    }, [holdingId, isRouteValid, routeMetal, routeType, router])

    if (!isRouteValid) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center p-4">
                <div className="w-full max-w-lg rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-center">
                    <p className="text-sm text-rose-200">Invalid bullion holding route.</p>
                    <button type="button" onClick={() => router.push(BULLION_LIST_ROUTE)} className="mt-4 rounded-xl border border-rose-500/35 px-4 py-2 text-sm font-semibold text-rose-200 transition-colors hover:bg-rose-500/10">
                        Back to Bullion
                    </button>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">Loading bullion holding…</div>
            </div>
        )
    }

    if (loadError || !enrichedHolding) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center p-4">
                <div className="w-full max-w-lg rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-center">
                    <p className="text-sm text-rose-200">{loadError || 'Bullion holding not found.'}</p>
                    <button type="button" onClick={() => router.push(BULLION_LIST_ROUTE)} className="mt-4 rounded-xl border border-rose-500/35 px-4 py-2 text-sm font-semibold text-rose-200 transition-colors hover:bg-rose-500/10">
                        Back to Bullion
                    </button>
                </div>
            </div>
        )
    }

    const h = enrichedHolding
    const displayTitle = h.title?.trim() || h.description
    const isGold = h.metal === 'GOLD'
    const accentColor = isGold ? 'amber' : 'sky'
    const pnlGbp = h.marketTotalGbp - h.investedTotalGbp
    const pnlPct = h.investedTotalGbp > 0 ? (pnlGbp / h.investedTotalGbp) * 100 : 0
    const pnlIsPositive = pnlGbp > 0
    const pnlIsNegative = pnlGbp < 0
    const pnlClassName = pnlIsPositive ? 'text-emerald-400' : pnlIsNegative ? 'text-rose-400' : 'text-white'
    const pnlBadgeClassName = pnlIsPositive ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : pnlIsNegative ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' : 'border-white/10 bg-white/5 text-white/60'
    const premiumClassName = h.marketPremiumPct >= 0 ? `border-${accentColor}-500/40 bg-${accentColor}-500/10 text-${accentColor}-300` : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
    const purchaseCurr = h.purchaseCurrency ?? 'GBP'

    return (
        <div className="w-full">
            {/* Header */}
            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.push(BULLION_LIST_ROUTE)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition-all hover:bg-white/10 hover:text-white"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{displayTitle}</h1>
                        <div className="mt-1 flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border border-${accentColor}-500/20 bg-${accentColor}-500/10 px-2.5 py-0.5 text-xs font-semibold text-${accentColor}-300`}>
                                {isGold ? <Coins className="h-3 w-3" /> : <BarIcon className="h-3 w-3" />}
                                {h.metal} {h.type}
                            </span>
                            {spotPrices.isConnected ? (
                                <span className="flex items-center gap-1.5">
                                    <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
                                    <span className="text-xs text-emerald-400/80">Live</span>
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5">
                                    <WifiOff className="h-3 w-3 text-rose-400" />
                                    <span className="text-xs text-rose-400">Offline</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-5 py-2.5 text-sm font-semibold text-indigo-300 transition-all hover:bg-indigo-500/20"
                >
                    <Pencil className="h-4 w-4" />
                    Edit Holding
                </button>
            </div>

            {/* Value cards */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Market Value</p>
                    <p className="mt-2 text-2xl font-bold text-white">{hideValues ? '••••' : formatCurrency(convertFromGbp(h.marketTotalGbp, preferredCurrency), preferredCurrency)}</p>
                    <p className="mt-1 text-xs text-white/40">{hideValues ? '••••' : `${formatCurrency(convertFromGbp(h.marketPriceGbp, preferredCurrency), preferredCurrency)} per unit`}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Intrinsic Value</p>
                    <p className="mt-2 text-2xl font-bold text-white">{hideValues ? '••••' : formatCurrency(convertFromGbp(h.intrinsicTotalGbp, preferredCurrency), preferredCurrency)}</p>
                    <p className="mt-1 text-xs text-white/40">{hideValues ? '••••' : `${formatCurrency(convertFromGbp(h.intrinsicPriceGbp, preferredCurrency), preferredCurrency)} per unit`}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Total Invested</p>
                    <p className="mt-2 text-2xl font-bold text-white">{hideValues ? '••••' : formatCurrency(convertFromGbp(h.investedTotalGbp, preferredCurrency), preferredCurrency)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/40">PNL</p>
                    <p className={`mt-2 text-2xl font-bold ${pnlClassName}`}>{hideValues ? '••••' : formatSignedCurrency(convertFromGbp(pnlGbp, preferredCurrency), preferredCurrency)}</p>
                    <span className={`mt-1 inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${pnlBadgeClassName}`}>
                        {hideValues ? '••••' : `${pnlGbp >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%`}
                    </span>
                </div>
            </div>

            {/* Main content: two-column layout */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left column — Image + quick info */}
                <div className="space-y-6 lg:col-span-1">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Holding Image</p>
                        <HoldingImage imagePath={h.imagePath} label={displayTitle} />
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Market Premium</p>
                        <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-bold ${h.marketPremiumPct >= 0 ? `border-${accentColor}-500/40 bg-${accentColor}-500/10 text-${accentColor}-300` : 'border-rose-500/40 bg-rose-500/10 text-rose-300'}`}>
                                {hideValues ? '••••' : `${h.marketPremiumPct >= 0 ? '+' : ''}${h.marketPremiumPct.toLocaleString('en-GB', { maximumFractionDigits: 2 })}%`}
                            </span>
                            <span className="text-xs text-white/40">above intrinsic</span>
                        </div>
                    </div>
                </div>

                {/* Right column — Details grid */}
                <div className="space-y-6 lg:col-span-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Holding Details</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <DetailItem icon={Layers} label="Description" value={h.description} />
                            <DetailItem icon={Scale} label="Quantity" value={hideValues ? '••••' : `${h.amount.toLocaleString('en-GB')} units`} />
                            <DetailItem icon={Scale} label="Weight per Unit" value={`${formatWeight(h.weightPerItemGrams)} g`} />
                            <DetailItem icon={Scale} label="Total Weight" value={hideValues ? '••••' : `${formatWeight(h.amount * h.weightPerItemGrams)} g`} />
                            <DetailItem icon={MapPin} label="Origin" value={h.country || 'Unknown'} />
                            <DetailItem icon={Calendar} label="Mint Year" value={h.year || 'Not specified'} />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Purchase Information</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <DetailItem icon={Calendar} label="Purchase Date" value={h.purchaseDate ? new Date(h.purchaseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not set'} />
                            <DetailItem icon={Banknote} label="Purchase Price" value={hideValues ? '••••' : h.purchaseValue !== null && h.purchaseValue !== undefined ? formatCurrency(h.purchaseValue, purchaseCurr) : 'Not set'} />
                            {h.taxRatePct !== null && h.taxRatePct !== undefined ? (
                                <DetailItem icon={Receipt} label="Tax Rate" value={hideValues ? '••••' : `${h.taxRatePct}%`} />
                            ) : null}
                            {h.taxAmount !== null && h.taxAmount !== undefined ? (
                                <DetailItem icon={Receipt} label="Tax Amount" value={hideValues ? '••••' : formatCurrency(h.taxAmount, purchaseCurr)} />
                            ) : null}
                            {h.totalPriceInclTax !== null && h.totalPriceInclTax !== undefined ? (
                                <DetailItem icon={Banknote} label="Total incl. Tax" value={hideValues ? '••••' : formatCurrency(h.totalPriceInclTax, purchaseCurr)} />
                            ) : null}
                        </div>
                    </div>

                    {h.notes ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">Notes</p>
                            <div className="flex items-start gap-3">
                                <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-white/30" />
                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/70">{h.notes}</p>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Edit modal */}
            {isEditModalOpen ? (
                <AddBullionModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    editHolding={holding}
                    onUpdated={(updatedRow) => {
                        setHolding(updatedRow)
                        setIsEditModalOpen(false)
                    }}
                    onDeleted={() => {
                        router.push(BULLION_LIST_ROUTE)
                    }}
                />
            ) : null}
        </div>
    )
}
