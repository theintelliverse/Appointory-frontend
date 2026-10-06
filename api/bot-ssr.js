// Vercel Serverless Bot SSR & Social Crawler Pre-renderer
// Serves server-rendered HTML with full meta tags, OpenGraph, Twitter, and Schema.org JSON-LD to non-JS crawlers
// (WhatsApp, Facebook, LinkedIn, Twitter/X, Telegram, PerplexityBot, ClaudeBot, Googlebot, etc.)
// Returns real 404 HTTP status for invalid or unconsented profiles under DPDP Act 2023.

const BACKEND_API = (typeof process !== 'undefined' && process.env?.VITE_API_URL) ? process.env.VITE_API_URL : 'https://api.appointory.in';
const SITE_URL = 'https://appointory.in';

async function fetchJson(url) {
    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Appointory-Edge-BotSSR/1.0' }
        });
        const data = await response.json();
        return { ok: response.ok, status: response.status, data };
    } catch (err) {
        return { ok: false, status: 500, error: err.message };
    }
}

function renderHtml({ title, description, canonicalUrl, ogImage, ogType = 'website', jsonLd = null, bodyHtml = '', is404 = false }) {
    const defaultImage = `${SITE_URL}/og-image.png`;
    const image = ogImage || defaultImage;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  ${is404 ? '<meta name="robots" content="noindex, nofollow, noarchive">' : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">'}
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  
  <!-- Multilingual hreflang -->
  <link rel="alternate" hreflang="en-IN" href="${escapeHtml(canonicalUrl)}">
  <link rel="alternate" hreflang="hi-IN" href="${escapeHtml(canonicalUrl)}">
  <link rel="alternate" hreflang="gu-IN" href="${escapeHtml(canonicalUrl)}">
  <link rel="alternate" hreflang="x-default" href="${escapeHtml(canonicalUrl)}">

  <!-- Open Graph / WhatsApp / Facebook / LinkedIn / Instagram -->
  <meta property="og:type" content="${ogType}">
  <meta property="og:site_name" content="Appointory">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:secure_url" content="${escapeHtml(image)}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(title)}">
  <meta property="og:locale" content="en_IN">
  <meta name="theme-color" content="#0d9488">

  <!-- Twitter / X Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@appointory">
  <meta name="twitter:creator" content="@appointory">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  <meta name="twitter:image:alt" content="${escapeHtml(title)}">

  ${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 800px; margin: 40px auto; padding: 0 20px; }
    h1 { color: #0d9488; font-size: 2rem; margin-bottom: 0.5rem; }
    h2 { color: #0f766e; margin-top: 2rem; }
    .badge { display: inline-block; background: #ccfbf1; color: #0f766e; padding: 4px 12px; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; }
    .faq { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 12px 0; }
    .faq h3 { margin-top: 0; color: #0f172a; font-size: 1.1rem; }
    .cta-btn { display: inline-block; background: #0d9488; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 1.5rem; }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export default async function handler(req, res) {
    const rawPath = req.query.path || req.url || '';
    const cleanPath = rawPath.replace(/^\/api\/bot-ssr\??/, '').replace(/^\/api\/bot-ssr/, '') || req.url;
    
    // Parse route and identifier
    // Matches /d/:slug, /c/:slug, /l/:slug, /verify/invoice/:id
    const doctorMatch = cleanPath.match(/\/d\/([a-zA-Z0-9_-]+)/);
    const clinicMatch = cleanPath.match(/\/c\/([a-zA-Z0-9_-]+)/);
    const labMatch = cleanPath.match(/\/l\/([a-zA-Z0-9_-]+)/);
    const invoiceMatch = cleanPath.match(/\/verify\/invoice\/([a-zA-Z0-9_-]+)/);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');

    // 1. DOCTOR PROFILE ROUTE (/d/:slug)
    if (doctorMatch) {
        const slug = doctorMatch[1];
        const result = await fetchJson(`${BACKEND_API}/api/public/seo/doctor/${slug}`);
        
        if (!result.ok || !result.data?.success || !result.data?.doctor) {
            return res.status(404).send(renderHtml({
                title: 'Doctor Profile Not Found (404) | Appointory',
                description: 'The requested doctor profile does not exist or has not consented to public directory listing under India’s DPDP Act 2023.',
                canonicalUrl: `${SITE_URL}/d/${slug}`,
                is404: true,
                bodyHtml: `
                    <h1>404 – Doctor Profile Not Found</h1>
                    <p>This profile is not publicly available or has been restricted in compliance with India's Digital Personal Data Protection (DPDP) Act 2023.</p>
                    <a href="${SITE_URL}" class="cta-btn">Back to Appointory Home</a>
                `
            }));
        }

        const doc = result.data.doctor;
        const clinic = result.data.clinic || {};
        const title = `Dr. ${doc.name} – ${doc.specialization} at ${clinic.name || 'Clinic'} | Appointory`;
        const description = `Book consultation and track live OPD token with Dr. ${doc.name} (${doc.specialization}) at ${clinic.name || 'Clinic'}. Experience zero waiting room delay with Appointory.`;
        const canonicalUrl = `${SITE_URL}/d/${doc.slug || slug}`;

        const bodyHtml = `
            <span class="badge">Verified Medical Practitioner</span>
            <h1>Dr. ${escapeHtml(doc.name)}</h1>
            <p><strong>Specialization:</strong> ${escapeHtml(doc.specialization)} | <strong>Experience:</strong> ${escapeHtml(doc.experience || 5)}+ Years</p>
            <p><strong>Clinic:</strong> ${escapeHtml(clinic.name || 'Private OPD')} | <strong>Consultation Fee:</strong> ₹${escapeHtml(doc.consultationFee || 500)}</p>
            ${doc.bio ? `<p>${escapeHtml(doc.bio)}</p>` : ''}
            
            <h2>OPD Queue & Appointments</h2>
            <p>Appointory enables real-time queue token tracking and automated WhatsApp notifications for appointments with Dr. ${escapeHtml(doc.name)}.</p>
            <a href="${canonicalUrl}" class="cta-btn">Check Live Queue & Book Appointment</a>

            <h2>Frequently Asked Questions</h2>
            <div class="faq">
                <h3>What is Dr. ${escapeHtml(doc.name)}'s consultation fee?</h3>
                <p>The consultation fee is ₹${escapeHtml(doc.consultationFee || 500)} per visit.</p>
            </div>
            <div class="faq">
                <h3>How do I avoid waiting at the clinic?</h3>
                <p>Appointory provides live token display on your phone, alerting you when 2 patients remain before your turn.</p>
            </div>
        `;

        return res.status(200).send(renderHtml({
            title,
            description,
            canonicalUrl,
            ogImage: doc.profileImage || `${SITE_URL}/og-image.png`,
            ogType: 'profile',
            jsonLd: result.data.jsonLd || null,
            bodyHtml
        }));
    }

    // 2. CLINIC PROFILE ROUTE (/c/:slug)
    if (clinicMatch) {
        const slug = clinicMatch[1];
        const result = await fetchJson(`${BACKEND_API}/api/public/seo/clinic/${slug}`);

        if (!result.ok || !result.data?.success || !result.data?.clinic) {
            return res.status(404).send(renderHtml({
                title: 'Clinic Profile Not Found (404) | Appointory',
                description: 'The requested clinic profile does not exist or has not consented to public directory listing under DPDP Act 2023.',
                canonicalUrl: `${SITE_URL}/c/${slug}`,
                is404: true,
                bodyHtml: `
                    <h1>404 – Clinic Profile Not Found</h1>
                    <p>This clinic is either private or has not opted into public listing under India's DPDP Act 2023.</p>
                    <a href="${SITE_URL}" class="cta-btn">Back to Appointory Home</a>
                `
            }));
        }

        const clinic = result.data.clinic;
        const title = `${clinic.name} – OPD Queue, Appointments & GST Billing | Appointory`;
        const description = `Live token tracking, digital appointments, and itemized 0% GST healthcare billing at ${clinic.name}. Track queue position from home with Appointory.`;
        const canonicalUrl = `${SITE_URL}/c/${clinic.slug || slug}`;

        const bodyHtml = `
            <span class="badge">Appointory Enabled Healthcare Clinic</span>
            <h1>${escapeHtml(clinic.name)}</h1>
            <p><strong>Address:</strong> ${escapeHtml(clinic.address || 'India')}</p>
            <p><strong>Consultation Fee:</strong> ₹${escapeHtml(clinic.feeConsult || 500)}</p>
            <p>${escapeHtml(clinic.bio || 'Modern outpatient clinic offering zero-wait OPD queue management and digital prescriptions.')}</p>

            <h2>Live OPD Queue Status</h2>
            <p>Track your token position remotely from your smartphone or check in via receptionist QR at the desk.</p>
            <a href="${canonicalUrl}" class="cta-btn">View Live Queue & Book Token</a>

            <h2>Billing & Statutory Compliance</h2>
            <p>All invoices issued by ${escapeHtml(clinic.name)} are itemized with doctor registration details and 0% GST healthcare exemption under SAC 999312.</p>
        `;

        return res.status(200).send(renderHtml({
            title,
            description,
            canonicalUrl,
            ogImage: clinic.logo || `${SITE_URL}/og-image.png`,
            jsonLd: result.data.jsonLd || null,
            bodyHtml
        }));
    }

    // 3. LAB PROFILE ROUTE (/l/:slug)
    if (labMatch) {
        const slug = labMatch[1];
        const result = await fetchJson(`${BACKEND_API}/api/public/seo/lab/${slug}`);

        if (!result.ok || !result.data?.success || !result.data?.lab) {
            return res.status(404).send(renderHtml({
                title: 'Diagnostic Lab Not Found (404) | Appointory',
                description: 'The requested pathology lab profile does not exist or has not consented to public directory listing under DPDP Act 2023.',
                canonicalUrl: `${SITE_URL}/l/${slug}`,
                is404: true,
                bodyHtml: `
                    <h1>404 – Diagnostic Lab Not Found</h1>
                    <p>This lab profile does not exist or has not opted into public listing under India's DPDP Act 2023.</p>
                    <a href="${SITE_URL}" class="cta-btn">Back to Appointory Home</a>
                `
            }));
        }

        const lab = result.data.lab;
        const title = `${lab.labName} – Diagnostic Pathology & Handshake Network | Appointory`;
        const description = `Direct digital lab referral, zero-error test handshakes, and tamper-proof PDF reports at ${lab.labName}. Partnered with top clinics on Appointory.`;
        const canonicalUrl = `${SITE_URL}/l/${lab.slug || slug}`;

        const bodyHtml = `
            <span class="badge">Connected Diagnostic Network</span>
            <h1>${escapeHtml(lab.labName)}</h1>
            <p><strong>Code:</strong> ${escapeHtml(lab.labCode)} | <strong>Accreditation:</strong> ${escapeHtml(lab.accreditation || 'Quality Assured')}</p>
            <p><strong>Phone:</strong> ${escapeHtml(lab.phone || 'N/A')}</p>
            
            <h2>Direct Clinical Handshake</h2>
            <p>Clinics refer tests directly to ${escapeHtml(lab.labName)} using 6-digit handshake codes. Completed reports sync instantly to doctor cabins and patient health lockers.</p>
            <a href="${canonicalUrl}" class="cta-btn">View Lab Profile</a>
        `;

        return res.status(200).send(renderHtml({
            title,
            description,
            canonicalUrl,
            ogImage: lab.logo || `${SITE_URL}/og-image.png`,
            jsonLd: result.data.jsonLd || null,
            bodyHtml
        }));
    }

    // 4. VERIFY INVOICE ROUTE (/verify/invoice/:id)
    if (invoiceMatch) {
        const id = invoiceMatch[1];
        const result = await fetchJson(`${BACKEND_API}/api/public/verify/invoice/${id}`);

        if (!result.ok || !result.data?.success || !result.data?.verified) {
            return res.status(404).send(renderHtml({
                title: 'Invoice Verification Failed (404) | Appointory',
                description: 'The queried invoice could not be verified in the Appointory official registry. Please check the QR code or link.',
                canonicalUrl: `${SITE_URL}/verify/invoice/${id}`,
                is404: true,
                bodyHtml: `
                    <h1>404 – Medical Invoice Not Found</h1>
                    <p>This invoice ID was not found in the official tamper-proof Appointory clinical registry.</p>
                    <a href="${SITE_URL}" class="cta-btn">Return to Appointory Home</a>
                `
            }));
        }

        const inv = result.data.invoice;
        const title = `Verified Medical Invoice #${inv.invoiceNumber || id} | Appointory Official Registry`;
        const description = `Officially verified medical invoice issued by ${inv.clinicName || 'Clinic'}. 0% GST healthcare exemption compliant with tamper-proof QR audit trail.`;
        const canonicalUrl = `${SITE_URL}/verify/invoice/${id}`;

        const bodyHtml = `
            <span class="badge">Official Anti-Fraud Verification</span>
            <h1>Verified Medical Invoice</h1>
            <p><strong>Invoice Number:</strong> ${escapeHtml(inv.invoiceNumber || id)}</p>
            <p><strong>Facility:</strong> ${escapeHtml(inv.clinicName || 'Registered Healthcare Facility')}</p>
            <p><strong>Status:</strong> Legitimate Medical Bill (0% GST Healthcare Exemption under Entry 74 Notification 12/2017)</p>
            <a href="${canonicalUrl}" class="cta-btn">View Full Digital Verification</a>
        `;

        return res.status(200).send(renderHtml({
            title,
            description,
            canonicalUrl,
            ogImage: `${SITE_URL}/og-image.png`,
            bodyHtml
        }));
    }

    // Default fallback to 404 for unknown dynamic paths
    return res.status(404).send(renderHtml({
        title: 'Page Not Found (404) | Appointory',
        description: 'The requested page was not found on Appointory.',
        canonicalUrl: `${SITE_URL}${cleanPath}`,
        is404: true,
        bodyHtml: `
            <h1>404 – Page Not Found</h1>
            <p>The page you are looking for does not exist on Appointory.</p>
            <a href="${SITE_URL}" class="cta-btn">Back to Appointory Home</a>
        `
    }));
}
