import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import PublicHeader from '../../components/seo/PublicHeader';
import Footer from '../../components/Footer';
import Breadcrumbs from '../../components/seo/Breadcrumbs';
import DirectAnswer from '../../components/seo/DirectAnswer';
import FaqSection from '../../components/seo/FaqSection';
import WhatsAppShareButton from '../../components/seo/WhatsAppShareButton';
import { CheckCircle2, Clock, Users, Tv, Smartphone, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function FeatureQueueManagement() {
    const pageUrl = '/features/queue-management';
    const pageTitle = 'OPD Queue Management System & Live Token App India';
    const pageDesc = 'Appointory OPD queue management eliminates clinic waiting rooms with live digital tokens, waiting room TV sync, and WhatsApp token alerts. Set up in 5 minutes.';

    const faqs = [
        {
            question: "What is an OPD queue management system?",
            answer: "An Outpatient Department (OPD) queue management system is a synchronized software solution that organizes patient arrival order, issues digital tokens, predicts wait times, and displays real-time queue status on waiting room TVs and mobile phones."
        },
        {
            question: "How does Appointory reduce clinic waiting room crowding?",
            answer: "Appointory issues live digital tokens via QR code scan or receptionist check-in. Patients can track their exact token position remotely on their smartphones and receive automated WhatsApp alerts when only two patients remain ahead of them."
        },
        {
            question: "Does Appointory require specialized hardware or token dispensers?",
            answer: "No. Appointory operates entirely on standard hardware. Any smart TV, monitor, tablet, or smartphone can display the live waiting room queue via a simple browser URL without proprietary kiosk hardware."
        },
        {
            question: "Can walk-in patients and online pre-booked appointments be merged in one queue?",
            answer: "Yes. Appointory automatically interleaves pre-booked appointments and walk-in patients using an intelligent fairness algorithm that prevents appointment delays while keeping emergency walk-ins accommodated."
        },
        {
            question: "How does the waiting room TV token display work?",
            answer: "Receptionists or doctors click 'Next Patient', which instantly triggers zero-latency WebSocket sound and visual updates on the clinic TV screen (e.g., 'Token #14 – Dr. Sharma Cabin 1')."
        },
        {
            question: "What happens if a patient arrives late for their token?",
            answer: "Receptionists can place the token on temporary hold with a single click or bump them back 2 positions, maintaining fair queue flow without disrupting other waiting patients."
        },
        {
            question: "Are patients notified via WhatsApp or SMS?",
            answer: "Yes. Patients receive instant booking confirmation tokens and automated reminders when their turn approaches, significantly reducing no-shows and reception inquiries."
        },
        {
            question: "Is patient queue data private and DPDP Act 2023 compliant?",
            answer: "Yes. Token displays show anonymized token numbers and optional initials to protect patient medical privacy in open waiting areas, fulfilling Digital Personal Data Protection Act safeguards."
        }
    ];

    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Appointory OPD Queue Management System",
            "operatingSystem": "Web, Android, iOS, Windows, macOS",
            "applicationCategory": "HealthApplication",
            "url": `https://appointory.in${pageUrl}`,
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "INR"
            },
            "description": pageDesc
        },
        {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to set up a clinic token system in 5 minutes",
            "step": [
                {
                    "@type": "HowToStep",
                    "position": 1,
                    "name": "Register Clinic Facility",
                    "text": "Sign up on Appointory with clinic details and doctor consulting hours."
                },
                {
                    "@type": "HowToStep",
                    "position": 2,
                    "name": "Print Reception QR Code",
                    "text": "Download and display your custom clinic QR code at the reception desk for contactless patient check-ins."
                },
                {
                    "@type": "HowToStep",
                    "position": 3,
                    "name": "Launch Waiting Room TV Display",
                    "text": "Open the secure Appointory TV URL on any smart TV or monitor in your waiting room."
                },
                {
                    "@type": "HowToStep",
                    "position": 4,
                    "name": "Call Tokens in Real Time",
                    "text": "Doctors click 'Call Next' from their cabin; tokens ding audio chimes and update TV and phone screens instantaneously."
                }
            ]
        },
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(f => ({
                "@type": "Question",
                "name": f.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": f.answer
                }
            }))
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://appointory.in" },
                { "@type": "ListItem", "position": 2, "name": "Features", "item": "https://appointory.in/features/queue-management" },
                { "@type": "ListItem", "position": 3, "name": "OPD Queue Management", "item": `https://appointory.in${pageUrl}` }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
            <SEO
                title={pageTitle}
                description={pageDesc}
                url={pageUrl}
                keywords="OPD queue management system, clinic management software India, token system for clinic, patient queue management app, waiting room TV token display, WhatsApp token alert for clinic"
                schemaMarkup={jsonLd}
            />
            <PublicHeader />

            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Breadcrumbs items={[{ name: 'Features', url: '/features/queue-management' }, { name: 'OPD Queue Management' }]} />

                <header className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Zero-Latency Queue Engine</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        OPD Queue Management System for Modern Indian Clinics
                    </h1>
                    <p className="mt-4 text-lg text-slate-600 max-w-3xl">
                        Say goodbye to chaos, overcrowding, and reception disputes. Appointory orchestrates doctor consultations with live digital tokens, waiting room TV sync, and real-time WhatsApp alerts.
                    </p>
                </header>

                <DirectAnswer
                    query="What is the fastest way to eliminate waiting room congestion in Indian OPD clinics?"
                    answer="Appointory's OPD queue management system synchronizes walk-in QR check-ins and pre-booked slots into live digital tokens. Patients track their wait remotely on their phones with automated WhatsApp notifications, while smart TVs announce called tokens with audio chimes, cutting clinic waiting room crowding by up to 70%."
                />

                {/* Key Benefits Grid */}
                <section className="my-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Why Indian Clinics Choose Appointory Queue Management</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                            <Smartphone className="w-8 h-8 text-teal-600 mb-4" />
                            <h3 className="font-bold text-lg text-slate-900 mb-2">Live Mobile Tracking</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Patients monitor real-time token movement from tea shops or cars. No more standing outside crowded cabin doors asking "Who is next?".
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                            <Tv className="w-8 h-8 text-teal-600 mb-4" />
                            <h3 className="font-bold text-lg text-slate-900 mb-2">Waiting Room TV Sync</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Turn any Android TV or monitor into a high-visibility queue board. Instant audio chimes announce token numbers as doctors call patients.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                            <Zap className="w-8 h-8 text-teal-600 mb-4" />
                            <h3 className="font-bold text-lg text-slate-900 mb-2">Fair Walk-In & Slot Merge</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Smart scheduling merges online appointments with unscheduled emergency walk-ins fairly without offending waiting families.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Step-by-Step Setup (HowTo) */}
                <section className="my-12 bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">How to Set Up a Clinic Token System (In 5 Minutes)</h2>
                    <p className="text-slate-600 text-sm mb-6">No expensive token hardware or specialized cabling required.</p>
                    
                    <ol className="space-y-6">
                        <li className="flex gap-4">
                            <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0">1</span>
                            <div>
                                <h3 className="font-bold text-slate-900">Register Your Clinic Facility</h3>
                                <p className="text-slate-600 text-sm mt-1">Sign up online in 60 seconds. Add your doctors, consulting rooms, and working hours.</p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0">2</span>
                            <div>
                                <h3 className="font-bold text-slate-900">Download Desk QR & TV URL</h3>
                                <p className="text-slate-600 text-sm mt-1">Print the receptionist QR code for patients to scan and open the TV display link on your waiting area screen.</p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0">3</span>
                            <div>
                                <h3 className="font-bold text-slate-900">Call Tokens with 1-Click</h3>
                                <p className="text-slate-600 text-sm mt-1">Doctors hit 'Next' in their cabin. Screens ding, tokens advance, and patients enter smoothly.</p>
                            </div>
                        </li>
                    </ol>
                </section>

                <FaqSection faqs={faqs} title="OPD Queue Management FAQs" />

                <div className="my-12 p-8 bg-teal-900 text-white rounded-3xl text-center space-y-4">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Ready for a Calm, Zero-Wait Clinic?</h2>
                    <p className="text-teal-200 text-sm sm:text-base max-w-xl mx-auto">
                        Join hundreds of healthcare clinics across India utilizing Appointory to organize their OPD queues.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        <Link
                            to="/register-clinic"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-teal-900 font-bold hover:bg-teal-50 transition-colors shadow-sm"
                        >
                            <span>Start Free Clinic Setup</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <WhatsAppShareButton 
                            text="Found this great OPD Queue System for clinics: Appointory"
                            path={pageUrl}
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
