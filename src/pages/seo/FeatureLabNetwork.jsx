import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import PublicHeader from '../../components/seo/PublicHeader';
import Footer from '../../components/Footer';
import Breadcrumbs from '../../components/seo/Breadcrumbs';
import DirectAnswer from '../../components/seo/DirectAnswer';
import FaqSection from '../../components/seo/FaqSection';
import WhatsAppShareButton from '../../components/seo/WhatsAppShareButton';
import { Network, FlaskConical, ArrowRight, ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react';

export default function FeatureLabNetwork() {
    const pageUrl = '/features/lab-network';
    const pageTitle = 'Pathology Lab Management Software & Clinic Handshake Network';
    const pageDesc = 'Seamless lab-clinic integration. Independent diagnostic labs connect to clinics via 6-digit handshake codes for instant report delivery and zero billing friction.';

    const faqs = [
        {
            question: "How does the clinic-to-lab 6-digit handshake work?",
            answer: "When a doctor prescribes diagnostic tests, Appointory generates a secure 6-digit handshake code. The partner lab enters this code in their portal to instantly import patient clinical notes and requested test panels without manual data re-entry."
        },
        {
            question: "How are completed diagnostic lab reports delivered to the doctor?",
            answer: "Once the pathologist uploads the signed report PDF, it syncs immediately to the referring doctor's active cabin dashboard and the patient's encrypted HealthLocker via WebSockets."
        },
        {
            question: "Can an independent lab partner with multiple clinics on Appointory?",
            answer: "Yes. Independent diagnostic centres can establish verified handshake connections with hundreds of local OPD clinics, managing test orders and settlements from one centralized lab dashboard."
        },
        {
            question: "Is patient health data protected during lab handshakes under DPDP Act 2023?",
            answer: "Yes. Test orders are transmitted over AES-256 encrypted protocols, and access is strictly restricted to authorized lab personnel and the referring doctor, fully adhering to India's DPDP Act."
        },
        {
            question: "Does Appointory support B2B lab referral billing and settlements?",
            answer: "Yes. Labs and clinics can review automated monthly reconciliation reports tracking completed tests, pending dues, and settled invoices with complete financial transparency."
        }
    ];

    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Appointory Diagnostic Lab Handshake Network",
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
                { "@type": "ListItem", "position": 2, "name": "Features", "item": "https://appointory.in/features/lab-network" },
                { "@type": "ListItem", "position": 3, "name": "Diagnostic Lab Network", "item": `https://appointory.in${pageUrl}` }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
            <SEO
                title={pageTitle}
                description={pageDesc}
                url={pageUrl}
                keywords="pathology lab management software, lab referral software for clinics, lab handshake network, diagnostic lab portal India, clinical lab software"
                schemaMarkup={jsonLd}
            />
            <PublicHeader />

            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Breadcrumbs items={[{ name: 'Features', url: '/features/lab-network' }, { name: 'Lab Handshake Network' }]} />

                <header className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3">
                        <FlaskConical className="w-3.5 h-3.5" />
                        <span>Connected Diagnostic Ecosystem</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Pathology Lab Management & Clinic Handshake Network
                    </h1>
                    <p className="mt-4 text-lg text-slate-600 max-w-3xl">
                        Unite independent pathology labs and outpatient clinics with instant 6-digit test handshakes, zero manual re-entry errors, and real-time report synchronization.
                    </p>
                </header>

                <DirectAnswer
                    query="How does the clinic-to-lab digital handshake work in Appointory?"
                    answer="Doctors prescribe blood tests and imaging with a single click, generating a secure 6-digit handshake code. The patient presents this code at the connected diagnostic lab, which auto-loads test parameters. Completed PDF reports sync directly into the doctor's cabin and patient locker without paper delays."
                />

                <section className="my-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <Network className="w-8 h-8 text-teal-600 mb-4" />
                        <h2 className="font-bold text-lg text-slate-900 mb-2">6-Digit Quick Sync</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            No more misread handwriting or lost paper slips. Lab technicians key in 6 digits to verify the exact tests ordered.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <FileCheck className="w-8 h-8 text-teal-600 mb-4" />
                        <h2 className="font-bold text-lg text-slate-900 mb-2">Zero-Latency Report Sync</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            The moment the lab verifies and uploads the test report, it pops up in the consulting doctor's dashboard in real time.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <ShieldCheck className="w-8 h-8 text-teal-600 mb-4" />
                        <h2 className="font-bold text-lg text-slate-900 mb-2">Automated Reconciliations</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Clear monthly B2B statements eliminate awkward billing discrepancies between clinics and diagnostic partners.
                        </p>
                    </div>
                </section>

                <FaqSection faqs={faqs} title="Diagnostic Lab Network FAQs" />

                <div className="my-12 p-8 bg-teal-900 text-white rounded-3xl text-center space-y-4">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Connect Your Diagnostic Lab Today</h2>
                    <p className="text-teal-200 text-sm sm:text-base max-w-xl mx-auto">
                        Partner with referring clinics in your city and streamline your test delivery pipeline.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        <Link
                            to="/register-clinic"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-teal-900 font-bold hover:bg-teal-50 transition-colors shadow-sm"
                        >
                            <span>Join Lab Network Free</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <WhatsAppShareButton 
                            text="Check out this clinic-to-lab handshake network: Appointory"
                            path={pageUrl}
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
