// Build-Time Pre-rendering Script for Appointory
// Pre-renders all static marketing, feature, solution, comparison, and city routes
// into dist/<route>/index.html with route-specific <title>, meta descriptions,
// canonicals, hreflang, OpenGraph, Twitter Cards, Schema.org JSON-LD, and semantic HTML.
// Ensures 100% crawlability with 0ms TTFB on Vercel CDN for all web crawlers.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');
const BASE_HTML_PATH = path.join(DIST_DIR, 'index.html');
const SITE_URL = 'https://appointory.in';

if (!fs.existsSync(BASE_HTML_PATH)) {
    console.error(`❌ Base index.html not found at ${BASE_HTML_PATH}. Run 'vite build' first.`);
    process.exit(1);
}

const baseHtml = fs.readFileSync(BASE_HTML_PATH, 'utf-8');

const ROUTES_METADATA = [
    {
        route: '',
        title: 'Appointory | #1 Clinic OPD Queue, 0% GST Billing & TV Token Software',
        description: 'Appointory is India’s modern clinic operating system: zero-wait OPD token display, WhatsApp live queue alerts, 0% GST billing (SAC 999312), and synchronized lab networks. The modern Practo & Cliniko alternative.',
        keywords: 'Appointory, Appointry, Apointory, Appointary, Appointori, Appoitory, Appontory, Appointery, Apointery, Apointry, Appoint-ory, Appoint ory, appointory.in, clinic management software India, Practo alternative, Cliniko alternative, HealthPlix alternative, Eka Care alternative, Docpulse alternative, Ray by Practo alternative, OPD queue management system, token system for clinic, online doctor appointment booking software, clinic billing software GST, SAC 999312, waiting room TV token display',
        h1: 'Appointory – Care without the Waiting Room',
        directAnswer: 'Appointory is India\'s clinical operating system that eliminates waiting room congestion. It pairs live waiting room TV token displays and WhatsApp queue tracking with 0% GST medical billing (SAC 999312) and 6-digit diagnostic lab handshakes.',
        schema: [
            {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Appointory",
                "alternateName": [
                    "Appointry",
                    "Apointory",
                    "Appointary",
                    "Appointori",
                    "Appoitory",
                    "Appontory",
                    "Appointery",
                    "Apointery",
                    "Apointry",
                    "Appoint-ory",
                    "Appoint ory",
                    "appointory.in"
                ],
                "url": "https://appointory.in",
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://appointory.in/search?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                }
            },
            {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Appointory",
                "alternateName": [
                    "Appointry",
                    "Apointory",
                    "Appointary",
                    "Appointori",
                    "Appoitory",
                    "Appontory",
                    "Appointery",
                    "Apointery",
                    "Apointry",
                    "Appoint-ory",
                    "Appoint ory",
                    "Appointory Healthcare",
                    "Appointory Health OS",
                    "Appointory India"
                ],
                "legalName": "Appointory Healthcare Systems",
                "url": "https://appointory.in",
                "logo": "https://appointory.in/appointory-logo-mark.png",
                "sameAs": [
                    "https://www.linkedin.com/company/appointory",
                    "https://x.com/appointory",
                    "https://www.instagram.com/appointory.in",
                    "https://github.com/theintelliverse"
                ]
            }
        ]
    },
    {
        route: 'features/queue-management',
        title: 'OPD Queue Management System & Live Token App India',
        description: 'Appointory OPD queue management eliminates clinic waiting rooms with live digital tokens, waiting room TV sync, and WhatsApp token alerts. Set up in 5 minutes.',
        keywords: 'OPD queue management system, clinic management software India, token system for clinic, patient queue management app, waiting room TV token display',
        h1: 'OPD Queue Management System for Modern Indian Clinics',
        directAnswer: 'Appointory\'s OPD queue management system synchronizes walk-in QR check-ins and pre-booked slots into live digital tokens. Patients track their wait remotely on their phones with automated WhatsApp notifications, while smart TVs announce called tokens with audio chimes.',
        schema: [
            {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "Appointory OPD Queue Management System",
                "operatingSystem": "Web, Android, iOS, Windows, macOS",
                "applicationCategory": "HealthApplication",
                "url": "https://appointory.in/features/queue-management"
            }
        ]
    },
    {
        route: 'features/token-display-tv',
        title: 'Waiting Room TV Token Display Software for Indian Clinics',
        description: 'Transform any smart TV or monitor into a real-time OPD token display. Zero proprietary hardware, WebSocket audio announcements, multi-cabin support.',
        keywords: 'waiting room TV token display, token system for clinic, OPD waiting screen, clinic digital signage, token display screen India',
        h1: 'Waiting Room TV Token Display for Clinics',
        directAnswer: 'Open your smart TV or Fire TV browser and navigate to your clinic\'s Appointory TV link. When doctors call the next patient, the TV screen instantly updates the token number with an audible bell chime and voice callout via WebSockets with zero lag.',
        schema: [
            {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "Appointory Waiting Room TV Token Display",
                "operatingSystem": "Smart TV, Web, Android TV, Fire TV, LG webOS, Tizen",
                "applicationCategory": "HealthApplication",
                "url": "https://appointory.in/features/token-display-tv"
            }
        ]
    },
    {
        route: 'features/gst-billing',
        title: 'Clinic Billing Software with 0% GST Exemption (SAC 999312)',
        description: 'Appointory clinic billing software automates 0% GST medical invoices under Notification 12/2017, SAC 999312 & 999316, with anti-fraud QR verification.',
        keywords: 'clinic billing software GST, is medical consultation GST exempt in India, SAC 999312, SAC 999316, doctor invoice software India',
        h1: 'Clinic Billing Software with Automated 0% GST Exemption',
        directAnswer: 'Under Notification No. 12/2017-Central Tax (Rate), Entry 74, clinical consultations (SAC 999312) and diagnostic pathology tests (SAC 999316) by registered practitioners are 100% exempt from GST (Nil / 0% tax). Appointory formats these invoices automatically.',
        schema: [
            {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "Appointory Clinic GST Billing Engine",
                "operatingSystem": "Web, Android, iOS, Windows, macOS",
                "applicationCategory": "HealthApplication",
                "url": "https://appointory.in/features/gst-billing"
            }
        ]
    },
    {
        route: 'features/lab-network',
        title: 'Pathology Lab Management Software & Clinic Handshake Network',
        description: 'Seamless lab-clinic integration. Independent diagnostic labs connect to clinics via 6-digit handshake codes for instant report delivery and zero billing friction.',
        keywords: 'pathology lab management software, lab referral software for clinics, lab handshake network, diagnostic lab portal India',
        h1: 'Pathology Lab Management & Clinic Handshake Network',
        directAnswer: 'Doctors prescribe blood tests and imaging with a single click, generating a secure 6-digit handshake code. The patient presents this code at the connected diagnostic lab, which auto-loads test parameters. Completed PDF reports sync directly to the doctor cabin.',
        schema: [
            {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "Appointory Diagnostic Lab Handshake Network",
                "operatingSystem": "Web, Android, iOS, Windows, macOS",
                "applicationCategory": "HealthApplication",
                "url": "https://appointory.in/features/lab-network"
            }
        ]
    },
    {
        route: 'features/digital-prescription',
        title: 'Digital Prescription Software (Rx Generator) for Indian Doctors',
        description: 'Create beautiful, compliant digital prescriptions in 30 seconds with Appointory. 1-click WhatsApp delivery, specialty Rx templates, and secure EMR storage.',
        keywords: 'digital prescription software, Rx generator India, clinic appointment software India, electronic medical records EMR',
        h1: 'Fast, Compliant Digital Prescription Software for Doctors',
        directAnswer: 'Appointory lets Indian doctors generate full medical prescriptions in under 30 seconds using pre-built specialty templates and drug autofill. Prescriptions comply with NMC Telemedicine Guidelines and deliver instantly to patients via WhatsApp PDF.',
        schema: [
            {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "Appointory Digital Prescription Software",
                "operatingSystem": "Web, Android, iOS, Windows, macOS",
                "applicationCategory": "HealthApplication",
                "url": "https://appointory.in/features/digital-prescription"
            }
        ]
    },
    {
        route: 'for/clinics',
        title: 'Clinic Management Software for Polyclinics & OPD Centers',
        description: 'All-in-one clinic management software for Indian OPDs and polyclinics. Multi-doctor queues, receptionist desk, 0% GST billing, and TV token displays.',
        keywords: 'clinic management software India, polyclinic software India, OPD software for clinics, receptionist billing software',
        h1: 'Complete Clinic Management Software for Indian OPDs',
        directAnswer: 'Appointory eliminates front-desk chaos in multi-doctor clinics with synchronized TV token displays, smart walk-in and online queue balancing, 0% GST compliant medical invoices, and direct 6-digit lab handshakes, all while ensuring DPDP Act 2023 compliance.',
        schema: [{ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Appointory for Clinics", "url": "https://appointory.in/for/clinics" }]
    },
    {
        route: 'for/doctors',
        title: 'Software for Doctors & Independent Practitioners in India',
        description: 'Designed for practicing doctors. Streamline your consulting cabin with instant token calls, digital prescriptions, longitudinal patient history, and zero admin burden.',
        keywords: 'doctor consultation software, clinic software for doctors, doctor appointment booking software, digital prescription app',
        h1: 'Focus 100% on Patient Care with Appointory Doctor Cabin',
        directAnswer: 'Appointory automates OPD queue flow so doctors consult without waiting room door knocks. With 1-click token callouts, pre-built specialty prescription templates delivered directly to patient WhatsApp, and instant access to past EMR records, doctors save time.',
        schema: [{ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Appointory for Doctors", "url": "https://appointory.in/for/doctors" }]
    },
    {
        route: 'for/labs',
        title: 'Diagnostic Lab Portal & Clinic Referral Network India',
        description: 'Independent pathology and diagnostic laboratory software. Connect with local clinics, receive 6-digit test handshakes, and dispatch verified PDF reports instantly.',
        keywords: 'pathology lab software, diagnostic lab portal India, clinical lab referral management, lab handshake network',
        h1: 'Grow Your Pathology Network with Appointory Lab Portal',
        directAnswer: 'Appointory provides diagnostic laboratories with a cloud portal connecting directly to local outpatient clinics. Using instant 6-digit test handshake codes, labs eliminate clerical transcription errors and deliver verified reports directly to doctor screens.',
        schema: [{ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Appointory for Diagnostic Labs", "url": "https://appointory.in/for/labs" }]
    },
    {
        route: 'pricing',
        title: 'Transparent Clinic Software Pricing India | Free Tier Available',
        description: 'Affordable clinic management pricing in India. Free plan for small practices, scalable plans for busy polyclinics and diagnostic labs. No hidden charges.',
        keywords: 'clinic management software pricing India, free clinic software India, affordable clinic software, OPD queue software price',
        h1: 'Simple, Predictable Plans for Clinics of All Sizes',
        directAnswer: 'Appointory offers a free Starter tier for solo doctors and small clinics. For high-volume multi-doctor polyclinics, the Professional plan costs ₹999/month, including unlimited tokens, waiting room TV sync, 0% GST billing, and WhatsApp alerts with zero hardware purchases.',
        schema: [{ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Appointory Pricing", "url": "https://appointory.in/pricing" }]
    },
    {
        route: 'blog',
        title: 'Clinic Management & Healthcare IT Blog | Appointory',
        description: 'Insights, statutory tax guides, and OPD operational strategies for Indian doctors and clinics. Learn about 0% GST billing, DPDP compliance, and queue tech.',
        keywords: 'clinic management blog, healthcare IT India, doctor consultation GST guide, clinic waiting room management',
        h1: 'Healthcare IT & Clinic Management Insights',
        directAnswer: 'Modern Indian clinics require three core systems: real-time OPD queue displays with WhatsApp alerts to eliminate waiting room crowding, statutory 0% GST billing engines (SAC 999312) with anti-fraud QR audit trails, and encrypted lab networks.',
        schema: [{ "@context": "https://schema.org", "@type": "Blog", "name": "Appointory Blog", "url": "https://appointory.in/blog" }]
    },
    {
        route: 'blog/how-to-reduce-patient-waiting-time-in-clinics',
        title: 'How to Reduce Patient Waiting Time in Clinics | Zero-Wait OPD Guide',
        description: 'Learn how to reduce patient waiting time in clinics by up to 70%. Practical strategies for real-time OPD queues, smart TV tokens, paperless records, and doctor scheduling.',
        keywords: 'how to reduce patient waiting time in clinics, real-time opd queue management system, doctor appointment booking app, paperless clinic software, smart token display for clinics, reduce clinic wait time',
        h1: 'How to Reduce Patient Waiting Time in Clinics: 2026 Zero-Wait Guide',
        directAnswer: 'To reduce patient waiting time in clinics, replace rigid fixed appointment slots with a dynamic real-time OPD queue management system. Let patients check in via QR code and track live token velocity on WhatsApp so they arrive only when 2 to 3 patients remain before their turn. Pair this with a smart TV token display and paperless clinic software to cut administrative delays by up to 70%.',
        schema: [{ "@context": "https://schema.org", "@type": "BlogPosting", "headline": "How to Reduce Patient Waiting Time in Clinics: The Complete 2026 Guide to Zero-Wait OPD", "url": "https://appointory.in/blog/how-to-reduce-patient-waiting-time-in-clinics" }]
    },
    {
        route: 'compare/appointory-vs-practo',
        title: 'Appointory vs Practo | Modern Clinic OS Comparison 2026',
        description: 'Compare Appointory and Practo for clinic management in India. Learn why clinics choose Appointory for zero-wait OPD queues, 0% GST billing, and independent branding.',
        keywords: 'Appointory vs Practo, Practo alternative India, Cliniko alternative, HealthPlix alternative, Eka Care alternative, Docpulse alternative, Ray by Practo alternative, clinic management software comparison',
        h1: 'Appointory vs Practo: Which is Best for Your Clinic?',
        directAnswer: 'While Practo functions primarily as a patient aggregator marketplace where competing doctors are listed, Appointory is a dedicated clinic operating system focused on eliminating physical waiting room chaos with live TV token displays, private WhatsApp alerts, and 0% GST billing.',
        schema: [{ "@context": "https://schema.org", "@type": "WebPage", "name": "Appointory vs Practo", "url": "https://appointory.in/compare/appointory-vs-practo" }]
    },
    {
        route: 'compare/practo-alternative',
        title: 'Top Practo Alternative for Clinics in India | Appointory',
        description: 'Discover the #1 Practo alternative for private clinics in India. Zero commissions, no rival doctor advertisements, waiting room TV tokens, and 0% GST billing.',
        keywords: 'Practo alternative, best Practo alternative India, Practo Ray alternative, Cliniko alternative, HealthPlix alternative, clinic software without commissions',
        h1: 'The #1 Private Practo Alternative for Indian Clinics',
        directAnswer: 'Appointory is India\'s top Practo alternative because it is 100% white-label and private to your clinic. You never pay booking commissions, competitor doctors are never advertised to your patients, and waiting room TV displays keep OPD running on time.',
        schema: [{ "@context": "https://schema.org", "@type": "WebPage", "name": "Practo Alternative Comparison", "url": "https://appointory.in/compare/practo-alternative" }]
    },
    {
        route: 'compare',
        title: 'Clinic Software Comparison & Alternatives | Appointory vs Others',
        description: 'Compare Appointory with legacy clinic software and aggregator apps. Choose zero wait times, TV token displays, and automated 0% GST billing.',
        keywords: 'clinic software comparison, Practo alternative, Cliniko alternative, HealthPlix alternative, doctor appointment software review',
        h1: 'Compare Appointory with Legacy Clinic Management Systems',
        directAnswer: 'Compare Appointory against aggregator platforms like Practo and legacy desktop software. Appointory gives you modern cloud queues, TV token broadcasts, WhatsApp alerts, and DPDP Act compliance at a fraction of the cost.',
        schema: [{ "@context": "https://schema.org", "@type": "WebPage", "name": "Clinic Software Comparison", "url": "https://appointory.in/compare" }]
    },
    {
        route: 'clinic-software/ahmedabad',
        title: 'Best Clinic Management Software in Ahmedabad | OPD Queue & Billing',
        description: 'Top clinic management and OPD queue software in Ahmedabad, Gujarat. Real-time TV token display, WhatsApp queue alerts, and 0% GST billing.',
        keywords: 'clinic software Ahmedabad, doctor appointment software Ahmedabad, OPD queue management Ahmedabad, clinic billing Ahmedabad',
        h1: 'Clinic Management & OPD Queue Software in Ahmedabad',
        directAnswer: 'Appointory is the premier clinic management platform in Ahmedabad, helping polyclinics and solo doctors eliminate waiting room delays. It features waiting room TV token displays, real-time WhatsApp queue updates, and 0% GST healthcare billing (SAC 999312).',
        schema: [{ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Appointory Ahmedabad", "url": "https://appointory.in/clinic-software/ahmedabad" }]
    },
    {
        route: 'clinic-software/surat',
        title: 'Best Clinic Management Software in Surat | OPD Queue & Billing',
        description: 'Top clinic management and OPD queue software in Surat, Gujarat. Real-time TV token display, WhatsApp queue alerts, and 0% GST billing.',
        keywords: 'clinic software Surat, doctor appointment software Surat, OPD queue management Surat, clinic billing Surat',
        h1: 'Clinic Management & OPD Queue Software in Surat',
        directAnswer: 'Appointory is the premier clinic management platform in Surat across Athwa Lines, Varachha, and Adajan, helping polyclinics eliminate waiting room delays with live TV token boards and WhatsApp alerts.',
        schema: [{ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Appointory Surat", "url": "https://appointory.in/clinic-software/surat" }]
    },
    {
        route: 'clinic-software/vadodara',
        title: 'Best Clinic Management Software in Vadodara | OPD Queue & Billing',
        description: 'Top clinic management and OPD queue software in Vadodara, Gujarat. Real-time TV token display, WhatsApp queue alerts, and 0% GST billing.',
        keywords: 'clinic software Vadodara, doctor appointment software Vadodara, OPD queue management Vadodara',
        h1: 'Clinic Management & OPD Queue Software in Vadodara',
        directAnswer: 'Appointory is the leading clinic software in Vadodara across Alkapuri and Sayajigunj, streamlining doctor appointments, waiting room screens, and 0% GST healthcare invoicing.',
        schema: [{ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Appointory Vadodara", "url": "https://appointory.in/clinic-software/vadodara" }]
    },
    {
        route: 'clinic-software/rajkot',
        title: 'Best Clinic Management Software in Rajkot | OPD Queue & Billing',
        description: 'Top clinic management and OPD queue software in Rajkot, Gujarat. Real-time TV token display, WhatsApp queue alerts, and 0% GST billing.',
        keywords: 'clinic software Rajkot, doctor appointment software Rajkot, OPD queue management Rajkot',
        h1: 'Clinic Management & OPD Queue Software in Rajkot',
        directAnswer: 'Appointory is the premier clinic management software in Rajkot across Yagnik Road and Kalawad Road, helping Saurashtra medical clinics coordinate high patient volumes with live WhatsApp tokens.',
        schema: [{ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Appointory Rajkot", "url": "https://appointory.in/clinic-software/rajkot" }]
    },
    {
        route: 'clinic-software/mumbai',
        title: 'Best Clinic Management Software in Mumbai | OPD Queue & Billing',
        description: 'Top clinic management and OPD queue software in Mumbai, Maharashtra. Real-time TV token display, WhatsApp queue alerts, and 0% GST billing.',
        keywords: 'clinic software Mumbai, doctor appointment software Mumbai, OPD queue management Mumbai',
        h1: 'Clinic Management & OPD Queue Software in Mumbai',
        directAnswer: 'Appointory is Mumbai\'s modern clinic operating system across Dadar, Bandra, and Andheri West, eliminating waiting room crowding with live TV token displays and zero-commission appointment booking.',
        schema: [{ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Appointory Mumbai", "url": "https://appointory.in/clinic-software/mumbai" }]
    },
    {
        route: 'clinic-software/delhi',
        title: 'Best Clinic Management Software in Delhi NCR | OPD Queue & Billing',
        description: 'Top clinic management and OPD queue software in Delhi NCR. Real-time TV token display, WhatsApp queue alerts, and 0% GST billing.',
        keywords: 'clinic software Delhi NCR, doctor appointment software Delhi, OPD queue management Delhi',
        h1: 'Clinic Management & OPD Queue Software in Delhi NCR',
        directAnswer: 'Appointory empowers clinics across South Delhi, Rohini, Noida, and Gurgaon with intelligent OPD queue orchestration, TV token boards, and statutory 0% GST medical billing under SAC 999312.',
        schema: [{ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Appointory Delhi", "url": "https://appointory.in/clinic-software/delhi" }]
    },
    {
        route: 'clinic-software/bengaluru',
        title: 'Best Clinic Management Software in Bengaluru | OPD Queue & Billing',
        description: 'Top clinic management and OPD queue software in Bengaluru, Karnataka. Real-time TV token display, WhatsApp queue alerts, and 0% GST billing.',
        keywords: 'clinic software Bengaluru, doctor appointment software Bengaluru, OPD queue management Bengaluru',
        h1: 'Clinic Management & OPD Queue Software in Bengaluru',
        directAnswer: 'Appointory is the preferred clinical operating system in Bengaluru across Indiranagar, Koramangala, and Whitefield, delivering a modern, wait-free healthcare experience for tech-forward patients.',
        schema: [{ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Appointory Bengaluru", "url": "https://appointory.in/clinic-software/bengaluru" }]
    },
    {
        route: 'clinic-software/pune',
        title: 'Best Clinic Management Software in Pune | OPD Queue & Billing',
        description: 'Top clinic management and OPD queue software in Pune, Maharashtra. Real-time TV token display, WhatsApp queue alerts, and 0% GST billing.',
        keywords: 'clinic software Pune, doctor appointment software Pune, OPD queue management Pune',
        h1: 'Clinic Management & OPD Queue Software in Pune',
        directAnswer: 'Appointory serves healthcare practices in Pune across Kothrud, Baner, and Shivaji Nagar, organizing multi-doctor OPD queues and synchronizing connected pathology lab networks.',
        schema: [{ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Appointory Pune", "url": "https://appointory.in/clinic-software/pune" }]
    },
    {
        route: 'about',
        title: 'About Appointory | Care without the Waiting Room',
        description: 'Appointory is India’s clinical operating system on a mission to eliminate waiting room congestion through real-time TV tokens, 0% GST billing, and synchronized lab networks.',
        keywords: 'about Appointory, clinic management company India, healthcare IT Bharat, digital health intermediary',
        h1: 'Care without the Waiting Room',
        directAnswer: 'Appointory is India\'s clinical operating system engineered to eliminate waiting room congestion. It synchronizes live waiting room TV token displays, mobile queue tracking via WhatsApp, and statutory 0% GST healthcare billing (SAC 999312).',
        schema: [{ "@context": "https://schema.org", "@type": "Organization", "name": "Appointory", "url": "https://appointory.in/about" }]
    },
    {
        route: 'press',
        title: 'Press & Media Kit | Appointory Healthcare Technologies',
        description: 'Official press releases, media assets, company logos, and quotable healthcare statistics for journalists and industry analysts covering Appointory.',
        keywords: 'Appointory press kit, Appointory media kit, healthcare IT news India, clinic software press release',
        h1: 'Appointory Press & Media Kit',
        directAnswer: 'Appointory is India\'s clinical operating system founded on the principle of "Care without the Waiting Room". Clinically proven to reduce OPD waiting room crowding by up to 70%, it synchronizes live TV token boards and 0% GST billing.',
        schema: [{ "@context": "https://schema.org", "@type": "WebPage", "name": "Appointory Press", "url": "https://appointory.in/press" }]
    },
    {
        route: 'links',
        title: 'Official Links & Portals | Appointory',
        description: 'Official link-in-bio for Appointory. Fast access to clinic registration, doctor cabin, waiting room TV displays, and patient health lockers.',
        keywords: 'Appointory links, Appointory instagram bio, clinic software links, book appointment, register clinic',
        h1: 'Appointory Official Portals',
        directAnswer: 'Quick access directory for Appointory: clinic registration, patient contactless check-in, waiting room TV display links, and doctor cabin portals.',
        schema: [{ "@context": "https://schema.org", "@type": "WebPage", "name": "Appointory Links", "url": "https://appointory.in/links" }]
    }
];

function generatePrerenderedHtml(item) {
    const canonicalUrl = `${SITE_URL}${item.route ? `/${item.route}` : ''}`;
    const ogImage = `${SITE_URL}/og-image.png`;

    let html = baseHtml;

    // 1. Replace <title>
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${item.title}</title>`);

    // 2. Replace <meta name="description">
    html = html.replace(/<meta name="description"[\s\S]*?>/i, `<meta name="description" content="${item.description}">`);

    // 2b. Replace <meta name="keywords">
    if (item.keywords) {
        html = html.replace(/<meta name="keywords"[\s\S]*?>/i, `<meta name="keywords" content="${item.keywords}">`);
    }

    // 3. Replace <link rel="canonical">
    html = html.replace(/<link rel="canonical"[\s\S]*?>/i, `<link rel="canonical" href="${canonicalUrl}">`);

    // 4. Update hreflang tags
    html = html.replace(/<link rel="alternate" hreflang="en-IN"[\s\S]*?>/i, `<link rel="alternate" hreflang="en-IN" href="${canonicalUrl}">`);
    html = html.replace(/<link rel="alternate" hreflang="hi-IN"[\s\S]*?>/i, `<link rel="alternate" hreflang="hi-IN" href="${canonicalUrl}">`);
    html = html.replace(/<link rel="alternate" hreflang="gu-IN"[\s\S]*?>/i, `<link rel="alternate" hreflang="gu-IN" href="${canonicalUrl}">`);
    html = html.replace(/<link rel="alternate" hreflang="x-default"[\s\S]*?>/i, `<link rel="alternate" hreflang="x-default" href="${canonicalUrl}">`);

    // 5. Update OpenGraph tags
    html = html.replace(/<meta property="og:title"[\s\S]*?>/i, `<meta property="og:title" content="${item.title}">`);
    html = html.replace(/<meta property="og:description"[\s\S]*?>/i, `<meta property="og:description" content="${item.description}">`);
    html = html.replace(/<meta property="og:url"[\s\S]*?>/i, `<meta property="og:url" content="${canonicalUrl}">`);
    html = html.replace(/<meta property="og:image"[\s\S]*?>/i, `<meta property="og:image" content="${ogImage}">`);

    // 6. Update Twitter tags
    html = html.replace(/<meta name="twitter:title"[\s\S]*?>/i, `<meta name="twitter:title" content="${item.title}">`);
    html = html.replace(/<meta name="twitter:description"[\s\S]*?>/i, `<meta name="twitter:description" content="${item.description}">`);
    html = html.replace(/<meta name="twitter:image"[\s\S]*?>/i, `<meta name="twitter:image" content="${ogImage}">`);

    // 7. Inject Schema.org JSON-LD
    if (item.schema) {
        const schemaString = JSON.stringify(item.schema);
        const schemaTag = `\n    <script type="application/ld+json">${schemaString}</script>\n`;
        html = html.replace('</head>', `${schemaTag}</head>`);
    }

    // 8. Inject Semantic AEO Content inside <div id="root">
    const semanticContent = `
        <header style="max-width:800px;margin:2rem auto;padding:0 1rem;">
            <p style="color:#0d9488;font-weight:700;text-transform:uppercase;font-size:0.875rem;">Appointory &bull; Healthcare OS for Bharat</p>
            <h1 style="color:#0f172a;font-size:2.25rem;font-weight:900;line-height:1.2;">${item.h1}</h1>
            <p style="color:#475569;font-size:1.125rem;margin-top:0.75rem;">${item.description}</p>
            <aside style="background:#f0fdfa;border:1px solid #99f6e4;padding:1.25rem;border-radius:1rem;margin:1.5rem 0;color:#134e4a;">
                <strong style="display:block;margin-bottom:0.25rem;color:#0f766e;">Quick Answer (AEO Summary):</strong>
                ${item.directAnswer}
            </aside>
            <nav style="margin-top:1.5rem;">
                <a href="${SITE_URL}/register-clinic" style="display:inline-block;background:#0d9488;color:#fff;padding:0.75rem 1.5rem;border-radius:0.75rem;text-decoration:none;font-weight:700;">Get Started Free</a>
                <a href="${SITE_URL}" style="display:inline-block;color:#0d9488;margin-left:1rem;font-weight:600;text-decoration:none;">Explore Home &rarr;</a>
            </nav>
        </header>
    `;

const HOME_SEMANTIC_CONTENT = `
    <header style="max-width: 1200px; margin: 0 auto; padding: 32px 20px 20px; text-align: center; font-family: system-ui, -apple-system, sans-serif;">
      <h1 style="font-size: 2.2rem; color: #064e3b; margin: 0 0 12px; font-weight: 800; letter-spacing: -0.02em;">
        Appointory – Care without the Waiting Room
      </h1>
      <p style="font-size: 1.15rem; color: #374151; max-width: 820px; margin: 0 auto 16px; line-height: 1.5;">
        India's #1 Clinic OPD Queue Management, Waiting Room TV Token Display, 0% GST Medical Billing &amp; Connected Pathology Lab Platform. The modern, private alternative to Practo, Cliniko, and HealthPlix.
      </p>
      <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 14px;">
        <span style="background: #d1fae5; color: #065f46; padding: 6px 14px; border-radius: 9999px; font-size: 0.85rem; font-weight: 700;">Zero-Wait OPD Queue</span>
        <span style="background: #e0f2fe; color: #0369a1; padding: 6px 14px; border-radius: 9999px; font-size: 0.85rem; font-weight: 700;">Smart TV Token Display</span>
        <span style="background: #fef3c7; color: #92400e; padding: 6px 14px; border-radius: 9999px; font-size: 0.85rem; font-weight: 700;">0% GST Medical Billing (SAC 999312)</span>
        <span style="background: #ede9fe; color: #6d28d9; padding: 6px 14px; border-radius: 9999px; font-size: 0.85rem; font-weight: 700;">Independent Lab Network</span>
      </div>
    </header>

    <main style="max-width: 1100px; margin: 0 auto; padding: 20px; font-family: system-ui, -apple-system, sans-serif; color: #1f2937; line-height: 1.6;">
      <section style="margin-bottom: 40px; padding: 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="font-size: 1.5rem; color: #0f766e; margin-top: 0;">Comprehensive Clinical Operating System</h2>
        <p>Appointory is purpose-built for Indian single-practitioner clinics, multi-specialty polyclinics, and diagnostic centers. It replaces unorganized paper queues, manual tokens, and disjointed software with a unified clinical workflow.</p>
        <ul style="padding-left: 20px; margin-top: 12px;">
          <li><strong>OPD Queue Management:</strong> Dynamic wait-time recalculation based on doctor consultation pace, with live WhatsApp &amp; SMS token alerts.</li>
          <li><strong>Waiting Room TV Token Display:</strong> Turn any smart TV or browser screen into an audible token monitor with chime alerts and multi-cabin coordination.</li>
          <li><strong>0% GST Medical Billing:</strong> Automated healthcare exemption compliance under Notification No. 12/2017 (SAC 999312 &amp; SAC 999316) with tamper-evident anti-fraud QR invoices.</li>
          <li><strong>Pathology Lab Handshake:</strong> Bi-directional connection with independent labs for digital test requests and automated report syncing.</li>
          <li><strong>Digital Prescriptions &amp; Health Locker:</strong> DPDP Act 2023 &amp; AES-256 encrypted digital records accessible for life.</li>
        </ul>
      </section>

      <section style="margin-bottom: 40px; padding: 24px; background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px;">
        <h2 style="font-size: 1.5rem; color: #0f766e; margin-top: 0;">Why Appointory is the Best Alternative to Practo, Cliniko &amp; HealthPlix</h2>
        <p>Traditional platforms act as aggregators that charge fees per booking and redirect your patients to competing clinics. Appointory is 100% private to your facility:</p>
        <ul style="padding-left: 20px; margin-top: 12px;">
          <li><strong>Zero Commissions:</strong> Keep 100% of your consultation and procedure revenues.</li>
          <li><strong>No Competitor Ads:</strong> Patients never see rival doctors on your booking portal.</li>
          <li><strong>Built-in Token TV:</strong> No separate hardware or dispenser contracts needed.</li>
          <li><strong>Complete Data Ownership:</strong> Patient records remain fully confidential and compliant with India's DPDP Act 2023.</li>
        </ul>
      </section>

      <section style="margin-bottom: 40px; padding: 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="font-size: 1.5rem; color: #0f766e; margin-top: 0;">Available Across Key Healthcare Hubs in India</h2>
        <p>Appointory powers clinics across Ahmedabad, Surat, Vadodara, Rajkot, Mumbai, Delhi NCR, Bengaluru, Pune, and expanding nationwide.</p>
        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
          <a href="/clinic-software/ahmedabad" style="color: #0d9488; text-decoration: underline; font-weight: 600;">Ahmedabad Clinic Software</a> &middot;
          <a href="/clinic-software/surat" style="color: #0d9488; text-decoration: underline; font-weight: 600;">Surat Clinic Software</a> &middot;
          <a href="/clinic-software/vadodara" style="color: #0d9488; text-decoration: underline; font-weight: 600;">Vadodara Clinic Software</a> &middot;
          <a href="/clinic-software/rajkot" style="color: #0d9488; text-decoration: underline; font-weight: 600;">Rajkot Clinic Software</a> &middot;
          <a href="/clinic-software/mumbai" style="color: #0d9488; text-decoration: underline; font-weight: 600;">Mumbai Clinic Software</a> &middot;
          <a href="/clinic-software/delhi" style="color: #0d9488; text-decoration: underline; font-weight: 600;">Delhi Clinic Software</a> &middot;
          <a href="/clinic-software/bengaluru" style="color: #0d9488; text-decoration: underline; font-weight: 600;">Bengaluru Clinic Software</a> &middot;
          <a href="/clinic-software/pune" style="color: #0d9488; text-decoration: underline; font-weight: 600;">Pune Clinic Software</a>
        </div>
      </section>
    </main>
`;

    // 8. Inject Semantic Content inside <div id="root"></div>
    const contentToInject = item.route === '' ? HOME_SEMANTIC_CONTENT : semanticContent;
    html = html.replace('<div id="root"></div>', `<div id="root">${contentToInject}</div>`);

    return html;
}

let generatedCount = 0;

for (const item of ROUTES_METADATA) {
    const renderedHtml = generatePrerenderedHtml(item);

    let targetFile;
    if (item.route === '') {
        targetFile = BASE_HTML_PATH;
    } else {
        const routeDir = path.join(DIST_DIR, item.route);
        if (!fs.existsSync(routeDir)) {
            fs.mkdirSync(routeDir, { recursive: true });
        }
        targetFile = path.join(routeDir, 'index.html');
    }

    fs.writeFileSync(targetFile, renderedHtml, 'utf-8');
    generatedCount++;
    console.log(`✅ Pre-rendered: /${item.route} -> ${path.relative(DIST_DIR, targetFile)}`);
}

console.log(`\n🎉 Successfully pre-rendered ${generatedCount} static routes with SEO, AEO, and JSON-LD schemas!`);
