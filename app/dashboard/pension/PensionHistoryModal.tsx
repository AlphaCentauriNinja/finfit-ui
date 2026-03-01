'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Pencil, Trash2, X } from 'lucide-react'
import PensionOperationModal from './PensionOperationModal'
import NativeDatePickerField from './NativeDatePickerField'

type Props = {
    isOpen: boolean
    onClose: () => void
    pensionId: string
    pensionName: string
}

type ContributionRow = {
    id: string
    contribution_name: string
    contribution_value: number | string | null
    contribution_date: string
    created_at: string
}

type ValueRow = {
    id: string
    value_amount: number | string | null
    value_date: string
    created_at: string
}

type HistoryEntry = {
    id: string
    kind: 'contribution' | 'value'
    date: string
    name: string | null
    amount: number
    valueChange: number | null
    createdAt: string
}

const toNumber = (value: number | string | null | undefined): number => {
    if (typeof value === 'number') return value
    return Number(value ?? 0)
}

const formatAmount = (value: number): string =>
    `£${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const formatSignedAmount = (value: number): string => {
    const sign = value > 0 ? '+' : ''
    return `${sign}${formatAmount(value)}`
}

const formatDate = (isoDate: string): string => {
    const date = new Date(`${isoDate}T00:00:00`)
    if (Number.isNaN(date.getTime())) return isoDate
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date)
}

function buildHistoryEntries(contributionRows: ContributionRow[], valueRows: ValueRow[]): HistoryEntry[] {
    const normalizedContributions: HistoryEntry[] = contributionRows.map((row) => {
        const amount = toNumber(row.contribution_value)

        return {
            id: row.id,
            kind: 'contribution',
            date: row.contribution_date,
            name: row.contribution_name,
            amount: Number.isFinite(amount) ? amount : 0,
            valueChange: null,
            createdAt: row.created_at,
        }
    })

    const valuesOrdered = [...valueRows].sort((a, b) => {
        if (a.value_date !== b.value_date) return a.value_date.localeCompare(b.value_date)
        return a.created_at.localeCompare(b.created_at)
    })

    let previousValue: number | null = null
    const normalizedValues: HistoryEntry[] = valuesOrdered.map((row) => {
        const amount = toNumber(row.value_amount)
        const safeAmount = Number.isFinite(amount) ? amount : 0
        const valueChange = previousValue === null ? null : safeAmount - previousValue
        previousValue = safeAmount

        return {
            id: row.id,
            kind: 'value',
            date: row.value_date,
            name: null,
            amount: safeAmount,
            valueChange,
            createdAt: row.created_at,
        }
    })

    return [...normalizedContributions, ...normalizedValues].sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date)
        return b.createdAt.localeCompare(a.createdAt)
    })
}

async function fetchHistoryEntries(pensionId: string): Promise<{ entries: HistoryEntry[]; error: string | null }> {
    const supabase = createClient()
    const [contributionRes, valueRes] = await Promise.all([
        supabase
            .from('pension_contributions')
            .select('id, contribution_name, contribution_value, contribution_date, created_at')
            .eq('pension_account_id', pensionId),
        supabase
            .from('pension_account_values')
            .select('id, value_amount, value_date, created_at')
            .eq('pension_account_id', pensionId),
    ])

    const queryError = contributionRes.error ?? valueRes.error
    if (queryError) {
        return {
            entries: [],
            error: queryError.message,
        }
    }

    return {
        entries: buildHistoryEntries(
            (contributionRes.data ?? []) as ContributionRow[],
            (valueRes.data ?? []) as ValueRow[]
        ),
        error: null,
    }
}

export default function PensionHistoryModal({ isOpen, onClose, pensionId, pensionName }: Props) {
    const [entries, setEntries] = useState<HistoryEntry[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [editingEntry, setEditingEntry] = useState<HistoryEntry | null>(null)
    const [deletingEntry, setDeletingEntry] = useState<HistoryEntry | null>(null)
    const [editName, setEditName] = useState('')
    const [editAmount, setEditAmount] = useState('')
    const [editDate, setEditDate] = useState('')
    const [editError, setEditError] = useState<string | null>(null)
    const [deleteError, setDeleteError] = useState<string | null>(null)
    const [isSavingEdit, setIsSavingEdit] = useState(false)
    const [isDeletingEntry, setIsDeletingEntry] = useState(false)
    const router = useRouter()

    const reloadHistory = useCallback(async () => {
        setLoadError(null)
        setIsLoading(true)
        const result = await fetchHistoryEntries(pensionId)
        setEntries(result.entries)
        setLoadError(result.error)
        setIsLoading(false)
    }, [pensionId])

    useEffect(() => {
        let active = true

        ; (async () => {
            const result = await fetchHistoryEntries(pensionId)
            if (!active) return
            setEntries(result.entries)
            setLoadError(result.error)
            setIsLoading(false)
        })()

        return () => {
            active = false
        }
    }, [pensionId])

    const openEditModal = (entry: HistoryEntry) => {
        setEditError(null)
        setEditingEntry(entry)
        setEditDate(entry.date)
        setEditAmount(entry.amount.toString())
        setEditName(entry.kind === 'contribution' ? (entry.name ?? '') : '')
    }

    const handleEditSave = async (event: FormEvent) => {
        event.preventDefault()
        if (!editingEntry) return
        setEditError(null)

        const parsedAmount = Number(editAmount)
        if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
            setEditError('Value must be a valid number greater than or equal to 0.')
            return
        }

        if (!editDate) {
            setEditError('Date is required.')
            return
        }

        if (editingEntry.kind === 'contribution' && !editName.trim()) {
            setEditError('Name is required for contributions.')
            return
        }

        setIsSavingEdit(true)
        const supabase = createClient()

        if (editingEntry.kind === 'contribution') {
            const { error } = await supabase
                .from('pension_contributions')
                .update({
                    contribution_name: editName.trim(),
                    contribution_value: parsedAmount,
                    contribution_date: editDate,
                })
                .eq('id', editingEntry.id)

            if (error) {
                setEditError(error.message)
                setIsSavingEdit(false)
                return
            }
        } else {
            const { error } = await supabase
                .from('pension_account_values')
                .update({
                    value_amount: parsedAmount,
                    value_date: editDate,
                })
                .eq('id', editingEntry.id)

            if (error) {
                setEditError(error.message)
                setIsSavingEdit(false)
                return
            }
        }

        setIsSavingEdit(false)
        setEditingEntry(null)
        await reloadHistory()
        router.refresh()
    }

    const handleDelete = async () => {
        if (!deletingEntry) return
        setDeleteError(null)
        setIsDeletingEntry(true)
        const supabase = createClient()

        const table = deletingEntry.kind === 'contribution'
            ? 'pension_contributions'
            : 'pension_account_values'

        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', deletingEntry.id)

        if (error) {
            setDeleteError(error.message)
            setIsDeletingEntry(false)
            return
        }

        setIsDeletingEntry(false)
        setDeletingEntry(null)
        await reloadHistory()
        router.refresh()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-5xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-xl font-bold text-white">History</h2>
                        <p className="text-xs text-white/60 mt-1">{pensionName}</p>
                    </div>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {loadError ? (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                            {loadError}
                        </div>
                    ) : isLoading ? (
                        <div className="h-40 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-300" />
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-sm text-white/65 text-center">
                            No history entries found for this pension yet.
                        </div>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <table className="w-full min-w-full text-sm">
                                <thead className="bg-white/[0.03]">
                                    <tr className="text-white/60">
                                        <th className="text-center font-medium px-4 py-3">Date</th>
                                        <th className="text-center font-medium px-4 py-3">Type</th>
                                        <th className="text-center font-medium px-4 py-3">Name</th>
                                        <th className="text-center font-medium px-4 py-3">Value</th>
                                        <th className="text-center font-medium px-4 py-3">Value Change</th>
                                        <th className="text-center font-medium px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map((entry) => {
                                        const isValueEntry = entry.kind === 'value'

                                        return (
                                            <tr key={`${entry.kind}-${entry.id}`} className="border-t border-white/10">
                                                <td className="px-4 py-3 text-center text-white/85">{formatDate(entry.date)}</td>
                                                <td className="px-4 py-3 text-center text-white/75">
                                                    {isValueEntry ? 'Value' : 'Contribution'}
                                                </td>
                                                <td className="px-4 py-3 text-center text-white/85">
                                                    {isValueEntry ? 'Value snapshot' : entry.name}
                                                </td>
                                                <td className={`px-4 py-3 text-center font-semibold ${isValueEntry ? 'text-cyan-200' : 'text-indigo-200'}`}>
                                                    {isValueEntry ? formatAmount(entry.amount) : formatSignedAmount(entry.amount)}
                                                </td>
                                                <td className={`px-4 py-3 text-center font-semibold ${isValueEntry ? (entry.valueChange === null ? 'text-white/55' : entry.valueChange >= 0 ? 'text-emerald-300' : 'text-rose-300') : 'text-white/45'}`}>
                                                    {isValueEntry
                                                        ? (entry.valueChange === null ? '—' : formatSignedAmount(entry.valueChange))
                                                        : '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => openEditModal(entry)}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/85 hover:bg-white/10"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setDeleteError(null)
                                                                setDeletingEntry(entry)
                                                            }}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/35 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-500/20"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {editingEntry ? (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setEditingEntry(null)} />
                    <div className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-white/10">
                            <h3 className="text-lg font-bold text-white">Edit {editingEntry.kind === 'value' ? 'Value' : 'Contribution'}</h3>
                        </div>
                        <form onSubmit={handleEditSave} className="p-6 space-y-4">
                            {editingEntry.kind === 'contribution' ? (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/80">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={editName}
                                        onChange={(event) => setEditName(event.target.value)}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                                    />
                                </div>
                            ) : null}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">
                                    {editingEntry.kind === 'value' ? 'Value (£)' : 'Contribution Value (£)'}
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="any"
                                    value={editAmount}
                                    onChange={(event) => setEditAmount(event.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                                />
                            </div>

                            <NativeDatePickerField
                                label="Date"
                                value={editDate}
                                onChange={setEditDate}
                                disabled={isSavingEdit}
                            />

                            {editError ? (
                                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                                    {editError}
                                </div>
                            ) : null}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingEntry(null)}
                                    disabled={isSavingEdit}
                                    className="flex-1 rounded-xl border border-white/10 text-white/80 px-4 py-3 text-sm font-semibold hover:bg-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingEdit}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white px-4 py-3 text-sm font-semibold hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isSavingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    {isSavingEdit ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}

            {deletingEntry ? (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setDeletingEntry(null)} />
                    <div className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-white/10">
                            <h3 className="text-lg font-bold text-white">Delete Entry</h3>
                            <p className="text-sm text-white/70 mt-2">
                                This {deletingEntry.kind} entry will be deleted permanently.
                            </p>
                        </div>
                        <div className="p-6 space-y-3">
                            {deleteError ? (
                                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                                    {deleteError}
                                </div>
                            ) : null}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isDeletingEntry}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 text-white px-4 py-3 text-sm font-semibold hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isDeletingEntry ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    {isDeletingEntry ? 'Deleting...' : 'Delete'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeletingEntry(null)}
                                    disabled={isDeletingEntry}
                                    className="flex-1 rounded-xl border border-white/10 text-white/80 px-4 py-3 text-sm font-semibold hover:bg-white/5 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            <PensionOperationModal
                isOpen={isSavingEdit || isDeletingEntry}
                title={isDeletingEntry ? 'Deleting Entry' : 'Saving Entry'}
                message={isDeletingEntry ? 'Please wait while we delete this history entry.' : 'Please wait while we store your history changes.'}
            />
        </div>
    )
}
