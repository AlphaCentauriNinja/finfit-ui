export type BabyStep = {
    step: number
    title: string
    description: string
    details: {
        headline: string
        whyItMatters: string
        actions: string[]
    }
}

export const babySteps: BabyStep[] = [
    {
        step: 1,
        title: 'Save £1,000 for your starter emergency fund',
        description: 'Build a quick cash buffer so small surprises do not force you into debt.',
        details: {
            headline: 'Create immediate breathing room with a starter emergency fund.',
            whyItMatters: 'This first buffer is designed to stop small emergencies from turning into new debt and to help you break the paycheck-to-paycheck cycle.',
            actions: [
                'Set a clear £1,000 starter target and keep it in easy-access savings.',
                'Use this fund only for true emergencies, not routine spending.',
                'Focus on speed: pause nonessential spending until the target is complete.',
            ],
        },
    },
    {
        step: 2,
        title: 'Pay off all debt (except your home)',
        description: 'Use focused debt payoff momentum and clear non-mortgage balances one by one.',
        details: {
            headline: 'Eliminate non-mortgage debt with a smallest-to-largest payoff sequence.',
            whyItMatters: 'Quick wins create momentum, and momentum helps you stay consistent long enough to become fully debt-free outside your mortgage.',
            actions: [
                'List debts from smallest balance to largest balance.',
                'Pay minimums on all debts except the smallest one.',
                'Throw every extra pound at the smallest debt, then roll that payment into the next debt.',
            ],
        },
    },
    {
        step: 3,
        title: 'Save 3-6 months of expenses',
        description: 'Fully fund your emergency reserve so essential bills are covered during setbacks.',
        details: {
            headline: 'Build a fully funded emergency reserve for real financial resilience.',
            whyItMatters: 'A larger emergency fund helps turn major setbacks into manageable events and protects your long-term plan from interruption.',
            actions: [
                'Calculate essential monthly expenses only, then multiply by 3-6 months.',
                'Aim nearer 3 months for stable income, nearer 6 months for variable income.',
                'Keep this money in a secure, liquid savings account and replenish quickly after use.',
            ],
        },
    },
    {
        step: 4,
        title: 'Invest 15% of household income for retirement',
        description: 'Start consistent long-term investing to build future financial independence.',
        details: {
            headline: 'Automate long-term investing with a 15% target of gross household income.',
            whyItMatters: 'Consistency and time in the market are the core drivers of retirement outcomes and long-term compounding.',
            actions: [
                'Calculate 15% of gross household income and set a monthly contribution target.',
                'Use tax-advantaged retirement accounts where available.',
                'Automate contributions so investing happens every month without fail.',
            ],
        },
    },
    {
        step: 5,
        title: "Save for your children's education",
        description: 'Set aside dedicated funds for future education costs where relevant.',
        details: {
            headline: 'Build a dedicated education fund once retirement investing is on track.',
            whyItMatters: 'Separating education savings from day-to-day cash flow helps reduce future borrowing pressure for both parents and children.',
            actions: [
                'Choose a dedicated education savings vehicle that fits your region and tax rules.',
                'Set a monthly contribution amount and review progress at least quarterly.',
                'Combine planned savings with grants and scholarships to reduce borrowing needs.',
            ],
        },
    },
    {
        step: 6,
        title: 'Pay off your home early',
        description: 'Reduce long-term interest costs and increase monthly cash-flow freedom.',
        details: {
            headline: 'Accelerate mortgage payoff while maintaining core long-term priorities.',
            whyItMatters: 'Sending extra payments to principal reduces interest and shortens your payoff timeline, unlocking significant future cash flow.',
            actions: [
                'Add extra payments directly to mortgage principal whenever possible.',
                'Use one-off cash injections (bonuses, refunds) to accelerate payoff.',
                'Maintain retirement and education contributions while attacking the mortgage.',
            ],
        },
    },
    {
        step: 7,
        title: 'Build wealth and give',
        description: 'Continue investing, grow assets, and give generously with margin.',
        details: {
            headline: 'Shift from recovery mode to long-term wealth growth and generous giving.',
            whyItMatters: 'With debt removed and obligations reduced, you can direct more of your income to investing, impact, and intentional lifestyle choices.',
            actions: [
                'Keep growing investments with a disciplined long-term allocation plan.',
                'Maintain clear giving goals as part of your monthly and annual plan.',
                'Continue budgeting so enjoyment, generosity, and wealth-building stay balanced.',
            ],
        },
    },
]
