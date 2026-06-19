import { toNumber } from '@/lib/utils/number'
import type { BudgetProfileRow, BudgetExpenditureRow, BudgetCapitalRow, DashboardBudgetExpenditure, DashboardBudgetCapital } from '../types'

export const buildBudgetSnapshot = (
    budgetProfile: BudgetProfileRow | null | undefined,
    budgetExpenditures: BudgetExpenditureRow[],
    budgetCapital: BudgetCapitalRow[]
) => {
    const monthlyNetSalary = (() => {
        const parsed = toNumber(budgetProfile?.monthly_net_salary)
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
    })()
    const employerName = (budgetProfile?.employer_name ?? '').trim() || 'Not set'

    const expenditures = budgetExpenditures
        .map<DashboardBudgetExpenditure | null>((expenditure) => {
            const amount = toNumber(expenditure.monthly_amount)
            const name = (expenditure.expenditure_name ?? '').trim()

            if (!expenditure.id || !name || !Number.isFinite(amount) || amount < 0) {
                return null
            }

            return {
                id: expenditure.id,
                name,
                amount,
            }
        })
        .filter((entry): entry is DashboardBudgetExpenditure => Boolean(entry))

    const capital = budgetCapital
        .map<DashboardBudgetCapital | null>((cap) => {
            const amount = toNumber(cap.monthly_amount)
            const name = (cap.capital_name ?? '').trim()

            if (!cap.id || !name || !Number.isFinite(amount) || amount < 0) {
                return null
            }

            return {
                id: cap.id,
                name,
                amount,
            }
        })
        .filter((entry): entry is DashboardBudgetCapital => Boolean(entry))

    const totalExpenditure = expenditures.reduce((sum, expenditure) => sum + expenditure.amount, 0)
    const totalCapital = capital.reduce((sum, cap) => sum + cap.amount, 0)
    const committedOutgoingRatio = monthlyNetSalary > 0
        ? ((totalExpenditure + totalCapital) / monthlyNetSalary) * 100
        : 0
    const annualNetSalary = monthlyNetSalary * 12
    const disposableIncome = monthlyNetSalary - totalExpenditure - totalCapital

    return {
        profile: {
            employerName,
            monthlyNetSalary,
        },
        expenditures,
        capital,
        totalExpenditure,
        totalCapital,
        committedOutgoingRatio,
        annualNetSalary,
        disposableIncome,
    }
}
