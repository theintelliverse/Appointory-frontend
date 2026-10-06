import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import PublicHeader from '../../components/seo/PublicHeader';
import Footer from '../../components/Footer';
import Breadcrumbs from '../../components/seo/Breadcrumbs';
import DirectAnswer from '../../components/seo/DirectAnswer';
import FaqSection from '../../components/seo/FaqSection';
import WhatsAppShareButton from '../../components/seo/WhatsAppShareButton';
import { Check, X, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function ComparePracto() {
    const pageUrl = '/compare/appointory-vs-practo';
    const pageTitle = 'Appointory vs Practo | Modern Clinic OS Comparison 2026';
    const pageDesc = 'Compare Appointory and Practo for clinic management in India. Learn why clinics choose Appointory for zero-wait OPD queues, 0% GST billing, and independent branding.';

    const faqs = [
        {
            question: "How is Appointory fundamentally different from Practo?",
            answer: "Practo operates primarily as an aggregator directory that lists thousands of doctors and charges commissions or fees to rank providers. Appointory is a private clinical operating system for your own clinic that eliminates waiting room chaos, manages real-time OPD queues, and automates 0% GST billing without diverting your patients to competing clinics."
        },
        {
            question: "Does Appointory show competitor doctor advertisements to my patients?",
            answer: "Never. Appointory is 100% white-label and private. Your patients only see your clinic, your doctors, and your queue updates. No cross-selling of competing specialists."
        },
        {
            question: "Does Appointory support waiting room TV token displays?",
            answer: "Yes. Appointory includes built-in TV screen synchronization with audible bell chimes and multi-cabin balancing. Most legacy software either lacks this entirely or requires expensive external hardware dispensers."
        },
        {
            question: "How does Appointory handle medical GST compliance?",
            answer: "Appointory features automated 0% GST billing under statutory Notification No. 12/2017 (SAC 999312 & SAC 999316) with tamper-proof anti-fraud verification QR codes."
        },
        {
            question: "Can I migrate my existing patient records to Appointory?",
            answer: "Yes. Appointory provides easy CSV and Excel imports for patient contact databases and medical rosters."
        }
    ];

    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Appointory vs Practo Comparison",
            "url": `https://appointory.in${pageUrl}`,
            "description": pageDesc
        },
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(f => ({
                "@type": "Question",
                "name": f.question,
                "acceptedAnswer": { "@type": "Answer", "text": f.answer }
            }))
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://appointory.in" },
                { "@type": "ListItem", "position": 2, "name": "Compare", "item": `https://appointory.in${pageUrl}` },
                { "@type": "ListItem", "position": 3, "name": "Appointory vs Practo", "item": `https://appointory.in${pageUrl}` }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
            <SEO
                title={pageTitle}
                description={pageDesc}
                url={pageUrl}
                keywords="Appointory vs Practo, clinic management software comparison, Practo alternative India, OPD queue management software, doctor appointment software comparison"
                schemaMarkup={jsonLd}
            />
            <PublicHeader />

            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Breadcrumbs items={[{ name: 'Compare', url: '/compare/appointory-vs-practo' }, { name: 'Appointory vs Practo' }]} />

                <header className="mb-8 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Software Evaluation</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Appointory vs Practo: Which is Best for Your Clinic?
                    </h1>
                    <p className="mt-4 text-lg text-slate-600">
                        An objective analysis of real-time OPD queue orchestration, patient data privacy, 0% GST billing, and independent clinic branding.
                    </p>
                </header>

                <DirectAnswer
                    query="What is the primary difference between Appointory and Practo?"
                    answer="While Practo functions primarily as a patient aggregator marketplace where competing doctors are listed, Appointory is a dedicated clinic operating system focused on eliminating physical waiting room chaos with live TV token displays, private WhatsApp alerts, 0% GST healthcare billing, and zero ads for competing doctors."
                />

                {/* Comparison Table */}
                <section className="my-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Feature-by-Feature Comparison</h2>
                    <div className="overflow-x-auto border border-slate-200 rounded-3xl bg-white shadow-xs">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-900 font-bold">
                                <tr>
                                    <th className="p-4 sm:p-5">Feature</th>
                                    <th className="p-4 sm:p-5 bg-teal-50/60 text-teal-900 font-extrabold">Appointory</th>
                                    <th className="p-4 sm:p-5 text-slate-500">Legacy Aggregators (Practo)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                <tr>
                                    <td className="p-4 sm:p-5 font-semibold text-slate-900">Live OPD Queue & Token TV</td>
                                    <td className="p-4 sm:p-5 bg-teal-50/30 text-teal-800 font-bold flex items-center gap-2">
                                        <Check className="w-4 h-4 text-teal-600" /> Real-time TV & mobile sync
                                    </td>
                                    <td className="p-4 sm:p-5 text-slate-500">Limited / Requires extra hardware</td>
                                </tr>
                                <tr>
                                    <td className="p-4 sm:p-5 font-semibold text-slate-900">Patient Data Privacy</td>
                                    <td className="p-4 sm:p-5 bg-teal-50/30 text-teal-800 font-bold flex items-center gap-2">
                                        <Check className="w-4 h-4 text-teal-600" /> 100% Private, DPDP 2023 compliant
                                    </td>
                                    <td className="p-4 sm:p-5 text-slate-500">Shared marketplace directory</td>
                                </tr>
                                <tr>
                                    <td className="p-4 sm:p-5 font-semibold text-slate-900">Competing Doctor Ads</td>
                                    <td className="p-4 sm:p-5 bg-teal-50/30 text-teal-800 font-bold flex items-center gap-2">
                                        <Check className="w-4 h-4 text-teal-600" /> Never (Zero ads)
                                    </td>
                                    <td className="p-4 sm:p-5 text-red-600 font-medium">May suggest nearby competitors</td>
                                </tr>
                                <tr>
                                    <td className="p-4 sm:p-5 font-semibold text-slate-900">0% GST Invoicing (SAC 999312)</td>
                                    <td className="p-4 sm:p-5 bg-teal-50/30 text-teal-800 font-bold flex items-center gap-2">
                                        <Check className="w-4 h-4 text-teal-600" /> Automated statutory compliance
                                    </td>
                                    <td className="p-4 sm:p-5 text-slate-500">Basic billing invoice generator</td>
                                </tr>
                                <tr>
                                    <td className="p-4 sm:p-5 font-semibold text-slate-900">Diagnostic Lab 6-Digit Handshake</td>
                                    <td className="p-4 sm:p-5 bg-teal-50/30 text-teal-800 font-bold flex items-center gap-2">
                                        <Check className="w-4 h-4 text-teal-600" /> Direct cloud report synchronization
                                    </td>
                                    <td className="p-4 sm:p-5 text-slate-500">Manual upload / Not integrated</td>
                                </tr>
                                <tr>
                                    <td className="p-4 sm:p-5 font-semibold text-slate-900">Pricing Transparency</td>
                                    <td className="p-4 sm:p-5 bg-teal-50/30 text-teal-800 font-bold flex items-center gap-2">
                                        <Check className="w-4 h-4 text-teal-600" /> Flat ₹0 to ₹999/mo (No commission)
                                    </td>
                                    <td className="p-4 sm:p-5 text-slate-500">High annual tiers + listing fees</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <FaqSection faqs={faqs} title="Comparison FAQs" />

                <div className="my-12 p-8 bg-teal-900 text-white rounded-3xl text-center space-y-4">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Experience the Difference in Your Clinic</h2>
                    <p className="text-teal-200 text-sm sm:text-base max-w-xl mx-auto">
                        Keep your patients loyal to your brand with zero waiting room congestion.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        <Link
                            to="/register-clinic"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-teal-900 font-bold hover:bg-teal-50 transition-colors shadow-sm"
                        >
                            <span>Switch to Appointory Free</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <WhatsAppShareButton 
                            text="Comparison between Appointory and Practo for clinic management"
                            path={pageUrl}
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
