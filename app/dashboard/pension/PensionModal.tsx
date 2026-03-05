'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import PensionOperationModal from './PensionOperationModal'

type Props = {
    isOpen: boolean
    onClose: () => void
}

export default function PensionModal({ isOpen, onClose }: Props) {
    const [name, setName] = useState('')
    const [value, setValue] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError(null)

        const cleanName = name.trim()
        const parsedValue = Number(value)

        if (!cleanName) {
            setFormError('Provider name is required.')
            return
        }

        if (!Number.isFinite(parsedValue) || parsedValue < 0) {
            setFormError('Value must be a valid number greater than or equal to 0.')
            return
        }

        setIsSaving(true)

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            setFormError('Session not found. Please sign in again.')
            setIsSaving(false)
            return
        }

        const { error: insertError } = await supabase.from('pension_accounts').insert({
            user_id: user.id,
            provider_name: cleanName,
            current_value: parsedValue,
        })

        if (insertError) {
            setFormError(insertError.message)
            setIsSaving(false)
            return
        }

        setIsSaving(false)
        setName('')
        setValue('')
        onClose()
        router.refresh()
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
                        className="text-rose-300 hover:text-rose-300 transition-colors p-1"
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

                    {formError ? (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                            {formError}
                        </div>
                    ) : null}

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="flex-1 px-4 py-3 border border-rose-500/35 rounded-xl text-rose-300 hover:bg-rose-500/10 transition-colors text-sm font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white rounded-xl px-4 py-3 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            <span className="inline-flex items-center justify-center gap-2">
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                {isSaving ? 'Saving...' : 'Save Account'}
                            </span>
                        </button>
                    </div>
                </form>
            </div>

            <PensionOperationModal
                isOpen={isSaving}
                title="Saving Pension"
                message="Please wait while we store your pension details."
            />
        </div>
    )
}
