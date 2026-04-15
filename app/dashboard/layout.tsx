import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/app/dashboard/components/Sidebar'
import Navbar from '@/app/dashboard/components/Navbar'
import MobileNav from '@/app/dashboard/components/mobile/MobileNav'
import AutoLogoutHandler from '@/app/dashboard/components/Auth/AutoLogoutHandler'
import { DashboardDataProvider } from '@/app/dashboard/components/providers/DashboardDataProvider'
import { PrivacyProvider } from '@/app/dashboard/components/providers/PrivacyProvider'
import {
    buildDashboardSnapshot,
    type DebtEntryRow,
    type PensionAccountRow,
    type PensionContributionRow,
    type PensionValueRow,
    type BudgetExpenditureRow,
    type BudgetProfileRow,
    type BudgetCapitalRow,
    type SavingsAccountRow,
    type SavingsPotRow,
    type SavingsHistoryRow,
    type CryptoAssetRow,
    type BullionHoldingRow,
    type InvestmentHoldingRow,
    type InvestmentAccountTransactionRow,
    type RealEstatePropertyRow,
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
        salaryCapitalResult,
        savingsAccountsResult,
        savingsPotsResult,
        savingsHistoryResult,
        debtEntriesResult,
        cryptoAssetsResult,
        bullionHoldingsResult,
        investmentHoldingsResult,
        investmentAccountTransactionsResult,
        realEstateResult,
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
            .from('salary_capital')
            .select('id, capital_name, monthly_amount')
            .order('created_at', { ascending: false }),
        supabase
            .from('savings_accounts')
            .select('id, name, created_at')
            .order('created_at', { ascending: false }),
        supabase
            .from('savings_pots')
            .select('id, account_id, name, balance, target_amount, created_at')
            .order('created_at', { ascending: false }),
        supabase
            .from('savings_history')
            .select('id, pot_id, amount, date, name, created_at')
            .order('date', { ascending: false }),
        supabase
            .from('debt_entries')
            .select('id, amount')
            .order('created_at', { ascending: false }),
        supabase
            .from('crypto_assets')
            .select('id, ticker, name, amount, usd, invested_gbp, created_at')
            .order('created_at', { ascending: false }),
        supabase
            .from('bullion_holdings')
            .select('id, metal, weight_per_item_grams, purchase_value, purchase_currency, amount, tax_rate_pct, tax_amount, total_price_incl_tax')
            .order('created_at', { ascending: false }),
        supabase
            .from('investment_holdings')
            .select('id, current_value')
            .order('created_at', { ascending: false }),
        supabase
            .from('investment_transactions')
            .select('account_id, holding_id, current_value_impact, transaction_date'),
        supabase
            .from('real_estate_properties')
            .select('id, estimated_value, current_value, market_value, mortgage_balance')
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
        budgetProfile: (salaryProfileResult.data as BudgetProfileRow | null) ?? null,
        budgetExpenditures: (salaryExpendituresResult.data as BudgetExpenditureRow[] | null) ?? [],
        budgetCapital: (salaryCapitalResult.data as BudgetCapitalRow[] | null) ?? [],
        budgetLoadError: Boolean(
            salaryProfileResult.error ||
            salaryExpendituresResult.error ||
            salaryCapitalResult.error
        ),
        savingsAccounts: (savingsAccountsResult.data as SavingsAccountRow[] | null) ?? [],
        savingsPots: (savingsPotsResult.data as SavingsPotRow[] | null) ?? [],
        savingsHistory: (savingsHistoryResult.data as SavingsHistoryRow[] | null) ?? [],
        savingsLoadError: Boolean(
            savingsAccountsResult.error ||
            savingsPotsResult.error ||
            savingsHistoryResult.error
        ),
        debtEntries: (debtEntriesResult.data as DebtEntryRow[] | null) ?? [],
        debtLoadError: Boolean(debtEntriesResult.error),
        cryptoAssets: (cryptoAssetsResult.data as CryptoAssetRow[] | null) ?? [],
        cryptoLoadError: Boolean(cryptoAssetsResult.error),
        bullionHoldings: (bullionHoldingsResult.data as BullionHoldingRow[] | null) ?? [],
        bullionLoadError: Boolean(bullionHoldingsResult.error),
        investmentHoldings: (investmentHoldingsResult.data as InvestmentHoldingRow[] | null) ?? [],
        investmentAccountTransactions: (investmentAccountTransactionsResult.data as InvestmentAccountTransactionRow[] | null) ?? [],
        investmentLoadError: Boolean(investmentHoldingsResult.error || investmentAccountTransactionsResult.error),
        realEstateProperties: (realEstateResult.data as RealEstatePropertyRow[] | null) ?? [],
        realEstateLoadError: Boolean(realEstateResult.error),
    })

    return (
        <div data-dashboard-root className="min-h-screen bg-slate-950 relative overflow-hidden font-sans text-gray-100">
            <AutoLogoutHandler />
            {/* Dynamic Background Gradients */}
            <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-purple-700/30 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

            {/* Subtle Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

            {/* Mobile hamburger + drawer — rendered OUTSIDE overflow containers */}
            <MobileNav />

            <div className="relative z-10 flex w-full min-h-screen p-4">
                <div className="flex w-full min-h-[calc(100vh-2rem)] overflow-hidden rounded-3xl border border-white/10 bg-slate-900/45 backdrop-blur-xl shadow-[0_20px_80px_rgba(2,6,23,0.45)]">
                    {/* Desktop sidebar — hidden below lg */}
                    <div className="hidden lg:block">
                        <Sidebar />
                    </div>
                    <PrivacyProvider>
                        <DashboardDataProvider initialData={dashboardData}>
                            <div className="flex-1 flex flex-col min-h-[calc(100vh-2rem)] overflow-hidden">
                                <Navbar userEmail={user?.email} userFullName={user?.user_metadata?.full_name} />
                                <main className="flex-1 p-8 pb-10 overflow-y-auto">
                                    {children}
                                </main>
                            </div>
                        </DashboardDataProvider>
                    </PrivacyProvider>
                </div>
            </div>
        </div>
    )
}
