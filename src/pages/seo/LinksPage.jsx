import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import WhatsAppShareButton from '../../components/seo/WhatsAppShareButton';
import { ArrowRight, Sparkles, Building2, Stethoscope, FlaskConical, MessageCircle, Globe } from 'lucide-react';

export default function LinksPage() {
    const pageUrl = '/links';
    const pageTitle = 'Official Links & Portals | Appointory';
    const pageDesc = 'Official link-in-bio for Appointory. Fast access to clinic registration, doctor cabin, waiting room TV displays, and patient health lockers.';

    const links = [
        {
            title: "Register Your Clinic Free",
            desc: "Set up your clinic OPD queue & TV display in 5 minutes",
            url: "/register-clinic?utm_source=instagram_bio&utm_medium=link_tree&utm_campaign=clinic_signup",
            icon: Building2,
            featured: true
        },
        {
            title: "Explore Live TV Token Display",
            desc: "Zero-hardware OPD queue board for your waiting room TV",
            url: "/features/token-display-tv?utm_source=instagram_bio&utm_medium=link_tree&utm_campaign=tv_tokens",
            icon: Sparkles
        },
        {
            title: "0% GST Clinic Billing (SAC 999312)",
            desc: "Statutory medical invoicing under Notification 12/2017",
            url: "/features/gst-billing?utm_source=instagram_bio&utm_medium=link_tree&utm_campaign=gst_billing",
            icon: Stethoscope
        },
        {
            title: "Diagnostic Lab Network",
            desc: "6-digit handshake codes connecting clinics and pathology labs",
            url: "/features/lab-network?utm_source=instagram_bio&utm_medium=link_tree&utm_campaign=lab_network",
            icon: FlaskConical
        },
        {
            title: "Visit Appointory Website",
            desc: "Care without the Waiting Room – Complete Healthcare OS",
            url: "/?utm_source=instagram_bio&utm_medium=link_tree&utm_campaign=home",
            icon: Globe
        }
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
            <SEO
                title={pageTitle}
                description={pageDesc}
                url={pageUrl}
                keywords="Appointory links, Appointory instagram bio, clinic software links, book appointment, register clinic"
            />

            <div className="w-full max-w-md mx-auto py-8 text-center space-y-6">
                {/* Brand Logo & Profile */}
                <div className="flex flex-col items-center">
                    <img 
                        src="/appointory-logo-mark.png" 
                        alt="Appointory" 
                        className="w-20 h-20 rounded-2xl p-1 bg-white/10 backdrop-blur-md shadow-xl object-contain mb-3"
                    />
                    <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1">
                        <span>Appointory</span>
                        <span className="text-teal-400">.</span>
                    </h1>
                    <p className="text-xs uppercase tracking-widest text-teal-300 font-bold mt-1">
                        Care without the Waiting Room
                    </p>
                    <p className="text-xs text-slate-400 max-w-xs mt-2">
                        OPD Queues &bull; TV Token Boards &bull; 0% GST Invoicing &bull; Pathology Network
                    </p>
                </div>

                {/* Links Stack */}
                <div className="space-y-3 text-left">
                    {links.map((link, idx) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={idx}
                                to={link.url}
                                className={`block p-4 rounded-2xl border transition-all duration-200 group ${
                                    link.featured 
                                        ? 'bg-teal-600 hover:bg-teal-500 border-teal-400 text-white shadow-lg shadow-teal-900/40' 
                                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-teal-500/50 text-slate-100'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl shrink-0 ${link.featured ? 'bg-teal-700/80 text-white' : 'bg-slate-700/80 text-teal-400'}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-bold block leading-tight">{link.title}</h2>
                                            <p className={`text-[11px] mt-0.5 ${link.featured ? 'text-teal-100' : 'text-slate-400'}`}>
                                                {link.desc}
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* WhatsApp Support & Social */}
                <div className="pt-4 flex flex-col items-center gap-3">
                    <WhatsAppShareButton
                        text="Check out Appointory – Care without the Waiting Room"
                        path={pageUrl}
                        className="!w-full !justify-center !py-3 !rounded-2xl"
                    />
                    <p className="text-[11px] text-slate-500">
                        &copy; 2026 Appointory &bull; Operated by The Intelliverse
                    </p>
                </div>
            </div>
        </div>
    );
}
