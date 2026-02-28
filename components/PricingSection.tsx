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
    <section id="pricing" className="scroll-mt-28">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-200/90 mb-3">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Horizontal Plans in GBP</h2>
            <p className="text-slate-300/80 mt-3">Choose Free, Pro, or Max. All prices are pounds sterling (£) per month.</p>
          </div>
          <div className="text-xs text-slate-400">Scroll horizontally on smaller screens</div>
        </div>

        <div className="flex flex-nowrap gap-5 overflow-x-auto pb-3 snap-x snap-mandatory [scrollbar-width:thin]">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`snap-start min-w-[280px] sm:min-w-[320px] lg:min-w-0 lg:flex-1 rounded-2xl p-6 border backdrop-blur-sm transition-all ${plan.highlighted
                ? 'bg-indigo-500/15 border-indigo-400/50 shadow-[0_10px_40px_rgba(129,140,248,0.2)]'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-xl font-bold">{plan.name}</h3>
                {plan.highlighted && (
                  <span className="text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-md bg-indigo-300/20 text-indigo-200">Most Popular</span>
                )}
              </div>
              <p className="text-slate-300/80 text-sm mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">£{plan.price}</span>
                <span className="text-slate-400 ml-2">/ month</span>
              </div>

              <ul className="space-y-2 mb-8 text-sm text-slate-200/90">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-300" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={onOpenLogin}
                className={`w-full rounded-xl px-4 py-2.5 font-semibold transition-colors ${plan.highlighted
                  ? 'bg-indigo-500 text-white hover:bg-indigo-400'
                  : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
              >
                {plan.cta}
              </button>
            </article>
          ))}
        </div>
    </section>
  )
}
