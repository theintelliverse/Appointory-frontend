import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import SEO from '../../components/SEO';
import PublicHeader from '../../components/seo/PublicHeader';
import Footer from '../../components/Footer';
import Breadcrumbs from '../../components/seo/Breadcrumbs';
import DirectAnswer from '../../components/seo/DirectAnswer';
import FaqSection from '../../components/seo/FaqSection';
import WhatsAppShareButton from '../../components/seo/WhatsAppShareButton';
import { MapPin, Building2, CheckCircle2, ArrowRight, Clock, Tv, Receipt } from 'lucide-react';

const CITY_DATA = {
    ahmedabad: {
        name: 'Ahmedabad',
        state: 'Gujarat',
        regionDescription: 'As the premier healthcare hub of Gujarat spanning SG Highway, Ellisbridge, Navrangpura, and Maninagar, Ahmedabad clinics face intense OPD patient inflow from across Saurashtra and North Gujarat.',
        localLanguage: 'Gujarati, Hindi & English',
        keyHubs: ['SG Highway', 'Ellisbridge', 'Navrangpura', 'Maninagar', 'Bopal'],
        averageWait: '45–75 minutes without token software',
        reducedWait: '10–15 minutes with Appointory live TV tokens'
    },
    surat: {
        name: 'Surat',
        state: 'Gujarat',
        regionDescription: 'Operating in dynamic commercial hubs across Athwa Lines, Varachha, Ring Road, and Adajan, Surat outpatient polyclinics handle high daily patient footfalls requiring rapid receptionist turnaround.',
        localLanguage: 'Gujarati, Hindi & English',
        keyHubs: ['Athwa Lines', 'Varachha', 'Ring Road', 'Adajan', 'Vesu'],
        averageWait: '50–80 minutes without token software',
        reducedWait: '12–15 minutes with Appointory live TV tokens'
    },
    vadodara: {
        name: 'Vadodara',
        state: 'Gujarat',
        regionDescription: 'Serving central Gujarat across Alkapuri, Sayajigunj, Gotri, and Karelibaug, Vadodara clinics balance both scheduled appointments and emergency walk-ins.',
        localLanguage: 'Gujarati, Hindi & English',
        keyHubs: ['Alkapuri', 'Sayajigunj', 'Gotri', 'Karelibaug', 'Fatehgunj'],
        averageWait: '40–60 minutes without token software',
        reducedWait: '8–12 minutes with Appointory live TV tokens'
    },
    rajkot: {
        name: 'Rajkot',
        state: 'Gujarat',
        regionDescription: 'The medical epicentre of Saurashtra, Rajkot clinics on Yagnik Road, Kalawad Road, and Dhebar Road receive thousands of rural and semi-urban patients daily.',
        localLanguage: 'Gujarati, Hindi & English',
        keyHubs: ['Yagnik Road', 'Kalawad Road', 'Dhebar Road', '150 Feet Ring Road'],
        averageWait: '60–90 minutes without token software',
        reducedWait: '15 minutes with Appointory WhatsApp queue alerts'
    },
    mumbai: {
        name: 'Mumbai',
        state: 'Maharashtra',
        regionDescription: 'From high-density clinics in Dadar and Bandra to suburban centers in Andheri and Thane, Mumbai practices need zero-lag queue coordination to respect busy commuter schedules.',
        localLanguage: 'Marathi, Hindi & English',
        keyHubs: ['Bandra', 'Dadar', 'Andheri West', 'Powai', 'Thane West'],
        averageWait: '45–70 minutes without token software',
        reducedWait: '10–12 minutes with Appointory live TV tokens'
    },
    delhi: {
        name: 'Delhi NCR',
        state: 'Delhi',
        regionDescription: 'Across South Delhi, Rohini, Dwarka, Noida, and Gurgaon, medical clinics experience diverse patient profiles demanding digital prescriptions and itemized 0% GST insurance receipts.',
        localLanguage: 'Hindi & English',
        keyHubs: ['South Extension', 'Rohini', 'Dwarka', 'Noida Sector 18', 'Gurgaon DLF'],
        averageWait: '50–75 minutes without token software',
        reducedWait: '10–15 minutes with Appointory live TV tokens'
    },
    bengaluru: {
        name: 'Bengaluru',
        state: 'Karnataka',
        regionDescription: 'In India’s tech capital spanning Indiranagar, Koramangala, Whitefield, and Jayanagar, tech-savvy patients expect real-time mobile queue tracking rather than waiting in congested reception lounges.',
        localLanguage: 'Kannada, English & Hindi',
        keyHubs: ['Indiranagar', 'Koramangala', 'Whitefield', 'Jayanagar', 'HSR Layout'],
        averageWait: '40–65 minutes without token software',
        reducedWait: '8–10 minutes with Appointory live mobile alerts'
    },
    pune: {
        name: 'Pune',
        state: 'Maharashtra',
        regionDescription: 'Spanning Kothrud, Shivaji Nagar, Baner, and Viman Nagar, Pune’s thriving medical ecosystem combines traditional family practices with modern diagnostic networks.',
        localLanguage: 'Marathi, Hindi & English',
        keyHubs: ['Kothrud', 'Shivaji Nagar', 'Baner', 'Aundh', 'Viman Nagar'],
        averageWait: '45–60 minutes without token software',
        reducedWait: '10–12 minutes with Appointory live TV tokens'
    }
};

export default function CityLandingPage() {
    const { city } = useParams();
    const cityKey = (city || '').toLowerCase();
    const data = CITY_DATA[cityKey];

    if (!data) {
        return <Navigate to="/" replace />;
    }

    const pageUrl = `/clinic-software/${cityKey}`;
    const pageTitle = `Best Clinic Management Software in ${data.name} | OPD Queue & Billing`;
    const pageDesc = `Top clinic management and OPD queue software in ${data.name}, ${data.state}. Real-time TV token display, WhatsApp queue alerts, and 0% GST billing.`;

    const faqs = [
        {
            question: `Why do clinics in ${data.name} choose Appointory?`,
            answer: `Clinics in ${data.name} choose Appointory because it eliminates waiting room crowding through live TV token displays, sends automated WhatsApp queue updates to patients, and generates compliant 0% GST invoices under SAC 999312 without requiring expensive hardware.`
        },
        {
            question: `How does Appointory handle patients traveling from outside ${data.name}?`,
            answer: `Patients traveling into ${data.name} from surrounding towns can track their token number on their phone and arrive at the clinic precisely when their consultation is approaching.`
        },
        {
            question: `Does Appointory support local languages spoken in ${data.name}?`,
            answer: `Yes. Appointory patient notifications and UI supports ${data.localLanguage}, ensuring elderly and regional language patients easily understand their token status.`
        },
        {
            question: `Can multi-specialty polyclinics in ${data.name} connect to local pathology labs?`,
            answer: `Yes. Clinics in ${data.name} can connect directly with nearby diagnostic labs using our 6-digit handshake code for instant, zero-delay report delivery.`
        }
    ];

    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": `Appointory Clinic Software – ${data.name}`,
            "operatingSystem": "Web, Android, iOS, Windows, macOS",
            "applicationCategory": "HealthApplication",
            "url": `https://appointory.in${pageUrl}`,
            "areaServed": {
                "@type": "City",
                "name": data.name,
                "containedInPlace": {
                    "@type": "State",
                    "name": data.state
                }
            },
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
                { "@type": "ListItem", "position": 2, "name": "City Directory", "item": "https://appointory.in/clinic-software/ahmedabad" },
                { "@type": "ListItem", "position": 3, "name": data.name, "item": `https://appointory.in${pageUrl}` }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
            <SEO
                title={pageTitle}
                description={pageDesc}
                url={pageUrl}
                keywords={`clinic software ${data.name}, doctor appointment software ${data.name}, OPD queue management ${data.name}, clinic billing software ${data.name}, token system for clinic ${data.name}`}
                schemaMarkup={jsonLd}
            />
            <PublicHeader />

            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Breadcrumbs items={[{ name: 'Cities', url: '/clinic-software/ahmedabad' }, { name: data.name }]} />

                <header className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Healthcare Operating System &bull; {data.name}, {data.state}</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Clinic Management & OPD Queue Software in {data.name}
                    </h1>
                    <p className="mt-4 text-lg text-slate-600 max-w-3xl">
                        {data.regionDescription}
                    </p>
                </header>

                <DirectAnswer
                    query={`What is the leading clinic management software in ${data.name}?`}
                    answer={`Appointory is the premier clinic management platform in ${data.name}, helping polyclinics and solo doctors eliminate waiting room delays. It features waiting room TV token displays, real-time WhatsApp queue updates, 0% GST healthcare billing (SAC 999312), and direct pathology lab integrations tailored for healthcare practices in ${data.name}.`}
                />

                {/* City Stats Block */}
                <section className="my-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <Clock className="w-8 h-8 text-teal-600 mb-2" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Wait Time Reduction</span>
                        <p className="text-lg font-bold text-slate-900 mt-1">{data.reducedWait}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <Building2 className="w-8 h-8 text-teal-600 mb-2" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Medical Zones</span>
                        <p className="text-sm font-semibold text-slate-700 mt-1">{data.keyHubs.join(', ')}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <Receipt className="w-8 h-8 text-teal-600 mb-2" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Languages Supported</span>
                        <p className="text-sm font-semibold text-slate-700 mt-1">{data.localLanguage}</p>
                    </div>
                </section>

                <FaqSection faqs={faqs} title={`Clinic FAQs for ${data.name}`} />

                <div className="my-12 p-8 bg-teal-900 text-white rounded-3xl text-center space-y-4">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Equip Your {data.name} Clinic Today</h2>
                    <p className="text-teal-200 text-sm sm:text-base max-w-xl mx-auto">
                        Experience calm waiting rooms and delighted patients across {data.name}.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        <Link
                            to="/register-clinic"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-teal-900 font-bold hover:bg-teal-50 transition-colors shadow-sm"
                        >
                            <span>Set Up Your {data.name} Clinic</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <WhatsAppShareButton 
                            text={`Check out Appointory clinic management software for ${data.name}`}
                            path={pageUrl}
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
