'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { babySteps, type BabyStep } from '@/lib/baby-steps'

export default function FinFitLevelsPage() {
    const [selectedStep, setSelectedStep] = useState<BabyStep | null>(null)

    return (
        <div className="w-full space-y-8">
            <header className="space-y-3">
                <h1 className="text-2xl font-bold text-white">FinFit Levels</h1>
                <div className="max-w-4xl space-y-4 text-sm text-white/70 leading-relaxed">
                    <p>
                        The FinFit Levels framework follows a structured 7-step path to financial fitness. Instead of treating money goals as disconnected tasks, it creates a clear order: stabilize first, then remove debt pressure, then grow long-term wealth from a stronger foundation.
                    </p>
                    <p>
                        The sequence starts with a £1,000 starter emergency fund, then moves to paying off all non-mortgage debt. After that, the focus shifts to building a fully funded emergency reserve of 3-6 months of expenses, investing 15% of household income for retirement, and saving for children&apos;s education where relevant.
                    </p>
                    <p>
                        Once those core priorities are in place, the final levels are to pay off your home early and continue building wealth while giving generously. The reason this method works is that each level reduces risk and increases capacity, so progress becomes more sustainable over time rather than relying on short-term motivation alone.
                    </p>
                </div>
            </header>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {babySteps.map((step) => (
                    <button
                        key={step.step}
                        type="button"
                        onClick={() => setSelectedStep(step)}
                        className="text-left bg-white/5 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-white/10 hover:bg-white/10 hover:border-indigo-400/35 transition-all"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 font-bold text-sm flex items-center justify-center">
                                {step.step}
                            </div>
                            <h2 className="text-base font-semibold text-white">{step.title}</h2>
                        </div>
                        <p className="text-sm text-white/70 leading-relaxed">{step.description}</p>
                    </button>
                ))}
            </section>

            {selectedStep && (
                <div
                    className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelectedStep(null)}
                >
                    <div
                        className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-6 md:p-7 space-y-6"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                                <p className="text-xs uppercase tracking-[0.2em] text-indigo-200/80">
                                    Step {selectedStep.step}
                                </p>
                                <h3 className="text-xl md:text-2xl font-bold text-white">
                                    {selectedStep.title}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedStep(null)}
                                className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                                aria-label="Close details modal"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                                <p className="text-xs uppercase tracking-wide text-white/45 mb-2">Focus</p>
                                <p className="text-sm text-white/85 leading-relaxed">
                                    {selectedStep.details.headline}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                                <p className="text-xs uppercase tracking-wide text-white/45 mb-2">Why It Matters</p>
                                <p className="text-sm text-white/85 leading-relaxed">
                                    {selectedStep.details.whyItMatters}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                                <p className="text-xs uppercase tracking-wide text-white/45 mb-2">Action Checklist</p>
                                <ul className="space-y-2">
                                    {selectedStep.details.actions.map((action) => (
                                        <li key={action} className="text-sm text-white/80 leading-relaxed flex gap-2">
                                            <span className="text-indigo-300 mt-0.5">•</span>
                                            <span>{action}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
