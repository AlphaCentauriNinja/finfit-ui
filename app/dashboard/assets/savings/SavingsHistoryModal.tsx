'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Pencil, Trash2, X, History } from 'lucide-react'
import DatePickerField from '@/app/dashboard/components/DatePickerField'
import type { DashboardSavingsAccount } from '@/lib/dashboard-data'

type Props = {
    isOpen: boolean
    onClose: () => void
    account: DashboardSavingsAccount
}

type HistoryEntry = {
    id: string
    pot_id: string
    pot_name: string
    amount: number
    date: string
    name: string
    created_at: string
}

const formatAmount = (value: number): string =>
    `£${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const formatDate = (isoDate: string): string => {
    const date = new Date(`${isoDate}T00:00:00`)
    if (Number.isNaN(date.getTime())) return isoDate
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date)
}

export default function SavingsHistoryModal({ isOpen, onClose, account }: Props) {
    const [entries, setEntries] = useState<HistoryEntry[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [editingEntry, setEditingEntry] = useState<HistoryEntry | null>(null)
    const [deletingEntry, setDeletingEntry] = useState<HistoryEntry | null>(null)

    const [editName, setEditName] = useState('')
    const [editAmount, setEditAmount] = useState('')
    const [editDate, setEditDate] = useState('')
    const [editError, setEditError] = useState<string | null>(null)
    const [isSavingEdit, setIsSavingEdit] = useState(false)
    const [isDeletingEntry, setIsDeletingEntry] = useState(false)

    const router = useRouter()

    const fetchHistory = useCallback(async () => {
        setIsLoading(true)
        setLoadError(null)
        const supabase = createClient()

        const potIds = account.pots.map(p => p.id)
        if (potIds.length === 0) {
            setEntries([])
            setIsLoading(false)
            return
        }

        const { data, error } = await supabase
            .from('savings_history')
            .select(`
                id,
                pot_id,
                amount,
                date,
                name,
                created_at,
                savings_pots (name)
            `)
            .in('pot_id', potIds)
            .order('date', { ascending: false })

        if (error) {
            setLoadError(error.message)
        } else {
            type RawEntry = { id: string; pot_id: string; savings_pots?: { name: string } | { name: string }[]; amount: string | number; date: string; name: string; created_at: string }
            setEntries((data || []).map((entry: RawEntry) => {
                const potName = Array.isArray(entry.savings_pots) 
                    ? entry.savings_pots[0]?.name 
                    : entry.savings_pots?.name
                return {
                    id: entry.id,
                    pot_id: entry.pot_id,
                    pot_name: potName || 'Unknown Pot',
                    amount: Number(entry.amount),
                    date: entry.date,
                    name: entry.name || 'Deposit',
                    created_at: entry.created_at
                }
            }))
        }
        setIsLoading(false)
    }, [account.pots])

    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchHistory().catch(error => console.error(error))
        }
    }, [isOpen, fetchHistory])

    const handleEditSave = async (e: FormEvent) => {
        e.preventDefault()
        if (!editingEntry) return
        setEditError(null)

        const parsedAmount = Number(editAmount)
        if (!Number.isFinite(parsedAmount) || parsedAmount === 0) {
            setEditError('Amount must be a non-zero number.')
            return
        }

        setIsSavingEdit(true)
        const supabase = createClient()

        // 1. Calculate difference for balance update
        const diff = parsedAmount - editingEntry.amount

        // 2. Update history
        const { error: updateError } = await supabase
            .from('savings_history')
            .update({
                amount: parsedAmount,
                date: editDate,
                name: editName.trim()
            })
            .eq('id', editingEntry.id)

        if (updateError) {
            setEditError(updateError.message)
            setIsSavingEdit(false)
            return
        }

        // 3. Update pot balance
        const pot = account.pots.find(p => p.id === editingEntry.pot_id)
        if (pot && diff !== 0) {
            await supabase
                .from('savings_pots')
                .update({ balance: pot.balance + diff })
                .eq('id', pot.id)
        }

        setIsSavingEdit(false)
        setEditingEntry(null)
        fetchHistory()
        router.refresh()
    }

    const handleDelete = async () => {
        if (!deletingEntry) return
        setIsDeletingEntry(true)
        const supabase = createClient()

        // 1. Update pot balance
        const pot = account.pots.find(p => p.id === deletingEntry.pot_id)
        if (pot) {
            await supabase
                .from('savings_pots')
                .update({ balance: pot.balance - deletingEntry.amount })
                .eq('id', pot.id)
        }

        // 2. Delete history
        await supabase.from('savings_history').delete().eq('id', deletingEntry.id)

        setIsDeletingEntry(false)
        setDeletingEntry(null)
        fetchHistory()
        router.refresh()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-5xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                            <History className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Savings History</h2>
                            <p className="text-xs text-white/60 mt-1">{account.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-rose-300 hover:text-rose-300 transition-colors p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {loadError ? (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200 font-medium">
                            {loadError}
                        </div>
                    ) : isLoading ? (
                        <div className="h-40 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-12 text-center">
                            <p className="text-sm text-white/40 italic">No history entries found for this account.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-white/10">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white/[0.03] text-white/60 font-medium border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Pot</th>
                                        <th className="px-6 py-4">Description</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {entries.map((entry) => (
                                        <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4 text-white/80 whitespace-nowrap">{formatDate(entry.date)}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                                    {entry.pot_name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-white/70">{entry.name}</td>
                                            <td className={`px-6 py-4 font-semibold ${entry.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {entry.amount > 0 ? '+' : ''} {formatAmount(entry.amount)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingEntry(entry)
                                                            setEditAmount(entry.amount.toString())
                                                            setEditDate(entry.date)
                                                            setEditName(entry.name)
                                                        }}
                                                        className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all border border-white/10"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingEntry(entry)}
                                                        className="p-2 rounded-lg bg-rose-500/5 text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-rose-500/10"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Edit Modal */}
                {editingEntry && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setEditingEntry(null)} />
                        <div className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-white/10">
                                <h3 className="text-lg font-bold text-white">Edit Entry</h3>
                            </div>
                            <form onSubmit={handleEditSave} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/80">Description</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-white/80">Amount (£)</label>
                                        <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                                            Use negative for withdrawal
                                        </span>
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        step="any"
                                        value={editAmount}
                                        onChange={(e) => setEditAmount(e.target.value)}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-semibold"
                                    />
                                </div>
                                <DatePickerField label="Date" value={editDate} onChange={setEditDate} />
                                {editError && <p className="text-xs text-rose-400">{editError}</p>}
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setEditingEntry(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-rose-500/35 text-rose-300 text-sm font-semibold hover:bg-rose-500/10 transition-colors">Cancel</button>
                                    <button type="submit" disabled={isSavingEdit} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                                        {isSavingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation */}
                {deletingEntry && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setDeletingEntry(null)} />
                        <div className="relative w-full max-w-sm bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-200">
                            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20 mx-auto mb-4">
                                <Trash2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Delete Entry?</h3>
                            <p className="text-sm text-white/60 mb-6">Are you sure you want to delete this history entry? The pot balance will be updated accordingly.</p>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setDeletingEntry(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-rose-500/35 text-rose-300 text-sm font-semibold hover:bg-rose-500/10 transition-colors">Cancel</button>
                                <button type="button" onClick={handleDelete} disabled={isDeletingEntry} className="flex-1 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                                    {isDeletingEntry && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
