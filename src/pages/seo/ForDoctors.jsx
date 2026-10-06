import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import PublicHeader from '../../components/seo/PublicHeader';
import Footer from '../../components/Footer';
import Breadcrumbs from '../../components/seo/Breadcrumbs';
import DirectAnswer from '../../components/seo/DirectAnswer';
import FaqSection from '../../components/seo/FaqSection';
import WhatsAppShareButton from '../../components/seo/WhatsAppShareButton';
import { Stethoscope, Clock, FileText, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ForDoctors() {
    const pageUrl = '/for/doctors';
    const pageTitle = 'Software for Doctors & Independent Practitioners in India';
    const pageDesc = 'Designed for practicing doctors. Streamline your consulting cabin with instant token calls, digital prescriptions, longitudinal patient history, and zero admin burden.';

    const faqs = [
        {
            question: "How does Appointory protect doctor consultation time?",
            answer: "By keeping the waiting room organized outside, doctors can consult with zero interruptions. Cabin doors remain closed until you tap 'Next Patient', which sounds the chime on the waiting area TV."
        },
        {
            question: "Can I use Appointory across multiple consulting clinics or hospitals?",
            answer: "Yes. Doctors can link their personal profile to multiple clinical establishments and switch consulting locations seamlessly."
        },
        {
            question: "Can I customize prescription templates for my specialty?",
            answer: "Yes. Specialists (pediatricians, cardiologists, dermatologists, orthopedic surgeons, GPs) can configure customized drug lists, dosage frequencies, and advice templates."
        },
        {
            question: "Are patient previous consultation records instantly viewable?",
            answer: "Yes. Returning patients have their complete medical history, past prescriptions, and uploaded pathology reports available in one longitudinal cabin view."
        }
    ];

    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Appointory for Doctors",
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
                { "@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://appointory.in/for/doctors" },
                { "@type": "ListItem", "position": 3, "name": "For Doctors", "item": `https://appointory.in${pageUrl}` }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
            <SEO
                title={pageTitle}
                description={pageDesc}
                url={pageUrl}
                keywords="doctor consultation software, clinic software for doctors, doctor appointment booking software, digital prescription app, EMR software for doctors India"
                schemaMarkup={jsonLd}
            />
            <PublicHeader />

            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Breadcrumbs items={[{ name: 'Solutions', url: '/for/doctors' }, { name: 'For Doctors' }]} />

                <header className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3">
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>Practicing Physicians & Specialists</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Focus 100% on Patient Care with Appointory Doctor Cabin
                    </h1>
                    <p className="mt-4 text-lg text-slate-600 max-w-3xl">
                        A distraction-free clinical environment. Call next patients with 1 click, write digital prescriptions in 30 seconds, and access longitudinal medical records effortlessly.
                    </p>
                </header>

                <DirectAnswer
                    query="How does Appointory help private doctors manage busy OPD consulting hours?"
                    answer="Appointory automates OPD queue flow so doctors consult without waiting room door knocks. With 1-click token callouts, pre-built specialty prescription templates delivered directly to patient WhatsApp, and instant access to past EMR records, doctors save 3-5 minutes per patient."
                />

                <section className="my-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <Clock className="w-8 h-8 text-teal-600 mb-4" />
                        <h2 className="font-bold text-lg text-slate-900 mb-2">Zero Cabin Interruptions</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            No more patients peeking in asking if you are free. The queue is called on the TV screen outside with audio chimes only when you are ready.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <FileText className="w-8 h-8 text-teal-600 mb-4" />
                        <h2 className="font-bold text-lg text-slate-900 mb-2">Fast Digital Prescriptions</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Specialty drug templates and dosage shortcuts allow you to generate NMC-compliant prescriptions sent directly to patient WhatsApp.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <ShieldCheck className="w-8 h-8 text-teal-600 mb-4" />
                        <h2 className="font-bold text-lg text-slate-900 mb-2">Longitudinal Patient History</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Past clinical notes, vitals, lab reports, and medication histories are organized on a single chronological timeline.
                        </p>
                    </div>
                </section>

                <FaqSection faqs={faqs} title="Doctor Consultation FAQs" />

                <div className="my-12 p-8 bg-teal-900 text-white rounded-3xl text-center space-y-4">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Join the Community of Modern Doctors</h2>
                    <p className="text-teal-200 text-sm sm:text-base max-w-xl mx-auto">
                        Reclaim your clinical peace of mind. Get started on Appointory free.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        <Link
                            to="/register-clinic"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-teal-900 font-bold hover:bg-teal-50 transition-colors shadow-sm"
                        >
                            <span>Set Up Doctor Profile</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <WhatsAppShareButton 
                            text="Check out Appointory for doctors and medical practitioners"
                            path={pageUrl}
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
