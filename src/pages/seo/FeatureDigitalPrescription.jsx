import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import PublicHeader from '../../components/seo/PublicHeader';
import Footer from '../../components/Footer';
import Breadcrumbs from '../../components/seo/Breadcrumbs';
import DirectAnswer from '../../components/seo/DirectAnswer';
import FaqSection from '../../components/seo/FaqSection';
import WhatsAppShareButton from '../../components/seo/WhatsAppShareButton';
import { FileEdit, Share2, Printer, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

export default function FeatureDigitalPrescription() {
    const pageUrl = '/features/digital-prescription';
    const pageTitle = 'Digital Prescription Software (Rx Generator) for Indian Doctors';
    const pageDesc = 'Create beautiful, compliant digital prescriptions in 30 seconds with Appointory. 1-click WhatsApp delivery, specialty Rx templates, and secure EMR storage.';

    const faqs = [
        {
            question: "How fast can a doctor generate a digital prescription on Appointory?",
            answer: "Most doctors generate full prescriptions in under 30 seconds using customizable specialty templates, drug autofill, dosage shortcuts, and saved clinical instructions."
        },
        {
            question: "Can prescriptions be sent directly to patients via WhatsApp?",
            answer: "Yes. With a single click, Appointory generates a tamper-proof PDF prescription with official doctor registration headers and dispatches it straight to the patient's WhatsApp."
        },
        {
            question: "Are Appointory digital prescriptions legally valid in India?",
            answer: "Yes. Prescriptions conform to National Medical Commission (NMC) Telemedicine Practice Guidelines and Information Technology Act 2000 standards, featuring doctor registration numbers and digital authentication."
        },
        {
            question: "Can I print prescriptions on my existing clinic letterhead?",
            answer: "Yes. Appointory allows you to customize header/footer margins to print cleanly on pre-printed letterheads or output complete self-branded PDF sheets."
        },
        {
            question: "Are past medical records and prescriptions accessible during follow-ups?",
            answer: "Yes. The doctor cabin displays a longitudinal clinical timeline of previous diagnoses, lab values, and prescribed medications for returning patients."
        }
    ];

    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Appointory Digital Prescription Software",
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
                { "@type": "ListItem", "position": 2, "name": "Features", "item": "https://appointory.in/features/digital-prescription" },
                { "@type": "ListItem", "position": 3, "name": "Digital Prescription Software", "item": `https://appointory.in${pageUrl}` }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
            <SEO
                title={pageTitle}
                description={pageDesc}
                url={pageUrl}
                keywords="digital prescription software, Rx generator India, clinic appointment software India, electronic medical records EMR, doctor prescription app"
                schemaMarkup={jsonLd}
            />
            <PublicHeader />

            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Breadcrumbs items={[{ name: 'Features', url: '/features/digital-prescription' }, { name: 'Digital Prescription' }]} />

                <header className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3">
                        <FileEdit className="w-3.5 h-3.5" />
                        <span>NMC Compliant Rx Generator</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Fast, Compliant Digital Prescription Software for Doctors
                    </h1>
                    <p className="mt-4 text-lg text-slate-600 max-w-3xl">
                        Replace messy handwriting with elegant, branded digital prescriptions. Deliver PDFs to patient WhatsApp in 1-click and maintain instant EMR histories.
                    </p>
                </header>

                <DirectAnswer
                    query="What makes Appointory's digital prescription software fast and legally compliant in India?"
                    answer="Appointory lets Indian doctors generate full medical prescriptions in under 30 seconds using pre-built specialty templates and drug autofill. Prescriptions comply with NMC Telemedicine Guidelines with doctor registration numbers and deliver instantly to patients via WhatsApp PDF and encrypted health lockers."
                />

                <section className="my-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <Share2 className="w-8 h-8 text-teal-600 mb-4" />
                        <h2 className="font-bold text-lg text-slate-900 mb-2">1-Click WhatsApp Dispatch</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Patients receive a crisp, high-resolution PDF on WhatsApp immediately, avoiding lost paper slips and pharmacy confusion.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <Printer className="w-8 h-8 text-teal-600 mb-4" />
                        <h2 className="font-bold text-lg text-slate-900 mb-2">Letterhead & Print Friendly</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Print directly onto clinic letterhead or export full-branded A4 sheets with clinic logo, doctor degree, and Council reg numbers.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <Lock className="w-8 h-8 text-teal-600 mb-4" />
                        <h2 className="font-bold text-lg text-slate-900 mb-2">AES-256 EMR Storage</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Every prescription is securely cataloged in the patient's HealthLocker, accessible in seconds during subsequent follow-up visits.
                        </p>
                    </div>
                </section>

                <FaqSection faqs={faqs} title="Digital Prescription FAQs" />

                <div className="my-12 p-8 bg-teal-900 text-white rounded-3xl text-center space-y-4">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Upgrade Your Clinical Prescriptions</h2>
                    <p className="text-teal-200 text-sm sm:text-base max-w-xl mx-auto">
                        Join doctors across India streamlining their OPD consultations with Appointory Rx.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        <Link
                            to="/register-clinic"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-teal-900 font-bold hover:bg-teal-50 transition-colors shadow-sm"
                        >
                            <span>Start Writing Digital Rx</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <WhatsAppShareButton 
                            text="Check out this digital prescription software for doctors: Appointory"
                            path={pageUrl}
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
