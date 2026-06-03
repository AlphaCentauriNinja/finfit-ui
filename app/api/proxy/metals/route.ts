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

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const qs = searchParams.toString()
  const upstreamUrl = `${INTERNAL_API_BASE}/metals${qs ? `?${qs}` : ''}`

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${API_TOKEN}`,
      },
      cache: 'no-store',
    })

    const data = await upstream.json()

    return NextResponse.json(data, { status: upstream.status })
  } catch (err) {
    console.error('[proxy/metals] Failed to reach upstream API:', err)
    return NextResponse.json(
      { success: false, error: 'upstream_unreachable', message: 'Could not reach FinFit API' },
      { status: 502 }
    )
  }
}
