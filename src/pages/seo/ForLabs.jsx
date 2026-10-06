import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import PublicHeader from '../../components/seo/PublicHeader';
import Footer from '../../components/Footer';
import Breadcrumbs from '../../components/seo/Breadcrumbs';
import DirectAnswer from '../../components/seo/DirectAnswer';
import FaqSection from '../../components/seo/FaqSection';
import WhatsAppShareButton from '../../components/seo/WhatsAppShareButton';
import { FlaskConical, Network, FileCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ForLabs() {
    const pageUrl = '/for/labs';
    const pageTitle = 'Diagnostic Lab Portal & Clinic Referral Network India';
    const pageDesc = 'Independent pathology and diagnostic laboratory software. Connect with local clinics, receive 6-digit test handshakes, and dispatch verified PDF reports instantly.';

    const faqs = [
        {
            question: "How do independent diagnostic labs register on Appointory?",
            answer: "Independent labs sign up in minutes by providing lab accreditation, test catalogs, and contact credentials. Once verified, labs can connect directly with local partner clinics."
        },
        {
            question: "How does the 6-digit handshake code benefit diagnostic labs?",
            answer: "Instead of deciphering handwritten doctor slips or making transcription errors, technicians simply input the 6-digit code to populate patient details and the exact tests ordered."
        },
        {
            question: "Can labs upload branded PDF reports with digital signatures?",
            answer: "Yes. Pathologists can upload signed PDF reports which are delivered simultaneously to the referring doctor's dashboard and the patient's encrypted health locker."
        },
        {
            question: "How are B2B referral settlements tracked?",
            answer: "Appointory provides automated ledger reconciliations detailing total tests performed, patient payments received, and clinic settlement balances."
        }
    ];

    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Appointory for Diagnostic Labs",
            "operatingSystem": "Web, iOS, Android, Windows, macOS",
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
                { "@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://appointory.in/for/labs" },
                { "@type": "ListItem", "position": 3, "name": "For Diagnostic Labs", "item": `https://appointory.in${pageUrl}` }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
            <SEO
                title={pageTitle}
                description={pageDesc}
                url={pageUrl}
                keywords="pathology lab software, diagnostic lab portal India, clinical lab referral management, lab handshake network, pathology report management"
                schemaMarkup={jsonLd}
            />
            <PublicHeader />

            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Breadcrumbs items={[{ name: 'Solutions', url: '/for/labs' }, { name: 'For Diagnostic Labs' }]} />

                <header className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3">
                        <FlaskConical className="w-3.5 h-3.5" />
                        <span>Pathology & Diagnostic Centres</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Grow Your Pathology Network with Appointory Lab Portal
                    </h1>
                    <p className="mt-4 text-lg text-slate-600 max-w-3xl">
                        Partner with local polyclinics, process test orders via 6-digit handshake codes, and deliver signed digital reports directly to doctors in real time.
                    </p>
                </header>

                <DirectAnswer
                    query="How does Appointory help independent pathology labs expand clinic referrals?"
                    answer="Appointory provides diagnostic laboratories with a cloud portal connecting directly to local outpatient clinics. Using instant 6-digit test handshake codes, labs eliminate clerical transcription errors, deliver verified reports directly to doctor screens, and automate B2B settlement tracking."
                />

                <section className="my-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <Network className="w-8 h-8 text-teal-600 mb-4" />
                        <h2 className="font-bold text-lg text-slate-900 mb-2">Connected Clinic Channels</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Form digital referral relationships with dozens of OPD clinics in your vicinity with zero manual paperwork.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <FileCheck className="w-8 h-8 text-teal-600 mb-4" />
                        <h2 className="font-bold text-lg text-slate-900 mb-2">Automated Report Sync</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Uploaded PDF reports sync automatically to doctor cabins and patient health lockers with zero delivery staff needed.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <CheckCircle2 className="w-8 h-8 text-teal-600 mb-4" />
                        <h2 className="font-bold text-lg text-slate-900 mb-2">Clear B2B Settlement Books</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Transparent monthly logs of referred tests, collected fees, and net settlement balances maintain long-term doctor trust.
                        </p>
                    </div>
                </section>

                <FaqSection faqs={faqs} title="Diagnostic Lab FAQs" />

                <div className="my-12 p-8 bg-teal-900 text-white rounded-3xl text-center space-y-4">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Scale Your Diagnostic Lab Today</h2>
                    <p className="text-teal-200 text-sm sm:text-base max-w-xl mx-auto">
                        Connect with clinics and receive instant digital test orders.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        <Link
                            to="/register-clinic"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-teal-900 font-bold hover:bg-teal-50 transition-colors shadow-sm"
                        >
                            <span>Register Diagnostic Lab</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <WhatsAppShareButton 
                            text="Check out Appointory for diagnostic pathology labs"
                            path={pageUrl}
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
