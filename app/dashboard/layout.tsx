import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/app/dashboard/components/Sidebar'
import Navbar from '@/app/dashboard/components/Navbar'
import { DashboardDataProvider } from '@/app/dashboard/components/providers/DashboardDataProvider'
import {
    buildDashboardSnapshot,
    type PensionAccountRow,
    type PensionContributionRow,
    type PensionValueRow,
    type SalaryExpenditureRow,
    type SalaryProfileRow,
    type SavingsAccountRow,
    type SavingsPotRow,
} from '@/lib/dashboard-data'

export default async function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/')

    const [
        pensionAccountsResult,
        pensionContributionsResult,
        pensionValuesResult,
        salaryProfileResult,
        salaryExpendituresResult,
        savingsAccountsResult,
        savingsPotsResult,
    ] = await Promise.all([
        supabase
            .from('pension_accounts')
            .select('id, provider_name, current_value, created_at')
            .order('created_at', { ascending: false }),
        supabase
            .from('pension_contributions')
            .select('pension_account_id, contribution_value, contribution_date'),
        supabase
            .from('pension_account_values')
            .select('pension_account_id, value_amount, value_date, created_at'),
        supabase
            .from('salary_profiles')
            .select('employer_name, monthly_net_salary')
            .maybeSingle(),
        supabase
            .from('salary_expenditures')
            .select('id, expenditure_name, monthly_amount')
            .order('created_at', { ascending: false }),
        supabase
            .from('savings_accounts')
            .select('id, name, created_at')
            .order('created_at', { ascending: false }),
        supabase
            .from('savings_pots')
            .select('id, account_id, name, balance, target_amount, created_at')
            .order('created_at', { ascending: false }),
    ])

    const dashboardData = buildDashboardSnapshot({
        pensionAccounts: (pensionAccountsResult.data as PensionAccountRow[] | null) ?? [],
        pensionContributions: (pensionContributionsResult.data as PensionContributionRow[] | null) ?? [],
        pensionValues: (pensionValuesResult.data as PensionValueRow[] | null) ?? [],
        pensionLoadError: Boolean(
            pensionAccountsResult.error ||
            pensionContributionsResult.error ||
            pensionValuesResult.error
        ),
        salaryProfile: (salaryProfileResult.data as SalaryProfileRow | null) ?? null,
        salaryExpenditures: (salaryExpendituresResult.data as SalaryExpenditureRow[] | null) ?? [],
        salaryLoadError: Boolean(
            salaryProfileResult.error ||
            salaryExpendituresResult.error
        ),
        savingsAccounts: (savingsAccountsResult.data as SavingsAccountRow[] | null) ?? [],
        savingsPots: (savingsPotsResult.data as SavingsPotRow[] | null) ?? [],
        savingsLoadError: Boolean(
            savingsAccountsResult.error ||
            savingsPotsResult.error
        ),
    })

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden font-sans text-gray-100">
            {/* Dynamic Background Gradients */}
            <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-purple-700/30 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

            {/* Subtle Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

            <div className="relative z-10 flex w-full min-h-screen p-4">
                <div className="flex w-full min-h-[calc(100vh-2rem)] overflow-hidden rounded-3xl border border-white/10 bg-slate-900/45 backdrop-blur-xl shadow-[0_20px_80px_rgba(2,6,23,0.45)]">
                    {/* The sidebar and navbar remain separate components but share one visual shell */}
                    <div className="hidden lg:block">
                        <Sidebar />
                    </div>
                    <DashboardDataProvider initialData={dashboardData}>
                        <div className="flex-1 flex flex-col min-h-[calc(100vh-2rem)] overflow-hidden">
                            <Navbar userEmail={user?.email} userFullName={user?.user_metadata?.full_name} />
                            <main className="flex-1 p-8 pb-10 overflow-y-auto">
                                {children}
                            </main>
                        </div>
                    </DashboardDataProvider>
                </div>
            </div>
        </div>
    )
}
