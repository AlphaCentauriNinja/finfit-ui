import { NextRequest, NextResponse } from 'next/server'

const INTERNAL_API_BASE = process.env.FINFIT_API_INTERNAL_URL ?? 'http://localhost:4000/api/v1'
const API_TOKEN = process.env.FINFIT_API_TOKEN ?? process.env.NEXT_PUBLIC_FINFIT_API_TOKEN ?? ''

export async function GET(request: NextRequest) {
    const upstreamUrl = `${INTERNAL_API_BASE}/currencies?limit=200`

    try {
        const upstream = await fetch(upstreamUrl, {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${API_TOKEN}`,
            },
            cache: 'no-store',
        })

        const data = await upstream.json()

        if (!upstream.ok || !data.success || !Array.isArray(data.data)) {
            return NextResponse.json(data, { status: upstream.status })
        }

        const ratesArray = data.data as Array<{ currency_symbol: string; base_currency: string; rate: number }>
        
        // base_currency is USD
        let usdToGbp = 0.746 // fallback
        const rawRates: Record<string, number> = {}

        for (const row of ratesArray) {
            if (row.base_currency === 'USD' && typeof row.rate === 'number') {
                rawRates[row.currency_symbol] = row.rate
                if (row.currency_symbol === 'GBP') {
                    usdToGbp = row.rate
                }
            }
        }

        return NextResponse.json({
            success: true,
            usdToCurrencyRates: rawRates,
        }, { status: 200 })

    } catch (err) {
        console.error('[proxy/currencies] Failed to reach upstream API:', err)
        return NextResponse.json(
            { success: false, error: 'upstream_unreachable', message: 'Could not reach FinFit API' },
            { status: 502 }
        )
    }
}
