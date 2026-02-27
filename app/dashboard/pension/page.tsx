'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import PensionModal from './PensionModal'

export default function PensionPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const pensions = [
        { name: 'Aviva', value: 8719.31 },
        { name: 'Aegon (Hotels.com)', value: 12769.3 },
        { name: 'Legal & General', value: 2622.3 },
        { name: 'Mercer (Schroders)', value: 53543.75 },
    ]

    const total = pensions.reduce((sum, p) => sum + p.value, 0)

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">
                    Pension Accounts
                </h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium shadow-sm shadow-indigo-500/20"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Pension</span>
                </button>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 mb-8">
                <p className="text-sm font-medium text-white/60">Total Value</p>
                <p className="text-3xl font-bold text-white mt-2">£{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {pensions.map((p) => (
                    <div
                        key={p.name}
                        className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <h3 className="text-sm font-medium text-white/60">
                            {p.name}
                        </h3>
                        <p className="text-2xl font-bold text-white mt-2">
                            £{p.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <div className="w-full bg-white/5 rounded-full h-1.5 mt-4">
                            <div
                                className="bg-indigo-400 h-1.5 rounded-full"
                                style={{ width: `${(p.value / total) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <PensionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    )
}
