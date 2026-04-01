'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { DashboardDataSnapshot } from '@/lib/dashboard-data'

export type DashboardDataContextValue = {
    data: DashboardDataSnapshot
    updateInvestmentsValue: (nextTotal: number) => void
}

export const DashboardDataContext = createContext<DashboardDataContextValue | undefined>(undefined)

export function DashboardDataProvider({
    initialData,
    children,
}: {
    initialData: DashboardDataSnapshot
    children: React.ReactNode
}) {
    const [data, setData] = useState(initialData)

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

            return {
                ...previous,
                portfolio: {
                    ...previous.portfolio,
                    totalAssets: nextTotalAssets,
                    assetsWithAllocation,
                },
            }
        })
    }, [])

    useEffect(() => {
        setData(initialData)
    }, [initialData])

    const value = useMemo(() => ({ data, updateInvestmentsValue }), [data, updateInvestmentsValue])

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
