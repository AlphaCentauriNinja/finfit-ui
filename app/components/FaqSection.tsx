'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

const faqs = [
    {
        question: "How does FinFit protect my data?",
        answer: "We use bank-grade encryption and partner with industry leaders like Supabase for secure authentication. Your financial data is encrypted in transit and at rest, and we never sell your data to third parties."
    },
    {
        question: "Can I connect multiple bank accounts?",
        answer: "Yes, you can connect multiple financial providers including banks, investment platforms, and crypto exchanges to see your entire portfolio in one place."
    },
    {
        question: "Is there a free trial for the Pro plan?",
        answer: "We offer a generous Free tier to get you started. You can upgrade to Pro or Max at any time to unlock advanced analytics and planning tools. All plans are billed monthly and can be cancelled whenever you like."
    },
    {
        question: "How are the PNL and percentages calculated?",
        answer: "PNL (Profit and Loss) is calculated by comparing your current asset values against your total contributions. We provide real-time updates so you can see your precise performance at any moment."
    },
    {
        question: "What currencies do you support?",
        answer: "FinFit currently focuses on GBP (£) for tracking and reporting, making it ideal for UK-based users and expats managing British assets. We plan to support more currencies in the near future."
    }
]

export default function FaqSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    return (
        <section id="faq" className="scroll-mt-20">
            <div className="mb-12">
                <p className="text-[11px] uppercase tracking-widest text-blue-400 mb-4">FAQ</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-white">Frequently Asked Questions</h2>
                <p className="text-slate-400 mt-3 max-w-2xl">
                    Everything you need to know about FinFit. Can&apos;t find the answer you&apos;re looking for? Reach out to our support team.
                </p>
            </div>

            <div className="space-y-4">
                {faqs.map((faq, index) => {
                    const isOpen = openIndex === index
                    return (
                        <div
                            key={index}
                            className="rounded-xl border border-white/10 bg-[#0e1629] overflow-hidden transition-all"
                        >
                            <button
                                onClick={() => setOpenIndex(isOpen ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.03] transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <HelpCircle className={`w-5 h-5 transition-colors ${isOpen ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                    <span className={`text-base font-semibold transition-colors ${isOpen ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                        {faq.question}
                                    </span>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
                            </button>

                            <div
                                className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <div className="p-6 text-slate-400 text-sm leading-relaxed border-t border-white/[0.05]">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
