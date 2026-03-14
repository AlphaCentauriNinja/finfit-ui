'use client'

import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight, History, Minus, Pencil, PlusCircle, PoundSterling } from 'lucide-react'
import PensionEditModal from './PensionEditModal'
import PensionContributionModal from './PensionContributionModal'
import PensionValueModal from './PensionValueModal'
import PensionHistoryModal from './PensionHistoryModal'
import { usePrivacy } from '@/app/dashboard/components/providers/PrivacyProvider'
import { formatCurrency } from '@/lib/utils'

type Props = {
    pension: {
        id: string
        name: string
        value: number
        pnl: number
        pnlPercentage: number
        contributionTotal: number
        latestValueDate: string | null
    }
    total: number
}

type PnlState = 'positive' | 'negative' | 'neutral'

const getPnlState = (value: number): PnlState => {
    const epsilon = 0.000001
    if (value > epsilon) return 'positive'
    if (value < -epsilon) return 'negative'
    return 'neutral'
}

export default function PensionAccountCard({ pension, total }: Props) {
    const { hideValues } = usePrivacy()
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isContributionOpen, setIsContributionOpen] = useState(false)
    const [isValueOpen, setIsValueOpen] = useState(false)
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)

    const valueDateLabel = (() => {
        if (!pension.latestValueDate) return null
        const date = new Date(`${pension.latestValueDate}T00:00:00`)
        if (Number.isNaN(date.getTime())) return pension.latestValueDate
        return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
    })()

    const pnlLabel = hideValues ? (pension.pnl >= 0 ? "+****" : "****") : `${pension.pnl >= 0 ? '+' : ''}£${pension.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    const pnlPctLabel = `${pension.pnlPercentage >= 0 ? '+' : ''}${pension.pnlPercentage.toFixed(2)}%`
    const pnlState = getPnlState(pension.pnl)
    const PnlIcon = pnlState === 'positive' ? ArrowUpRight : pnlState === 'negative' ? ArrowDownRight : Minus
    const pnlPillTone = pnlState === 'positive'
        ? 'border-green-500 bg-green-500/20 text-green-200'
        : pnlState === 'negative'
            ? 'border-red-500 bg-red-500/20 text-red-200'
            : 'border-amber-500 bg-amber-500/20 text-amber-200'

    return (
        <>
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 hover:bg-white/10 transition-colors">
                <h3 className="text-sm font-medium text-white/60">{pension.name}</h3>
                <p className="text-2xl font-bold text-white mt-2">
                    {formatCurrency(pension.value, hideValues)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${pnlPillTone}`}>
                        <PnlIcon className="mr-1 h-3.5 w-3.5" />
                        PNL {pnlLabel}
                    </span>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${pnlPillTone}`}>
                        {pnlPctLabel}
                    </span>
                </div>
                {valueDateLabel ? (
                    <p className="text-xs text-white/55 mt-1">Value date: {valueDateLabel}</p>
                ) : null}

                {pension.contributionTotal > 0 ? (
                    <p className="text-xs text-indigo-200/85 mt-1">
                        Contributions added: {hideValues ? "****" : `£${pension.contributionTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </p>
                ) : null}

                <div className="w-full bg-white/5 rounded-full h-1.5 mt-4">
                    <div
                        className="bg-indigo-400 h-1.5 rounded-full"
                        style={{ width: `${total > 0 ? (pension.value / total) * 100 : 0}%` }}
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
                        onClick={() => setIsContributionOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/20 hover:text-indigo-100 transition-colors"
                    >
                        <PlusCircle className="h-3.5 w-3.5" />
                        Add Contribution
                    </button>
                    <button
                        onClick={() => setIsValueOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-400/35 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/20 transition-colors"
                    >
                        <PoundSterling className="h-3.5 w-3.5" />
                        Add Value
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
                <PensionEditModal
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    pensionId={pension.id}
                    initialName={pension.name}
                />
            ) : null}

            {isContributionOpen ? (
                <PensionContributionModal
                    isOpen={isContributionOpen}
                    onClose={() => setIsContributionOpen(false)}
                    pensionId={pension.id}
                    pensionName={pension.name}
                />
            ) : null}

            {isValueOpen ? (
                <PensionValueModal
                    isOpen={isValueOpen}
                    onClose={() => setIsValueOpen(false)}
                    pensionId={pension.id}
                    pensionName={pension.name}
                />
            ) : null}

            {isHistoryOpen ? (
                <PensionHistoryModal
                    isOpen={isHistoryOpen}
                    onClose={() => setIsHistoryOpen(false)}
                    pensionId={pension.id}
                    pensionName={pension.name}
                />
            ) : null}
        </>
    )
}
