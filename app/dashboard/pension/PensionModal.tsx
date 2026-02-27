'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

type Props = {
    isOpen: boolean
    onClose: () => void
}

export default function PensionModal({ isOpen, onClose }: Props) {
    const [name, setName] = useState('')
    const [value, setValue] = useState('')

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Here you would typically save the data via Supabase
        console.log({ name, value })
        onClose()
        setName('')
        setValue('')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        Add Pension Account
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white/50 hover:text-white transition-colors p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">
                            Provider Name
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                                placeholder="e.g. Scottish Widows"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">
                            Current Value (£)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                required
                                min="0"
                                step="any"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-white/80 hover:bg-white/5 hover:text-white transition-colors text-sm font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white rounded-xl px-4 py-3 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/25"
                        >
                            Save Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
