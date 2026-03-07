import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const validCurrencies = new Set(['GBP', 'EUR', 'USD', 'CHF', 'CAD'])

type BodyPayload = {
    action?: string
    fullName?: string
    phone?: string
    dateOfBirth?: string
    country?: string
    city?: string
    preferredCurrency?: string
    providerName?: string
    accountLabel?: string
    keyLabel?: string
    apiKey?: string
    apiSecret?: string
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
}

function parseBody(value: unknown): BodyPayload {
    if (!value || typeof value !== 'object') return {}
    return value as BodyPayload
}

function isMissingRelationError(error: { code?: string; message?: string } | null): boolean {
    if (!error) return false
    if (error.code === '42P01' || error.code === '42703') return true
    const message = (error.message || '').toLowerCase()
    return (
        message.includes('does not exist') ||
        message.includes('relation') ||
        message.includes('column')
    )
}

function normalizeString(value: string | undefined): string {
    return (value || '').trim()
}

export async function POST(request: Request) {
    const supabase = await createClient()

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
        return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    const rawBody = await request.json().catch(() => null)
    const body = parseBody(rawBody)

    if (!body.action) {
        return NextResponse.json({ error: 'Missing action.' }, { status: 400 })
    }

    if (body.action === 'upsert_personal') {
        const fullName = normalizeString(body.fullName)
        const phone = normalizeString(body.phone)
        const dateOfBirth = normalizeString(body.dateOfBirth)
        const country = normalizeString(body.country)
        const city = normalizeString(body.city)

        if (!fullName) {
            return NextResponse.json({ error: 'Full name is required.' }, { status: 400 })
        }

        if (!country || !city) {
            return NextResponse.json({ error: 'Country and city are required.' }, { status: 400 })
        }

        const { error } = await supabase.from('user_settings').upsert(
            {
                user_id: user.id,
                full_name: fullName,
                phone: phone || null,
                date_of_birth: dateOfBirth || null,
                country,
                city,
            },
            { onConflict: 'user_id' }
        )

        if (error) {
            if (isMissingRelationError(error)) {
                return NextResponse.json({ error: 'Missing user_settings table. Apply latest migrations.' }, { status: 400 })
            }
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        await supabase.auth.updateUser({
            data: {
                full_name: fullName,
            },
        })

        return NextResponse.json({ ok: true })
    }

    if (body.action === 'set_currency') {
        const preferredCurrency = normalizeString(body.preferredCurrency)

        if (!validCurrencies.has(preferredCurrency)) {
            return NextResponse.json({ error: 'Invalid currency selection.' }, { status: 400 })
        }

        const { error } = await supabase.from('user_settings').upsert(
            {
                user_id: user.id,
                preferred_currency: preferredCurrency,
            },
            { onConflict: 'user_id' }
        )

        if (error) {
            if (isMissingRelationError(error)) {
                return NextResponse.json({ error: 'Missing user_settings table. Apply latest migrations.' }, { status: 400 })
            }
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ ok: true })
    }

    if (body.action === 'add_open_banking_connection') {
        const providerName = normalizeString(body.providerName)
        const accountLabel = normalizeString(body.accountLabel)

        if (!providerName) {
            return NextResponse.json({ error: 'Provider name is required.' }, { status: 400 })
        }

        const { error } = await supabase.from('open_banking_connections').insert({
            user_id: user.id,
            provider_name: providerName,
            account_label: accountLabel || null,
            connection_status: 'pending',
        })

        if (error) {
            if (isMissingRelationError(error)) {
                return NextResponse.json({ error: 'Missing open_banking_connections table. Apply latest migrations.' }, { status: 400 })
            }
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ ok: true })
    }

    if (body.action === 'upsert_api_integration') {
        const providerName = normalizeString(body.providerName)
        const keyLabel = normalizeString(body.keyLabel) || 'default'
        const accountLabel = normalizeString(body.accountLabel)
        const apiKey = normalizeString(body.apiKey)
        const apiSecret = normalizeString(body.apiSecret)

        if (!providerName || !apiKey) {
            return NextResponse.json({ error: 'Provider and API key are required.' }, { status: 400 })
        }

        const { error } = await supabase.from('api_integrations').upsert(
            {
                user_id: user.id,
                provider_name: providerName,
                key_label: keyLabel,
                account_label: accountLabel || null,
                api_key_ciphertext: apiKey,
                api_secret_ciphertext: apiSecret || null,
                is_active: true,
            },
            { onConflict: 'user_id,provider_name,key_label' }
        )

        if (error) {
            if (isMissingRelationError(error)) {
                return NextResponse.json({ error: 'Missing api_integrations table. Apply latest migrations.' }, { status: 400 })
            }
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ ok: true })
    }

    if (body.action === 'update_password') {
        const newPassword = normalizeString(body.newPassword)
        const confirmPassword = normalizeString(body.confirmPassword)

        if (!newPassword || !confirmPassword) {
            return NextResponse.json({ error: 'New password and confirmation are required.' }, { status: 400 })
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json({ error: 'Password confirmation does not match.' }, { status: 400 })
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 })
        }

        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
}
