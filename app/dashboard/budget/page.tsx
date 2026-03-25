'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, BriefcaseBusiness, ChevronRight, CreditCard, Loader2, List, Pencil, Plus, Trash2, TrendingUp, Wallet, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useDashboardData } from '@/components/providers/DashboardDataProvider'
import { usePrivacy } from '@/app/dashboard/components/providers/PrivacyProvider'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'
import DeleteActionModal from '@/app/dashboard/components/DeleteActionModal'

type BaseModalProps = {
    isOpen: boolean
    onClose: () => void
}

const formatCurrencyWithPrivacy = (value: number, hideValues: boolean): string => {
    if (hideValues) return '****'
    return `£${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const formatPercentWithPrivacy = (value: number, hideValues: boolean): string => {
    if (hideValues) return '****'
    return `${value.toFixed(1)}%`
}

type ExpenditureDetailModalProps = BaseModalProps & {
    onEditExpenditure: (id: string) => void
}

function ExpenditureDetailModal({ isOpen, onClose, onEditExpenditure }: ExpenditureDetailModalProps) {
    const dashboardData = useDashboardData()
    const { hideValues } = usePrivacy()
    const budgetData = dashboardData.budget
    const expenditures = useMemo(
        () => [...budgetData.expenditures].sort((a, b) => b.amount - a.amount),
        [budgetData.expenditures]
    )

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <h3 className="text-lg font-bold text-white">Core Expenses Breakdown</h3>
                    <button onClick={onClose} className="p-1 text-white/60 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-6">
                    {expenditures.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-white/60">No expenditures added yet.</p>
                        </div>
                    ) : (
                        <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-sm backdrop-blur-sm">
                            <div className="w-full overflow-x-auto">
                                <table className="w-full min-w-full table-fixed text-sm">
                                    <thead className="bg-white/[0.03]">
                                        <tr className="text-white/60">
                                            <th className="px-6 py-3 text-left font-medium">Expenditure</th>
                                            <th className="px-6 py-3 text-right font-medium">Monthly Amount</th>
                                            <th className="px-6 py-3 text-right font-medium">% Of Income</th>
                                            <th className="px-6 py-3 text-center font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expenditures.map((expenditure) => {
                                            const percentageOfIncome = budgetData.profile.monthlyNetSalary > 0
                                                ? (expenditure.amount / budgetData.profile.monthlyNetSalary) * 100
                                                : 0

                                            return (
                                                <tr key={expenditure.id} className="border-t border-white/10">
                                                    <td className="px-6 py-4 font-semibold text-white">{expenditure.name}</td>
                                                    <td className="px-6 py-4 text-right text-white/85">
                                                        {formatCurrencyWithPrivacy(expenditure.amount, hideValues)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-green-300">
                                                        {formatPercentWithPrivacy(percentageOfIncome, hideValues)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => {
                                                                onClose()
                                                                onEditExpenditure(expenditure.id)
                                                            }}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/85 hover:bg-white/10"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                            Edit
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
                </div>
            </div>
        </div>
    )
}

type CapitalDetailModalProps = BaseModalProps & {
    onEditCapital: (id: string) => void
    onDeleteCapital: (id: string) => void
}

function CapitalDetailModal({ isOpen, onClose, onEditCapital, onDeleteCapital }: CapitalDetailModalProps) {
    const dashboardData = useDashboardData()
    const { hideValues } = usePrivacy()
    const budgetData = dashboardData.budget

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <h3 className="text-lg font-bold text-white">Saving and Investments</h3>
                    <button onClick={onClose} className="p-1 text-white/60 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-6">
                    {budgetData.capital.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-white/60">No capital expenditures added yet.</p>
                        </div>
                    ) : (
                        <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-sm backdrop-blur-sm">
                            <div className="w-full overflow-x-auto">
                                <table className="w-full min-w-full table-fixed text-sm">
                                    <thead className="bg-white/[0.03]">
                                        <tr className="text-white/60">
                                            <th className="px-6 py-3 text-left font-medium">Capital Item</th>
                                            <th className="px-6 py-3 text-right font-medium">Monthly Amount</th>
                                            <th className="px-6 py-3 text-right font-medium">% Of Income</th>
                                            <th className="px-6 py-3 text-center font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {budgetData.capital.map((capital) => {
                                            const percentageOfIncome = budgetData.profile.monthlyNetSalary > 0
                                                ? (capital.amount / budgetData.profile.monthlyNetSalary) * 100
                                                : 0

                                            return (
                                                <tr key={capital.id} className="border-t border-white/10">
                                                    <td className="px-6 py-4 font-semibold text-white">{capital.name}</td>
                                                    <td className="px-6 py-4 text-right text-white/85">
                                                        {formatCurrencyWithPrivacy(capital.amount, hideValues)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-amber-300">
                                                        {formatPercentWithPrivacy(percentageOfIncome, hideValues)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    onClose()
                                                                    onEditCapital(capital.id)
                                                                }}
                                                                className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/85 hover:bg-white/10"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    onClose()
                                                                    onDeleteCapital(capital.id)
                                                                }}
                                                                className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/20"
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

type EditBudgetModalProps = BaseModalProps & {
    initialEmployerName: string
    initialMonthlyIncome: number
}

function EditBudgetModal({
    isOpen,
    onClose,
    initialEmployerName,
    initialMonthlyIncome,
}: EditBudgetModalProps) {
    const [employerName, setEmployerName] = useState(initialEmployerName === 'Not set' ? '' : initialEmployerName)
    const [monthlyIncome, setMonthlyIncome] = useState(initialMonthlyIncome > 0 ? String(initialMonthlyIncome) : '')
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    if (!isOpen) return null

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setError(null)

        const cleanEmployer = employerName.trim()
        const parsedIncome = Number(monthlyIncome)

        if (!cleanEmployer) {
            setError('Current employer is required.')
            return
        }

        if (!Number.isFinite(parsedIncome) || parsedIncome < 0) {
            setError('Monthly net income must be a valid amount.')
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
            .from('budget_profiles')
            .upsert(
                {
                    user_id: user.id,
                    employer_name: cleanEmployer,
                    monthly_net_budget: parsedIncome,
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
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-green bg-[#0f172a] shadow-xl">
                <div className="flex items-center justify-between border-b border-green/10 p-6">
                    <h3 className="text-lg font-bold text-white">Edit Salary</h3>
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
                        <label className="text-sm font-medium text-white/80">Monthly Net Income (£)</label>
                        <input
                            type="number"
                            min="0"
                            step="any"
                            value={monthlyIncome}
                            onChange={(event) => setMonthlyIncome(event.target.value)}
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
                            className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
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

type AddCapitalModalProps = BaseModalProps

function AddCapitalModal({ isOpen, onClose }: AddCapitalModalProps) {
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
            setError('Capital name is required.')
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
            .from('salary_capital')
            .insert({
                user_id: user.id,
                capital_name: cleanName,
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
                    <h3 className="text-lg font-bold text-white">Add Capital</h3>
                    <button onClick={onClose} className="p-1 text-white/60 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Capital Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                            disabled={isSaving}
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            placeholder="e.g. Emergency Fund"
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
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
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
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-60"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {isSaving ? 'Adding...' : 'Add Capital'}
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
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
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
            setShowDeleteConfirm(false)
            return
        }

        setIsDeleting(false)
        setShowDeleteConfirm(false)
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
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={isSaving || isDeleting}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
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

            <DeleteActionModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Expenditure?"
                message="Are you sure you want to delete this expenditure? This action cannot be undone."
                confirmText="Delete"
                isProcessing={isDeleting}
            />
        </div>
    )
}

type EditCapitalModalProps = BaseModalProps & {
    capitalId: string
    initialName: string
    initialAmount: number
}

function EditCapitalModal({
    isOpen,
    onClose,
    capitalId,
    initialName,
    initialAmount,
}: EditCapitalModalProps) {
    const [name, setName] = useState(initialName)
    const [amount, setAmount] = useState(String(initialAmount))
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
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
            setError('Capital name is required.')
            return
        }

        if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
            setError('Monthly amount must be a valid number.')
            return
        }

        setIsSaving(true)

        const { error: updateError } = await supabase
            .from('salary_capital')
            .update({
                capital_name: cleanName,
                monthly_amount: parsedAmount,
            })
            .eq('id', capitalId)

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
            .from('salary_capital')
            .delete()
            .eq('id', capitalId)

        if (deleteError) {
            setError(deleteError.message)
            setIsDeleting(false)
            setShowDeleteConfirm(false)
            return
        }

        setIsDeleting(false)
        setShowDeleteConfirm(false)
        onClose()
        router.refresh()
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <h3 className="text-lg font-bold text-white">Edit Capital</h3>
                    <button onClick={onClose} className="p-1 text-white/60 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSave} className="space-y-4 p-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Capital Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                            disabled={isSaving || isDeleting}
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            placeholder="e.g. Emergency Fund"
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
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
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
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={isSaving || isDeleting}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || isDeleting}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-60"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            <DeleteActionModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Capital?"
                message="Are you sure you want to delete this capital item? This action cannot be undone."
                confirmText="Delete"
                isProcessing={isDeleting}
            />
        </div>
    )
}

type SalaryPieTooltipProps = {
    active?: boolean
    payload?: Array<{
        payload?: {
            fill?: string
            name?: string
            value?: number | string
        }
    }>
}

function BudgetPieTooltip({ active, payload }: SalaryPieTooltipProps) {
    const { hideValues } = usePrivacy()
    if (!active || !payload?.length) return null
    const data = payload[0]?.payload
    if (!data) return null
    return (
        <div className="rounded-lg border border-white/10 bg-[#0e1629] px-4 py-3 shadow-xl text-xs">
            <div className="flex items-center gap-2 py-0.5">
                <span
                    className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                    style={{ background: data.fill ?? '#94a3b8' }}
                />
                <span className="text-slate-400">{data.name ?? 'Value'}:</span>
                <span className="font-semibold tabular-nums text-white">
                    {hideValues
                        ? '****'
                        : `£${Number(data.value ?? 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}`}
                </span>
            </div>
        </div>
    )
}

export default function BudgetPage() {
    const dashboardData = useDashboardData()
    const { hideValues } = usePrivacy()
    const budgetData = dashboardData.budget
    const router = useRouter()
    const expenditures = useMemo(
        () => [...budgetData.expenditures].sort((a, b) => b.amount - a.amount),
        [budgetData.expenditures]
    )
    const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false)
    const [isAddExpenditureOpen, setIsAddExpenditureOpen] = useState(false)
    const [isAddCapitalOpen, setIsAddCapitalOpen] = useState(false)
    const [editingExpenditureId, setEditingExpenditureId] = useState<string | null>(null)
    const [isExpenditureDetailOpen, setIsExpenditureDetailOpen] = useState(false)
    const [isCapitalDetailOpen, setIsCapitalDetailOpen] = useState(false)
    const [editingCapitalId, setEditingCapitalId] = useState<string | null>(null)
    const [deletingCapitalId, setDeletingCapitalId] = useState<string | null>(null)
    const totalCapital = useMemo(
        () => budgetData.capital.reduce((sum, cap) => sum + cap.amount, 0),
        [budgetData.capital]
    )
    const coreExpensesRatio = useMemo(
        () => budgetData.profile.monthlyNetSalary > 0
            ? (budgetData.totalExpenditure / budgetData.profile.monthlyNetSalary) * 100
            : 0,
        [budgetData.totalExpenditure, budgetData.profile.monthlyNetSalary]
    )
    const capitalRatio = useMemo(
        () => budgetData.profile.monthlyNetSalary > 0
            ? (totalCapital / budgetData.profile.monthlyNetSalary) * 100
            : 0,
        [totalCapital, budgetData.profile.monthlyNetSalary]
    )
    const committedOutgoingsTotal = useMemo(
        () => budgetData.totalExpenditure + totalCapital,
        [budgetData.totalExpenditure, totalCapital]
    )

    const outgoingLabel = useMemo(
        () => hideValues ? '**** of net income' : `${budgetData.committedOutgoingRatio.toFixed(1)}% of net income`,
        [budgetData.committedOutgoingRatio, hideValues]
    )
    const budgetSplitData = useMemo(() => {
        const split = [
            { name: 'Committed Outgoings', value: Number(committedOutgoingsTotal) || 0, fill: '#6366f1' },
            { name: 'Disposable Income', value: Math.max(Number(budgetData.disposableIncome) || 0, 0), fill: '#fbbf24' },
        ]

        return split.filter((entry) => entry.value > 0)
    }, [budgetData.disposableIncome, committedOutgoingsTotal])

    const expenditureGraphData = useMemo(() => {
        const colors = [
            '#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
            '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
            '#6366f1', '#d946ef', '#eab308', '#ef4444', '#0ea5e9',
            '#22c55e', '#64748b', '#a855f7', '#fb923c', '#c084fc'
        ]
        return budgetData.expenditures.map((exp, index) => ({
            name: exp.name,
            value: exp.amount,
            fill: colors[index % colors.length]
        }))
    }, [budgetData.expenditures])

    const isOverspending = committedOutgoingsTotal > budgetData.profile.monthlyNetSalary

    const handleDeleteCapital = async () => {
        if (!deletingCapitalId) return

        const supabase = createClient()
        const { error } = await supabase
            .from('salary_capital')
            .delete()
            .eq('id', deletingCapitalId)

        if (error) {
            console.error('Error deleting capital:', error)
        } else {
            setDeletingCapitalId(null)
            router.refresh()
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Budget Tool</h1>
                    <p className="text-sm text-white/65 mt-1">
                        Track your income and committed outgoings
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsAddExpenditureOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-indigo-400/30 bg-indigo-500/15 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/25"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Expenditure
                    </button>
                    <button
                        onClick={() => setIsAddCapitalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/25"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Capital
                    </button>
                    <button
                        onClick={() => setIsEditBudgetOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit Salary
                    </button>
                </div>
            </div>

            {isOverspending && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-400" />
                    <p className="text-sm font-medium">
                        Your monthly committed outgoings exceed your monthly net income. Consider reviewing your expenses.
                    </p>
                </div>
            )}

            <div className="mb-8 grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 shadow-sm backdrop-blur-sm">
                    <div className="mb-4 flex items-start justify-between gap-3">
                        <h3 className="text-sm font-medium text-emerald-300">Monthly Net Income</h3>
                        <div className="flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-emerald-400">
                        {formatCurrencyWithPrivacy(budgetData.profile.monthlyNetSalary, hideValues)}
                    </p>
                    <p className="mt-2 text-sm font-medium text-emerald-300/80">
                        {hideValues ? '**** annually' : `£${budgetData.annualNetSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} annually`}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200">
                        <BriefcaseBusiness className="h-3.5 w-3.5" />
                        <span className="text-emerald-200">Current employer:</span>
                        <span className="text-white">{budgetData.profile.employerName}</span>
                    </div>
                </div>

                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 shadow-sm backdrop-blur-sm">
                    <div className="mb-4 flex items-start justify-between">
                        <h3 className="text-sm font-medium text-rose-300">Monthly Commited Outgoings</h3>
                        <CreditCard className="h-5 w-5 text-rose-400" />
                    </div>
                    <p className="text-4xl font-bold text-rose-400">
                        {formatCurrencyWithPrivacy(committedOutgoingsTotal, hideValues)}
                    </p>
                    <p className="mt-2 text-sm font-medium text-rose-300/80">{outgoingLabel}</p>
                    <p className="mt-2 text-xs text-rose-200/90">
                        {hideValues
                            ? 'Disposable income: ****'
                            : `Disposable income: £${budgetData.disposableIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </p>
                </div>
            </div>

            {budgetData.loadError ? (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    HTTP 500: could not load budget
                </div>
            ) : null}

            {!hideValues ? (
                <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-6 shadow-sm backdrop-blur-sm">
                        <div className="mb-2 flex items-start justify-between">
                            <h3 className="text-sm font-medium text-purple-300">Income Split</h3>
                        </div>

                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                {budgetSplitData.length > 0 ? (
                                    <PieChart>
                                        <Pie
                                            data={budgetSplitData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={75}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {budgetSplitData.map((entry, index) => (
                                                <Cell key={`budget-cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip content={<BudgetPieTooltip />} />
                                    </PieChart>
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs text-purple-100/70">
                                        No income split data
                                    </div>
                                )}
                            </ResponsiveContainer>
                        </div>

                    </div>

                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-6 shadow-sm backdrop-blur-sm">
                        <div className="mb-2 flex items-start justify-between">
                            <h3 className="text-sm font-medium text-cyan-300">Expenditure Breakdown</h3>
                        </div>

                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                {expenditureGraphData.length > 0 ? (
                                    <PieChart>
                                        <Pie
                                            data={expenditureGraphData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={75}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {expenditureGraphData.map((entry, index) => (
                                                <Cell key={`expenditure-cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip content={<BudgetPieTooltip />} />
                                    </PieChart>
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs text-cyan-100/70">
                                        No expenditure data
                                    </div>
                                )}
                            </ResponsiveContainer>
                        </div>

                    </div>
                </div>
            ) : (
                <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
                    Charts are hidden while values are hidden.
                </div>
            )}

            <div className="mt-8 grid gap-6 md:grid-cols-2">
                {/* Core Expenses Card */}
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 hover:bg-white/10 transition-colors flex flex-col h-full group/card">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="text-sm font-medium text-white/60">Core Expenses</h3>
                            <div className="mt-1 flex items-center gap-2">
                                <p className="text-2xl font-bold text-white">
                                    {formatCurrencyWithPrivacy(budgetData.totalExpenditure, hideValues)}
                                </p>
                                <span className="inline-flex items-center rounded-full border border-rose-400/30 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-200">
                                    {formatPercentWithPrivacy(coreExpensesRatio, hideValues)}
                                </span>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 font-bold border border-rose-500/20 group-hover/card:scale-110 transition-transform">
                            <CreditCard className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="w-full bg-white/5 rounded-full h-1.5 mt-4 mb-6">
                        <div
                            className="bg-rose-400 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: hideValues ? '0%' : `${budgetData.profile.monthlyNetSalary > 0 ? Math.min((budgetData.totalExpenditure / budgetData.profile.monthlyNetSalary) * 100, 100) : 0}%` }}
                        />
                    </div>

                    <div className="flex-1 space-y-4">
                        <button
                            onClick={() => setIsExpenditureDetailOpen(true)}
                            className="w-full text-left group/detail"
                        >
                            <div className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-rose-500/30 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/10 group-hover/detail:scale-110 transition-transform">
                                            <List className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Expenses</p>
                                            <p className="text-sm font-medium text-white mt-0.5">
                                                {expenditures.length} {expenditures.length === 1 ? 'Expense' : 'Expenses'}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-white/20 group-hover/detail:text-white/60 group-hover/detail:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </button>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setIsAddExpenditureOpen(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10 hover:text-white transition-colors"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add
                        </button>
                        <button
                            onClick={() => setIsExpenditureDetailOpen(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/20 hover:text-rose-100 transition-colors"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                            View All
                        </button>
                    </div>
                </div>

                {/* Saving and Investments Card */}
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 hover:bg-white/10 transition-colors flex flex-col h-full group/card">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="text-sm font-medium text-white/60">Saving & Investments</h3>
                            <div className="mt-1 flex items-center gap-2">
                                <p className="text-2xl font-bold text-white">
                                    {formatCurrencyWithPrivacy(totalCapital, hideValues)}
                                </p>
                                <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-200">
                                    {formatPercentWithPrivacy(capitalRatio, hideValues)}
                                </span>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold border border-amber-500/20 group-hover/card:scale-110 transition-transform">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="w-full bg-white/5 rounded-full h-1.5 mt-4 mb-6">
                        <div
                            className="bg-amber-400 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: hideValues ? '0%' : `${budgetData.profile.monthlyNetSalary > 0 ? Math.min((totalCapital / budgetData.profile.monthlyNetSalary) * 100, 100) : 0}%` }}
                        />
                    </div>

                    <div className="flex-1 space-y-4">
                        <button
                            onClick={() => setIsCapitalDetailOpen(true)}
                            className="w-full text-left group/detail"
                        >
                            <div className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/10 group-hover/detail:scale-110 transition-transform">
                                            <List className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Capital</p>
                                            <p className="text-sm font-medium text-white mt-0.5">
                                                {budgetData.capital.length} {budgetData.capital.length === 1 ? 'Item' : 'Items'} · Monthly capital
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-white/20 group-hover/detail:text-white/60 group-hover/detail:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </button>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setIsAddCapitalOpen(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10 hover:text-white transition-colors"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add
                        </button>
                        <button
                            onClick={() => setIsCapitalDetailOpen(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/20 hover:text-amber-100 transition-colors"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                            View All
                        </button>
                    </div>
                </div>
            </div>

            {isExpenditureDetailOpen ? (
                <ExpenditureDetailModal
                    isOpen={isExpenditureDetailOpen}
                    onClose={() => setIsExpenditureDetailOpen(false)}
                    onEditExpenditure={setEditingExpenditureId}
                />
            ) : null}

            {isCapitalDetailOpen ? (
                <CapitalDetailModal
                    isOpen={isCapitalDetailOpen}
                    onClose={() => setIsCapitalDetailOpen(false)}
                    onEditCapital={setEditingCapitalId}
                    onDeleteCapital={setDeletingCapitalId}
                />
            ) : null}

            {isEditBudgetOpen ? (
                <EditBudgetModal
                    isOpen={isEditBudgetOpen}
                    onClose={() => setIsEditBudgetOpen(false)}
                    initialEmployerName={budgetData.profile.employerName}
                    initialMonthlyIncome={budgetData.profile.monthlyNetSalary}
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

            {editingCapitalId ? (
                <EditCapitalModal
                    isOpen={Boolean(editingCapitalId)}
                    onClose={() => setEditingCapitalId(null)}
                    capitalId={editingCapitalId}
                    initialName={budgetData.capital.find((item) => item.id === editingCapitalId)?.name ?? ''}
                    initialAmount={budgetData.capital.find((item) => item.id === editingCapitalId)?.amount ?? 0}
                />
            ) : null}

            {deletingCapitalId ? (
                <DeleteActionModal
                    isOpen={Boolean(deletingCapitalId)}
                    onClose={() => setDeletingCapitalId(null)}
                    onConfirm={handleDeleteCapital}
                    title="Delete Capital Item?"
                    message={`Are you sure you want to delete "${budgetData.capital.find((item) => item.id === deletingCapitalId)?.name ?? 'this item'}"? This action cannot be undone.`}
                    confirmText="Delete"
                />
            ) : null}

            {isAddCapitalOpen ? (
                <AddCapitalModal
                    isOpen={isAddCapitalOpen}
                    onClose={() => setIsAddCapitalOpen(false)}
                />
            ) : null}
        </div>
    )
}
