'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import PensionOperationModal from './PensionOperationModal'
import NativeDatePickerField from './NativeDatePickerField'

type Props = {
    isOpen: boolean
    onClose: () => void
    pensionId: string
    pensionName: string
}

const todayIso = new Date().toISOString().slice(0, 10)

export default function PensionValueModal({ isOpen, onClose, pensionId, pensionName }: Props) {
    const [valueAmount, setValueAmount] = useState('')
    const [valueDate, setValueDate] = useState(todayIso)
    const [isSaving, setIsSaving] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    if (!isOpen) return null

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setFormError(null)

        const parsedValue = Number(valueAmount)

        if (!Number.isFinite(parsedValue) || parsedValue < 0) {
            setFormError('Value must be a valid number greater than or equal to 0.')
            return
        }

        if (!valueDate) {
            setFormError('Value date is required.')
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

        const { error } = await supabase.from('pension_account_values').insert({
            user_id: user.id,
            pension_account_id: pensionId,
            value_amount: parsedValue,
            value_date: valueDate,
        })

        if (error) {
            setFormError(error.message)
            setIsSaving(false)
            return
        }

        setIsSaving(false)
        onClose()
        router.refresh()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-xl font-bold text-white">Add Value</h2>
                        <p className="text-xs text-white/60 mt-1">{pensionName}</p>
                    </div>
                    <button onClick={onClose} className="text-rose-300 hover:text-rose-300 transition-colors p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Current Value (£)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="any"
                            value={valueAmount}
                            onChange={(event) => setValueAmount(event.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                            placeholder="0.00"
                        />
                    </div>

                    <NativeDatePickerField
                        label="Value Date"
                        value={valueDate}
                        onChange={setValueDate}
                        disabled={isSaving}
                    />

                    {formError ? (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                            {formError}
                        </div>
                    ) : null}

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="flex-1 px-4 py-3 border border-rose-500/35 rounded-xl text-rose-300 hover:bg-rose-500/10 transition-colors text-sm font-semibold disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white rounded-xl px-4 py-3 text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <span className="inline-flex items-center justify-center gap-2">
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                {isSaving ? 'Saving...' : 'Add Value'}
                            </span>
                        </button>
                    </div>
                </form>
            </div>

            <PensionOperationModal
                isOpen={isSaving}
                title="Saving Value"
                message="Please wait while we store this pension value."
            />
        </div>
    )
}
