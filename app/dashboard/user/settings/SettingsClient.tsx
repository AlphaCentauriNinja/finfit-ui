'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    AlertTriangle,
    Calendar,
    CheckCircle2,
    KeyRound,
    Landmark,
    Link2,
    Lock,
    Mail,
    MapPin,
    Plus,
    Save,
    Shield,
    Smartphone,
    Trash2,
    User,
    Wallet,
    XCircle,
} from 'lucide-react'
import DatePickerField from '@/app/dashboard/components/DatePickerField'

export type CurrencyCode = 'GBP' | 'EUR' | 'USD' | 'CHF' | 'CAD'

type SettingsTab = 'personal' | 'financials' | 'security' | 'danger'

type TabItem = {
    key: SettingsTab
    label: string
    icon: typeof User
}

export type SettingsUserInfo = {
    fullName: string
    email: string
    phone: string
    dateOfBirth: string
    country: string
    city: string
    preferredCurrency: CurrencyCode
}

export type OpenBankingConnection = {
    id: string
    providerName: string
    accountLabel: string
    connectionStatus: string
    lastSyncedAt: string | null
}

export type ApiIntegration = {
    id: string
    providerName: string
    accountLabel: string
    keyLabel: string
    isActive: boolean
    lastSyncedAt: string | null
}

type Props = {
    userInfo: SettingsUserInfo
    openBankingConnections: OpenBankingConnection[]
    apiIntegrations: ApiIntegration[]
    missingTables: string[]
}

type Feedback = {
    type: 'success' | 'error'
    message: string
}

const tabs: TabItem[] = [
    { key: 'personal', label: 'Personal Info', icon: User },
    { key: 'financials', label: 'Financials', icon: Wallet },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'danger', label: 'Delete Account', icon: AlertTriangle },
]

const cardClass = 'rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5 md:p-6'
const labelClass = 'text-xs uppercase tracking-wide text-white/50 font-semibold'
const inputClass = 'w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-indigo-500/50'
const secondaryButtonClass = 'inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/10 transition-colors'
const primaryButtonClass = 'inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors'

function Field({
    label,
    name,
    defaultValue,
    placeholder,
    type = 'text',
    readOnly = false,
}: {
    label: string
    name: string
    defaultValue?: string
    placeholder?: string
    type?: string
    readOnly?: boolean
}) {
    return (
        <div className="space-y-2">
            <label className={labelClass}>{label}</label>
            <input
                name={name}
                type={type}
                defaultValue={defaultValue}
                placeholder={placeholder}
                readOnly={readOnly}
                className={`${inputClass} ${readOnly ? 'cursor-not-allowed opacity-75' : ''}`}
            />
        </div>
    )
}

function formatSyncedAt(value: string | null): string {
    if (!value) return 'Never'

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return 'Unknown'

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(parsed)
}

function getConnectionBadge(status: string): string {
    const normalized = status.toLowerCase()

    if (normalized === 'connected') {
        return 'rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300'
    }

    if (normalized === 'error') {
        return 'rounded-full bg-rose-500/20 px-2.5 py-1 text-xs font-semibold text-rose-300'
    }

    if (normalized === 'revoked') {
        return 'rounded-full bg-slate-500/30 px-2.5 py-1 text-xs font-semibold text-slate-200'
    }

    return 'rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-300'
}

function getValue(formData: FormData, key: string): string {
    const value = formData.get(key)
    return typeof value === 'string' ? value.trim() : ''
}

async function postSettingsAction(payload: Record<string, unknown>): Promise<void> {
    const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })

    const body = await response.json().catch(() => ({}))

    if (!response.ok) {
        throw new Error(typeof body.error === 'string' ? body.error : 'Unable to save settings.')
    }
}

export default function SettingsClient({
    userInfo,
    openBankingConnections,
    apiIntegrations,
    missingTables,
}: Props) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<SettingsTab>('personal')
    const [feedback, setFeedback] = useState<Feedback | null>(null)
    const [isSavingPersonal, setIsSavingPersonal] = useState(false)
    const [isSavingCurrency, setIsSavingCurrency] = useState(false)
    const [isSavingBankConnection, setIsSavingBankConnection] = useState(false)
    const [isSavingApiKey, setIsSavingApiKey] = useState(false)
    const [isSavingPassword, setIsSavingPassword] = useState(false)
    const [dateOfBirth, setDateOfBirth] = useState(userInfo.dateOfBirth)

    useEffect(() => {
        if (!feedback) return

        const timeout = window.setTimeout(() => {
            setFeedback(null)
        }, 3000)

        return () => {
            window.clearTimeout(timeout)
        }
    }, [feedback])

    useEffect(() => {
        setDateOfBirth(userInfo.dateOfBirth)
    }, [userInfo.dateOfBirth])

    const shownBankConnections =
        openBankingConnections.length > 0
            ? openBankingConnections
            : [
                {
                    id: 'placeholder-primary',
                    providerName: 'Open Banking Provider',
                    accountLabel: 'Primary Current Account',
                    connectionStatus: 'pending',
                    lastSyncedAt: null,
                },
                {
                    id: 'placeholder-savings',
                    providerName: 'Open Banking Provider',
                    accountLabel: 'Savings Account',
                    connectionStatus: 'pending',
                    lastSyncedAt: null,
                },
            ]

    const missingTablesMessage =
        missingTables.length > 0
            ? `Some Financials tables are not available yet in Supabase: ${missingTables.join(', ')}. Apply the suggested migration to enable full data loading.`
            : null

    const activeToast: Feedback | null = feedback || (
        missingTablesMessage
            ? { type: 'error', message: missingTablesMessage }
            : null
    )

    const refreshWithSuccess = (message: string) => {
        setFeedback({ type: 'success', message })
        router.refresh()
    }

    const handlePersonalSave = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const fullName = getValue(formData, 'full_name')
        const phone = getValue(formData, 'phone')
        const selectedCountry = getValue(formData, 'country')
        const selectedCity = getValue(formData, 'city')

        if (!fullName) {
            setFeedback({ type: 'error', message: 'Full name is required.' })
            return
        }

        if (!selectedCountry || !selectedCity) {
            setFeedback({ type: 'error', message: 'Country and city are required.' })
            return
        }

        setIsSavingPersonal(true)
        setFeedback(null)

        try {
            await postSettingsAction({
                action: 'upsert_personal',
                fullName,
                phone,
                dateOfBirth,
                country: selectedCountry,
                city: selectedCity,
            })
            refreshWithSuccess('Personal information saved.')
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error instanceof Error ? error.message : 'Unable to save personal information.',
            })
        } finally {
            setIsSavingPersonal(false)
        }
    }

    const handleCurrencySave = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const preferredCurrency = getValue(formData, 'preferred_currency')

        setIsSavingCurrency(true)
        setFeedback(null)

        try {
            await postSettingsAction({
                action: 'set_currency',
                preferredCurrency,
            })
            refreshWithSuccess('Currency preference saved.')
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error instanceof Error ? error.message : 'Unable to save currency.',
            })
        } finally {
            setIsSavingCurrency(false)
        }
    }

    const handleOpenBankingAdd = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const providerName = getValue(formData, 'provider_name')
        const accountLabel = getValue(formData, 'account_label')

        if (!providerName) {
            setFeedback({ type: 'error', message: 'Provider name is required.' })
            return
        }

        setIsSavingBankConnection(true)
        setFeedback(null)

        try {
            await postSettingsAction({
                action: 'add_open_banking_connection',
                providerName,
                accountLabel,
            })
            refreshWithSuccess('Open Banking connection saved.')
            event.currentTarget.reset()
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error instanceof Error ? error.message : 'Unable to add Open Banking connection.',
            })
        } finally {
            setIsSavingBankConnection(false)
        }
    }

    const handleApiKeySave = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const providerName = getValue(formData, 'provider_name')
        const keyLabel = getValue(formData, 'key_label') || 'default'
        const accountLabel = getValue(formData, 'account_label')
        const apiKey = getValue(formData, 'api_key')
        const apiSecret = getValue(formData, 'api_secret')

        if (!providerName || !apiKey) {
            setFeedback({ type: 'error', message: 'Provider and API key are required.' })
            return
        }

        setIsSavingApiKey(true)
        setFeedback(null)

        try {
            await postSettingsAction({
                action: 'upsert_api_integration',
                providerName,
                keyLabel,
                accountLabel,
                apiKey,
                apiSecret,
            })
            refreshWithSuccess('API integration saved.')
            event.currentTarget.reset()
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error instanceof Error ? error.message : 'Unable to save API integration.',
            })
        } finally {
            setIsSavingApiKey(false)
        }
    }

    const handlePasswordUpdate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const currentPassword = getValue(formData, 'current_password')
        const newPassword = getValue(formData, 'new_password')
        const confirmPassword = getValue(formData, 'confirm_password')

        if (!newPassword || !confirmPassword) {
            setFeedback({ type: 'error', message: 'Please fill in the password fields.' })
            return
        }

        if (newPassword !== confirmPassword) {
            setFeedback({ type: 'error', message: 'New password and confirmation must match.' })
            return
        }

        setIsSavingPassword(true)
        setFeedback(null)

        try {
            await postSettingsAction({
                action: 'update_password',
                currentPassword,
                newPassword,
                confirmPassword,
            })
            setFeedback({ type: 'success', message: 'Password updated successfully.' })
            event.currentTarget.reset()
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error instanceof Error ? error.message : 'Unable to update password.',
            })
        } finally {
            setIsSavingPassword(false)
        }
    }

    return (
        <div className="w-full space-y-6">
            {activeToast ? (
                <div className="w-full pb-8">
                    <div className={`w-full rounded-2xl border px-4 py-3 text-sm shadow-xl backdrop-blur ${activeToast.type === 'success'
                        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-100'
                        : 'border-rose-500/40 bg-rose-500/15 text-rose-100'}`}>
                        {activeToast.message}
                    </div>
                </div>
            ) : null}

            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:p-8 backdrop-blur-sm">
                <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex flex-col items-center gap-6 text-center xl:flex-row xl:items-start xl:text-left">
                        <div className="h-28 w-28 rounded-2xl border border-indigo-400/30 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 p-1">
                            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950">
                                <User className="h-12 w-12 text-white/65" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <h1 className="text-3xl font-bold text-white">{userInfo.fullName}</h1>
                                <p className="text-white/60">FinFit account settings</p>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-2 xl:justify-start">
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Verified
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-200">
                                    <Shield className="h-3.5 w-3.5" />
                                    2FA enabled
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/65 xl:justify-start">
                                <span className="inline-flex items-center gap-1.5"><Mail className="h-4 w-4" /> {userInfo.email}</span>
                                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> London, UK</span>
                                <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Member since 2024</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <nav className="rounded-2xl border border-white/10 bg-white/[0.03] p-2 backdrop-blur-sm">
                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = tab.key === activeTab

                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                                    isActive
                                        ? 'border border-indigo-400/40 bg-indigo-500/25 text-white'
                                        : 'border border-transparent text-white/65 hover:bg-white/8 hover:text-white'
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>
            </nav>

            {activeTab === 'personal' && (
                <section className="grid grid-cols-1 gap-4">
                    <div className={`${cardClass} max-w-3xl`}>
                        <h2 className="mb-5 text-xl font-bold text-white">Basic Information</h2>
                        <form onSubmit={handlePersonalSave} className="space-y-4">
                            <Field name="full_name" label="Full name" defaultValue={userInfo.fullName} placeholder="Full name" />
                            <Field name="email" label="Email" defaultValue={userInfo.email} placeholder="Email" type="email" readOnly />
                            <Field name="phone" label="Phone" defaultValue={userInfo.phone} placeholder="Phone" />
                            <Field name="country" label="Country" defaultValue={userInfo.country} placeholder="Country" />
                            <Field name="city" label="City" defaultValue={userInfo.city} placeholder="City" />
                            <DatePickerField
                                label="Date of birth"
                                value={dateOfBirth}
                                onChange={setDateOfBirth}
                                disabled={isSavingPersonal}
                            />
                            <button type="submit" disabled={isSavingPersonal} className={`${primaryButtonClass} w-full disabled:cursor-not-allowed disabled:opacity-60`}>
                                <Save className="h-4 w-4" /> {isSavingPersonal ? 'Saving...' : 'Save changes'}
                            </button>
                        </form>
                    </div>
                </section>
            )}

            {activeTab === 'financials' && (
                <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <div className={cardClass}>
                        <h2 className="mb-5 text-xl font-bold text-white">Currency Preferences</h2>
                        <form onSubmit={handleCurrencySave} className="space-y-4">
                            <div className="space-y-2">
                                <label className={labelClass}>Default currency</label>
                                <select name="preferred_currency" className={inputClass} defaultValue={userInfo.preferredCurrency}>
                                    <option value="GBP">GBP - British Pound</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="CHF">CHF - Swiss Franc</option>
                                    <option value="CAD">CAD - Canadian Dollar</option>
                                </select>
                            </div>
                            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-sm text-indigo-100">
                                Your selected currency is loaded from Supabase and drives valuations, totals, and performance reporting.
                            </div>
                            <button type="submit" disabled={isSavingCurrency} className={`${primaryButtonClass} w-full disabled:cursor-not-allowed disabled:opacity-60`}>
                                <Save className="h-4 w-4" /> {isSavingCurrency ? 'Saving...' : 'Save currency'}
                            </button>
                        </form>
                    </div>

                    <div className={cardClass}>
                        <h2 className="mb-5 inline-flex items-center gap-2 text-xl font-bold text-white">
                            <Landmark className="h-5 w-5 text-cyan-300" />
                            Open Banking
                        </h2>
                        <div className="space-y-4">
                            <p className="text-sm text-white/70">
                                Connect bank accounts securely via Open Banking to import balances and transactions automatically.
                            </p>
                            <div className="space-y-2">
                                {shownBankConnections.map((connection) => (
                                    <div key={connection.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/70 p-3">
                                        <div>
                                            <p className="font-medium text-white">{connection.accountLabel}</p>
                                            <p className="text-xs text-white/55">
                                                {connection.providerName} - Last sync: {formatSyncedAt(connection.lastSyncedAt)}
                                            </p>
                                        </div>
                                        <span className={getConnectionBadge(connection.connectionStatus)}>{connection.connectionStatus}</span>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleOpenBankingAdd} className="space-y-3">
                                <Field name="provider_name" label="Provider" placeholder="e.g. TrueLayer" />
                                <Field name="account_label" label="Account label" placeholder="e.g. Main Current Account" />
                                <button type="submit" disabled={isSavingBankConnection} className={`${primaryButtonClass} w-full disabled:cursor-not-allowed disabled:opacity-60`}>
                                    <Plus className="h-4 w-4" /> {isSavingBankConnection ? 'Saving...' : 'Add Open Banking connection'}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className={`${cardClass} xl:col-span-2`}>
                        <h2 className="mb-5 inline-flex items-center gap-2 text-xl font-bold text-white">
                            <KeyRound className="h-5 w-5 text-amber-300" />
                            API Keys & Data Imports
                        </h2>
                        <form onSubmit={handleApiKeySave} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className={labelClass}>Provider</label>
                                    <select name="provider_name" className={inputClass} defaultValue="Trading212">
                                        <option value="Trading212">Trading212</option>
                                        <option value="Coinbase">Coinbase</option>
                                        <option value="InteractiveBrokers">Interactive Brokers</option>
                                    </select>
                                </div>
                                <Field name="key_label" label="Key label" placeholder="default" />
                                <div className="md:col-span-2">
                                    <Field name="account_label" label="Account identifier (optional)" placeholder="e.g. Main Portfolio" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className={labelClass}>API key</label>
                                    <input name="api_key" type="password" placeholder="Paste your API key" className={inputClass} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className={labelClass}>API secret (if required)</label>
                                    <input name="api_secret" type="password" placeholder="Paste your API secret" className={inputClass} />
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <button type="submit" disabled={isSavingApiKey} className={`${primaryButtonClass} disabled:cursor-not-allowed disabled:opacity-60`}>
                                    <Save className="h-4 w-4" /> {isSavingApiKey ? 'Saving...' : 'Save API credentials'}
                                </button>
                                <button type="button" className={secondaryButtonClass}><Link2 className="h-4 w-4" /> Test connection</button>
                            </div>
                        </form>
                        <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/60 p-4">
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/60">Connected Sources (from Supabase)</h3>
                            <div className="flex flex-col gap-2">
                                {apiIntegrations.length > 0 ? (
                                    apiIntegrations.map((integration) => (
                                        <div key={integration.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                                            <div>
                                                <p className="text-sm font-medium text-white">{integration.providerName}</p>
                                                <p className="text-xs text-white/55">
                                                    {integration.accountLabel || integration.keyLabel} - Last sync: {formatSyncedAt(integration.lastSyncedAt)}
                                                </p>
                                            </div>
                                            <span className={integration.isActive
                                                ? 'rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300'
                                                : 'rounded-full bg-slate-500/30 px-2.5 py-1 text-xs font-semibold text-slate-200'}>
                                                {integration.isActive ? 'Active' : 'Disabled'}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                                        <div>
                                            <p className="text-sm font-medium text-white">Trading212</p>
                                            <p className="text-xs text-white/55">Last sync: Never</p>
                                        </div>
                                        <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-300">Pending setup</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {activeTab === 'security' && (
                <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <div className={cardClass}>
                        <h2 className="mb-5 text-xl font-bold text-white">Change Password</h2>
                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                            <Field name="current_password" label="Current password" placeholder="Current password" type="password" />
                            <Field name="new_password" label="New password" placeholder="New password" type="password" />
                            <Field name="confirm_password" label="Confirm new password" placeholder="Confirm password" type="password" />
                            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                                Password must be 8+ characters and include upper/lowercase, number, and symbol.
                            </div>
                            <button type="submit" disabled={isSavingPassword} className={`${primaryButtonClass} w-full disabled:cursor-not-allowed disabled:opacity-60`}>
                                <Lock className="h-4 w-4" /> {isSavingPassword ? 'Updating...' : 'Update password'}
                            </button>
                        </form>
                    </div>

                    <div className={cardClass}>
                        <h2 className="mb-5 text-xl font-bold text-white">Two-Factor Authentication</h2>
                        <div className="space-y-4">
                            <div className="flex items-start justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                                <div>
                                    <p className="font-semibold text-white">2FA enabled</p>
                                    <p className="text-sm text-white/65">Authenticator app linked.</p>
                                </div>
                                <input type="checkbox" defaultChecked className="mt-1 h-5 w-5 accent-emerald-500" />
                            </div>
                            <button className={`${secondaryButtonClass} w-full`}><Smartphone className="h-4 w-4" /> Configure authenticator app</button>
                            <button className={`${secondaryButtonClass} w-full`}><Shield className="h-4 w-4" /> View backup codes</button>
                        </div>
                    </div>
                </section>
            )}

            {activeTab === 'danger' && (
                <section className="space-y-4">
                    <div className="rounded-2xl border border-rose-500/35 bg-rose-500/8 p-5 md:p-6">
                        <div className="mb-6 flex items-start gap-3">
                            <div className="rounded-xl bg-rose-500/20 p-2.5 text-rose-300">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-rose-300">Delete Account</h2>
                                <p className="text-sm text-rose-100/70">These actions are irreversible. Proceed carefully.</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="rounded-xl border border-rose-500/35 bg-rose-500/10 p-4">
                                <h3 className="text-lg font-semibold text-white">Deactivate account</h3>
                                <p className="mt-1 text-sm text-white/70">Temporarily disable your account. You can reactivate by logging in.</p>
                                <button className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15">
                                    <XCircle className="h-4 w-4" /> Deactivate
                                </button>
                            </div>

                            <div className="rounded-xl border border-rose-500/45 bg-rose-500/12 p-4">
                                <h3 className="text-lg font-semibold text-white">Delete account permanently</h3>
                                <p className="mt-1 text-sm text-white/70">All account data, history, and preferences will be permanently removed.</p>
                                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-white/70">
                                    <li>All transaction history is deleted.</li>
                                    <li>Connected apps are unlinked.</li>
                                    <li>This action cannot be undone.</li>
                                </ul>
                                <button className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-300/40 bg-rose-500/30 px-4 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-500/40">
                                    <Trash2 className="h-4 w-4" /> Delete permanently
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}
