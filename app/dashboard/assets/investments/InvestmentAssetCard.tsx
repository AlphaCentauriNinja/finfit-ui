'use client'

import { useMemo, useState } from 'react'
import { ArrowDownRight, ArrowRightLeft, ArrowUpRight, History, Minus, Pencil, TrendingUp } from 'lucide-react'
import type { InvestmentHoldingRow } from './types'

type PnlState = 'positive' | 'negative' | 'neutral'

const getPnlState = (value: number): PnlState => {
    const epsilon = 0.01 // Use 1p as threshold for investments
    if (value > epsilon) return 'positive'
    if (value < -epsilon) return 'negative'
    return 'neutral'
}

type Props = {
    holding: InvestmentHoldingRow
    accountName: string
    totalPortfolioValue: number
    preferredCurrency: string
    hideValues: boolean
    formatCurrency: (val: number, curr: any) => string
    formatSignedCurrency: (val: number, curr: any) => string
    onEdit: (holding: InvestmentHoldingRow) => void
    onTransaction: (holding: InvestmentHoldingRow) => void
    onHistory: (holding: InvestmentHoldingRow) => void
}

export default function InvestmentAssetCard({ 
    holding, 
    accountName, 
    totalPortfolioValue, 
    preferredCurrency, 
    hideValues, 
    formatCurrency, 
    formatSignedCurrency,
    onEdit,
    onTransaction,
    onHistory
}: Props) {
    const rowPnl = holding.currentValue - holding.investedAmount
    const rowPnlPct = holding.investedAmount > 0 ? (rowPnl / holding.investedAmount) * 100 : 0
    const allocation = totalPortfolioValue > 0 ? (holding.currentValue / totalPortfolioValue) * 100 : 0

    const pnlState = hideValues ? 'neutral' : getPnlState(rowPnl)
    const PnlIcon = pnlState === 'positive' ? ArrowUpRight : pnlState === 'negative' ? ArrowDownRight : Minus
    const pnlPillTone = pnlState === 'positive'
        ? 'border-green-500 bg-green-500/20 text-green-200'
        : pnlState === 'negative'
            ? 'border-red-500 bg-red-500/20 text-red-200'
            : 'border-amber-500 bg-amber-500/20 text-amber-200'

    return (
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 hover:bg-white/10 transition-colors flex flex-col h-full group/card">
            <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider truncate">{holding.ticker}</p>
                        <span className="text-[10px] bg-white/10 text-white/70 px-1.5 py-0.5 rounded truncate max-w-[100px]">{accountName}</span>
                    </div>
                    <h3 className="text-sm font-medium text-white/80 mt-1 truncate">{holding.name}</h3>
                    <p className="text-2xl font-bold text-white mt-1">
                        {hideValues ? '****' : formatCurrency(holding.currentValue, preferredCurrency)}
                    </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover/card:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5" />
                </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${pnlPillTone}`}>
                    <PnlIcon className="mr-1 h-3.5 w-3.5" />
                    PNL {hideValues
                        ? '****'
                        : formatSignedCurrency(rowPnl, preferredCurrency)}
                </span>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${pnlPillTone}`}>
                    {hideValues ? '****' : `${rowPnl >= 0 ? '+' : ''}${rowPnlPct.toFixed(2)}%`}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 text-sm font-medium">
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <p className="text-white/45 text-[10px] uppercase tracking-wider">Invested</p>
                    <p className="text-white/85 mt-1">{hideValues ? '****' : formatCurrency(holding.investedAmount, preferredCurrency)}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <p className="text-white/45 text-[10px] uppercase tracking-wider">Allocation</p>
                    <p className="text-white/85 mt-1">{hideValues ? '****' : `${allocation.toFixed(1)}%`}</p>
                </div>
            </div>

            <div className="w-full bg-white/5 rounded-full h-1.5 mt-4 overflow-hidden">
                <div
                    className="bg-indigo-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: hideValues ? '0%' : `${Math.min(allocation, 100)}%` }}
                />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
                <button
                    onClick={() => onEdit(holding)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10 hover:text-white transition-colors"
                >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                </button>
                <button
                    onClick={() => onTransaction(holding)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/20 hover:text-indigo-100 transition-colors"
                >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    Transaction
                </button>
                <button
                    onClick={() => onHistory(holding)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-400/35 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/20 transition-colors"
                >
                    <History className="h-3.5 w-3.5" />
                    History
                </button>
            </div>
        </div>
    )
}
