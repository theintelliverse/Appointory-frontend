import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import PublicHeader from '../../components/seo/PublicHeader';
import Footer from '../../components/Footer';
import Breadcrumbs from '../../components/seo/Breadcrumbs';
import DirectAnswer from '../../components/seo/DirectAnswer';
import FaqSection from '../../components/seo/FaqSection';
import WhatsAppShareButton from '../../components/seo/WhatsAppShareButton';
import { Check, ShieldCheck, ArrowRight, Zap, HelpCircle } from 'lucide-react';

export default function PricingPage() {
    const pageUrl = '/pricing';
    const pageTitle = 'Transparent Clinic Software Pricing India | Free Tier Available';
    const pageDesc = 'Affordable clinic management pricing in India. Free plan for small practices, scalable plans for busy polyclinics and diagnostic labs. No hidden charges.';

    const faqs = [
        {
            question: "Is there really a free version of Appointory?",
            answer: "Yes. Appointory provides a genuine Starter tier for single-doctor clinics and small community practitioners to manage queues and print prescriptions without upfront costs."
        },
        {
            question: "How much does Appointory cost for multi-doctor polyclinics?",
            answer: "Our Professional tier for multi-doctor clinics starts at just ₹999/month, including unlimited receptionist accounts, waiting room TV displays, 0% GST billing, and WhatsApp alerts."
        },
        {
            question: "Are there any hidden setup or hardware installation fees?",
            answer: "Zero. Appointory is 100% cloud-based and runs on any existing smart TV, smartphone, tablet, or laptop. No expensive server machines or token hardware dispensers to buy."
        },
        {
            question: "Can I cancel or change my plan anytime?",
            answer: "Yes. All paid subscriptions operate on monthly or annual cycles with zero lock-in contracts. You can upgrade, downgrade, or cancel at any time from your admin panel."
        },
        {
            question: "Are software subscription fees subject to GST?",
            answer: "Yes. Cloud software subscriptions are standard B2B information technology services subject to 18% GST (SAC 997331). Clinics with a GSTIN can claim 100% Input Tax Credit (ITC)."
        },
        {
            question: "Do you offer priority phone support and staff onboarding?",
            answer: "Yes. Professional and Enterprise tiers include dedicated WhatsApp and phone support along with remote onboarding training for clinic receptionists and doctors."
        }
    ];

    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Appointory Clinic Management Software",
            "operatingSystem": "Web, iOS, Android, Windows, macOS",
            "applicationCategory": "HealthApplication",
            "url": `https://appointory.in${pageUrl}`,
            "offers": [
                {
                    "@type": "Offer",
                    "name": "Starter",
                    "price": "0",
                    "priceCurrency": "INR"
                },
                {
                    "@type": "Offer",
                    "name": "Professional",
                    "price": "999",
                    "priceCurrency": "INR"
                }
            ],
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
                { "@type": "ListItem", "position": 2, "name": "Pricing", "item": `https://appointory.in${pageUrl}` }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
            <SEO
                title={pageTitle}
                description={pageDesc}
                url={pageUrl}
                keywords="clinic management software pricing India, free clinic software India, affordable clinic software, OPD queue software price, doctor software cost"
                schemaMarkup={jsonLd}
            />
            <PublicHeader />

            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Breadcrumbs items={[{ name: 'Pricing' }]} />

                <header className="mb-8 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Fair, Transparent Pricing</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Simple, Predictable Plans for Clinics of All Sizes
                    </h1>
                    <p className="mt-4 text-lg text-slate-600">
                        Zero hardware lock-ins. Free tier for small community clinics and affordable pricing for growing polyclinics.
                    </p>
                </header>

                <DirectAnswer
                    query="How much does Appointory clinic management software cost in India?"
                    answer="Appointory offers a free Starter tier for solo doctors and small clinics. For high-volume multi-doctor polyclinics and diagnostic networks, the Professional plan costs ₹999/month, including unlimited tokens, waiting room TV sync, 0% GST billing, and WhatsApp alerts with zero hardware purchases required."
                />

                {/* Pricing Cards Grid */}
                <section className="my-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Starter Tier */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-slate-900">Starter</h2>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">Small Clinics</span>
                            </div>
                            <div className="mb-6">
                                <span className="text-4xl font-black text-slate-900">₹0</span>
                                <span className="text-slate-500 text-sm font-medium"> / forever</span>
                                <p className="text-xs text-slate-500 mt-1">Perfect for solo practitioners and community clinics.</p>
                            </div>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-600 shrink-0" /> Up to 1 Doctor & 1 Receptionist</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-600 shrink-0" /> OPD Queue Tokens & QR Check-In</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-600 shrink-0" /> Basic Waiting Room TV Display</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-600 shrink-0" /> Digital Prescription Generator</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-600 shrink-0" /> 0% GST Medical Invoice Print</li>
                            </ul>
                        </div>
                        <div className="pt-8">
                            <Link
                                to="/register-clinic"
                                className="w-full text-center block py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors"
                            >
                                Get Started Free
                            </Link>
                        </div>
                    </div>

                    {/* Pro Tier */}
                    <div className="bg-teal-900 text-white rounded-3xl p-8 border-2 border-teal-600 shadow-xl flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-4 right-4 bg-teal-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                            Most Popular
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white">Professional</h2>
                            </div>
                            <div className="mb-6">
                                <span className="text-4xl font-black text-white">₹999</span>
                                <span className="text-teal-200 text-sm font-medium"> / month</span>
                                <p className="text-xs text-teal-300 mt-1">Complete system for polyclinics and diagnostic networks.</p>
                            </div>
                            <ul className="space-y-3 text-sm text-teal-100">
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400 shrink-0" /> Unlimited Doctors & Multi-Cabin Queues</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400 shrink-0" /> Automated WhatsApp Token Alerts</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400 shrink-0" /> Real-time TV Display with Audio Chimes</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400 shrink-0" /> Connected Diagnostic Lab Handshake (6-digit)</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400 shrink-0" /> Anti-Fraud Verification QR on Bills</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400 shrink-0" /> Priority WhatsApp & Phone Support</li>
                            </ul>
                        </div>
                        <div className="pt-8">
                            <Link
                                to="/register-clinic"
                                className="w-full text-center block py-3 rounded-xl bg-white hover:bg-teal-50 text-teal-950 font-bold text-sm transition-colors shadow-sm"
                            >
                                Start 14-Day Free Pro Trial
                            </Link>
                        </div>
                    </div>
                </section>

                <FaqSection faqs={faqs} title="Pricing & Subscription FAQs" />

                <div className="my-12 text-center">
                    <WhatsAppShareButton 
                        text="Check out Appointory clinic management software pricing plans"
                        path={pageUrl}
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
}
