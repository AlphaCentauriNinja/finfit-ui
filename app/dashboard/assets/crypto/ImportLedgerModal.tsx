'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Upload, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type ImportLedgerModalProps = {
    isOpen: boolean
    onClose: () => void
}

type AggregatedCoin = {
    ticker: string
    name: string
    amount: number
    usd: number
    investedGbp: number
}

// Map common tickers to full names
const TICKER_TO_NAME: Record<string, string> = {
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    XRP: 'XRP',
    ADA: 'Cardano',
    SOL: 'Solana',
    ALGO: 'Algorand',
    DOT: 'Polkadot',
    DOGE: 'Dogecoin',
    LTC: 'Litecoin',
    MATIC: 'Polygon',
    USDT: 'Tetherus',
    USDC: 'USD Coin',
}

export function ImportLedgerModal({ isOpen, onClose }: ImportLedgerModalProps) {
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successCount, setSuccessCount] = useState<number | null>(null)
    const router = useRouter()

    if (!isOpen) return null

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsSaving(true)
        setError(null)
        setSuccessCount(null)

        const reader = new FileReader()
        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string
                if (!text) throw new Error('Failed to read file')

                await processCsv(text)
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Error processing CSV file.')
                setIsSaving(false)
            }
        }
        reader.onerror = () => {
            setError('Error reading file.')
            setIsSaving(false)
        }
        reader.readAsText(file)
    }

    const processCsv = async (csvText: string) => {
        const lines = csvText.split('\n').map((line) => line.trim()).filter((line) => line.length > 0)

        if (lines.length < 2) {
            throw new Error('CSV file is empty or missing data.')
        }

        const headerLine = lines[0].toLowerCase()
        if (
            !headerLine.includes('operation date') ||
            !headerLine.includes('currency ticker') ||
            !headerLine.includes('operation type') ||
            !headerLine.includes('operation amount')
        ) {
            throw new Error('Invalid CSV format. ONLY Ledger.com CSV format is supported.')
        }

        const aggregated: Record<string, AggregatedCoin> = {}

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i]
            // Note: Ledger CSV uses plain comma separators generally, but simple splitting suffices
            const columns = line.split(',')
            if (columns.length < 11) continue

            const status = columns[1].trim().toUpperCase()
            if (status !== 'CONFIRMED') continue

            const ticker = columns[2].trim().toUpperCase()
            const type = columns[3].trim().toUpperCase()
            const opAmount = parseFloat(columns[4]) || 0
            const opFiatStr = columns[10]?.trim()
            const opFiat = opFiatStr ? parseFloat(opFiatStr) || 0 : 0

            if (!aggregated[ticker]) {
                aggregated[ticker] = {
                    ticker,
                    name: TICKER_TO_NAME[ticker] || ticker,
                    amount: 0,
                    usd: 0, // We cannot deduce the current live USD from Ledger export, we set to 0. It auto updates based on ticker matching later in the UI.
                    investedGbp: 0,
                }
            }

            if (type === 'IN') {
                aggregated[ticker].amount += opAmount
                aggregated[ticker].investedGbp += opFiat
            } else if (type === 'OUT' || type === 'FEES' || type === 'DELEGATE' || type === 'UNDELEGATE') {
                aggregated[ticker].amount -= opAmount
                if (type === 'OUT') {
                    aggregated[ticker].investedGbp -= opFiat
                }
            }
        }

        const results = Object.values(aggregated).filter((coin) => coin.amount > 0)

        if (results.length === 0) {
            throw new Error('No valid confirmed holdings found in the CSV.')
        }

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated.')

        for (const coin of results) {
            // Upsert the data conceptually, or just delete all existing for these tickers and re-insert
            // Since there is no unique constraint on ticker right now, let's just delete existing matching tickers for this user and then insert.
            await supabase
                .from('crypto_assets')
                .delete()
                .eq('user_id', user.id)
                .eq('ticker', coin.ticker)

            const { error: insertError } = await supabase.from('crypto_assets').insert({
                user_id: user.id,
                ticker: coin.ticker,
                name: coin.name,
                amount: coin.amount,
                usd: 0,
                invested_gbp: coin.investedGbp > 0 ? coin.investedGbp : 0,
            })

            if (insertError) {
                console.error('Insert error', insertError)
                throw new Error(`Failed to insert data for ${coin.ticker}`)
            }
        }

        setSuccessCount(results.length)
        setIsSaving(false)
        router.refresh()
    }

    const resetAndClose = () => {
        setError(null)
        setIsSaving(false)
        setSuccessCount(null)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={resetAndClose} />
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <h3 className="text-lg font-bold text-white">Import Ledger Data</h3>
                    <button onClick={resetAndClose} className="p-1 text-white/60 hover:text-white" disabled={isSaving}>
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-6 rounded-lg bg-amber-500/10 p-4 border border-amber-500/20 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-200">
                            <p className="font-semibold mb-1">ONLY Ledger.com CSV format is supported.</p>
                            <p className="opacity-80">
                                Please export your transaction history from Ledger Live web or app and upload the raw CSV file here.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-lg bg-red-500/10 p-4 border border-red-500/20 text-sm text-red-200">
                            {error}
                        </div>
                    )}

                    {successCount !== null ? (
                        <div className="text-center py-6">
                            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                                <Upload className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h4 className="text-lg font-semibold text-white mb-2">Import Successful!</h4>
                            <p className="text-sm text-white/60 mb-6">Successfully imported {successCount} assets from Ledger.</p>
                            <button
                                onClick={resetAndClose}
                                className="w-full inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative w-full">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    disabled={isSaving}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                />
                                <div className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-colors ${
                                    isSaving ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/20 hover:border-indigo-500/50 hover:bg-white/5'
                                }`}>
                                    {isSaving ? (
                                        <div className="flex flex-col items-center">
                                            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
                                            <p className="text-sm font-medium text-indigo-400">Processing CSV...</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <Upload className="w-8 h-8 text-white/60 mb-3" />
                                            <p className="text-sm font-medium text-white/80">Click or drag CSV file here</p>
                                            <p className="text-xs text-white/40 mt-1">Maximum size 5MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
