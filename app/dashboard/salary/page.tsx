'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BriefcaseBusiness, CreditCard, Loader2, Pencil, Plus, ReceiptText, Trash2, Wallet, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useDashboardData } from '@/components/providers/DashboardDataProvider'

type BaseModalProps = {
    isOpen: boolean
    onClose: () => void
}

type EditSalaryModalProps = BaseModalProps & {
    initialEmployerName: string
    initialMonthlySalary: number
}

function EditSalaryModal({
    isOpen,
    onClose,
    initialEmployerName,
    initialMonthlySalary,
}: EditSalaryModalProps) {
    const [employerName, setEmployerName] = useState(initialEmployerName === 'Not set' ? '' : initialEmployerName)
    const [monthlySalary, setMonthlySalary] = useState(initialMonthlySalary > 0 ? String(initialMonthlySalary) : '')
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    if (!isOpen) return null

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setError(null)

        const cleanEmployer = employerName.trim()
        const parsedSalary = Number(monthlySalary)

        if (!cleanEmployer) {
            setError('Current employer is required.')
            return
        }

        if (!Number.isFinite(parsedSalary) || parsedSalary < 0) {
            setError('Monthly net salary must be a valid amount.')
            return
        }

        setIsSaving(true)

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            setError('Session not found. Please sign in again.')
            setIsSaving(false)
            return
        }

        const { error: upsertError } = await supabase
            .from('salary_profiles')
            .upsert(
                {
                    user_id: user.id,
                    employer_name: cleanEmployer,
                    monthly_net_salary: parsedSalary,
                },
                { onConflict: 'user_id' }
            )

        if (upsertError) {
            setError(upsertError.message)
            setIsSaving(false)
            return
        }

        setIsSaving(false)
        onClose()
        router.refresh()
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <h3 className="text-lg font-bold text-white">Edit Salary Details</h3>
                    <button onClick={onClose} className="p-1 text-white/60 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Current Employer</label>
                        <input
                            type="text"
                            value={employerName}
                            onChange={(event) => setEmployerName(event.target.value)}
                            required
                            disabled={isSaving}
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            placeholder="e.g. FinFit Ltd"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Monthly Net Salary (£)</label>
                        <input
                            type="number"
                            min="0"
                            step="any"
                            value={monthlySalary}
                            onChange={(event) => setMonthlySalary(event.target.value)}
                            required
                            disabled={isSaving}
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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
                            className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/5"
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

type AddExpenditureModalProps = BaseModalProps

function AddExpenditureModal({ isOpen, onClose }: AddExpenditureModalProps) {
    const [name, setName] = useState('')
    const [amount, setAmount] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    if (!isOpen) return null

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setError(null)

        const cleanName = name.trim()
        const parsedAmount = Number(amount)

        if (!cleanName) {
            setError('Expenditure name is required.')
            return
        }

        if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
            setError('Monthly amount must be a valid number.')
            return
        }

        setIsSaving(true)

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            setError('Session not found. Please sign in again.')
            setIsSaving(false)
            return
        }

        const { error: insertError } = await supabase
            .from('salary_expenditures')
            .insert({
                user_id: user.id,
                expenditure_name: cleanName,
                monthly_amount: parsedAmount,
            })

        if (insertError) {
            setError(insertError.message)
            setIsSaving(false)
            return
        }

        setIsSaving(false)
        onClose()
        router.refresh()
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <h3 className="text-lg font-bold text-white">Add Expenditure</h3>
                    <button onClick={onClose} className="p-1 text-white/60 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Expenditure Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                            disabled={isSaving}
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            placeholder="e.g. Mortgage"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Monthly Amount (£)</label>
                        <input
                            type="number"
                            min="0"
                            step="any"
                            value={amount}
                            onChange={(event) => setAmount(event.target.value)}
                            required
                            disabled={isSaving}
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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
                            className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {isSaving ? 'Adding...' : 'Add Expenditure'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

type EditExpenditureModalProps = BaseModalProps & {
    expenditureId: string
    initialName: string
    initialAmount: number
}

function EditExpenditureModal({
    isOpen,
    onClose,
    expenditureId,
    initialName,
    initialAmount,
}: EditExpenditureModalProps) {
    const [name, setName] = useState(initialName)
    const [amount, setAmount] = useState(String(initialAmount))
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    if (!isOpen) return null

    const handleSave = async (event: FormEvent) => {
        event.preventDefault()
        setError(null)

        const cleanName = name.trim()
        const parsedAmount = Number(amount)

        if (!cleanName) {
            setError('Expenditure name is required.')
            return
        }

        if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
            setError('Monthly amount must be a valid number.')
            return
        }

        setIsSaving(true)

        const { error: updateError } = await supabase
            .from('salary_expenditures')
            .update({
                expenditure_name: cleanName,
                monthly_amount: parsedAmount,
            })
            .eq('id', expenditureId)

        if (updateError) {
            setError(updateError.message)
            setIsSaving(false)
            return
        }

        setIsSaving(false)
        onClose()
        router.refresh()
    }

    const handleDelete = async () => {
        setError(null)
        setIsDeleting(true)

        const { error: deleteError } = await supabase
            .from('salary_expenditures')
            .delete()
            .eq('id', expenditureId)

        if (deleteError) {
            setError(deleteError.message)
            setIsDeleting(false)
            return
        }

        setIsDeleting(false)
        onClose()
        router.refresh()
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <h3 className="text-lg font-bold text-white">Edit Expenditure</h3>
                    <button onClick={onClose} className="p-1 text-white/60 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSave} className="space-y-4 p-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Expenditure Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                            disabled={isSaving || isDeleting}
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            placeholder="e.g. Mortgage"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Monthly Amount (£)</label>
                        <input
                            type="number"
                            min="0"
                            step="any"
                            value={amount}
                            onChange={(event) => setAmount(event.target.value)}
                            required
                            disabled={isSaving || isDeleting}
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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
                            onClick={handleDelete}
                            disabled={isSaving || isDeleting}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || isDeleting}
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

export default function SalaryPage() {
    const dashboardData = useDashboardData()
    const salaryData = dashboardData.salary
    const expenditures = useMemo(
        () => [...salaryData.expenditures].sort((a, b) => b.amount - a.amount),
        [salaryData.expenditures]
    )
    const [isEditSalaryOpen, setIsEditSalaryOpen] = useState(false)
    const [isAddExpenditureOpen, setIsAddExpenditureOpen] = useState(false)
    const [editingExpenditureId, setEditingExpenditureId] = useState<string | null>(null)

    const outgoingLabel = useMemo(
        () => `${salaryData.committedOutgoingRatio.toFixed(1)}% of net income`,
        [salaryData.committedOutgoingRatio]
    )

    return (
        <div className="w-full">
            <h1 className="mb-6 text-2xl font-bold text-white">Income & Outgoings</h1>

            <div className="mb-8 grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 shadow-sm backdrop-blur-sm">
                    <div className="mb-4 flex items-start justify-between gap-3">
                        <h3 className="text-sm font-medium text-emerald-300">Monthly Net Salary</h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsEditSalaryOpen(true)}
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-400/20"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </button>
                            <Wallet className="h-5 w-5 text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-emerald-400">
                        £{salaryData.profile.monthlyNetSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="mt-2 text-sm font-medium text-emerald-300/80">
                        £{salaryData.annualNetSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} annually
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200">
                        <BriefcaseBusiness className="h-3.5 w-3.5" />
                        Current employer: {salaryData.profile.employerName}
                    </div>
                </div>

                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 shadow-sm backdrop-blur-sm">
                    <div className="mb-4 flex items-start justify-between">
                        <h3 className="text-sm font-medium text-rose-300">Monthly Commited Outgoings</h3>
                        <CreditCard className="h-5 w-5 text-rose-400" />
                    </div>
                    <p className="text-4xl font-bold text-rose-400">
                        £{salaryData.totalExpenditure.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="mt-2 text-sm font-medium text-rose-300/80">{outgoingLabel}</p>
                    <p className="mt-2 text-xs text-rose-200/90">
                        Disposable income: £{salaryData.disposableIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-white/90">Core Expenses Breakdown</h2>
                <button
                    onClick={() => setIsAddExpenditureOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-indigo-400/30 bg-indigo-500/15 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/25"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add Expenditure
                </button>
            </div>

            {salaryData.loadError ? (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    HTTP 500: could not load salary
                </div>
            ) : null}

            {expenditures.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-white/65">
                    No expenditures added yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {expenditures.map((expenditure) => (
                        <div
                            key={expenditure.id}
                            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-5 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/10"
                        >
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
                                    <ReceiptText className="h-5 w-5 text-white/80" />
                                </div>
                                <div>
                                    <p className="font-bold text-white">{expenditure.name}</p>
                                    <p className="text-sm text-white/60">Monthly committed cost</p>
                                </div>
                            </div>
                            <p className="text-lg font-bold text-white">
                                £{expenditure.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <button
                                onClick={() => setEditingExpenditureId(expenditure.id)}
                                className="ml-4 inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/85 hover:bg-white/10"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {isEditSalaryOpen ? (
                <EditSalaryModal
                    isOpen={isEditSalaryOpen}
                    onClose={() => setIsEditSalaryOpen(false)}
                    initialEmployerName={salaryData.profile.employerName}
                    initialMonthlySalary={salaryData.profile.monthlyNetSalary}
                />
            ) : null}

            {isAddExpenditureOpen ? (
                <AddExpenditureModal
                    isOpen={isAddExpenditureOpen}
                    onClose={() => setIsAddExpenditureOpen(false)}
                />
            ) : null}

            {editingExpenditureId ? (
                <EditExpenditureModal
                    isOpen={Boolean(editingExpenditureId)}
                    onClose={() => setEditingExpenditureId(null)}
                    expenditureId={editingExpenditureId}
                    initialName={expenditures.find((item) => item.id === editingExpenditureId)?.name ?? ''}
                    initialAmount={expenditures.find((item) => item.id === editingExpenditureId)?.amount ?? 0}
                />
            ) : null}
        </div>
    )
}
