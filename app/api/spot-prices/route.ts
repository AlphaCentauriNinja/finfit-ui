import { NextRequest, NextResponse } from 'next/server'

type MetalsDevResponse = {
    status: string
    currency: string
    unit: string
    metals: {
        gold: number
        silver: number
        platinum?: number
        palladium?: number
        [key: string]: number | undefined
    }
    timestamps?: {
        metal?: string
        currency?: string
    }
}

type CachedPrices = {
    gold: number
    silver: number
    platinum: number | null
    palladium: number | null
    currency: string
    timestamp: string
    fetchedAt: number
}

const CACHE_TTL_MS = 60_000 // 60 seconds

let cachedPrices: CachedPrices | null = null

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const currency = searchParams.get('currency')?.toUpperCase() || 'GBP'

    const apiKey = process.env.METALS_DEV_API_KEY

    if (!apiKey) {
        return NextResponse.json(
            {
                error: 'METALS_DEV_API_KEY is not configured',
                gold: null,
                silver: null,
                currency,
                timestamp: null,
            },
            { status: 503 }
        )
    }

    // Return cached prices if still fresh and same currency
    if (
        cachedPrices &&
        cachedPrices.currency === currency &&
        Date.now() - cachedPrices.fetchedAt < CACHE_TTL_MS
    ) {
        return NextResponse.json({
            gold: cachedPrices.gold,
            silver: cachedPrices.silver,
            platinum: cachedPrices.platinum,
            palladium: cachedPrices.palladium,
            currency: cachedPrices.currency,
            timestamp: cachedPrices.timestamp,
            cached: true,
        })
    }

    try {
        const url = `https://api.metals.dev/v1/latest?api_key=${apiKey}&currency=${currency}&unit=toz`

        const response = await fetch(url, {
            headers: { Accept: 'application/json' },
            cache: 'no-store',
        })

        if (!response.ok) {
            throw new Error(`Metals.dev API returned ${response.status}`)
        }

        const data: MetalsDevResponse = await response.json()

        if (data.status !== 'success') {
            throw new Error(`Metals.dev API error: ${data.status}`)
        }

        const goldPrice = data.metals?.gold ?? null
        const silverPrice = data.metals?.silver ?? null
        const platinumPrice = data.metals?.platinum ?? null
        const palladiumPrice = data.metals?.palladium ?? null
        const timestamp = data.timestamps?.metal ?? new Date().toISOString()

        if (goldPrice !== null && silverPrice !== null) {
            cachedPrices = {
                gold: goldPrice,
                silver: silverPrice,
                platinum: platinumPrice,
                palladium: palladiumPrice,
                currency,
                timestamp,
                fetchedAt: Date.now(),
            }
        }

        return NextResponse.json({
            gold: goldPrice,
            silver: silverPrice,
            platinum: platinumPrice,
            palladium: palladiumPrice,
            currency,
            timestamp,
            cached: false,
        })
    } catch (error) {
        // If we have stale cached prices, return them as a fallback
        if (cachedPrices && cachedPrices.currency === currency) {
            return NextResponse.json({
                gold: cachedPrices.gold,
                silver: cachedPrices.silver,
                platinum: cachedPrices.platinum,
                palladium: cachedPrices.palladium,
                currency: cachedPrices.currency,
                timestamp: cachedPrices.timestamp,
                cached: true,
                stale: true,
            })
        }

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to fetch spot prices',
                gold: null,
                silver: null,
                platinum: null,
                palladium: null,
                currency,
                timestamp: null,
            },
            { status: 502 }
        )
    }
}
