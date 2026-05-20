'use client'

import { useMemo, useState } from 'react'
import { ArrowDownRight, ArrowRightLeft, ArrowUpRight, Coins, History, Minus, Pencil } from 'lucide-react'
import { tokenIcons } from '@web3icons/react'
import {
    CURRENCY_LOCALE,
    GBP_TO_CURRENCY_RATE,
    type CurrencyCode,
} from '@/lib/crypto-data'
import CryptoEditModal from './CryptoEditModal'
import CryptoHistoryModal from './CryptoHistoryModal'
import CryptoTransactionModal from './CryptoTransactionModal'

type CryptoCardAsset = {
    id: string
    ticker: string
    name: string
    amount: number
    usd: number
    investedGbp: number
    marketValueGbp: number
}

type Props = {
    asset: CryptoCardAsset
    totalCurrentValue: number
    preferredCurrency: CurrencyCode
    hideValues: boolean
}

type PnlState = 'positive' | 'negative' | 'neutral'

const getPnlState = (value: number): PnlState => {
    const epsilon = 0.000001
    if (value > epsilon) return 'positive'
    if (value < -epsilon) return 'negative'
    return 'neutral'
}

const convertFromGbp = (valueGbp: number, currency: CurrencyCode): number =>
    valueGbp * GBP_TO_CURRENCY_RATE[currency]

const formatCurrency = (value: number, currency: CurrencyCode): string =>
    new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)

export default function CryptoAssetCard({ asset, totalCurrentValue, preferredCurrency, hideValues }: Props) {
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isTransactionOpen, setIsTransactionOpen] = useState(false)
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)

    const rowPnl = asset.marketValueGbp - asset.investedGbp
    const rowPnlPct = asset.investedGbp > 0 ? (rowPnl / asset.investedGbp) * 100 : 0
    const allocation = totalCurrentValue > 0 ? (asset.marketValueGbp / totalCurrentValue) * 100 : 0

    const pnlState = hideValues ? 'neutral' : getPnlState(rowPnl)
    const PnlIcon = pnlState === 'positive' ? ArrowUpRight : pnlState === 'negative' ? ArrowDownRight : Minus
    const pnlPillTone = pnlState === 'positive'
        ? 'border-green-500 bg-green-500/20 text-green-200'
        : pnlState === 'negative'
            ? 'border-red-500 bg-red-500/20 text-red-200'
            : 'border-amber-500 bg-amber-500/20 text-amber-200'

    const amountLabel = useMemo(
        () => asset.amount.toLocaleString('en-GB', { maximumFractionDigits: 8 }),
        [asset.amount]
    )
    const priceUsdLabel = useMemo(
        () => asset.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        [asset.usd]
    )

    const IconComponent = (tokenIcons as Record<string, React.FC<React.SVGProps<SVGSVGElement>>>)[`Token${asset.ticker.toUpperCase()}`] || null

    return (
        <>
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 hover:bg-white/10 transition-colors flex flex-col h-full group/card">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">{asset.ticker}</p>
                        <h3 className="text-sm font-medium text-white/80 mt-0.5">{asset.name}</h3>
                        <p className="text-2xl font-bold text-white mt-1">
                            {hideValues ? '****' : formatCurrency(convertFromGbp(asset.marketValueGbp, preferredCurrency), preferredCurrency)}
                        </p>
                    </div>
                    {IconComponent ? (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/5 shadow-sm border border-white/10 group-hover/card:scale-110 transition-transform overflow-hidden">
                            <IconComponent variant="branded" className="h-[28px] w-[28px]" />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover/card:scale-110 transition-transform">
                            <Coins className="w-5 h-5" />
                        </div>
                    )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${pnlPillTone}`}>
                        <PnlIcon className="mr-1 h-3.5 w-3.5" />
                        PNL {hideValues
                            ? '****'
                            : `${rowPnl >= 0 ? '+' : '-'}${formatCurrency(convertFromGbp(Math.abs(rowPnl), preferredCurrency), preferredCurrency)}`}
                    </span>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${pnlPillTone}`}>
                        {hideValues ? '****' : `${rowPnl >= 0 ? '+' : ''}${rowPnlPct.toFixed(2)}%`}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                        <p className="text-white/45 text-xs uppercase tracking-wider">Amount</p>
                        <p className="text-white/85 font-medium mt-1">{hideValues ? '****' : amountLabel}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                        <p className="text-white/45 text-xs uppercase tracking-wider">Live Price</p>
                        <p className="text-white/85 font-medium mt-1">{hideValues ? '****' : `$${priceUsdLabel}`}</p>
                    </div>
                </div>

                <div className="w-full bg-white/5 rounded-full h-1.5 mt-4">
                    <div
                        className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: hideValues ? '0%' : `${allocation}%` }}
                    />
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setIsEditOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                    </button>
                    <button
                        onClick={() => setIsTransactionOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/20 hover:text-indigo-100 transition-colors"
                    >
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                        Transaction
                    </button>
                    <button
                        onClick={() => setIsHistoryOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-400/35 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/20 transition-colors"
                    >
                        <History className="h-3.5 w-3.5" />
                        History
                    </button>
                </div>
            </div>

            {isEditOpen ? (
                <CryptoEditModal
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    asset={asset}
                />
            ) : null}

            {isTransactionOpen ? (
                <CryptoTransactionModal
                    isOpen={isTransactionOpen}
                    onClose={() => setIsTransactionOpen(false)}
                    asset={asset}
                />
            ) : null}

            {isHistoryOpen ? (
                <CryptoHistoryModal
                    isOpen={isHistoryOpen}
                    onClose={() => setIsHistoryOpen(false)}
                    asset={asset}
                    preferredCurrency={preferredCurrency}
                    hideValues={hideValues}
                />
            ) : null}
        </>
    )
}
