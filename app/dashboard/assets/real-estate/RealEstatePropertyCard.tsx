'use client'

import { Home, Pencil, ArrowRightLeft, History } from 'lucide-react'
import { useState } from 'react'
import { usePrivacy } from '@/app/dashboard/components/providers/PrivacyProvider'
import EditPropertyModal from './EditPropertyModal'
import PropertyTransactionModal from './PropertyTransactionModal'
import PropertyHistoryModal from './PropertyHistoryModal'

type PropertyCard = {
    id: string
    name: string
    address?: string | null
    current_value?: number | null
    estimated_value?: number | null
    market_value?: number | null
    mortgage_balance?: number | null
}

type Props = {
    property: PropertyCard
    totalPortfolioValue: number
    onRefresh?: () => void
}

function formatCurrency(value: number, hide: boolean) {
    if (hide) return '****'
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        maximumFractionDigits: 0,
    }).format(value)
}

export default function RealEstatePropertyCard({ property, totalPortfolioValue, onRefresh }: Props) {
    const { hideValues } = usePrivacy()
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isTransactionOpen, setIsTransactionOpen] = useState(false)
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)

    const value = property.current_value ?? property.estimated_value ?? property.market_value ?? 0
    const mortgage = property.mortgage_balance ?? 0
    const equity = value - mortgage
    const allocation = totalPortfolioValue > 0 ? (value / totalPortfolioValue) * 100 : 0

    return (
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 hover:bg-white/10 transition-colors flex flex-col h-full group/card">
            <div className="flex items-start justify-between mb-2">
                <div className="min-w-0">
                    <h3 className="text-sm font-medium text-white/80 truncate">{property.name}</h3>
                    {property.address ? (
                        <p className="text-xs text-white/50 mt-0.5 truncate">{property.address}</p>
                    ) : null}
                    <p className="text-2xl font-bold text-white mt-2">
                        {formatCurrency(value, hideValues)}
                    </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover/card:scale-110 transition-transform">
                    <Home className="w-5 h-5" />
                </div>
            </div>

            <div className="w-full bg-white/5 rounded-full h-1.5 mt-4 mb-4 overflow-hidden">
                <div
                    className="bg-indigo-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: hideValues ? '0%' : `${Math.min(allocation, 100)}%` }}
                />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm font-medium text-white/80 mt-auto">
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <p className="text-white/45 text-[10px] uppercase tracking-wider">Equity</p>
                    <p className="text-white mt-1">{formatCurrency(equity, hideValues)}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <p className="text-white/45 text-[10px] uppercase tracking-wider">Mortgage</p>
                    <p className="text-white mt-1">{formatCurrency(mortgage, hideValues)}</p>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
                <button
                    onClick={() => setIsEditOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10 hover:text-white transition-colors"
                >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                </button>
                <button
                    onClick={() => setIsTransactionOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/20 hover:text-emerald-100 transition-colors"
                >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    Transaction
                </button>
                <button
                    onClick={() => setIsHistoryOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-400/35 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-100 hover:bg-indigo-500/20 transition-colors"
                >
                    <History className="h-3.5 w-3.5" />
                    History
                </button>
            </div>

            {isEditOpen && (
                <EditPropertyModal
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    property={property as any}
                    onUpdated={onRefresh}
                    onDeleted={onRefresh}
                />
            )}

            {isTransactionOpen && (
                <PropertyTransactionModal
                    isOpen={isTransactionOpen}
                    onClose={() => setIsTransactionOpen(false)}
                    property={property as any}
                    onSaved={onRefresh}
                />
            )}

            {isHistoryOpen && (
                <PropertyHistoryModal
                    isOpen={isHistoryOpen}
                    onClose={() => setIsHistoryOpen(false)}
                    property={property as any}
                    onDeleted={onRefresh}
                />
            )}
        </div>
    )
}
