import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import PublicHeader from '../../components/seo/PublicHeader';
import Footer from '../../components/Footer';
import Breadcrumbs from '../../components/seo/Breadcrumbs';
import DirectAnswer from '../../components/seo/DirectAnswer';
import FaqSection from '../../components/seo/FaqSection';
import WhatsAppShareButton from '../../components/seo/WhatsAppShareButton';
import { Tv, Volume2, MonitorPlay, Wifi, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function FeatureTokenTv() {
    const pageUrl = '/features/token-display-tv';
    const pageTitle = 'Waiting Room TV Token Display Software for Indian Clinics';
    const pageDesc = 'Transform any smart TV or monitor into a real-time OPD token display. Zero proprietary hardware, WebSocket audio announcements, multi-cabin support.';

    const faqs = [
        {
            question: "How do I connect my waiting room TV to Appointory?",
            answer: "Simply open your smart TV's built-in web browser (Android TV, Samsung Tizen, LG webOS, or Fire TV Stick) and visit your clinic's dedicated TV display URL. No app installation or cables required."
        },
        {
            question: "Does the TV display make an audio announcement when a token is called?",
            answer: "Yes. The Appointory TV display plays clear audio chimes and speaks out the token number and consulting room (e.g., 'Token 12, Dr. Patel, Room 2') so patients never miss their turn."
        },
        {
            question: "Can one TV screen display tokens for multiple doctors and cabins simultaneously?",
            answer: "Yes. Appointory's multi-cabin split layout dynamically organizes token statuses across all active consulting doctors on a single screen."
        },
        {
            question: "What happens if the internet disconnects temporarily?",
            answer: "The display system features auto-reconnection logic that seamlessly resumes live token listening the moment connectivity is restored."
        },
        {
            question: "Is there any hardware cost or proprietary token dispenser needed?",
            answer: "Zero. Any consumer TV, HDMI monitor, tablet, or old PC can act as your OPD queue screen, saving thousands of rupees compared to hardware token machines."
        },
        {
            question: "Can I show clinic health tips or notices on the token screen?",
            answer: "Yes. The display includes an optional bottom news ticker where clinics can broadcast seasonal health advisories, vaccination drives, or clinic holiday notices."
        }
    ];

    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Appointory Waiting Room TV Token Display",
            "operatingSystem": "Smart TV, Web, Android TV, Fire TV, LG webOS, Tizen",
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
                { "@type": "ListItem", "position": 2, "name": "Features", "item": "https://appointory.in/features/queue-management" },
                { "@type": "ListItem", "position": 3, "name": "Waiting Room TV Display", "item": `https://appointory.in${pageUrl}` }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
            <SEO
                title={pageTitle}
                description={pageDesc}
                url={pageUrl}
                keywords="waiting room TV token display, token system for clinic, OPD waiting screen, clinic digital signage, token display screen India"
                schemaMarkup={jsonLd}
            />
            <PublicHeader />

            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Breadcrumbs items={[{ name: 'Features', url: '/features/queue-management' }, { name: 'TV Token Display' }]} />

                <header className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3">
                        <Tv className="w-3.5 h-3.5" />
                        <span>Smart Screen Integration</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Waiting Room TV Token Display for Clinics
                    </h1>
                    <p className="mt-4 text-lg text-slate-600 max-w-3xl">
                        Turn any consumer television into a hospital-grade digital token display with zero cables, zero costly hardware, and real-time audio announcements.
                    </p>
                </header>

                <DirectAnswer
                    query="How do I display patient token numbers on a clinic waiting room TV?"
                    answer="Open your smart TV or Fire TV browser and navigate to your clinic's Appointory TV link. When doctors or receptionists call the next patient, the TV screen instantly updates the token number with an audible bell chime and voice callout via WebSockets with zero lag."
                />

                <section className="my-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <Volume2 className="w-8 h-8 text-teal-600 mb-4" />
                        <h2 className="font-bold text-lg text-slate-900 mb-2">Audible Bell Chimes</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Clear chimes and text-to-speech callouts ensure elderly patients and waiting parents hear when their token is called.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <MonitorPlay className="w-8 h-8 text-teal-600 mb-4" />
                        <h2 className="font-bold text-lg text-slate-900 mb-2">Multi-Doctor Cabin Grid</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Whether you have 1 doctor or 8 specialist cabins, the layout automatically balances consulting rooms side by side.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <Wifi className="w-8 h-8 text-teal-600 mb-4" />
                        <h2 className="font-bold text-lg text-slate-900 mb-2">Zero Hardware Purchase</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Works on any Android TV, Fire TV Stick, LG, Samsung, or spare monitor. No annual maintenance contracts for LED hardware boards.
                        </p>
                    </div>
                </section>

                <FaqSection faqs={faqs} title="Waiting Room TV FAQs" />

                <div className="my-12 p-8 bg-teal-900 text-white rounded-3xl text-center space-y-4">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Upgrade Your Waiting Room Screen Today</h2>
                    <p className="text-teal-200 text-sm sm:text-base max-w-xl mx-auto">
                        Display live tokens on your clinic TV in under 3 minutes with Appointory.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        <Link
                            to="/register-clinic"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-teal-900 font-bold hover:bg-teal-50 transition-colors shadow-sm"
                        >
                            <span>Set Up TV Display Free</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <WhatsAppShareButton 
                            text="Check out this waiting room TV token display for clinics: Appointory"
                            path={pageUrl}
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
