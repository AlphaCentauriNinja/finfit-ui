'use client'

import { useEffect, useMemo, useState } from 'react'
import { Edit3, History, Coins } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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
    const [preferredCurrency, setPreferredCurrency] = useState<CurrencyCode>('GBP')

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
                        {formatCurrency(convertFromGbp(totalMarketGbp, preferredCurrency), preferredCurrency)}
                    </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-sm">
                    <p className="text-sm font-medium text-white/60">Intrinsic Value</p>
                    <p className="mt-2 text-3xl font-bold text-white">
                        {formatCurrency(convertFromGbp(totalIntrinsicGbp, preferredCurrency), preferredCurrency)}
                    </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-sm">
                    <p className="text-sm font-medium text-white/60">PNL</p>
                    <div className="mt-2 flex items-center gap-2">
                        <p className={`text-3xl font-bold ${totalPnlClassName}`}>
                            {formatSignedCurrency(convertFromGbp(totalPnlGbp, preferredCurrency), preferredCurrency)}
                        </p>
                        <span className={`rounded-md px-2 py-1 text-xs ${totalPnlPillClassName}`}>
                            {totalPnlPct >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}%
                        </span>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-none overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-sm backdrop-blur-sm">
                <div className="border-b border-white/10 px-6 py-4">
                    <h3 className="text-sm font-semibold text-white">Bullion Holdings</h3>
                </div>
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[1950px] table-fixed text-sm">
                        <thead className="bg-white/[0.03]">
                            <tr className="text-white/60">
                                <th className="px-4 py-3 text-center font-medium">Metal</th>
                                <th className="px-4 py-3 text-center font-medium">Type</th>
                                <th className="px-4 py-3 text-center font-medium">Description</th>
                                <th className="px-4 py-3 text-center font-medium">Amount</th>
                                <th className="px-4 py-3 text-center font-medium">Weight (g)</th>
                                <th className="px-4 py-3 text-center font-medium">Intrinsic Price ({preferredCurrency})</th>
                                <th className="px-4 py-3 text-center font-medium">Market Price ({preferredCurrency})</th>
                                <th className="px-4 py-3 text-center font-medium">Delta Intrinsic ({preferredCurrency})</th>
                                <th className="px-4 py-3 text-center font-medium">Market Total ({preferredCurrency})</th>
                                <th className="px-4 py-3 text-center font-medium">Intrinsic Total ({preferredCurrency})</th>
                                <th className="px-4 py-3 text-center font-medium">Edit</th>
                                <th className="px-4 py-3 text-center font-medium">History</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bullionRows.map((row) => {
                                const deltaIntrinsicGbp = row.marketPriceGbp - row.intrinsicPriceGbp
                                const typeIconToneClassName = row.metal === 'GOLD'
                                    ? 'bg-amber-500/15 text-amber-300'
                                    : 'bg-white/10 text-white'

                                return (
                                    <tr key={row.id} className="border-t border-white/10">
                                        <td className="px-4 py-4 text-center">
                                            <span className={`rounded-md px-2 py-1 text-xs font-semibold ${row.metal === 'GOLD' ? 'bg-amber-500/15 text-amber-300' : 'bg-slate-400/15 text-slate-200'}`}>
                                                {row.metal}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span
                                                className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${typeIconToneClassName}`}
                                                title={row.type}
                                                aria-label={row.type}
                                            >
                                                {row.type === 'COIN' ? (
                                                    <Coins className="h-4 w-4" />
                                                ) : (
                                                    <BarIcon className="h-4 w-4" />
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center text-white/85">{row.description}</td>
                                        <td className="px-4 py-4 text-center text-white/80">{row.amount}</td>
                                        <td className="px-4 py-4 text-center text-white/80">{formatWeight(row.totalWeightGrams)}</td>
                                        <td className="px-4 py-4 text-center text-white/80">
                                            {formatCurrency(convertFromGbp(row.intrinsicPriceGbp, preferredCurrency), preferredCurrency)}
                                        </td>
                                        <td className="px-4 py-4 text-center text-white/90">
                                            {formatCurrency(convertFromGbp(row.marketPriceGbp, preferredCurrency), preferredCurrency)}
                                        </td>
                                        <td className={`px-4 py-4 text-center font-semibold ${deltaIntrinsicGbp > 0 ? 'text-emerald-400' : deltaIntrinsicGbp < 0 ? 'text-rose-400' : 'text-amber-400'}`}>
                                            {formatSignedCurrency(convertFromGbp(deltaIntrinsicGbp, preferredCurrency), preferredCurrency)}
                                        </td>
                                        <td className="px-4 py-4 text-center text-white/90">
                                            {formatCurrency(convertFromGbp(row.marketTotalGbp, preferredCurrency), preferredCurrency)}
                                        </td>
                                        <td className="px-4 py-4 text-center text-white/80">
                                            {formatCurrency(convertFromGbp(row.intrinsicTotalGbp, preferredCurrency), preferredCurrency)}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <button
                                                type="button"
                                                className="inline-flex h-9 items-center justify-center rounded-lg bg-white/10 px-3 text-white/80 transition-colors hover:bg-white/15"
                                                aria-label={`Edit ${row.id}`}
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <button
                                                type="button"
                                                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-indigo-500/15 px-3 text-indigo-200 transition-colors hover:bg-indigo-500/25"
                                                aria-label={`History for ${row.id}`}
                                            >
                                                <History className="h-4 w-4" />
                                                History
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
