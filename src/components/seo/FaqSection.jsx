import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

/**
 * FaqSection Component for AEO and User Engagement
 * Renders 8-12 collapsible, accessible Q&As per page.
 */
export default function FaqSection({ faqs = [], title = "Frequently Asked Questions", subtitle = "Clear, verified answers regarding Appointory clinic workflows and Indian healthcare compliance." }) {
    const [openIndex, setOpenIndex] = useState(0);

    const toggle = (idx) => {
        setOpenIndex(openIndex === idx ? -1 : idx);
    };

    return (
        <section className="my-12 sm:my-16" aria-labelledby="faq-heading">
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Got Questions?</span>
                </div>
                <h2 id="faq-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-2 text-sm sm:text-base text-slate-600">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="max-w-3xl mx-auto space-y-3">
                {faqs.map((faq, idx) => {
                    const isOpen = openIndex === idx;
                    return (
                        <div 
                            key={idx}
                            className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs transition-colors duration-150"
                        >
                            <button
                                type="button"
                                onClick={() => toggle(idx)}
                                aria-expanded={isOpen}
                                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-semibold text-slate-900 hover:text-teal-700 transition-colors cursor-pointer text-sm sm:text-base"
                            >
                                <span>{faq.question}</span>
                                <ChevronDown 
                                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-teal-600' : ''}`} 
                                />
                            </button>
                            {isOpen && (
                                <div className="px-5 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100 bg-slate-50/50">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
