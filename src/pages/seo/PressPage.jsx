import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import PublicHeader from '../../components/seo/PublicHeader';
import Footer from '../../components/Footer';
import Breadcrumbs from '../../components/seo/Breadcrumbs';
import DirectAnswer from '../../components/seo/DirectAnswer';
import FaqSection from '../../components/seo/FaqSection';
import WhatsAppShareButton from '../../components/seo/WhatsAppShareButton';
import { Download, Newspaper, Mail, BarChart3, CheckCircle2 } from 'lucide-react';

export default function PressPage() {
    const pageUrl = '/press';
    const pageTitle = 'Press & Media Kit | Appointory Healthcare Technologies';
    const pageDesc = 'Official press releases, media assets, company logos, and quotable healthcare statistics for journalists and industry analysts covering Appointory.';

    const faqs = [
        {
            question: "How should Appointory be cited in news publications?",
            answer: "Appointory should be cited as 'Appointory – Care without the Waiting Room', a clinical operating system developed in India that unifies outpatient clinic queues, smart 0% GST billing, and diagnostic lab networks."
        },
        {
            question: "Where can journalists download official brand assets?",
            answer: "Official vector and high-resolution PNG logos, founder headshots, and product UI screenshots can be downloaded directly from this page under the Brand Assets section."
        }
    ];

    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Appointory Press & Media Kit",
            "url": `https://appointory.in${pageUrl}`,
            "description": pageDesc
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://appointory.in" },
                { "@type": "ListItem", "position": 2, "name": "Press", "item": `https://appointory.in${pageUrl}` }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
            <SEO
                title={pageTitle}
                description={pageDesc}
                url={pageUrl}
                keywords="Appointory press kit, Appointory media kit, healthcare IT news India, clinic software press release, OPD queue statistics"
                schemaMarkup={jsonLd}
            />
            <PublicHeader />

            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Breadcrumbs items={[{ name: 'Press' }]} />

                <header className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3">
                        <Newspaper className="w-3.5 h-3.5" />
                        <span>Media Resources</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Appointory Press & Media Kit
                    </h1>
                    <p className="mt-4 text-lg text-slate-600 max-w-3xl">
                        Fact sheets, verifiable clinical statistics, and brand identity assets for journalists, healthcare researchers, and technology analysts.
                    </p>
                </header>

                <DirectAnswer
                    query="What are the key facts about Appointory for press and media coverage?"
                    answer="Appointory is India's clinical operating system founded on the principle of 'Care without the Waiting Room'. Clinically proven to reduce OPD waiting room crowding by up to 70%, it synchronizes live TV token boards, WhatsApp queue alerts, statutory 0% GST healthcare billing (SAC 999312), and independent diagnostic lab handshakes."
                />

                {/* Quotable Stats */}
                <section className="my-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-4xl font-black text-teal-600 block mb-1">70%</span>
                        <p className="font-bold text-slate-900">Wait Time Reduction</p>
                        <p className="text-xs text-slate-500 mt-1">Average decrease in physical waiting room congestion across partner clinics.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-4xl font-black text-teal-600 block mb-1">&lt;30s</span>
                        <p className="font-bold text-slate-900">Digital Prescription Time</p>
                        <p className="text-xs text-slate-500 mt-1">Doctors generate NMC-compliant prescriptions dispatched straight to patient WhatsApp.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-4xl font-black text-teal-600 block mb-1">100%</span>
                        <p className="font-bold text-slate-900">DPDP Act 2023 Compliant</p>
                        <p className="text-xs text-slate-500 mt-1">AES-256 encrypted digital health locker and explicit patient consent protocols.</p>
                    </div>
                </section>

                {/* Brand Assets */}
                <section className="my-10 bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Official Brand Assets</h2>
                    <p className="text-slate-600 text-sm mb-6">High-resolution assets for digital and print reproduction.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <a 
                            href="/appointory-logo-mark.png" 
                            download 
                            className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50 transition-colors"
                        >
                            <span className="font-semibold text-slate-800 text-sm">Appointory Logo Mark (PNG)</span>
                            <Download className="w-4 h-4 text-teal-600" />
                        </a>
                        <a 
                            href="/og-image.png" 
                            download 
                            className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50 transition-colors"
                        >
                            <span className="font-semibold text-slate-800 text-sm">Official Social Banner 1200x630 (PNG)</span>
                            <Download className="w-4 h-4 text-teal-600" />
                        </a>
                    </div>
                </section>

                <div className="my-10 p-6 bg-slate-100 rounded-2xl flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm">Media Inquiries & Interview Requests</h3>
                        <p className="text-xs text-slate-600 mt-0.5">Reach our communications team at media@appointory.in</p>
                    </div>
                    <a
                        href="mailto:contact@appointory.in?subject=Press%20Inquiry%20-%20Appointory"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 transition-colors"
                    >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Contact Press</span>
                    </a>
                </div>

                <FaqSection faqs={faqs} title="Press FAQs" />
            </main>

            <Footer />
        </div>
    );
}
