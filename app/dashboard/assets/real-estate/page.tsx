/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Home, Plus, Building2, Landmark } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { usePrivacy } from '@/app/dashboard/components/providers/PrivacyProvider'
import EmptyStateAlert from '@/app/dashboard/components/EmptyStateAlert'
import AssetOnboardingHero from '@/app/dashboard/components/AssetOnboardingHero'
import RealEstatePropertyCard from './RealEstatePropertyCard'

type PropertyRow = {
    id: string
    name: string
    address: string | null
    estimated_value: number | null
    current_value: number | null
    market_value: number | null
    mortgage_balance: number | null
}

function formatCurrency(value: number, hide: boolean) {
    if (hide) return '****'
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value)
}

export default function RealEstatePage() {
    const { hideValues } = usePrivacy()
    const [properties, setProperties] = useState<PropertyRow[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [form, setForm] = useState({ name: '', address: '', value: '', mortgage: '' })

    const loadData = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setError('Please sign in to view properties.')
            setIsLoading(false)
            return
        }
        const { data, error: fetchError } = await supabase
            .from('real_estate_properties')
            .select('id, name, address, estimated_value, current_value, market_value, mortgage_balance')
            .order('created_at', { ascending: true })

        if (fetchError) setError(fetchError.message)
        setProperties((data ?? []) as PropertyRow[])
        setIsLoading(false)
    }, [])

    useEffect(() => {
         
         
        void loadData()
    }, [loadData])

    // Real-time sync
    useEffect(() => {
        const supabase = createClient()
        const channel = supabase
            .channel('real-estate-live-sync')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'real_estate_properties' },
                () => {  
         
        void loadData() }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'real_estate_transactions' },
                () => {  
         
        void loadData() }
            )
            .subscribe()

        return () => {
            void supabase.removeChannel(channel)
        }
    }, [loadData])

    const totals = useMemo(() => {
        const value = properties.reduce((sum, p) => sum + (p.current_value ?? p.estimated_value ?? p.market_value ?? 0), 0)
        const mortgage = properties.reduce((sum, p) => sum + (p.mortgage_balance ?? 0), 0)
        const equity = value - mortgage
        return { value, mortgage, equity }
    }, [properties])

    const handleSave = async () => {
        setError(null)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setError('Please sign in first.')
            return
        }
        const parsedValue = Number(form.value)
        const parsedMortgage = form.mortgage ? Number(form.mortgage) : null
        if (!form.name.trim() || !Number.isFinite(parsedValue)) {
            setError('Name and value are required.')
            return
        }
        const { data, error: insertError } = await supabase
            .from('real_estate_properties')
            .insert({
                user_id: user.id,
                name: form.name.trim(),
                address: form.address.trim() || null,
                current_value: parsedValue,
                estimated_value: parsedValue,
                mortgage_balance: parsedMortgage,
            })
            .select('*')
            .single()

        if (insertError) {
            setError(insertError.message)
            return
        }

        setProperties((prev) => [...prev, data as PropertyRow])
        setForm({ name: '', address: '', value: '', mortgage: '' })
        setIsAddOpen(false)
    }

    return (
        <div className="w-full">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Real Estate</h1>
                    <p className="mt-1 text-sm text-white/65">
                        Track your properties, mortgages, and home equity.
                    </p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/25 transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add Property
                </button>
            </div>

            {isLoading ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white/60">Loading properties…</div>
            ) : error ? (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-200 text-sm">{error}</div>
            ) : properties.length === 0 ? (
                <div className="space-y-6">
                    <EmptyStateAlert
                        description="No properties tracked yet. Add your first home or investment property to monitor your equity."
                    />

                    <AssetOnboardingHero
                        title="Track Your Property Equity"
                        description="Monitor your real estate portfolio, manage mortgages, and track your growing equity as you pay down debt."
                        items={[
                            {
                                icon: Home,
                                title: "Residential & Investment",
                                description: "Track your main home or buy-to-let properties. Record valuations and location details for a complete overview.",
                                colorClass: "bg-indigo-500/10 border-indigo-500/20 text-indigo-300"
                            },
                            {
                                icon: Building2,
                                title: "Mortgage Tracking",
                                description: "Link mortgages to your properties to see your actual equity. Track interest rates, monthly payments, and term ends.",
                                colorClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            }
                        ]}
                        actionText="Add First Property"
                        onAction={() => setIsAddOpen(true)}
                    />
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-3 mb-6">
                        <div className="bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-white/50">House Value</p>
                            <p className="text-2xl font-bold text-white mt-2">{formatCurrency(totals.value, hideValues)}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Mortgage Remaining</p>
                            <p className="text-2xl font-bold text-rose-200 mt-2">{formatCurrency(totals.mortgage, hideValues)}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Current Equity</p>
                            <p className="text-2xl font-bold text-emerald-200 mt-2">{formatCurrency(totals.equity, hideValues)}</p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {properties.map((prop) => (
                            <RealEstatePropertyCard
                                key={prop.id}
                                property={prop}
                                totalPortfolioValue={totals.value}
                                onRefresh={loadData}
                            />
                        ))}
                    </div>
                </>
            )}

            {isAddOpen ? (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
                    <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl overflow-hidden">
                        <div className="flex items-center justify-between border-b border-white/10 p-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">Add Property</h3>
                                <p className="text-xs text-white/50">Store this property in your Supabase workspace.</p>
                            </div>
                            <button onClick={() => setIsAddOpen(false)} className="text-white/60 hover:text-white">✕</button>
                        </div>
                        <div className="p-4 space-y-3">
                            <div>
                                <label className="text-xs font-medium text-white/70">Name</label>
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                    className="mt-1 w-full h-11 rounded-xl border border-white/10 bg-slate-900 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    placeholder="e.g. Main Residence"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-white/70">Address (optional)</label>
                                <input
                                    value={form.address}
                                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                                    className="mt-1 w-full h-11 rounded-xl border border-white/10 bg-slate-900 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    placeholder="Street, City"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-white/70">Current Value (£)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={form.value}
                                        onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                                        className="mt-1 w-full h-11 rounded-xl border border-white/10 bg-slate-900 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-white/70">Mortgage Balance (£)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={form.mortgage}
                                        onChange={(e) => setForm((f) => ({ ...f, mortgage: e.target.value }))}
                                        className="mt-1 w-full h-11 rounded-xl border border-white/10 bg-slate-900 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        placeholder="0 (optional)"
                                    />
                                </div>
                            </div>
                            {error ? (
                                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                                    {error}
                                </div>
                            ) : null}
                        </div>
                        <div className="border-t border-white/10 p-4 flex gap-3">
                            <button
                                onClick={() => setIsAddOpen(false)}
                                className="flex-1 rounded-xl border border-white/15 bg-white/5 text-white/80 px-3 py-2 text-sm font-semibold hover:bg-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 rounded-xl bg-emerald-600 text-white px-3 py-2 text-sm font-semibold hover:bg-emerald-500"
                            >
                                Save Property
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    )
}
