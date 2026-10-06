import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import PublicHeader from '../../components/seo/PublicHeader';
import Footer from '../../components/Footer';
import Breadcrumbs from '../../components/seo/Breadcrumbs';
import DirectAnswer from '../../components/seo/DirectAnswer';
import FaqSection from '../../components/seo/FaqSection';
import WhatsAppShareButton from '../../components/seo/WhatsAppShareButton';
import { ShieldCheck, HeartHandshake, MapPin, Building, Globe, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
    const pageUrl = '/about';
    const pageTitle = 'About Appointory | Care without the Waiting Room';
    const pageDesc = 'Appointory is India’s clinical operating system on a mission to eliminate waiting room congestion through real-time TV tokens, 0% GST billing, and synchronized lab networks.';

    const faqs = [
        {
            question: "What is Appointory's founding mission?",
            answer: "Appointory was founded with a singular conviction: 'Care without the Waiting Room'. We believe patient time is sacred, and Indian OPD clinics deserve world-class technology that eliminates physical congestion, restores doctor peace of mind, and streamlines clinical administration."
        },
        {
            question: "Where is Appointory based and who operates it?",
            answer: "Appointory is developed and operated by The Intelliverse, headquartered in India, serving healthcare facilities across Gujarat, Maharashtra, Delhi NCR, Karnataka, and pan-Bharat."
        },
        {
            question: "How does Appointory comply with India's DPDP Act 2023?",
            answer: "Appointory implements strict purpose-limited data processing, AES-256 encrypted health lockers, and granular consent management ensuring patient health information is never commoditized or shared without explicit permission."
        }
    ];

    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Appointory",
            "alternateName": "The Intelliverse Appointory",
            "url": "https://appointory.in",
            "logo": "https://appointory.in/appointory-logo-mark.png",
            "sameAs": [
                "https://www.linkedin.com/company/appointory",
                "https://x.com/appointory",
                "https://www.instagram.com/appointory.in",
                "https://github.com/theintelliverse",
                "https://www.youtube.com/@appointory"
            ],
            "description": pageDesc,
            "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN"
            }
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://appointory.in" },
                { "@type": "ListItem", "position": 2, "name": "About", "item": `https://appointory.in${pageUrl}` }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
            <SEO
                title={pageTitle}
                description={pageDesc}
                url={pageUrl}
                keywords="about Appointory, clinic management company India, healthcare IT Bharat, digital health intermediary, DPDP Act compliant healthcare"
                schemaMarkup={jsonLd}
            />
            <PublicHeader />

            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Breadcrumbs items={[{ name: 'About' }]} />

                <header className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3">
                        <HeartHandshake className="w-3.5 h-3.5" />
                        <span>Our Mission & Vision</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Care without the Waiting Room
                    </h1>
                    <p className="mt-4 text-lg text-slate-600 max-w-3xl">
                        Building a zero-latency clinical operating system that unifies outpatient clinics, independent diagnostic laboratories, doctors, receptionists, and patients across Bharat.
                    </p>
                </header>

                <DirectAnswer
                    query="What is Appointory?"
                    answer="Appointory is India's modern clinical operating system engineered to eliminate waiting room congestion. It synchronizes live waiting room TV token displays, mobile queue tracking via WhatsApp, statutory 0% GST healthcare billing (SAC 999312), and direct 6-digit diagnostic lab handshakes with full DPDP Act 2023 compliance."
                />

                <section className="my-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <ShieldCheck className="w-8 h-8 text-teal-600 mb-4" />
                        <h2 className="font-bold text-lg text-slate-900 mb-2">DPDP Act 2023 Compliant</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Patient health records are encrypted with AES-256. We never sell patient data or advertise competing doctors.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <Building className="w-8 h-8 text-teal-600 mb-4" />
                        <h2 className="font-bold text-lg text-slate-900 mb-2">Designed for Bharat</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Engineered for standard consumer hardware, regional Indian languages, and unreliable network conditions.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <Globe className="w-8 h-8 text-teal-600 mb-4" />
                        <h2 className="font-bold text-lg text-slate-900 mb-2">Open Ecosystem</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Seamlessly bridges independent diagnostic pathology labs and polyclinics through zero-friction handshake protocols.
                        </p>
                    </div>
                </section>

                <FaqSection faqs={faqs} title="About Appointory FAQs" />
            </main>

            <Footer />
        </div>
    );
}
