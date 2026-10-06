import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
    title,
    description,
    url = '',
    keywords,
    image,
    schemaMarkup,
    noindex = false,
    ogType = 'website',
    author = 'Appointory Healthcare Systems',
    publishedTime,
    modifiedTime
}) => {
    const brandName = import.meta.env.VITE_BRAND_NAME || 'Appointory';
    const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://appointory.in').replace(/\/$/, '');

    // Title: Aim for 50-60 characters with primary keyword near the start
    const cleanTitle = title ? `${title} | ${brandName}` : `${brandName} – Care without the Waiting Room | Clinic OPD Queue & Billing`;
    
    // Description: Aim for 140-160 characters for Google, concise for WhatsApp previews
    const defaultDescription = 'Appointory is India’s modern clinic operating system: zero-wait OPD token display, WhatsApp live queue alerts, 0% GST billing, and synchronized lab networks.';
    const cleanDescription = description || defaultDescription;

    const defaultKeywords = 'clinic management software India, OPD queue management system, token system for clinic, online doctor appointment booking software, clinic appointment software India, patient queue management app, clinic billing software GST, digital prescription software, waiting room TV token display, WhatsApp token alert for clinic, pathology lab management software, lab referral software for clinics, free clinic software India, clinic software for small clinics, clinic software Gujarat, Ahmedabad, Surat, Vadodara, Rajkot, SAC 999312, SAC 999316';
    const cleanKeywords = keywords || defaultKeywords;

    // Canonical & alternate URLs
    const path = url.startsWith('/') ? url : `/${url}`;
    const canonicalUrl = `${siteUrl}${path === '/' ? '' : path}`;

    // Social Sharing Image (1200x630, PNG, <300KB safe for WhatsApp)
    const resolvedImage = image
        ? (image.startsWith('http') ? image : `${siteUrl}${image.startsWith('/') ? image : `/${image}`}`)
        : `${siteUrl}/og-image.png`;

    return (
        <Helmet>
            <html lang="en" />
            <title>{cleanTitle}</title>
            <meta name="description" content={cleanDescription} />
            <meta name="keywords" content={cleanKeywords} />
            <meta name="author" content={author} />
            <link rel="canonical" href={canonicalUrl} />

            {/* hreflang for multilingual India & international default */}
            <link rel="alternate" hrefLang="en-IN" href={canonicalUrl} />
            <link rel="alternate" hrefLang="hi-IN" href={canonicalUrl} />
            <link rel="alternate" hrefLang="gu-IN" href={canonicalUrl} />
            <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

            {/* Robots Directives */}
            {noindex ? (
                <>
                    <meta name="robots" content="noindex, nofollow, noarchive" />
                    <meta name="googlebot" content="noindex, nofollow, noarchive" />
                    <meta name="bingbot" content="noindex, nofollow, noarchive" />
                </>
            ) : (
                <>
                    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
                    <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large" />
                    <meta name="bingbot" content="index, follow" />
                </>
            )}

            {/* Geo & Brand Meta */}
            <meta name="geo.region" content="IN" />
            <meta name="geo.placename" content="India" />
            <meta name="ICBM" content="20.5937, 78.9629" />
            <meta name="theme-color" content="#0d9488" />
            <meta name="application-name" content={brandName} />
            <meta name="apple-mobile-web-app-title" content={brandName} />
            <meta name="format-detection" content="telephone=no" />

            {/* Open Graph (WhatsApp, Facebook, LinkedIn, Instagram) */}
            <meta property="og:type" content={ogType} />
            <meta property="og:site_name" content={brandName} />
            <meta property="og:title" content={cleanTitle} />
            <meta property="og:description" content={cleanDescription} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={resolvedImage} />
            <meta property="og:image:secure_url" content={resolvedImage} />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content="Appointory - Care without the Waiting Room" />
            <meta property="og:locale" content="en_IN" />
            {publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

            {/* Twitter / X */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@appointory" />
            <meta name="twitter:creator" content="@appointory" />
            <meta name="twitter:title" content={cleanTitle} />
            <meta name="twitter:description" content={cleanDescription} />
            <meta name="twitter:image" content={resolvedImage} />
            <meta name="twitter:image:alt" content="Appointory - Care without the Waiting Room" />

            {/* Schema.org JSON-LD */}
            {schemaMarkup && (
                Array.isArray(schemaMarkup) ? (
                    schemaMarkup.map((schema, index) => (
                        <script key={index} type="application/ld+json">
                            {JSON.stringify(schema)}
                        </script>
                    ))
                ) : (
                    <script type="application/ld+json">
                        {JSON.stringify(schemaMarkup)}
                    </script>
                )
            )}
        </Helmet>
    );
};

export default SEO;
