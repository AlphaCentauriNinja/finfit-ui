import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AddPensionButton from './AddPensionButton'

type PensionAccountRow = {
    id: string
    provider_name: string
    current_value: number | string | null
}

export default async function PensionPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    const { data, error } = await supabase
        .from('pension_accounts')
        .select('id, provider_name, current_value, created_at')
        .order('created_at', { ascending: false })

    const pensions = ((data as PensionAccountRow[] | null) ?? []).map((account) => {
        const parsedValue =
            typeof account.current_value === 'number'
                ? account.current_value
                : Number(account.current_value ?? 0)

        return {
            id: account.id,
            name: account.provider_name,
            value: Number.isFinite(parsedValue) ? parsedValue : 0,
        }
    })

    const total = pensions.reduce((sum, pension) => sum + pension.value, 0)

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Pension Accounts</h1>
                <AddPensionButton />
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 mb-8">
                <p className="text-sm font-medium text-white/60">Total Value</p>
                <p className="text-3xl font-bold text-white mt-2">
                    £{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>

            {error ? (
                <div className="mb-8 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    Could not load pension accounts from Supabase. Please create the `pension_accounts` table and RLS policies, then refresh.
                </div>
            ) : null}

            {pensions.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 text-white/70">
                    No pension accounts yet. Use <span className="text-white font-medium">Add Pension</span> to create your first entry.
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {pensions.map((pension) => (
                        <div
                            key={pension.id}
                            className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <h3 className="text-sm font-medium text-white/60">{pension.name}</h3>
                            <p className="text-2xl font-bold text-white mt-2">
                                £{pension.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <div className="w-full bg-white/5 rounded-full h-1.5 mt-4">
                                <div
                                    className="bg-indigo-400 h-1.5 rounded-full"
                                    style={{ width: `${total > 0 ? (pension.value / total) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
