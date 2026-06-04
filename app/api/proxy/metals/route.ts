import { NextRequest, NextResponse } from 'next/server'

/**
 * Server-side proxy for the metals endpoint.
 *
 * The browser calls /api/proxy/metals (same origin → no CORS issues).
 * This route forwards the request server-side to finfit-api using the
 * Docker-internal hostname when running in a container, or localhost
 * when running locally.
 *
 * Query params are forwarded as-is (e.g. ?currency=GBP&unit=toz).
 */

// Docker-internal hostname takes priority; falls back to localhost for local dev.
const INTERNAL_API_BASE =
  process.env.FINFIT_API_INTERNAL_URL ?? 'http://localhost:4000/api/v1'

const API_TOKEN = process.env.FINFIT_API_TOKEN ?? process.env.NEXT_PUBLIC_FINFIT_API_TOKEN ?? ''
const DEFAULT_SPOT_PRICE_LIMIT = '100'

const PRECIOUS_METAL_FALLBACKS: Record<string, string[]> = {
  gold: ['lbma_gold_pm', 'lbma_gold', 'lbma_gold_am', 'mcx_gold', 'mcx_gold_pm', 'mcx_gold_am', 'ibja_gold'],
  silver: ['lbma_silver', 'mcx_silver', 'mcx_silver_pm', 'mcx_silver_am'],
  platinum: ['lbma_platinum_pm', 'lbma_platinum', 'lbma_platinum_am'],
  palladium: ['lbma_palladium_pm', 'lbma_palladium', 'lbma_palladium_am'],
}

type JsonRecord = Record<string, unknown>

type ApiMetalRow = {
  metal_symbol?: unknown
  symbol?: unknown
  name?: unknown
  currency?: unknown
  price?: unknown
  timestamp?: unknown
  fetched_at?: unknown
  price_usd?: unknown
  price_eur?: unknown
  price_gbp?: unknown
  price_chf?: unknown
  price_cad?: unknown
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normaliseCurrency(value: string | null): string {
  const currency = value?.trim().toUpperCase() ?? ''
  return /^[A-Z]{3}$/.test(currency) ? currency : 'GBP'
}

function normaliseUnit(value: string | null): string {
  return value?.trim().toLowerCase() || 'toz'
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function getCanonicalMetalKey(rawKey: string): string {
  const key = rawKey.trim().toUpperCase()

  switch (key) {
    case 'AU':
    case 'XAU':
    case 'GOLD':
      return 'gold'
    case 'AG':
    case 'XAG':
    case 'SILVER':
      return 'silver'
    case 'PT':
    case 'XPT':
    case 'PLATINUM':
      return 'platinum'
    case 'PD':
    case 'XPD':
    case 'PALLADIUM':
      return 'palladium'
    default:
      return rawKey.trim().toLowerCase()
  }
}

function getMetalKey(row: ApiMetalRow): string | null {
  const rawKey = asString(row.metal_symbol) ?? asString(row.symbol) ?? asString(row.name)
  return rawKey ? getCanonicalMetalKey(rawKey) : null
}

function getMetalPrice(row: ApiMetalRow, currency: string): number | null {
  const currencyField = `price_${currency.toLowerCase()}`
  const fieldPrice = asNumber((row as JsonRecord)[currencyField])

  return fieldPrice ?? asNumber(row.price)
}

function getLatestTimestamp(current: string | null, next: string | null): string | null {
  if (!current) return next
  if (!next) return current

  return Date.parse(next) > Date.parse(current) ? next : current
}

function getPayloadMetalTimestamp(payload: JsonRecord): string | null {
  if (!isRecord(payload.timestamps)) return null
  return asString(payload.timestamps.metal)
}

function applyPreciousMetalFallbacks(metals: Record<string, number>): void {
  for (const [canonicalKey, fallbackKeys] of Object.entries(PRECIOUS_METAL_FALLBACKS)) {
    if (metals[canonicalKey] !== undefined) continue

    const fallbackKey = fallbackKeys.find((key) => metals[key] !== undefined)
    if (fallbackKey) {
      metals[canonicalKey] = metals[fallbackKey]
    }
  }
}

function normaliseMetalsPayload(payload: unknown, currency: string, unit: string): unknown {
  if (!isRecord(payload)) return payload

  const rows = !isRecord(payload.metals) && Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload)
      ? payload
      : []

  const metals: Record<string, number> = {}
  let latestTimestamp: string | null = getPayloadMetalTimestamp(payload)

  if (isRecord(payload.metals)) {
    for (const [rawKey, rawPrice] of Object.entries(payload.metals)) {
      const price = asNumber(rawPrice)
      if (price === null) continue

      metals[getCanonicalMetalKey(rawKey)] = price
    }
  } else {
    for (const item of rows) {
      if (!isRecord(item)) continue

      const row = item as ApiMetalRow
      const metalKey = getMetalKey(row)
      const price = getMetalPrice(row, currency)

      if (!metalKey || price === null) continue

      metals[metalKey] = price
      latestTimestamp = getLatestTimestamp(
        latestTimestamp,
        asString(row.timestamp) ?? asString(row.fetched_at)
      )
    }
  }

  applyPreciousMetalFallbacks(metals)

  if (Object.keys(metals).length === 0) return payload

  return {
    status: 'success',
    currency,
    unit,
    metals,
    currencies: {},
    timestamps: {
      metal: latestTimestamp ?? new Date().toISOString(),
    },
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const upstreamParams = new URLSearchParams(searchParams)

  if (!upstreamParams.has('limit')) {
    upstreamParams.set('limit', DEFAULT_SPOT_PRICE_LIMIT)
  }

  const qs = upstreamParams.toString()
  const upstreamUrl = `${INTERNAL_API_BASE}/metals${qs ? `?${qs}` : ''}`
  const currency = normaliseCurrency(searchParams.get('currency'))
  const unit = normaliseUnit(searchParams.get('unit'))

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${API_TOKEN}`,
      },
      cache: 'no-store',
    })

    const data = await upstream.json()
    const responseData = upstream.ok ? normaliseMetalsPayload(data, currency, unit) : data

    return NextResponse.json(responseData, { status: upstream.status })
  } catch (err) {
    console.error('[proxy/metals] Failed to reach upstream API:', err)
    return NextResponse.json(
      { success: false, error: 'upstream_unreachable', message: 'Could not reach FinFit API' },
      { status: 502 }
    )
  }
}
