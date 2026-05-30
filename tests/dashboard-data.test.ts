import test from 'node:test'
import assert from 'node:assert/strict'
import { buildDashboardSnapshot } from '../lib/dashboard-data.ts'

const almostEqual = (actual: number, expected: number, epsilon = 1e-6) => {
    assert.ok(Math.abs(actual - expected) < epsilon, `expected ${actual} to be within ${epsilon} of ${expected}`)
}

test('buildDashboardSnapshot aggregates portfolio, YTD, and major dashboard totals', () => {
    const currentYear = Number(new Date().toISOString().slice(0, 4))
    const y = String(currentYear)
    const previousYear = String(currentYear - 1)

    const snapshot = buildDashboardSnapshot({
        pensionAccounts: [
            { id: 'p1', provider_name: 'PensionBee Core', current_value: '900' },
            { id: 'p2', provider_name: 'Workplace Pension', current_value: '200' },
        ],
        pensionContributions: [
            { pension_account_id: 'p1', contribution_value: '100', contribution_date: `${y}-01-10` },
            { pension_account_id: 'p1', contribution_value: '50', contribution_date: `${y}-02-01` },
        ],
        pensionValues: [
            { pension_account_id: 'p1', value_amount: '90', value_date: `${previousYear}-12-15`, created_at: `${previousYear}-12-15T09:00:00Z` },
            { pension_account_id: 'p1', value_amount: '110', value_date: `${y}-01-15`, created_at: `${y}-01-15T09:00:00Z` },
            { pension_account_id: 'p1', value_amount: '130', value_date: `${y}-03-15`, created_at: `${y}-03-15T09:00:00Z` },
            { pension_account_id: 'p2', value_amount: '200', value_date: `${y}-01-20`, created_at: `${y}-01-20T09:00:00Z` },
            { pension_account_id: 'p2', value_amount: '220', value_date: `${y}-02-20`, created_at: `${y}-02-20T09:00:00Z` },
        ],
        budgetProfile: { employer_name: 'ACME', monthly_net_salary: '4000' },
        budgetExpenditures: [
            { id: 'e1', expenditure_name: 'Rent', monthly_amount: '1000' },
            { id: 'e2', expenditure_name: 'Invalid', monthly_amount: '-5' },
            { id: '', expenditure_name: 'Invalid2', monthly_amount: '10' },
        ],
        budgetCapital: [
            { id: 'c1', capital_name: 'ISA', monthly_amount: '500' },
            { id: 'c2', capital_name: '', monthly_amount: '100' },
        ],
        savingsAccounts: [{ id: 's1', name: 'Emergency', created_at: `${y}-01-01T00:00:00Z` }],
        savingsPots: [
            { id: 'pot1', account_id: 's1', name: 'Main Pot', balance: '1000', target_amount: '1500', created_at: `${y}-01-01T00:00:00Z` },
        ],
        savingsHistory: [
            { id: 'h1', pot_id: 'pot1', amount: '200', date: `${y}-01-05`, name: 'Deposit', created_at: `${y}-01-05T00:00:00Z` },
            { id: 'h2', pot_id: 'pot1', amount: '100', date: `${y}-02-01`, name: 'Deposit', created_at: `${y}-02-01T00:00:00Z` },
        ],
        debtEntries: [
            { id: 'd1', amount: '1000' },
            { id: 'd2', amount: '-200' },
            { id: 'd3', amount: null },
        ],
        cryptoAssets: [
            { id: 'c-btc', ticker: 'BTC', name: 'Bitcoin', amount: '1', usd: '100', invested_gbp: '50', created_at: `${y}-01-01T00:00:00Z` },
        ],
        bullionHoldings: [
            { id: 'b1', purchase_value: '0', purchase_currency: 'EUR', amount: '1', tax_rate_pct: '0', tax_amount: '0', total_price_incl_tax: '100' },
            { id: 'b2', purchase_value: '50', purchase_currency: 'USD', amount: '1', tax_rate_pct: '20', tax_amount: '0', total_price_incl_tax: null },
        ],
        investmentHoldings: [{ id: 'i1', current_value: '300' }],
        investmentAccountTransactions: [
            { account_id: 'a1', holding_id: null, current_value_impact: '50', transaction_date: `${y}-03-01` },
            { account_id: 'a1', holding_id: null, current_value_impact: '-20', transaction_date: `${previousYear}-12-15` },
            { account_id: 'a1', holding_id: 'i1', current_value_impact: '999', transaction_date: null },
        ],
        realEstateProperties: [
            { id: 'r1', current_value: '1000', mortgage_balance: '400' },
            { id: 'r2', current_value: '0', estimated_value: '0', market_value: '500', mortgage_balance: '100' },
        ],
    })

    const investments = snapshot.portfolio.assetsWithAllocation.find((asset) => asset.name === 'Investments')
    assert.ok(investments)
    almostEqual(investments.value, 330)

    almostEqual(snapshot.pension.totalValue, 350)
    almostEqual(snapshot.savings.totalValue, 1000)
    almostEqual(snapshot.crypto.totalValue, 74.6)
    almostEqual(snapshot.budget.totalExpenditure, 1000)
    almostEqual(snapshot.budget.totalCapital, 500)
    almostEqual(snapshot.budget.committedOutgoingRatio, 37.5)
    almostEqual(snapshot.budget.annualNetSalary, 48000)
    almostEqual(snapshot.budget.disposableIncome, 2500)
    assert.equal(snapshot.budget.profile.employerName, 'ACME')
    assert.equal(snapshot.debt.totalDebt, 1000)
    assert.equal(snapshot.debt.debtCount, 1)

    const expectedTotalAssets = 2884.8300854700855
    const expectedStartOfYear = 2494.8300854700855
    almostEqual(snapshot.portfolio.totalAssets, expectedTotalAssets)
    almostEqual(snapshot.portfolio.startOfYearValue, expectedStartOfYear)
    almostEqual(snapshot.portfolio.ytdPnl, 390)
    almostEqual(snapshot.portfolio.ytdPercentage, (390 / expectedStartOfYear) * 100)

    const allocationSum = snapshot.portfolio.assetsWithAllocation.reduce((sum, asset) => sum + asset.allocation, 0)
    almostEqual(allocationSum, 100)

    assert.equal(snapshot.pension.comparisonLabel, 'PENSIONBEE')
    assert.ok(snapshot.pension.chartData.some((point) => point.label.includes("'")))
    assert.ok(snapshot.pension.chartData.length >= 1)
    assert.ok(snapshot.savings.chartData.length >= 3)
})

test('buildDashboardSnapshot handles empty input and fallback chart states', () => {
    const snapshot = buildDashboardSnapshot({})

    assert.equal(snapshot.portfolio.totalAssets, 0)
    assert.equal(snapshot.portfolio.startOfYearValue, 0)
    assert.equal(snapshot.portfolio.ytdPnl, 0)
    assert.equal(snapshot.portfolio.ytdPercentage, 0)

    assert.equal(snapshot.pension.accounts.length, 0)
    assert.equal(snapshot.pension.chartData.length, 1)
    assert.equal(snapshot.pension.chartData[0].current, 0)
    assert.equal(snapshot.pension.comparisonLabel, 'BENCHMARK')

    assert.equal(snapshot.savings.accounts.length, 0)
    assert.equal(snapshot.savings.chartData.length, 6)
    for (const point of snapshot.savings.chartData) {
        assert.equal(point.current, 0)
    }

    assert.equal(snapshot.budget.profile.employerName, 'Not set')
    assert.equal(snapshot.budget.profile.monthlyNetSalary, 0)
})

test('buildDashboardSnapshot parses savings dates from quick-pick formats for chart and YTD', () => {
    const currentYear = new Date().toISOString().slice(0, 4)
    const previousYear = String(Number(currentYear) - 1)
    const snapshot = buildDashboardSnapshot({
        savingsAccounts: [{ id: 's1', name: 'Main', created_at: `${currentYear}-01-01T00:00:00Z` }],
        savingsPots: [
            { id: 'pot1', account_id: 's1', name: 'Pot', balance: '900', target_amount: null, created_at: `${currentYear}-01-01T00:00:00Z` },
        ],
        savingsHistory: [
            { id: 'h0', pot_id: 'pot1', amount: '-20', date: `${previousYear}-12-31`, name: null, created_at: `${previousYear}-12-31T00:00:00Z` },
            { id: 'h1', pot_id: 'pot1', amount: '100', date: `05/01/${currentYear}`, name: null, created_at: `${currentYear}-01-05T00:00:00Z` },
            { id: 'h2', pot_id: 'pot1', amount: '200', date: `7 February ${currentYear}`, name: null, created_at: `${currentYear}-02-07T00:00:00Z` },
            { id: 'h3', pot_id: 'pot1', amount: '-50', date: `${currentYear}-03-01`, name: null, created_at: `${currentYear}-03-01T10:00:00Z` },
            { id: 'h3b', pot_id: 'pot1', amount: '5', date: `${currentYear}-03-01`, name: null, created_at: `${currentYear}-03-01T11:00:00Z` },
            { id: 'h3c', pot_id: 'pot1', amount: '1', date: `${currentYear}-03-01`, name: null, created_at: `${currentYear}-03-01T11:00:00Z` },
            { id: 'h4', pot_id: 'pot1', amount: '10', date: null, name: null, created_at: `${currentYear}-04-10T12:00:00Z` },
            { id: 'h5', pot_id: 'pot1', amount: '30', date: `March 9, ${currentYear} 12:00:00 UTC`, name: null, created_at: `${currentYear}-03-09T12:00:00Z` },
        ],
    })

    const monthKeys = new Set(snapshot.savings.chartData.map((point) => point.month))
    assert.ok(monthKeys.has(`${currentYear}-01-05`))
    assert.ok(monthKeys.has(`${currentYear}-02-07`))
    assert.ok(monthKeys.has(`${currentYear}-03-01`))
    assert.ok(monthKeys.has(`${currentYear}-03-09`))
    assert.ok(monthKeys.has(`${currentYear}-04-10`))
    assert.ok(snapshot.savings.chartData.some((point) => point.label.includes("'")))

    const expectedFlow = 100 + 200 - 50 + 5 + 1 + 10 + 30
    almostEqual(snapshot.portfolio.ytdPnl, expectedFlow)
    almostEqual(snapshot.portfolio.startOfYearValue, 900 - expectedFlow)
})

test('buildDashboardSnapshot pension pnl falls back to snapshot deltas when no contributions exist', () => {
    const currentYear = new Date().toISOString().slice(0, 4)
    const snapshot = buildDashboardSnapshot({
        pensionAccounts: [
            { id: 'p-previous', provider_name: 'First Provider', current_value: 0 },
            { id: 'p-single', provider_name: 'Second Provider', current_value: '100' },
            { id: 'p-none', provider_name: 'Third Provider', current_value: 75 },
        ],
        pensionValues: [
            { pension_account_id: 'p-previous', value_amount: 100, value_date: `${currentYear}-01-10`, created_at: `${currentYear}-01-10T00:00:00Z` },
            { pension_account_id: 'p-previous', value_amount: 130, value_date: `${currentYear}-02-10`, created_at: `${currentYear}-02-10T00:00:00Z` },
            { pension_account_id: 'p-single', value_amount: 150, value_date: `${currentYear}-03-10`, created_at: `${currentYear}-03-10T12:00:00Z` },
        ],
    })

    const previous = snapshot.pension.accounts.find((p) => p.id === 'p-previous')
    const single = snapshot.pension.accounts.find((p) => p.id === 'p-single')
    const none = snapshot.pension.accounts.find((p) => p.id === 'p-none')

    assert.ok(previous)
    assert.ok(single)
    assert.ok(none)

    almostEqual(previous.pnl, 30)
    almostEqual(previous.pnlPercentage, 30)

    almostEqual(single.pnl, 50)
    almostEqual(single.pnlPercentage, 50)

    almostEqual(none.pnl, 0)
    almostEqual(none.pnlPercentage, 0)

    assert.equal(snapshot.pension.comparisonLabel, 'FIRST PROVIDER')
})

test('buildDashboardSnapshot propagates load-error flags', () => {
    const snapshot = buildDashboardSnapshot({
        pensionLoadError: true,
        budgetLoadError: true,
        savingsLoadError: true,
        debtLoadError: true,
        cryptoLoadError: true,
    })

    assert.equal(snapshot.pension.loadError, true)
    assert.equal(snapshot.budget.loadError, true)
    assert.equal(snapshot.savings.loadError, true)
    assert.equal(snapshot.debt.loadError, true)
    assert.equal(snapshot.crypto.loadError, true)
})
