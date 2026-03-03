'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { DashboardDataSnapshot } from '@/lib/dashboard-data'

type DashboardDataContextValue = {
    data: DashboardDataSnapshot
}

const DashboardDataContext = createContext<DashboardDataContextValue | undefined>(undefined)

export function DashboardDataProvider({
    initialData,
    children,
}: {
    initialData: DashboardDataSnapshot
    children: React.ReactNode
}) {
    const [data, setData] = useState(initialData)

    useEffect(() => {
        setData(initialData)
    }, [initialData])

    const value = useMemo(() => ({ data }), [data])

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

