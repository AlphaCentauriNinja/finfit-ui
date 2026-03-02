import { Check } from 'lucide-react'

type PricingSectionProps = {
  onOpenLogin: () => void
}

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'For getting started with tracking your personal finances.',
    features: ['Dashboard overview', 'Basic budgeting', 'Transaction history'],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 10,
    description: 'For deeper financial planning and smarter insights.',
    features: ['Everything in Free', 'Advanced analytics', 'Goal planning tools'],
    cta: 'Choose Pro',
    highlighted: true,
  },
  {
    name: 'Max',
    price: 20,
    description: 'For power users managing more assets and complexity.',
    features: ['Everything in Pro', 'Priority support', 'Premium forecasting'],
    cta: 'Choose Max',
    highlighted: false,
  },
]

export default function PricingSection({ onOpenLogin }: PricingSectionProps) {
  return (
    <section id="pricing" className="scroll-mt-20">

      {/* Header */}
      <div className="mb-12">
        <p className="text-[11px] uppercase tracking-widest text-blue-400 mb-4">Pricing</p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Plans in GBP</h2>
          <p className="text-sm text-slate-500">All prices per month &middot; Cancel anytime</p>
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.05] rounded-xl overflow-hidden border border-white/[0.06]">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col p-8 ${plan.highlighted ? 'bg-[#0d1a35]' : 'bg-[#080d1a] hover:bg-[#0e1629]'
              } transition-colors`}
          >
            {/* Most popular badge */}
            {plan.highlighted && (
              <div className="absolute top-0 left-8 right-8">
                <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">{plan.name}</h3>
                {plan.highlighted && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-blue-400/30 bg-blue-400/10 text-blue-300 uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">{plan.description}</p>
            </div>

            <div className="mb-8">
              <span className="text-5xl font-bold text-white tabular-nums">£{plan.price}</span>
              <span className="text-slate-500 ml-2 text-sm">/ month</span>
            </div>

            <ul className="space-y-3 mb-10 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-sm text-slate-400">
                  <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={onOpenLogin}
              className={`w-full rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${plan.highlighted
                  ? 'bg-blue-600 text-white hover:bg-blue-500'
                  : 'bg-white/[0.05] text-slate-300 border border-white/[0.08] hover:bg-white/[0.1] hover:text-white'
                }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

    </section>
  )
}
