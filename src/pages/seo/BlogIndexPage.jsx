import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import PublicHeader from '../../components/seo/PublicHeader';
import Footer from '../../components/Footer';
import Breadcrumbs from '../../components/seo/Breadcrumbs';
import DirectAnswer from '../../components/seo/DirectAnswer';
import FaqSection from '../../components/seo/FaqSection';
import WhatsAppShareButton from '../../components/seo/WhatsAppShareButton';
import { BookOpen, Calendar, UserCheck, ArrowRight, ShieldCheck } from 'lucide-react';

const ARTICLES = [
    {
        title: "Is Doctor Consultation Exempt from GST in India? Complete SAC 999312 Guide",
        slug: "is-doctor-consultation-gst-exempt-india",
        category: "Taxation & Compliance",
        date: "2026-09-15",
        readTime: "6 min read",
        excerpt: "An in-depth statutory analysis of Notification No. 12/2017-Central Tax (Rate), Entry 74, SAC 999312, and how Indian clinics must handle 0% GST itemized billing."
    },
    {
        title: "How to Reduce Clinic Waiting Room Times by 70% with Live TV Tokens",
        slug: "how-to-reduce-clinic-waiting-room-times",
        category: "OPD Operations",
        date: "2026-09-08",
        readTime: "5 min read",
        excerpt: "Why overcrowded waiting rooms drive away patients and how smart TV displays synchronized with WhatsApp alerts restore dignity to the OPD experience."
    },
    {
        title: "Digital Personal Data Protection (DPDP) Act 2023: Compliance Guide for Indian Clinics",
        slug: "dpdp-act-2023-compliance-guide-indian-clinics",
        category: "Patient Privacy & Legal",
        date: "2026-08-28",
        readTime: "8 min read",
        excerpt: "Understanding clinical consent management, AES-256 encrypted health lockers, and safeguarding sensitive patient health records under DPDP Act 2023."
    },
    {
        title: "Connecting Outpatient Clinics with Independent Pathology Labs: The 6-Digit Handshake",
        slug: "clinic-pathology-lab-handshake-network",
        category: "Diagnostic Integration",
        date: "2026-08-14",
        readTime: "5 min read",
        excerpt: "How eliminating manual transcription slips with instant 6-digit handshake codes speeds up diagnosis, reduces specimen mix-ups, and automates report delivery."
    }
];

export default function BlogIndexPage() {
    const pageUrl = '/blog';
    const pageTitle = 'Clinic Management & Healthcare IT Blog | Appointory';
    const pageDesc = 'Insights, statutory tax guides, and OPD operational strategies for Indian doctors and clinics. Learn about 0% GST billing, DPDP compliance, and queue tech.';

    const faqs = [
        {
            question: "Who writes and reviews articles on the Appointory Clinical Blog?",
            answer: "Our articles are authored by healthcare IT specialists and reviewed by practicing physicians and Chartered Accountants to ensure clinical accuracy and statutory compliance under Indian healthcare law."
        },
        {
            question: "Can I use these insights to streamline my clinic's tax audits?",
            answer: "Yes. Our guides cite official government gazette notifications, CBIC rulings, and National Medical Commission standards to help clinics maintain audit-proof records."
        }
    ];

    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Appointory Healthcare Insights & Clinic Management Blog",
            "url": `https://appointory.in${pageUrl}`,
            "description": pageDesc,
            "publisher": {
                "@type": "Organization",
                "name": "Appointory",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://appointory.in/appointory-logo-mark.png"
                }
            }
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://appointory.in" },
                { "@type": "ListItem", "position": 2, "name": "Blog", "item": `https://appointory.in${pageUrl}` }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
            <SEO
                title={pageTitle}
                description={pageDesc}
                url={pageUrl}
                keywords="clinic management blog, healthcare IT India, doctor consultation GST guide, clinic waiting room management, DPDP Act healthcare"
                schemaMarkup={jsonLd}
            />
            <PublicHeader />

            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Breadcrumbs items={[{ name: 'Blog' }]} />

                <header className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Clinical Knowledge & Best Practices</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Healthcare IT & Clinic Management Insights
                    </h1>
                    <p className="mt-4 text-lg text-slate-600 max-w-3xl">
                        Statutory guides, queue optimization strategies, and tech tutorials for modern outpatient clinics across Bharat.
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <UserCheck className="w-4 h-4 text-teal-600" />
                        <span>Reviewed by Chartered Accountants & Practicing Medical Professionals</span>
                    </div>
                </header>

                <DirectAnswer
                    query="What are the essential technological upgrades modern Indian clinics require?"
                    answer="Modern Indian clinics require three core systems: real-time OPD queue displays with WhatsApp alerts to eliminate waiting room crowding, statutory 0% GST billing engines (SAC 999312) with anti-fraud QR audit trails, and encrypted lab networks that sync diagnostic test results directly to doctor screens."
                />

                {/* Articles List */}
                <section className="my-10 space-y-6">
                    {ARTICLES.map((art, idx) => (
                        <article 
                            key={idx}
                            className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs hover:border-teal-300 transition-all group"
                        >
                            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 mb-3">
                                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">{art.category}</span>
                                <span>&bull;</span>
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {art.date}</span>
                                <span>&bull;</span>
                                <span>{art.readTime}</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                                {art.title}
                            </h2>
                            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
                                {art.excerpt}
                            </p>
                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-sm font-semibold text-teal-700 flex items-center gap-1">
                                    <span>Read Full Article</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <WhatsAppShareButton 
                                    text={`Interesting healthcare article: ${art.title}`}
                                    path={`${pageUrl}#${art.slug}`}
                                    className="!py-1.5 !px-3 !text-xs"
                                />
                            </div>
                        </article>
                    ))}
                </section>

                <FaqSection faqs={faqs} title="Blog & Knowledge Base FAQs" />
            </main>

            <Footer />
        </div>
    );
}
