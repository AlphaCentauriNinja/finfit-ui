'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { DashboardDataSnapshot } from '@/lib/dashboard-data'

import type { CurrencyCode } from '@/lib/crypto-data'

export type DashboardDataContextValue = {
    data: DashboardDataSnapshot
    updateInvestmentsValue: (nextTotal: number) => void
    preferredCurrency: CurrencyCode
    setPreferredCurrency: (currency: CurrencyCode) => void
    usdToPreferredCurrencyRate: number
}

export const DashboardDataContext = createContext<DashboardDataContextValue | undefined>(undefined)

export function DashboardDataProvider({
    initialData,
    initialCurrency,
    children,
}: {
    initialData: DashboardDataSnapshot
    initialCurrency: CurrencyCode
    children: React.ReactNode
}) {
    const [data, setData] = useState(initialData)
    const [preferredCurrency, setPreferredCurrency] = useState<CurrencyCode>(initialCurrency)
    const [usdToPreferredCurrencyRate, setUsdToPreferredCurrencyRate] = useState<number>(1)

    useEffect(() => {
        let active = true

        const fetchRates = async () => {
            try {
                const res = await fetch('/api/proxy/currencies')
                const json = await res.json()
                if (active && json.success && json.usdToCurrencyRates) {
                    const rate = json.usdToCurrencyRates[preferredCurrency] || 1
                    setUsdToPreferredCurrencyRate(rate)
                }
            } catch (err) {
                console.error('Failed to fetch currency rates', err)
            }
        }

        void fetchRates()

        return () => {
            active = false
        }
    }, [preferredCurrency])

    const updateInvestmentsValue = useCallback((nextTotal: number) => {
        setData((previous) => {
            const nextAssets = previous.portfolio.assetsWithAllocation.map((asset) =>
                asset.name === 'Investments' ? { ...asset, value: nextTotal } : asset
            )
            const nextTotalAssets = nextAssets.reduce((sum, asset) => sum + asset.value, 0)
            const assetsWithAllocation = nextAssets.map((asset) => ({
                ...asset,
                allocation: nextTotalAssets > 0 ? (asset.value / nextTotalAssets) * 100 : 0,
            }))
            const ytdPnl = nextTotalAssets - previous.portfolio.startOfYearValue
            const ytdPercentage = previous.portfolio.startOfYearValue > 0
                ? (ytdPnl / previous.portfolio.startOfYearValue) * 100
                : 0

            return {
                ...previous,
                investments: {
                    ...previous.investments,
                    totalValue: nextTotal,
                },
                portfolio: {
                    ...previous.portfolio,
                    totalAssets: nextTotalAssets,
                    assetsWithAllocation,
                    ytdPnl,
                    ytdPercentage,
                },
            }
        })
    }, [])

    useEffect(() => {
        setData(initialData)
    }, [initialData])

    const value = useMemo(() => ({
        data,
        updateInvestmentsValue,
        preferredCurrency,
        setPreferredCurrency,
        usdToPreferredCurrencyRate,
    }), [data, updateInvestmentsValue, preferredCurrency, usdToPreferredCurrencyRate])

    return (
        <DashboardDataContext.Provider value={value}>
            {children}
        </DashboardDataContext.Provider>
    )
}

export function useDashboardData() {
    const context = useContext(DashboardDataContext)

    if (!context) {
        throw new Error('useDashboardData must be used inside DashboardDataProvider')
    }

    return context.data
}

export function useDashboardDataActions() {
    const context = useContext(DashboardDataContext)

    if (!context) {
        throw new Error('useDashboardDataActions must be used inside DashboardDataProvider')
    }

    return {
        updateInvestmentsValue: context.updateInvestmentsValue,
    }
}

export function useCurrencyContext() {
    const context = useContext(DashboardDataContext)
    if (!context) {
        throw new Error('useCurrencyContext must be used inside DashboardDataProvider')
    }
    return {
        preferredCurrency: context.preferredCurrency,
        setPreferredCurrency: context.setPreferredCurrency,
        usdToPreferredCurrencyRate: context.usdToPreferredCurrencyRate,
    }
}
