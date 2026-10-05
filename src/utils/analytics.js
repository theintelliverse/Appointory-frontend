// frontend/src/utils/analytics.js
/**
 * Analytics Utility for Appointory.in
 * Handles sanitized GA4 tracking, SPA virtual page views, bot protection, and custom key conversion events.
 * Strips PII (phone, email, IDs) and marketing click IDs (fbclid) from analytics payloads.
 * Protects patient health privacy by never sending patient user_ids to GA4.
 */

const SENSITIVE_PARAMS = [
  'id',
  'token',
  'phone',
  'email',
  'patientId',
  'queueId',
  'appointmentId',
  'fbclid'
  // Note: gclid and utm_id are intentionally preserved for Google Ads attribution
];

// Targeted bot regex: specifically identifies search crawlers and headless environments
// Excludes 'Cubot' mobile phone user agents
const BOT_REGEX = /(googlebot|bingbot|yandexbot|duckduckbot|slurp|baiduspider|crawler|spider|headlesschrome|lighthouse)/i;

/**
 * Checks for automated headless browsers, scrapers, and webdriver instances
 * to prevent bot inflation in GA4 metrics without false-flagging real mobile phones.
 */
export const isBot = () => {
  if (typeof navigator === 'undefined') return false;
  if (navigator.webdriver) return true;
  const ua = navigator.userAgent || '';
  return BOT_REGEX.test(ua);
};

/**
 * Strips sensitive query parameters and URL fragments to protect patient privacy
 * and prevent GA4 report row fragmentation.
 */
export const cleanUrl = (href) => {
  try {
    const url = new URL(href, window.location.origin);
    SENSITIVE_PARAMS.forEach((param) => url.searchParams.delete(param));
    return url.pathname + (url.search ? url.search : '');
  } catch {
    return window.location.pathname;
  }
};

/**
 * Fires a custom GA4 event if gtag is available and visitor is human.
 */
export const trackEvent = (eventName, params = {}) => {
  if (isBot()) return;
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
};

/**
 * Tracks SPA virtual page views with a small delay so React components
 * and document.title updates settle before firing.
 */
let pageViewTimeout = null;

export const trackPageView = () => {
  if (isBot()) return;
  if (typeof window.gtag !== 'function') return;

  if (pageViewTimeout) {
    clearTimeout(pageViewTimeout);
  }

  pageViewTimeout = setTimeout(() => {
    const sanitizedPath = cleanUrl(window.location.href);
    window.gtag('event', 'page_view', {
      page_title: document.title || 'Appointory',
      page_location: window.location.origin + sanitizedPath,
      page_path: sanitizedPath
    });
  }, 150);
};

/**
 * Sets authenticated staff identity and dimensions.
 * PRIVACY GUARD: Patients are NEVER assigned a persistent user_id in GA4
 * to protect health data confidentiality under DPDP Act 2023.
 */
export const setAnalyticsUser = (user) => {
  if (isBot() || typeof window.gtag !== 'function' || !user?._id) return;

  // Only assign user_id for clinic/admin/doctor/staff roles
  if (user.role && user.role !== 'patient') {
    window.gtag('set', { user_id: user._id });
    window.gtag('set', 'user_properties', {
      user_role: user.role,
      clinic_id: user.clinicId || 'none'
    });
  }
};

/**
 * Resets user identity and dimensions on logout to prevent cross-user contamination
 * on shared clinic reception terminals.
 */
export const resetAnalyticsUser = () => {
  if (typeof window.gtag !== 'function') return;

  window.gtag('set', { user_id: null });
  window.gtag('set', 'user_properties', {
    user_role: null,
    clinic_id: null
  });
};

/**
 * Captures Core Web Vitals (CLS, INP, LCP, FCP, TTFB) and reports them to GA4.
 */
export const reportWebVitals = () => {
  if (isBot()) return;

  import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
    const sendMetricToGtag = (metric) => {
      if (typeof window.gtag === 'function') {
        window.gtag('event', metric.name, {
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          metric_id: metric.id,
          metric_value: metric.value,
          metric_delta: metric.delta,
          non_interaction: true
        });
      }
    };

    onCLS(sendMetricToGtag);
    onINP(sendMetricToGtag);
    onLCP(sendMetricToGtag);
    onFCP(sendMetricToGtag);
    onTTFB(sendMetricToGtag);
  }).catch((err) => {
    console.debug('Web vitals tracking not initialized:', err);
  });
};

