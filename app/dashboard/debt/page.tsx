'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CreditCard, Edit3, Loader2, Plus, Trash2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ConfirmActionModal from '@/app/components/ConfirmActionModal'
import { usePrivacy } from '@/app/dashboard/components/providers/PrivacyProvider'
import { formatCurrency } from '@/lib/utils'

type DebtTypeValue = 'credit_card' | 'private_loan' | 'student_loan' | 'car_finance' | 'mortgage' | 'other'

type DebtEntry = {
    id: string
    debtType: DebtTypeValue
    debtName: string
    amount: number
    createdAt: string | null
}

type SupabaseError = {
    code?: string
    message?: string
}

type DebtModalPayload = {
    debtType: DebtTypeValue
    debtName: string
    amount: number
}

type ModalResult = {
    ok: boolean
    error?: string
}

type AddDebtModalProps = {
    onClose: () => void
    onSubmit: (payload: DebtModalPayload) => Promise<ModalResult>
}

type EditDebtModalProps = {
    onClose: () => void
    entry: DebtEntry | null
    onSubmit: (id: string, payload: DebtModalPayload) => Promise<ModalResult>
}

const DEBT_TYPE_OPTIONS: Array<{ value: DebtTypeValue; label: string }> = [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'private_loan', label: 'Private Loan' },
    { value: 'student_loan', label: 'Student Loan' },
    { value: 'car_finance', label: 'Car Finance' },
    { value: 'mortgage', label: 'Mortgage' },
    { value: 'other', label: 'Other' },
]

function isMissingTableError(error: SupabaseError | null): boolean {
    if (!error) return false
    if (error.code === '42P01') return true

    const message = (error.message || '').toLowerCase()
    return message.includes('relation') && message.includes('does not exist')
}

function toAmount(value: number | string | null | undefined): number {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : 0
    }
    return 0
}

function normalizeDebtType(value: string | null | undefined): DebtTypeValue {
    if (
        value === 'credit_card' ||
        value === 'private_loan' ||
        value === 'student_loan' ||
        value === 'car_finance' ||
        value === 'mortgage'
    ) {
        return value
    }
    return 'other'
}

function formatDebtTypeLabel(value: DebtTypeValue): string {
    return DEBT_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? 'Other'
}

function formatGbp(value: number): string {
    return `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function AddDebtModal({ onClose, onSubmit }: AddDebtModalProps) {
    const [debtType, setDebtType] = useState<DebtTypeValue>('credit_card')
    const [debtName, setDebtName] = useState('')
    const [amount, setAmount] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setError(null)

        const cleanName = debtName.trim()
        const parsedAmount = Number(amount)

        if (!cleanName) {
            setError('Debt name is required.')
            return
        }

        if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
            setError('Amount must be 0 or greater.')
            return
        }

        setIsSaving(true)
        const result = await onSubmit({
            debtType,
            debtName: cleanName,
            amount: parsedAmount,
        })
        setIsSaving(false)

        if (!result.ok) {
            setError(result.error ?? 'Unable to add debt.')
            return
        }

        onClose()
    }

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <h3 className="text-lg font-bold text-white">Add Debt</h3>
                    <button onClick={onClose} className="p-1 text-white/60 hover:text-white" aria-label="Close add debt modal">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Debt Type</label>
                        <select
                            value={debtType}
                            onChange={(event) => setDebtType(event.target.value as DebtTypeValue)}
                            disabled={isSaving}
                            className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        >
                            {DEBT_TYPE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Name</label>
                        <input
                            type="text"
                            value={debtName}
                            onChange={(event) => setDebtName(event.target.value)}
                            disabled={isSaving}
                            className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            placeholder="e.g. Barclaycard"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Amount (£)</label>
                        <input
                            type="number"
                            min="0"
                            step="any"
                            value={amount}
                            onChange={(event) => setAmount(event.target.value)}
                            disabled={isSaving}
                            className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            placeholder="0.00"
                        />
                    </div>

                    {error ? (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                            {error}
                        </div>
                    ) : null}

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            {isSaving ? 'Adding...' : 'Add Debt'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function EditDebtModal({ onClose, entry, onSubmit }: EditDebtModalProps) {
    const [debtType, setDebtType] = useState<DebtTypeValue>(entry?.debtType ?? 'credit_card')
    const [debtName, setDebtName] = useState(entry?.debtName ?? '')
    const [amount, setAmount] = useState(entry ? String(entry.amount) : '')
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!entry) return null

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setError(null)

        const cleanName = debtName.trim()
        const parsedAmount = Number(amount)

        if (!cleanName) {
            setError('Debt name is required.')
            return
        }

        if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
            setError('Amount must be 0 or greater.')
            return
        }

        setIsSaving(true)
        const result = await onSubmit(entry.id, {
            debtType,
            debtName: cleanName,
            amount: parsedAmount,
        })
        setIsSaving(false)

        if (!result.ok) {
            setError(result.error ?? 'Unable to update debt.')
            return
        }

        onClose()
    }

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <h3 className="text-lg font-bold text-white">Edit Debt</h3>
                    <button onClick={onClose} className="p-1 text-white/60 hover:text-white" aria-label="Close edit debt modal">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Debt Type</label>
                        <select
                            value={debtType}
                            onChange={(event) => setDebtType(event.target.value as DebtTypeValue)}
                            disabled={isSaving}
                            className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        >
                            {DEBT_TYPE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Name</label>
                        <input
                            type="text"
                            value={debtName}
                            onChange={(event) => setDebtName(event.target.value)}
                            disabled={isSaving}
                            className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Amount (£)</label>
                        <input
                            type="number"
                            min="0"
                            step="any"
                            value={amount}
                            onChange={(event) => setAmount(event.target.value)}
                            disabled={isSaving}
                            className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                    </div>

                    {error ? (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                            {error}
                        </div>
                    ) : null}

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/5 disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function DebtPage() {
    const supabase = useMemo(() => createClient(), [])
    const { hideValues } = usePrivacy()
    const [userId, setUserId] = useState<string | null>(null)
    const [debts, setDebts] = useState<DebtEntry[]>([])
    const [monthlyNetSalary, setMonthlyNetSalary] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [isAddDebtOpen, setIsAddDebtOpen] = useState(false)
    const [editingDebtId, setEditingDebtId] = useState<string | null>(null)
    const [deletingDebtId, setDeletingDebtId] = useState<string | null>(null)
    const [confirmDeleteDebtId, setConfirmDeleteDebtId] = useState<string | null>(null)

    useEffect(() => {
        let isActive = true

        const loadDebtData = async () => {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser()

            if (!isActive) return

            if (userError || !user) {
                setLoadError('Session not found. Please sign in again.')
                setDebts([])
                setMonthlyNetSalary(0)
                setUserId(null)
                setIsLoading(false)
                return
            }

            setUserId(user.id)

            const [debtsResult, salaryResult] = await Promise.all([
                supabase
                    .from('debt_entries')
                    .select('id, debt_type, debt_name, amount, created_at')
                    .order('created_at', { ascending: false }),
                supabase
                    .from('salary_profiles')
                    .select('monthly_net_salary')
                    .maybeSingle(),
            ])

            if (!isActive) return

            const debtsError = debtsResult.error as SupabaseError | null

            if (debtsError) {
                if (isMissingTableError(debtsError)) {
                    setLoadError('Missing debt_entries table. Apply the latest migration to enable debt tracking.')
                } else {
                    setLoadError(debtsError.message || 'Unable to load debt data.')
                }
                setDebts([])
            } else {
                const mappedDebts: DebtEntry[] = ((debtsResult.data as Array<{
                    id: string
                    debt_type: string | null
                    debt_name: string | null
                    amount: number | string | null
                    created_at: string | null
                }> | null) || [])
                    .map((row) => {
                        const debtName = (row.debt_name || '').trim()
                        const amount = toAmount(row.amount)

                        if (!row.id || !debtName || !Number.isFinite(amount) || amount < 0) return null

                        return {
                            id: row.id,
                            debtType: normalizeDebtType(row.debt_type),
                            debtName,
                            amount,
                            createdAt: row.created_at,
                        }
                    })
                    .filter((entry): entry is DebtEntry => Boolean(entry))
                    .sort((a, b) => b.amount - a.amount)

                setDebts(mappedDebts)
            }

            const salaryAmount = toAmount((salaryResult.data as { monthly_net_salary?: number | string | null } | null)?.monthly_net_salary)
            setMonthlyNetSalary(Number.isFinite(salaryAmount) && salaryAmount > 0 ? salaryAmount : 0)
            setIsLoading(false)
        }

        void loadDebtData()

        return () => {
            isActive = false
        }
    }, [supabase])

    const totalDebt = useMemo(
        () => debts.reduce((sum, debt) => sum + debt.amount, 0),
        [debts]
    )

    const debtToIncomeRatio = monthlyNetSalary > 0
        ? (totalDebt / monthlyNetSalary) * 100
        : 0

    const addDebt = useCallback(async (payload: DebtModalPayload): Promise<ModalResult> => {
        if (!userId) return { ok: false, error: 'Session not found. Please sign in again.' }

        const { data, error } = await supabase
            .from('debt_entries')
            .insert({
                user_id: userId,
                debt_type: payload.debtType,
                debt_name: payload.debtName,
                amount: payload.amount,
            })
            .select('id, debt_type, debt_name, amount, created_at')
            .single()

        if (error) {
            return { ok: false, error: error.message }
        }

        const inserted = data as {
            id: string
            debt_type: string | null
            debt_name: string | null
            amount: number | string | null
            created_at: string | null
        }

        const amount = toAmount(inserted.amount)
        const debtName = (inserted.debt_name || '').trim()

        if (!inserted.id || !debtName || !Number.isFinite(amount) || amount < 0) {
            return { ok: false, error: 'Inserted debt row is invalid.' }
        }

        const entry: DebtEntry = {
            id: inserted.id,
            debtType: normalizeDebtType(inserted.debt_type),
            debtName,
            amount,
            createdAt: inserted.created_at,
        }

        setDebts((previous) => [entry, ...previous].sort((a, b) => b.amount - a.amount))
        return { ok: true }
    }, [supabase, userId])

    const updateDebt = useCallback(async (id: string, payload: DebtModalPayload): Promise<ModalResult> => {
        if (!userId) return { ok: false, error: 'Session not found. Please sign in again.' }

        const { data, error } = await supabase
            .from('debt_entries')
            .update({
                debt_type: payload.debtType,
                debt_name: payload.debtName,
                amount: payload.amount,
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select('id, debt_type, debt_name, amount, created_at')
            .single()

        if (error) {
            return { ok: false, error: error.message }
        }

        const updated = data as {
            id: string
            debt_type: string | null
            debt_name: string | null
            amount: number | string | null
            created_at: string | null
        }
        const amount = toAmount(updated.amount)
        const debtName = (updated.debt_name || '').trim()

        if (!updated.id || !debtName || !Number.isFinite(amount) || amount < 0) {
            return { ok: false, error: 'Updated debt row is invalid.' }
        }

        const entry: DebtEntry = {
            id: updated.id,
            debtType: normalizeDebtType(updated.debt_type),
            debtName,
            amount,
            createdAt: updated.created_at,
        }

        setDebts((previous) =>
            previous
                .map((debt) => (debt.id === id ? entry : debt))
                .sort((a, b) => b.amount - a.amount)
        )
        return { ok: true }
    }, [supabase, userId])

    const deleteDebt = useCallback(async (id: string): Promise<ModalResult> => {
        if (!userId) return { ok: false, error: 'Session not found. Please sign in again.' }

        const { error } = await supabase
            .from('debt_entries')
            .delete()
            .eq('id', id)
            .eq('user_id', userId)

        if (error) {
            return { ok: false, error: error.message }
        }

        setDebts((previous) => previous.filter((debt) => debt.id !== id))
        return { ok: true }
    }, [supabase, userId])

    const editingDebt = useMemo(
        () => debts.find((debt) => debt.id === editingDebtId) ?? null,
        [debts, editingDebtId]
    )

    const handleDeleteFromTable = async (id: string) => {
        setConfirmDeleteDebtId(id)
    }

    const confirmDeleteDebt = async () => {
        if (!confirmDeleteDebtId) return

        setDeletingDebtId(confirmDeleteDebtId)
        const result = await deleteDebt(confirmDeleteDebtId)
        setDeletingDebtId(null)
        setConfirmDeleteDebtId(null)

        if (!result.ok) {
            setLoadError(result.error ?? 'Unable to delete debt.')
        }
    }

    return (
        <div className="w-full">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Debt</h1>
                    <p className="text-sm text-white/65 mt-1">
                        Manage and track your liabilities
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsAddDebtOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-indigo-400/30 bg-indigo-500/15 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/25"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Debt
                    </button>
                </div>
            </div>

            {totalDebt > 0 ? (
                <div className="mb-8 grid gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 shadow-sm backdrop-blur-sm">
                        <div className="mb-4 flex items-start justify-between">
                            <h3 className="text-sm font-medium text-rose-300">Total Debt</h3>
                            <CreditCard className="h-5 w-5 text-rose-400" />
                        </div>
                        <p className="text-4xl font-bold text-rose-400">{formatGbp(totalDebt)}</p>
                        <p className="mt-2 text-sm font-medium text-rose-300/80">
                            {debts.length} debt account{debts.length === 1 ? '' : 's'}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6 shadow-sm backdrop-blur-sm">
                        <div className="mb-4 flex items-start justify-between">
                            <h3 className="text-sm font-medium text-amber-300">Debt-to-Income Ratio</h3>
                            <AlertTriangle className="h-5 w-5 text-amber-400" />
                        </div>
                        <p className="text-4xl font-bold text-amber-300">{debtToIncomeRatio.toFixed(1)}%</p>
                        <p className="mt-2 text-sm font-medium text-amber-200/80">
                            Monthly net salary: {hideValues ? "****" : `£${monthlyNetSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </p>
                    </div>
                </div>
            ) : null}

            <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-white/90">Debt Breakdown</h2>
            </div>

            {loadError ? (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {loadError}
                </div>
            ) : null}

            {isLoading ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-white/65">
                    Loading debt accounts...
                </div>
            ) : debts.length === 0 ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    Well done, you do not have any debt
                </div>
            ) : (
                <div className="w-full max-w-none overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-sm backdrop-blur-sm">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-full table-fixed text-sm">
                            <thead className="bg-white/[0.03]">
                                <tr className="text-white/60">
                                    <th className="px-6 py-3 text-center font-medium">Type</th>
                                    <th className="px-6 py-3 text-center font-medium">Name</th>
                                    <th className="px-6 py-3 text-center font-medium">Amount</th>
                                    <th className="px-6 py-3 text-center font-medium">% Of Total</th>
                                    <th className="px-6 py-3 text-center font-medium">Edit</th>
                                    <th className="px-6 py-3 text-center font-medium">Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {debts.map((debt) => {
                                    const shareOfTotal = totalDebt > 0 ? (debt.amount / totalDebt) * 100 : 0
                                    const isDeleting = deletingDebtId === debt.id

                                    return (
                                        <tr key={debt.id} className="border-t border-white/10">
                                            <td className="px-6 py-4 text-center text-white/85">{formatDebtTypeLabel(debt.debtType)}</td>
                                            <td className="px-6 py-4 text-center font-semibold text-white">{debt.debtName}</td>
                                            <td className="px-6 py-4 text-center text-white/85">{hideValues ? "****" : `£${debt.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</td>
                                            <td className="px-6 py-4 text-center text-amber-300">{shareOfTotal.toFixed(1)}%</td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => setEditingDebtId(debt.id)}
                                                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/85 hover:bg-white/10"
                                                >
                                                    <Edit3 className="h-3.5 w-3.5" />
                                                    Edit
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => void handleDeleteFromTable(debt.id)}
                                                    disabled={isDeleting}
                                                    className="inline-flex h-9 items-center gap-1 rounded-lg bg-rose-500/15 px-2.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/25 disabled:opacity-60"
                                                >
                                                    {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isAddDebtOpen ? (
                <AddDebtModal
                    onClose={() => setIsAddDebtOpen(false)}
                    onSubmit={addDebt}
                />
            ) : null}

            {editingDebt ? (
                <EditDebtModal
                    onClose={() => setEditingDebtId(null)}
                    entry={editingDebt}
                    onSubmit={updateDebt}
                />
            ) : null}

            <ConfirmActionModal
                isOpen={Boolean(confirmDeleteDebtId)}
                onClose={() => setConfirmDeleteDebtId(null)}
                title="Delete debt entry"
                message={`Are you sure you want to delete "${debts.find((d) => d.id === confirmDeleteDebtId)?.debtName ?? 'this debt entry'}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDeleteDebt}
                isProcessing={Boolean(deletingDebtId)}
            />
        </div>
    )
}
