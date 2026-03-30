import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingsClient, {
    type ApiIntegration,
    type CurrencyCode,
    type OpenBankingConnection,
    type SettingsUserInfo,
    type UserTaxRate,
} from './SettingsClient'

type SupabaseError = {
    code?: string
    message?: string
}

type UserSettingsRow = {
    full_name: string | null
    phone: string | null
    date_of_birth: string | null
    preferred_currency: string | null
    country?: string | null
    city?: string | null
}

function isMissingTableError(error: SupabaseError | null): boolean {
    if (!error) return false

    if (error.code === '42P01') return true

    const message = (error.message || '').toLowerCase()
    return message.includes('relation') && message.includes('does not exist')
}

function isMissingColumnError(error: SupabaseError | null): boolean {
    if (!error) return false
    if (error.code === '42703') return true

    const message = (error.message || '').toLowerCase()
    return message.includes('column') && message.includes('does not exist')
}

function normalizeCurrency(value: string | null | undefined): CurrencyCode {
    if (value === 'GBP' || value === 'EUR' || value === 'USD' || value === 'CHF' || value === 'CAD') {
        return value
    }

    return 'GBP'
}

export default async function SettingsPage() {
    const supabase = await createClient()
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
        redirect('/')
    }

    const [openBankingResult, apiIntegrationsResult] = await Promise.all([
        supabase
            .from('open_banking_connections')
            .select('id, provider_name, account_label, connection_status, last_synced_at')
            .order('created_at', { ascending: false }),
        supabase
            .from('api_integrations')
            .select('id, provider_name, account_label, key_label, is_active, last_synced_at')
            .order('created_at', { ascending: false }),
        supabase
            .from('user_tax_rates')
            .select('id, rate_pct, is_default')
            .order('rate_pct', { ascending: true }),
    ])

    let hasCountryCityColumns = true
    let userSettingsResult = await supabase
        .from('user_settings')
        .select('full_name, phone, date_of_birth, country, city, preferred_currency')
        .maybeSingle()

    if (isMissingColumnError(userSettingsResult.error as SupabaseError | null)) {
        hasCountryCityColumns = false
        userSettingsResult = await supabase
            .from('user_settings')
            .select('full_name, phone, date_of_birth, preferred_currency')
            .maybeSingle()
    }

    const missingTables: string[] = []

    if (isMissingTableError(userSettingsResult.error as SupabaseError | null)) {
        missingTables.push('user_settings')
    }

    if (isMissingTableError(openBankingResult.error as SupabaseError | null)) {
        missingTables.push('open_banking_connections')
    }

    if (isMissingTableError(apiIntegrationsResult.error as SupabaseError | null)) {
        missingTables.push('api_integrations')
    }

    const { data: rawTaxRates, error: taxRatesError } = await supabase
        .from('user_tax_rates')
        .select('id, rate_pct, is_default')
        .order('rate_pct', { ascending: true })

    if (isMissingTableError(taxRatesError as SupabaseError | null)) {
        missingTables.push('user_tax_rates')
    }

    const metadataName =
        typeof user.user_metadata?.full_name === 'string'
            ? user.user_metadata.full_name
            : typeof user.user_metadata?.name === 'string'
                ? user.user_metadata.name
                : ''

    const fallbackName = metadataName || user.email?.split('@')[0] || 'User'

    let userSettingsRow =
        !userSettingsResult.error || isMissingTableError(userSettingsResult.error as SupabaseError | null)
            ? (userSettingsResult.data as UserSettingsRow | null)
            : null

    if (!userSettingsResult.error && !userSettingsRow) {
        const bootstrapPayload: {
            user_id: string
            full_name: string
            country?: string
            city?: string
        } = {
            user_id: user.id,
            full_name: fallbackName,
        }

        if (hasCountryCityColumns) {
            bootstrapPayload.country = 'United Kingdom'
            bootstrapPayload.city = 'London'
        }

        const bootstrapSettingsResult = await supabase
            .from('user_settings')
            .upsert(bootstrapPayload, { onConflict: 'user_id' })
            .select(
                hasCountryCityColumns
                    ? 'full_name, phone, date_of_birth, country, city, preferred_currency'
                    : 'full_name, phone, date_of_birth, preferred_currency'
            )
            .maybeSingle()

        if (!bootstrapSettingsResult.error) {
            userSettingsRow = bootstrapSettingsResult.data as UserSettingsRow | null
        }
    }

    const userInfo: SettingsUserInfo = {
        fullName: userSettingsRow?.full_name || fallbackName,
        email: user.email || '',
        phone: userSettingsRow?.phone || '',
        dateOfBirth: userSettingsRow?.date_of_birth || '',
        country: userSettingsRow?.country || 'United Kingdom',
        city: userSettingsRow?.city || 'London',
        preferredCurrency: normalizeCurrency(userSettingsRow?.preferred_currency),
    }

    const openBankingConnections: OpenBankingConnection[] =
        !openBankingResult.error || isMissingTableError(openBankingResult.error as SupabaseError | null)
            ? ((openBankingResult.data as Array<{
                id: string
                provider_name: string
                account_label: string | null
                connection_status: string | null
                last_synced_at: string | null
            }> | null) || []).map((row) => ({
                id: row.id,
                providerName: row.provider_name,
                accountLabel: row.account_label || 'Unnamed Account',
                connectionStatus: row.connection_status || 'pending',
                lastSyncedAt: row.last_synced_at,
            }))
            : []

    const apiIntegrations: ApiIntegration[] =
        !apiIntegrationsResult.error || isMissingTableError(apiIntegrationsResult.error as SupabaseError | null)
            ? ((apiIntegrationsResult.data as Array<{
                id: string
                provider_name: string
                account_label: string | null
                key_label: string | null
                is_active: boolean | null
                last_synced_at: string | null
            }> | null) || []).map((row) => ({
                id: row.id,
                providerName: row.provider_name,
                accountLabel: row.account_label || '',
                keyLabel: row.key_label || 'default',
                isActive: row.is_active !== false,
                lastSyncedAt: row.last_synced_at,
            }))
            : []

    const taxRates: UserTaxRate[] = (rawTaxRates || []).map((row) => ({
        id: row.id,
        ratePct: Number(row.rate_pct),
        isDefault: row.is_default || false,
    }))

    return (
        <SettingsClient
            userInfo={userInfo}
            openBankingConnections={openBankingConnections}
            apiIntegrations={apiIntegrations}
            taxRates={taxRates}
            missingTables={missingTables}
        />
    )
}
