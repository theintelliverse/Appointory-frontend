import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import PublicHeader from '../../components/seo/PublicHeader';
import Footer from '../../components/Footer';
import Breadcrumbs from '../../components/seo/Breadcrumbs';
import DirectAnswer from '../../components/seo/DirectAnswer';
import FaqSection from '../../components/seo/FaqSection';
import WhatsAppShareButton from '../../components/seo/WhatsAppShareButton';
import { Building2, Users, Receipt, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ForClinics() {
    const pageUrl = '/for/clinics';
    const pageTitle = 'Clinic Management Software for Polyclinics & OPD Centers';
    const pageDesc = 'All-in-one clinic management software for Indian OPDs and polyclinics. Multi-doctor queues, receptionist desk, 0% GST billing, and TV token displays.';

    const faqs = [
        {
            question: "How does Appointory support multi-doctor polyclinics?",
            answer: "Appointory supports unlimited doctors, consulting cabins, and receptionist accounts with role-based permissions. The central waiting room TV display cleanly separates queues across all active consulting doctors."
        },
        {
            question: "Can receptionists quickly register walk-in families and patients?",
            answer: "Yes. Our intelligent reception desk features instant family phone number autofill, 1-click token booking, and slot holds that eliminate long lines at the front counter."
        },
        {
            question: "Does Appointory help clinics track daily revenue and doctor settlements?",
            answer: "Yes. Real-time clinic analytics track daily OPD volume, payment modes (UPI vs Cash), doctor fee splits, and diagnostic test referrals with zero reconciliation confusion."
        },
        {
            question: "Is patient data stored safely and in compliance with India's DPDP Act?",
            answer: "Yes. Appointory utilizes end-to-end AES-256 encryption, role-restricted cabin views, and strict privacy consent controls required under the Digital Personal Data Protection Act 2023."
        }
    ];

    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Appointory for Clinics",
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
                { "@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://appointory.in/for/clinics" },
                { "@type": "ListItem", "position": 3, "name": "For Clinics", "item": `https://appointory.in${pageUrl}` }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
            <SEO
                title={pageTitle}
                description={pageDesc}
                url={pageUrl}
                keywords="clinic management software India, polyclinic software India, OPD software for clinics, receptionist billing software, clinic queue management"
                schemaMarkup={jsonLd}
            />
            <PublicHeader />

            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Breadcrumbs items={[{ name: 'Solutions', url: '/for/clinics' }, { name: 'For Clinics' }]} />

                <header className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Polyclinics & Health Centers</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Complete Clinic Management Software for Indian OPDs
                    </h1>
                    <p className="mt-4 text-lg text-slate-600 max-w-3xl">
                        Unify multi-doctor queues, reception desks, 0% GST billing, and partner pathology labs in one elegant clinical operating system.
                    </p>
                </header>

                <DirectAnswer
                    query="What makes Appointory the preferred clinic management software for Indian polyclinics?"
                    answer="Appointory eliminates front-desk chaos in multi-doctor clinics with synchronized TV token displays, smart walk-in and online queue balancing, 0% GST compliant medical invoices, and direct 6-digit lab handshakes, all while ensuring DPDP Act 2023 patient privacy compliance."
                />

                <section className="my-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <Users className="w-8 h-8 text-teal-600 mb-4" />
                        <h2 className="font-bold text-lg text-slate-900 mb-2">Multi-Doctor Orchestration</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Organize multiple visiting specialists and consulting cabins simultaneously with dedicated queue feeds and TV display balancing.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <Receipt className="w-8 h-8 text-teal-600 mb-4" />
                        <h2 className="font-bold text-lg text-slate-900 mb-2">Front Desk Billing & UPI</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Generate itemized invoices with anti-fraud QR codes in 10 seconds. Collect UPI payments directly to your clinic bank account.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <ShieldCheck className="w-8 h-8 text-teal-600 mb-4" />
                        <h2 className="font-bold text-lg text-slate-900 mb-2">Staff Access Controls</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Role-based access protects sensitive financial and medical data. Receptionists manage queues without peering into medical notes.
                        </p>
                    </div>
                </section>

                <FaqSection faqs={faqs} title="Clinic Management FAQs" />

                <div className="my-12 p-8 bg-teal-900 text-white rounded-3xl text-center space-y-4">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Transform Your Clinic's Front Desk</h2>
                    <p className="text-teal-200 text-sm sm:text-base max-w-xl mx-auto">
                        Get started with Appointory for your clinic in under 5 minutes.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        <Link
                            to="/register-clinic"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-teal-900 font-bold hover:bg-teal-50 transition-colors shadow-sm"
                        >
                            <span>Register Your Clinic</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <WhatsAppShareButton 
                            text="Check out Appointory clinic management software for polyclinics"
                            path={pageUrl}
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
