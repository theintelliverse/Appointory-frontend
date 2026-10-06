import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import PublicHeader from '../../components/seo/PublicHeader';
import Footer from '../../components/Footer';
import Breadcrumbs from '../../components/seo/Breadcrumbs';
import DirectAnswer from '../../components/seo/DirectAnswer';
import FaqSection from '../../components/seo/FaqSection';
import WhatsAppShareButton from '../../components/seo/WhatsAppShareButton';
import { Receipt, ShieldAlert, CheckCircle2, QrCode, FileText, ArrowRight, Scale, AlertTriangle } from 'lucide-react';

export default function FeatureGstBilling() {
    const pageUrl = '/features/gst-billing';
    const pageTitle = 'Clinic Billing Software with 0% GST Exemption (SAC 999312)';
    const pageDesc = 'Appointory clinic billing software automates 0% GST medical invoices under Notification 12/2017, SAC 999312 & 999316, with anti-fraud QR verification.';

    const faqs = [
        {
            question: "Is doctor consultation exempt from GST in India?",
            answer: "Yes. Under Notification No. 12/2017-Central Tax (Rate), Entry 74, health care services provided by a clinical establishment, an authorized medical practitioner, or paramedics are exempt from GST (Nil / 0% GST rate) under Services Accounting Code (SAC) 999312."
        },
        {
            question: "What is SAC 999312 and SAC 999316?",
            answer: "SAC 999312 covers general and specialist medical consultation services (0% GST exemption). SAC 999316 covers medical laboratory and diagnostic testing services (0% GST exemption). Appointory auto-assigns the correct SAC code to every line item."
        },
        {
            question: "Are medicines and cosmetic procedures also 0% GST exempt?",
            answer: "No. While clinical consultation and diagnostic path tests are 0% exempt under Entry 74, retail medicines sold via in-house pharmacy counters are taxed at 5%, 12%, or 18% GST. Cosmetic surgeries that are not reconstructive post-trauma also attract 18% GST."
        },
        {
            question: "How does Appointory handle tamper-proof QR verification on medical bills?",
            answer: "Every invoice generated through Appointory embeds a unique cryptographic QR code. When scanned by patients, insurance TPAs, or tax auditors, it verifies authenticity against our cloud ledger, eliminating counterfeit medical claims."
        },
        {
            question: "Can patients submit Appointory invoices for health insurance mediclaim?",
            answer: "Yes. Appointory invoices contain all mandatory statutory details: clinic registration, treating doctor Medical Council registration number, itemized test/procedure breakdowns, and timestamped digital signatures."
        },
        {
            question: "Do small clinics below the ₹40 lakh GST threshold need GST numbers to use Appointory?",
            answer: "No. Small practitioners and unregistered clinics can generate legitimate medical fee receipts without a GSTIN, while GST-registered polyclinics can insert their GSTIN for formal statutory filing."
        },
        {
            question: "Can I collect payments via UPI QR directly on the bill?",
            answer: "Yes. Invoices include dynamic clinic UPI QR codes so patients can scan and pay instantly via Google Pay, PhonePe, Paytm, or BHIM without manual card swipe machines."
        }
    ];

    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Appointory Clinic GST Billing Engine",
            "operatingSystem": "Web, Android, iOS, Windows, macOS",
            "applicationCategory": "HealthApplication",
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
                { "@type": "ListItem", "position": 2, "name": "Features", "item": "https://appointory.in/features/gst-billing" },
                { "@type": "ListItem", "position": 3, "name": "0% GST Clinic Billing", "item": `https://appointory.in${pageUrl}` }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
            <SEO
                title={pageTitle}
                description={pageDesc}
                url={pageUrl}
                keywords="clinic billing software GST, is medical consultation GST exempt in India, SAC 999312, SAC 999316, doctor invoice software India, mediclaim medical bill generator"
                schemaMarkup={jsonLd}
            />
            <PublicHeader />

            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Breadcrumbs items={[{ name: 'Features', url: '/features/gst-billing' }, { name: '0% GST Billing Engine' }]} />

                <header className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3">
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Statutory Healthcare Billing</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Clinic Billing Software with Automated 0% GST Exemption
                    </h1>
                    <p className="mt-4 text-lg text-slate-600 max-w-3xl">
                        Generate compliant, itemized clinical invoices with accurate SAC codes (SAC 999312 & 999316), anti-fraud verification QR codes, and instant UPI collection.
                    </p>
                </header>

                <DirectAnswer
                    query="Are medical consultations and clinical treatments GST exempt in India?"
                    answer="Yes. Under Notification No. 12/2017-Central Tax (Rate), Entry 74, clinical consultations (SAC 999312) and diagnostic pathology tests (SAC 999316) by registered practitioners are 100% exempt from GST (Nil / 0% tax). Appointory automatically formats these invoices with statutory citations and anti-fraud QR verification."
                />

                {/* CA / Statutory Legal Disclaimer */}
                <aside className="my-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4">
                    <Scale className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-900 leading-relaxed">
                        <strong className="block font-bold mb-1">Chartered Accountant & Legal Advisory Note:</strong>
                        Under GST law, healthcare exemption applies exclusively to recognized diagnostic and therapeutic consultations for cure, healing, or prevention of illness. Retail pharmacy sales, nutraceuticals, or non-therapeutic aesthetic procedures remain subject to standard GST rates (5%, 12%, or 18%). Consult your tax advisor regarding composite supply thresholds.
                    </div>
                </aside>

                {/* Comparison Table */}
                <section className="my-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">SAC Code & GST Rates for Indian Healthcare</h2>
                    <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-xs">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-900 font-bold">
                                <tr>
                                    <th className="p-4">Service Category</th>
                                    <th className="p-4">SAC Code</th>
                                    <th className="p-4">GST Rate</th>
                                    <th className="p-4">Statutory Basis</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                <tr>
                                    <td className="p-4 font-semibold text-slate-900">Doctor OPD Consultation</td>
                                    <td className="p-4 font-mono text-teal-700">999312</td>
                                    <td className="p-4 font-bold text-emerald-700">0% (Nil)</td>
                                    <td className="p-4 text-xs">Notification 12/2017, Entry 74</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-semibold text-slate-900">Pathology & Diagnostic Tests</td>
                                    <td className="p-4 font-mono text-teal-700">999316</td>
                                    <td className="p-4 font-bold text-emerald-700">0% (Nil)</td>
                                    <td className="p-4 text-xs">Notification 12/2017, Entry 74</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-semibold text-slate-900">Outpatient Minor Clinical Procedures</td>
                                    <td className="p-4 font-mono text-teal-700">999312</td>
                                    <td className="p-4 font-bold text-emerald-700">0% (Nil)</td>
                                    <td className="p-4 text-xs">Notification 12/2017, Entry 74</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-semibold text-slate-900">Retail Pharmacy Medicines</td>
                                    <td className="p-4 font-mono text-slate-500">HSN 3004</td>
                                    <td className="p-4 font-bold text-amber-700">5% / 12%</td>
                                    <td className="p-4 text-xs">Standard Drug GST Schedule</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <FaqSection faqs={faqs} title="Clinic GST Billing FAQs" />

                <div className="my-12 p-8 bg-teal-900 text-white rounded-3xl text-center space-y-4">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Generate Compliant Medical Bills Today</h2>
                    <p className="text-teal-200 text-sm sm:text-base max-w-xl mx-auto">
                        Say goodbye to messy paper receipts and audit headaches. Try Appointory smart billing free.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        <Link
                            to="/register-clinic"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-teal-900 font-bold hover:bg-teal-50 transition-colors shadow-sm"
                        >
                            <span>Start Free Billing</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <WhatsAppShareButton 
                            text="Found this statutory 0% GST billing tool for clinics: Appointory"
                            path={pageUrl}
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
