'use client'

import { useState } from 'react'
import { ArrowRightLeft, ChevronRight, History, Landmark, Pencil, Plus } from 'lucide-react'
import type { InvestmentAccountCardData, InvestmentHoldingRow } from './types'
import { usePrivacy } from '@/app/dashboard/components/providers/PrivacyProvider'

type Props = {
    account: InvestmentAccountCardData
    totalPortfolioValue: number
    preferredCurrency: string
    formatCurrency: (val: number, curr: any) => string
    onEdit: (account: InvestmentAccountCardData) => void
    onTransaction: (account: InvestmentAccountCardData) => void
    onHistory: (account: InvestmentAccountCardData) => void
    onAddHolding: (accountId: string) => void
    onEditHolding: (holding: InvestmentHoldingRow) => void
}

export default function InvestmentAccountCard({ 
    account, 
    totalPortfolioValue, 
    preferredCurrency, 
    formatCurrency,
    onEdit,
    onTransaction,
    onHistory,
    onAddHolding,
    onEditHolding,
}: Props) {
    const { hideValues } = usePrivacy()
    const [isHoldingsExpanded, setIsHoldingsExpanded] = useState(false)

    const allocation = totalPortfolioValue > 0 ? (account.totalCurrentValue / totalPortfolioValue) * 100 : 0

    return (
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 hover:bg-white/10 transition-colors flex flex-col h-full group/card">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-white/60">{account.name}</h3>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            account.type === 'ISA' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}>
                            {account.type}
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-white mt-1">
                        {hideValues ? '****' : formatCurrency(account.totalCurrentValue, preferredCurrency)}
                    </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover/card:scale-110 transition-transform">
                    <Landmark className="w-5 h-5" />
                </div>
            </div>

            <div className="w-full bg-white/5 rounded-full h-1.5 mt-4 mb-6">
                <div
                    className="bg-indigo-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(allocation, 100)}%` }}
                />
            </div>

            <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Top Holdings</p>
                    <button 
                        onClick={() => onAddHolding(account.id)}
                        className="p-1 hover:bg-white/10 rounded-full text-indigo-400 transition-colors"
                        title="Add Ticker Holding"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="space-y-2">
                    {account.holdings.length === 0 ? (
                        <div className="p-4 rounded-xl border border-dashed border-white/10 text-center">
                            <p className="text-xs text-white/30 italic">No holdings in this account yet.</p>
                        </div>
                    ) : (
                        account.holdings.slice(0, 3).map((holding) => (
                            <button
                                key={holding.id}
                                onClick={() => onEditHolding(holding)}
                                className="w-full flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10 transition-all group/holding"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/60 border border-white/5 group-hover/holding:text-white transition-colors">
                                        {holding.ticker}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-medium text-white/80 group-hover/holding:text-white transition-colors truncate max-w-[120px]">{holding.name}</p>
                                        <p className="text-[10px] text-white/40">Holding</p>
                                    </div>
                                </div>
                                <div className="text-right flex items-baseline gap-2">
                                    <p className="text-xs font-bold text-white">
                                        {hideValues ? '****' : formatCurrency(holding.currentValue, preferredCurrency)}
                                    </p>
                                    <ChevronRight className="w-3 h-3 text-white/10 group-hover/holding:text-white/40 group-hover/holding:translate-x-0.5 transition-all" />
                                </div>
                            </button>
                        ))
                    )}
                    {account.holdings.length > 3 && (
                        <p className="text-center text-[10px] text-white/30 mt-1 font-medium">
                            + {account.holdings.length - 3} more assets
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2">
                <button
                    onClick={() => onEdit(account)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10 hover:text-white transition-colors"
                >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                </button>
                <button
                    onClick={() => onTransaction(account)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/20 hover:text-indigo-100 transition-colors"
                >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    Transaction
                </button>
                <button
                    onClick={() => onHistory(account)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-400/35 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/20 transition-colors"
                >
                    <History className="h-3.5 w-3.5" />
                    History
                </button>
            </div>
        </div>
    )
}
