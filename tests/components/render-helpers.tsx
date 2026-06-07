import React from 'react'
import { render } from '@testing-library/react'
import { vi } from 'vitest'

import {
  DashboardDataProvider as AppDashboardDataProvider,
} from '@/app/dashboard/components/providers/DashboardDataProvider'
import { PrivacyProvider } from '@/app/dashboard/components/providers/PrivacyProvider'
import { buildDashboardSnapshot } from '@/lib/dashboard-data'

export const noop = vi.fn()

export const formatCurrency = (value: number) => `£${value.toFixed(2)}`
export const formatSignedCurrency = (value: number) => `${value >= 0 ? '+' : '-'}£${Math.abs(value).toFixed(2)}`

export const currentYear = new Date().toISOString().slice(0, 4)
const previousYear = String(Number(currentYear) - 1)

export const providerSnapshot = buildDashboardSnapshot({
  pensionAccounts: [{ id: 'p1', provider_name: 'PensionBee', current_value: '1200' }],
  pensionContributions: [{ pension_account_id: 'p1', contribution_value: '900', contribution_date: `${currentYear}-01-05` }],
  pensionValues: [
    { pension_account_id: 'p1', value_amount: '1100', value_date: `${previousYear}-12-20`, created_at: `${previousYear}-12-20T00:00:00Z` },
    { pension_account_id: 'p1', value_amount: '1200', value_date: `${currentYear}-03-20`, created_at: `${currentYear}-03-20T00:00:00Z` },
  ],
  budgetProfile: { employer_name: 'FinFit Ltd', monthly_net_salary: '4500' },
  budgetExpenditures: [{ id: 'e1', expenditure_name: 'Rent', monthly_amount: '1500' }],
  budgetCapital: [{ id: 'c1', capital_name: 'ISA', monthly_amount: '500' }],
  savingsAccounts: [{ id: 's1', name: 'Main Savings', created_at: `${currentYear}-01-01T00:00:00Z` }],
  savingsPots: [
    { id: 'pot1', account_id: 's1', name: 'Emergency', balance: '1500', target_amount: '3000', created_at: `${currentYear}-01-01T00:00:00Z` },
  ],
  savingsHistory: [{ id: 'sh1', pot_id: 'pot1', amount: '300', date: `${currentYear}-02-01`, name: 'Deposit', created_at: `${currentYear}-02-01T00:00:00Z` }],
  debtEntries: [{ id: 'd1', amount: '2500' }],
  cryptoAssets: [{ id: 'c1', ticker: 'BTC', name: 'Bitcoin', amount: '1', usd: '65000', invested_gbp: '30000', created_at: `${currentYear}-01-01T00:00:00Z` }],
  investmentHoldings: [{ id: 'i1', current_value: '1600' }],
  realEstateProperties: [{ id: 'r1', current_value: '250000', mortgage_balance: '120000' }],
})

export const sampleInvestmentHolding = {
  id: 'ih1',
  accountId: 'ia1',
  ticker: 'VUSA',
  name: 'Vanguard S&P 500',
  investedAmount: 1000,
  currentValue: 1250,
}

export const sampleInvestmentAccount = {
  id: 'ia1',
  name: 'Main ISA',
  type: 'ISA' as const,
  taxStatus: 'TAX-FREE' as const,
  holdings: [sampleInvestmentHolding],
  totalInvested: 1000,
  totalCurrentValue: 1250,
  pnl: 250,
  pnlPct: 25,
}

export const sampleSavingsAccount = {
  id: 'sa1',
  name: 'Savings Account',
  totalValue: 1600,
  totalPnl: 100,
  totalPnlPercentage: 6.25,
  pots: [
    { id: 'sp1', name: 'Emergency', balance: 1200, targetAmount: 2500 },
    { id: 'sp2', name: 'Holiday', balance: 400, targetAmount: 1000 },
  ],
}

export const samplePension = {
  id: 'pn1',
  name: 'PensionBee',
  value: 5000,
  pnl: 300,
  pnlPercentage: 6,
  contributionTotal: 4700,
  latestValueDate: `${currentYear}-03-01`,
}

export const sampleProperty = {
  id: 'rp1',
  name: 'Home',
  address: '1 Finance Street',
  current_value: 250000,
  estimated_value: 250000,
  market_value: 255000,
  mortgage_balance: 120000,
}

export const sampleCryptoAsset = {
  id: 'ca1',
  ticker: 'BTC',
  name: 'Bitcoin',
  amount: 1.234,
  usd: 65000,
  investedGbp: 30000,
  marketValueGbp: 35000,
}

export const sampleSettingsProps = {
  userInfo: {
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '+447700900123',
    dateOfBirth: `${currentYear}-01-01`,
    country: 'United Kingdom',
    city: 'London',
    preferredCurrency: 'GBP' as const,
  },
  openBankingConnections: [],
  apiIntegrations: [],
  taxRates: [{ id: 'tax-1', ratePct: 20, isDefault: true }],
  missingTables: [],
}

export const renderWithProviders = (ui: React.ReactElement) =>
  render(
    <AppDashboardDataProvider initialData={providerSnapshot} initialCurrency="GBP">
      <PrivacyProvider>{ui}</PrivacyProvider>
    </AppDashboardDataProvider>
  )
