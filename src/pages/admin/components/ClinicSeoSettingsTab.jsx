import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Globe,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  ExternalLink,
  Upload,
  Plus,
  Trash2,
  Smartphone,
  Monitor,
  Share2,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  HelpCircle,
  Save,
  Download,
  Info,
  Tag,
  Stethoscope
} from 'lucide-react';
import { API_URL } from '../../../config/runtime';

export default function ClinicSeoSettingsTab({ onConsentUpdated }) {
  const token = localStorage.getItem('token');
  const qrRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop'); // 'desktop' | 'mobile'

  // Server state
  const [serverState, setServerState] = useState(null);

  // Form State
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [about, setAbout] = useState('');
  const [services, setServices] = useState([]);
  const [serviceInput, setServiceInput] = useState('');
  const [faqs, setFaqs] = useState([]);
  const [ogImageUrl, setOgImageUrl] = useState('');
  const [googleBusinessUrl, setGoogleBusinessUrl] = useState('');
  const [noindex, setNoindex] = useState(false);
  const [slug, setSlug] = useState('');
  const [city, setCity] = useState('');
  const [publicConsent, setPublicConsent] = useState(false);

  // Copy feedback
  const [copiedLink, setCopiedLink] = useState(null);

  // Initial Snapshot for dirty-checking
  const [initialSnapshot, setInitialSnapshot] = useState('');

  // Fetch SEO configuration from backend
  const fetchSeoSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/clinic/seo`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const d = res.data.data;
        setServerState(d);
        const seo = d.seo || {};
        const eff = d.effectiveSeo || {};

        setMetaTitle(seo.metaTitle || '');
        setMetaDescription(seo.metaDescription || '');
        setFocusKeyword(seo.focusKeyword || '');
        setKeywords(seo.keywords && seo.keywords.length > 0 ? seo.keywords : eff.keywords || []);
        setAbout(seo.about || d.bio || '');
        setServices(seo.services && seo.services.length > 0 ? seo.services : eff.services || []);
        setFaqs(seo.faqs && seo.faqs.length > 0 ? seo.faqs : []);
        setOgImageUrl(seo.ogImageUrl || '');
        setGoogleBusinessUrl(seo.googleBusinessUrl || '');
        const serverSlug = (d.slug || '').trim();
        const safeSlug = (serverSlug && serverSlug !== 'clinic')
          ? serverSlug
          : (d.name ? `${d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}${d.clinicCode ? `-${d.clinicCode.toLowerCase()}` : ''}` : (d.clinicCode ? d.clinicCode.toLowerCase() : ''));
        setSlug(safeSlug);
        setCity(d.city || '');
        setPublicConsent(Boolean(d.publicConsent));

        const snapshot = JSON.stringify({
          metaTitle: seo.metaTitle || '',
          metaDescription: seo.metaDescription || '',
          focusKeyword: seo.focusKeyword || '',
          keywords: seo.keywords || [],
          about: seo.about || d.bio || '',
          services: seo.services || [],
          faqs: seo.faqs || [],
          ogImageUrl: seo.ogImageUrl || '',
          googleBusinessUrl: seo.googleBusinessUrl || '',
          noindex: Boolean(seo.noindex),
          city: d.city || ''
        });
        setInitialSnapshot(snapshot);
      }
    } catch (err) {
      console.error('Failed to load clinic SEO settings:', err);
      Swal.fire('Error', err.response?.data?.message || 'Could not fetch SEO settings.', 'error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSeoSettings();
  }, [fetchSeoSettings]);

  // Compute Current Snapshot
  const currentSnapshot = useMemo(() => {
    return JSON.stringify({
      metaTitle,
      metaDescription,
      focusKeyword,
      keywords,
      about,
      services,
      faqs,
      ogImageUrl,
      googleBusinessUrl,
      noindex,
      city
    });
  }, [metaTitle, metaDescription, focusKeyword, keywords, about, services, faqs, ogImageUrl, googleBusinessUrl, noindex, city]);

  const isDirty = useMemo(() => {
    return initialSnapshot !== currentSnapshot;
  }, [initialSnapshot, currentSnapshot]);

  // Derived Effective Values for Live Preview
  const displayTitle = useMemo(() => {
    if (metaTitle.trim()) return metaTitle.trim();
    const cName = serverState?.name || 'Clinic';
    const cCity = city.trim() || serverState?.city || 'India';
    return `${cName} – ${cCity} | Book Appointment Online`.slice(0, 70);
  }, [metaTitle, serverState, city]);

  const displayDescription = useMemo(() => {
    if (metaDescription.trim()) return metaDescription.trim();
    const cName = serverState?.name || 'Clinic';
    const cCity = city.trim() || serverState?.city || 'India';
    const topServices = services.slice(0, 3).join(', ');
    return `${cName} in ${cCity}.${topServices ? ` Top services: ${topServices}.` : ''} Live token queue, no waiting room.`.slice(0, 170);
  }, [metaDescription, serverState, city, services]);

  const clinicId = serverState?.clinicId || '';
  const clinicCode = (serverState?.clinicCode || '').toLowerCase();

  const currentSlug = useMemo(() => {
    const s = (slug || serverState?.slug || '').trim();
    if (s && s !== 'clinic') return s;
    if (serverState?.name) {
      const namePart = serverState.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      if (namePart && namePart !== 'clinic') {
        return clinicCode ? `${namePart}-${clinicCode}` : namePart;
      }
    }
    if (clinicCode) return clinicCode;
    return s || (clinicId ? String(clinicId) : 'clinic');
  }, [slug, serverState, clinicCode, clinicId]);

  const siteDomain = typeof window !== 'undefined' ? window.location.origin : 'https://appointory.in';
  const publicPageUrl = `${siteDomain}/c/${currentSlug}`;

  // 🎯 Direct 1-Click Booking URL: Opens public /book with clinic pre-selected for instant booking!
  const bookingPageUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (clinicId) params.set('clinicId', clinicId);
    if (currentSlug && currentSlug !== 'clinic') {
      params.set('clinic', currentSlug);
    } else if (clinicCode) {
      params.set('clinic', clinicCode);
    }
    params.set('utm_source', 'qr');
    return `${siteDomain}/book?${params.toString()}`;
  }, [siteDomain, clinicId, currentSlug, clinicCode]);

  // -------------------------------------------------------------
  // 🔍 SEO SCORE EVALUATION ENGINE (0 to 100)
  // -------------------------------------------------------------
  const seoAudit = useMemo(() => {
    const checks = [];
    const fk = focusKeyword.trim().toLowerCase();
    const tLower = displayTitle.toLowerCase();
    const dLower = displayDescription.toLowerCase();
    const aLower = about.toLowerCase();
    const first100WordsAbout = aLower.split(/\s+/).slice(0, 100).join(' ');

    // 1. Focus keyword present in title (10 pts)
    const inTitle = fk ? tLower.includes(fk) : false;
    checks.push({
      id: 'fk_title',
      label: 'Focus keyword in Meta Title',
      pass: inTitle,
      points: 10,
      hint: fk ? `Add "${focusKeyword}" into the meta title` : 'Define a focus keyword first'
    });

    // 2. Focus keyword in meta description (10 pts)
    const inDesc = fk ? dLower.includes(fk) : false;
    checks.push({
      id: 'fk_desc',
      label: 'Focus keyword in Meta Description',
      pass: inDesc,
      points: 10,
      hint: fk ? `Include "${focusKeyword}" in your meta description` : 'Define a focus keyword first'
    });

    // 3. Focus keyword in about text first 100 words (10 pts)
    const inAbout = fk ? first100WordsAbout.includes(fk) : false;
    checks.push({
      id: 'fk_about',
      label: 'Focus keyword in first 100 words of About text',
      pass: inAbout,
      points: 10,
      hint: fk ? `Use "${focusKeyword}" within the first paragraph of about text` : 'Define a focus keyword first'
    });

    // 4. Focus keyword in at least one service or FAQ (10 pts)
    const inServiceOrFaq = fk ? (
      services.some(s => s.toLowerCase().includes(fk)) ||
      faqs.some(f => (f.q && f.q.toLowerCase().includes(fk)) || (f.a && f.a.toLowerCase().includes(fk)))
    ) : false;
    checks.push({
      id: 'fk_services_faq',
      label: 'Focus keyword in a Service or FAQ',
      pass: inServiceOrFaq,
      points: 10,
      hint: `Mention your focus keyword in at least one clinical service or FAQ`
    });

    // 5. Title length 40-70 characters (10 pts)
    const tLen = displayTitle.length;
    const titleLenPass = tLen >= 40 && tLen <= 70;
    checks.push({
      id: 'title_length',
      label: `Meta Title length between 40–70 chars (current: ${tLen})`,
      pass: titleLenPass,
      points: 10,
      hint: tLen < 40 ? 'Expand title to at least 40 characters' : 'Shorten title under 70 characters'
    });

    // 6. Description length 110-170 characters (10 pts)
    const dLen = displayDescription.length;
    const descLenPass = dLen >= 110 && dLen <= 170;
    checks.push({
      id: 'desc_length',
      label: `Meta Description length 110–170 chars (current: ${dLen})`,
      pass: descLenPass,
      points: 10,
      hint: dLen < 110 ? 'Write more detail to reach at least 110 characters' : 'Keep description under 170 characters'
    });

    // 7. ≥ 3 services listed (10 pts)
    const hasServices = services.length >= 3;
    checks.push({
      id: 'services_count',
      label: `At least 3 clinical services specified (current: ${services.length})`,
      pass: hasServices,
      points: 10,
      hint: 'Add at least 3 clinical services or specialties'
    });

    // 8. ≥ 2 FAQs added (10 pts)
    const validFaqsCount = faqs.filter(f => f.q?.trim() && f.a?.trim()).length;
    const hasFaqs = validFaqsCount >= 2;
    checks.push({
      id: 'faqs_count',
      label: `At least 2 FAQs configured (current: ${validFaqsCount})`,
      pass: hasFaqs,
      points: 10,
      hint: 'Add at least 2 questions & answers for voice search / AEO snippets'
    });

    // 9. About clinic ≥ 80 words (10 pts)
    const wordCount = about.trim() ? about.trim().split(/\s+/).length : 0;
    const aboutPass = wordCount >= 80;
    checks.push({
      id: 'about_words',
      label: `About description ≥ 80 words (current: ${wordCount})`,
      pass: aboutPass,
      points: 10,
      hint: `Add ${Math.max(0, 80 - wordCount)} more words describing your clinic facilities and doctors`
    });

    // 10. Core Contact Details (City, Address, Phone, Hours) (5 pts)
    const hasCity = Boolean(city.trim() || serverState?.city);
    const hasAddress = Boolean(serverState?.address);
    const hasPhone = Boolean(serverState?.contactPhone);
    const hasHours = Boolean(serverState?.openingTime && serverState?.closingTime);
    const coreDetailsPass = hasCity && hasAddress && hasPhone && hasHours;
    checks.push({
      id: 'core_details',
      label: 'Clinic address, verified phone, city & operating hours filled',
      pass: coreDetailsPass,
      points: 5,
      hint: 'Ensure city, address, phone number, and hours are filled in Clinic Profile'
    });

    // 11. OG image set (2.5 pts) & Google Business URL set (2.5 pts)
    const hasOg = Boolean(ogImageUrl.trim());
    checks.push({
      id: 'og_image',
      label: 'Open Graph (OG) social share banner image set',
      pass: hasOg,
      points: 2.5,
      hint: 'Upload an image or paste a banner URL for WhatsApp & Google cards'
    });

    const hasGbp = Boolean(googleBusinessUrl.trim());
    checks.push({
      id: 'gbp_url',
      label: 'Google Business Profile link verified',
      pass: hasGbp,
      points: 2.5,
      hint: 'Link your Google Maps / Business Profile URL for local SEO citation'
    });

    const totalScore = Math.round(checks.reduce((acc, c) => acc + (c.pass ? c.points : 0), 0));
    return { checks, totalScore };
  }, [focusKeyword, displayTitle, displayDescription, about, services, faqs, city, serverState, ogImageUrl, googleBusinessUrl]);

  // Handlers for Chip Inputs
  const handleAddKeyword = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = keywordInput.trim().replace(/^,+|,+$/g, '').toLowerCase();
      if (val && !keywords.includes(val) && keywords.length < 15) {
        setKeywords([...keywords, val]);
        setKeywordInput('');
      }
    }
  };

  const handleRemoveKeyword = (index) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleAddService = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = serviceInput.trim().replace(/^,+|,+$/g, '');
      if (val && !services.includes(val) && services.length < 25) {
        setServices([...services, val]);
        setServiceInput('');
      }
    }
  };

  const handleRemoveService = (index) => {
    setServices(services.filter((_, i) => i !== index));
  };

  // Handlers for FAQs
  const handleAddFaq = () => {
    if (faqs.length < 8) {
      setFaqs([...faqs, { q: '', a: '' }]);
    }
  };

  const handleUpdateFaq = (index, field, value) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  const handleRemoveFaq = (index) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  // OG Image Upload
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire('Invalid File', 'Please select a valid image file (PNG, JPG, WebP).', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    try {
      const res = await axios.post(`${API_URL}/api/clinic/upload-og-image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success && res.data.url) {
        setOgImageUrl(res.data.url);
        Swal.fire({
          icon: 'success',
          title: 'Image Uploaded',
          text: 'Social banner uploaded successfully to Cloudinary.',
          timer: 1800,
          showConfirmButton: false
        });
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      Swal.fire('Upload Failed', err.response?.data?.message || 'Could not upload image.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Copy helper
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(key);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // QR Download
  const handleDownloadQr = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = image;
    a.download = `Appointory_Booking_QR_${currentSlug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Save Settings
  const handleSave = async (e) => {
    if (e) e.preventDefault();

    if (!publicConsent && !noindex) {
      Swal.fire({
        icon: 'warning',
        title: 'Consent Required',
        text: 'Public listing consent under DPDP Act 2023 is required before enabling Google indexation.',
        confirmButtonColor: '#0F766E'
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        metaTitle: metaTitle.trim(),
        metaDescription: metaDescription.trim(),
        focusKeyword: focusKeyword.trim(),
        keywords,
        about: about.trim(),
        services,
        faqs: faqs.filter(f => f.q.trim() && f.a.trim()),
        ogImageUrl: ogImageUrl.trim(),
        googleBusinessUrl: googleBusinessUrl.trim(),
        noindex: Boolean(noindex),
        city: city.trim(),
        slug: slug.trim().toLowerCase(),
        confirmSlugChange: true,
        publicListingConsent: publicConsent
      };

      const res = await axios.put(`${API_URL}/api/clinic/seo`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setInitialSnapshot(currentSnapshot);
        Swal.fire({
          icon: 'success',
          title: 'SEO Published!',
          text: 'Changes are live and search engine cache has been updated.',
          confirmButtonColor: '#0F766E',
          timer: 2000
        });
      }
    } catch (err) {
      console.error('Failed to save SEO settings:', err);
      Swal.fire('Save Failed', err.response?.data?.message || 'Error updating SEO settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-khaki uppercase tracking-widest">Loading SEO & Google Listing configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* ------------------------------------------------------------- */}
      {/* 1. PUBLIC LISTING CONSENT BANNER & TOGGLE */}
      {/* ------------------------------------------------------------- */}
      <div className={`p-6 md:p-8 rounded-3xl border transition-all ${publicConsent ? 'bg-emerald-50/60 border-emerald-200' : 'bg-amber-50/80 border-amber-200'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl shrink-0 ${publicConsent ? 'bg-emerald-600 text-white shadow-md' : 'bg-amber-500 text-white shadow-md'}`}>
              {publicConsent ? <ShieldCheck size={26} /> : <ShieldAlert size={26} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-teak">
                  Public Google Listing Status: {publicConsent ? 'ACTIVE & CONSENTED' : 'PRIVATE (CONSENT REQUIRED)'}
                </h3>
              </div>
              <p className="text-xs md:text-sm text-teak/80 mt-1 max-w-2xl leading-relaxed">
                {publicConsent
                  ? "Your facility is authorized for public indexation under India’s Digital Personal Data Protection (DPDP) Act 2023. Google, ChatGPT, and patient searches can index your clinic."
                  : "Under India’s DPDP Act 2023, public listing and Google indexation require explicit written consent from the clinic administration. Enable consent below to unlock all SEO features."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-black uppercase tracking-wider text-teak">
              {publicConsent ? 'Consented' : 'Consent Inactive'}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={publicConsent}
                onChange={async (e) => {
                  const newConsent = e.target.checked;
                  try {
                    // Update clinic settings
                    await axios.patch(`${API_URL}/api/clinic/settings`, { publicListingConsent: newConsent }, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    setPublicConsent(newConsent);
                    if (onConsentUpdated) onConsentUpdated(newConsent);
                    Swal.fire({
                      icon: newConsent ? 'success' : 'info',
                      title: newConsent ? 'Consent Granted' : 'Consent Revoked',
                      text: newConsent ? 'Public Google listing is now authorized.' : 'Clinic is now private and hidden from Google.',
                      timer: 1800,
                      showConfirmButton: false
                    });
                  } catch (err) {
                    Swal.fire('Error', err.response?.data?.message || 'Could not update consent status.', 'error');
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-700"></div>
            </label>
            {isDirty && (
              <button
                type="button"
                disabled={saving || !publicConsent}
                onClick={handleSave}
                className="ml-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? 'Publishing...' : 'Publish'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Form Left, SEO Panel & Preview Right */}
      <div className={`grid lg:grid-cols-12 gap-8 ${!publicConsent ? 'opacity-50 pointer-events-none select-none' : ''}`}>
        
        {/* Left Column: Form Fields (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card: Core Meta Fields */}
          <div className="bg-white border border-sandstone rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="border-b border-sandstone/60 pb-4 flex items-center justify-between">
              <div>
                <h3 className="font-heading text-xl text-teak">Google Metadata & Keywords</h3>
                <p className="text-xs text-khaki font-medium mt-0.5">Control how your clinic displays on Google Search results</p>
              </div>
              <Globe size={20} className="text-teal-600" />
            </div>

            {/* Focus Keyword */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-khaki">Focus Keyword (Target Search Term)</label>
                <span className="text-xs font-mono text-khaki">{focusKeyword.length}/60</span>
              </div>
              <input
                type="text"
                maxLength={60}
                placeholder="e.g. dental clinic in Junagadh, ENT specialist Rajkot"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                className="w-full px-4 py-3 bg-parchment border border-sandstone rounded-2xl outline-none focus:border-teal-600 font-bold text-teak text-sm"
              />
              <p className="text-[11px] text-khaki leading-tight">The primary phrase patients in your city search on Google to find care.</p>
            </div>

            {/* Meta Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-khaki">Meta Title (SERP Heading)</label>
                <span className={`text-xs font-mono ${metaTitle.length >= 40 && metaTitle.length <= 70 ? 'text-teal-600 font-bold' : 'text-khaki'}`}>
                  {metaTitle.length}/70
                </span>
              </div>
              <input
                type="text"
                maxLength={70}
                placeholder={displayTitle}
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full px-4 py-3 bg-parchment border border-sandstone rounded-2xl outline-none focus:border-teal-600 font-bold text-teak text-sm"
              />
              <p className="text-[11px] text-khaki leading-tight">Recommended: 40–70 characters. Leave empty to auto-generate default format.</p>
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-khaki">Meta Description (SERP Snippet)</label>
                <span className={`text-xs font-mono ${metaDescription.length >= 110 && metaDescription.length <= 170 ? 'text-teal-600 font-bold' : 'text-khaki'}`}>
                  {metaDescription.length}/170
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={170}
                placeholder={displayDescription}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full px-4 py-3 bg-parchment border border-sandstone rounded-2xl outline-none focus:border-teal-600 font-medium text-teak text-sm resize-none"
              />
              <p className="text-[11px] text-khaki leading-tight">Recommended: 110–170 characters. Highlight your zero-waiting room advantage.</p>
            </div>

            {/* Keywords Chip Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-khaki">Keywords ({keywords.length}/15)</label>
                <span className="text-[11px] text-khaki">Press Enter or Comma to add</span>
              </div>
              <div className="p-3 bg-parchment border border-sandstone rounded-2xl flex flex-wrap gap-2 items-center min-h-[48px]">
                {keywords.map((kw, idx) => (
                  <span key={idx} className="bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
                    {kw}
                    <button type="button" onClick={() => handleRemoveKeyword(idx)} className="hover:text-rose-600 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
                {keywords.length < 15 && (
                  <input
                    type="text"
                    placeholder={keywords.length === 0 ? "Type keyword and press Enter..." : "Add more..."}
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleAddKeyword}
                    className="bg-transparent outline-none text-xs font-medium text-teak flex-grow min-w-[140px] px-2 py-1"
                  />
                )}
              </div>
            </div>

            {/* City Override */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-khaki">Clinic City (Directory Sorting)</label>
              <input
                type="text"
                placeholder="e.g. Junagadh, Rajkot, Ahmedabad"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 bg-parchment border border-sandstone rounded-2xl outline-none focus:border-teal-600 font-bold text-teak text-sm"
              />
            </div>
          </div>

          {/* Card: About & Services */}
          <div className="bg-white border border-sandstone rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="border-b border-sandstone/60 pb-4">
              <h3 className="font-heading text-xl text-teak">Clinic Content & Services</h3>
              <p className="text-xs text-khaki font-medium mt-0.5">Visible on the public profile and indexed by Google crawlers</p>
            </div>

            {/* About Clinic */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-khaki">About Clinic (Visible Narrative)</label>
                <span className="text-xs font-mono text-khaki">{about.length}/2000</span>
              </div>
              <textarea
                rows={5}
                maxLength={2000}
                placeholder="Describe your clinic, specialties, medical equipment, doctor qualifications, and hygiene standards..."
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full px-4 py-3 bg-parchment border border-sandstone rounded-2xl outline-none focus:border-teal-600 font-medium text-teak text-sm"
              />
              <p className="text-[11px] text-khaki leading-tight">Minimum 80 words recommended for high organic search rankings.</p>
            </div>

            {/* Services Chip Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-khaki">Clinical Services & Treatments ({services.length}/25)</label>
                <span className="text-[11px] text-khaki">Press Enter to add</span>
              </div>
              <div className="p-3 bg-parchment border border-sandstone rounded-2xl flex flex-wrap gap-2 items-center min-h-[48px]">
                {services.map((srv, idx) => (
                  <span key={idx} className="bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
                    {srv}
                    <button type="button" onClick={() => handleRemoveService(idx)} className="hover:text-rose-600 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
                {services.length < 25 && (
                  <input
                    type="text"
                    placeholder={services.length === 0 ? "Type service (e.g. Root Canal, ECG) and press Enter..." : "Add more..."}
                    value={serviceInput}
                    onChange={(e) => setServiceInput(e.target.value)}
                    onKeyDown={handleAddService}
                    className="bg-transparent outline-none text-xs font-medium text-teak flex-grow min-w-[160px] px-2 py-1"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Card: FAQs (AEO & Voice Search) */}
          <div className="bg-white border border-sandstone rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-sandstone/60 pb-4">
              <div>
                <h3 className="font-heading text-xl text-teak">Frequently Asked Questions (AEO)</h3>
                <p className="text-xs text-khaki font-medium mt-0.5">Power Google FAQ rich snippets & AI answers (max 8)</p>
              </div>
              {faqs.length < 8 && (
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Plus size={14} /> Add FAQ
                </button>
              )}
            </div>

            {faqs.length === 0 ? (
              <div className="text-center py-8 bg-parchment/60 rounded-2xl border border-dashed border-sandstone">
                <HelpCircle size={28} className="mx-auto text-khaki mb-2" />
                <p className="text-xs font-bold text-teak">No custom FAQs configured</p>
                <p className="text-[11px] text-khaki mt-1">Add FAQs like consultation timings, parking, or appointment policies.</p>
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-teal-700 transition-all inline-flex items-center gap-1"
                >
                  <Plus size={13} /> Add First FAQ
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="p-4 bg-parchment rounded-2xl border border-sandstone space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-khaki">Question #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                        title="Delete FAQ"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={200}
                      placeholder="e.g. Do I need an appointment for OPD consultation?"
                      value={faq.q}
                      onChange={(e) => handleUpdateFaq(idx, 'q', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-sandstone rounded-xl outline-none focus:border-teal-600 text-xs font-bold text-teak"
                    />
                    <textarea
                      rows={2}
                      maxLength={1000}
                      placeholder="e.g. Walk-ins are accepted, but online booking ensures zero queue waiting time."
                      value={faq.a}
                      onChange={(e) => handleUpdateFaq(idx, 'a', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-sandstone rounded-xl outline-none focus:border-teal-600 text-xs font-medium text-teak resize-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card: Social Image & Google Links */}
          <div className="bg-white border border-sandstone rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="border-b border-sandstone/60 pb-4">
              <h3 className="font-heading text-xl text-teak">Social Sharing & Local Presence</h3>
              <p className="text-xs text-khaki font-medium mt-0.5">Open Graph image and Google Business verification</p>
            </div>

            {/* OG Image Upload */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-khaki">Open Graph (OG) Preview Banner</label>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {ogImageUrl ? (
                  <div className="relative w-40 h-24 rounded-2xl overflow-hidden border border-sandstone shadow-sm shrink-0 bg-slate-100">
                    <img src={ogImageUrl} alt="OG Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setOgImageUrl('')}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 text-white rounded-lg"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="w-40 h-24 rounded-2xl border-2 border-dashed border-sandstone bg-parchment flex flex-col items-center justify-center text-khaki shrink-0">
                    <Upload size={18} />
                    <span className="text-[10px] font-bold mt-1">1200 x 630 px</span>
                  </div>
                )}

                <div className="flex-grow space-y-2">
                  <div className="flex gap-2">
                    <label className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-sm transition-all">
                      <Upload size={13} />
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        disabled={uploadingImage}
                        onChange={handleImageFileChange}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="Or paste direct Cloudinary / Image URL..."
                    value={ogImageUrl}
                    onChange={(e) => setOgImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-parchment border border-sandstone rounded-xl outline-none focus:border-teal-600 text-xs font-mono text-teak"
                  />
                  <p className="text-[10.5px] text-khaki">Appears when your clinic profile is shared on WhatsApp, Facebook, LinkedIn, or X.</p>
                </div>
              </div>
            </div>

            {/* Google Business Profile URL */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-khaki">Google Business Profile / Maps URL</label>
              <input
                type="url"
                placeholder="https://maps.google.com/... or https://g.page/..."
                value={googleBusinessUrl}
                onChange={(e) => setGoogleBusinessUrl(e.target.value)}
                className="w-full px-4 py-3 bg-parchment border border-sandstone rounded-2xl outline-none focus:border-teal-600 font-mono text-xs text-teak"
              />
              <p className="text-[11px] text-khaki">Validates your local Google listing and maps citation in JSON-LD schema.</p>
            </div>

            {/* Noindex Toggle */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-teak">Hide from Search Engines (noindex)</h4>
                <p className="text-[11px] text-khaki mt-0.5">Instructs Google not to index this clinic page in search results.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={noindex}
                  onChange={(e) => setNoindex(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Google Live Preview & SEO Score Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card: Google Search Live Preview */}
          <div className="bg-white border border-sandstone rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-sandstone/60 pb-3">
              <div className="flex items-center gap-2">
                <Search size={16} className="text-teal-600" />
                <h4 className="font-heading text-lg text-teak">Google SERP Preview</h4>
              </div>
              
              {/* Desktop / Mobile Switcher */}
              <div className="flex bg-parchment p-1 rounded-xl border border-sandstone">
                <button
                  type="button"
                  onClick={() => setPreviewMode('desktop')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${previewMode === 'desktop' ? 'bg-white text-teak shadow-sm' : 'text-khaki'}`}
                >
                  <Monitor size={12} /> Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${previewMode === 'mobile' ? 'bg-white text-teak shadow-sm' : 'text-khaki'}`}
                >
                  <Smartphone size={12} /> Mobile
                </button>
              </div>
            </div>

            {/* Google Result Box */}
            <div className={`p-4 rounded-2xl bg-white border border-slate-200 font-sans shadow-sm transition-all ${previewMode === 'mobile' ? 'max-w-[340px] mx-auto' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px] font-black shrink-0">
                  A
                </div>
                <div className="truncate">
                  <p className="text-[11px] text-slate-800 font-medium truncate">Appointory</p>
                  <p className="text-[10px] text-emerald-800 font-mono truncate">
                    https://appointory.in › c › {currentSlug}
                  </p>
                </div>
              </div>

              {/* Title */}
              <a
                href={publicPageUrl}
                target="_blank"
                rel="noreferrer"
                className="text-base text-[#1a0dab] hover:underline font-medium block leading-snug line-clamp-2 mt-1"
              >
                {displayTitle}
              </a>

              {/* Snippet */}
              <p className="text-xs text-[#4d5156] mt-1.5 leading-relaxed line-clamp-3">
                {displayDescription}
              </p>
            </div>
            
            <p className="text-[10.5px] text-khaki italic text-center">
              * Live approximation based on current field values.
            </p>
          </div>

          {/* Card: SEO Score Gauge & Checklist */}
          <div className="bg-white border border-sandstone rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-sandstone/60 pb-3">
              <div>
                <h4 className="font-heading text-lg text-teak">SEO Health Score</h4>
                <p className="text-[11px] text-khaki">Real-time indexation readiness</p>
              </div>

              {/* Score Badge */}
              <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black border shadow-sm ${
                seoAudit.totalScore >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                seoAudit.totalScore >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                <span className="text-xl leading-none">{seoAudit.totalScore}</span>
                <span className="text-[9px] uppercase tracking-wider">/ 100</span>
              </div>
            </div>

            {/* Score Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  seoAudit.totalScore >= 80 ? 'bg-emerald-500' :
                  seoAudit.totalScore >= 50 ? 'bg-amber-500' :
                  'bg-rose-500'
                }`}
                style={{ width: `${seoAudit.totalScore}%` }}
              ></div>
            </div>

            {/* Checklist */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {seoAudit.checks.map((check) => (
                <div
                  key={check.id}
                  className={`p-3 rounded-2xl border text-xs transition-all ${
                    check.pass
                      ? 'bg-emerald-50/40 border-emerald-100 text-slate-800'
                      : 'bg-rose-50/40 border-rose-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {check.pass ? (
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle size={15} className="text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-grow">
                      <p className={`font-bold ${check.pass ? 'text-emerald-900' : 'text-slate-800'}`}>
                        {check.label}
                      </p>
                      {!check.pass && (
                        <p className="text-[11px] text-rose-700 mt-0.5 font-medium flex items-center gap-1">
                          <AlertTriangle size={11} className="shrink-0" /> {check.hint}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-khaki shrink-0">
                      +{check.points}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Share & 1-Click Booking Links + QR Code */}
          <div className="bg-white border border-sandstone rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-sandstone/60 pb-3">
              <div className="flex items-center gap-2">
                <Share2 size={18} className="text-teal-600" />
                <h4 className="font-heading text-lg text-teak">Public Links &amp; 1-Click Booking</h4>
              </div>
              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                publicConsent 
                  ? 'bg-teal-50 text-teal-800 border-teal-200' 
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {publicConsent ? '● Live & Active' : '○ Private / Needs Consent'}
              </span>
            </div>

            {!publicConsent && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>⚠️ Public Directory Consent is inactive. Enable it so patients can access your public booking link.</span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await axios.patch(`${API_URL}/api/clinic/settings`, { publicListingConsent: true }, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      setPublicConsent(true);
                      if (onConsentUpdated) onConsentUpdated(true);
                      Swal.fire({
                        icon: 'success',
                        title: 'Public Profile Activated!',
                        text: 'Your clinic is now publicly accessible at your link.',
                        timer: 1800,
                        showConfirmButton: false
                      });
                    } catch (err) {
                      Swal.fire('Error', err.response?.data?.message || 'Could not activate consent.', 'error');
                    }
                  }}
                  className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer text-center"
                >
                  Enable Now
                </button>
              </div>
            )}

            {/* Editable Slug Input */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10.5px] font-black uppercase tracking-wider text-khaki">Clinic URL Handle (Slug)</span>
                <span className="text-[10px] text-slate-400 font-mono">Unique profile path</span>
              </div>
              <div className="flex items-center bg-parchment rounded-xl border border-sandstone overflow-hidden">
                <span className="px-3 py-2 text-xs font-mono text-slate-500 bg-sandstone/20 border-r border-sandstone shrink-0">
                  /c/
                </span>
                <input
                  type="text"
                  value={slug}
                  placeholder={serverState?.slug || 'clinic-name'}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))}
                  className="w-full px-3 py-2 bg-transparent text-xs font-mono font-bold text-teak outline-none"
                />
              </div>
            </div>

            {/* Main Public URL */}
            <div className="space-y-1">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-khaki">Public Clinic Profile</span>
              <div className="flex items-center gap-2 bg-parchment p-2.5 rounded-xl border border-sandstone">
                <span className="text-xs font-mono text-teak truncate flex-grow">{publicPageUrl}</span>
                <a
                  href={publicPageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                  title="Open in new tab"
                >
                  <ExternalLink size={12} /> Open
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy(publicPageUrl, 'public')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-teak border border-sandstone rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <Copy size={12} /> {copiedLink === 'public' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Direct Booking URL */}
            <div className="space-y-1">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-khaki">Direct 1-Click Booking URL (Pre-selects Clinic)</span>
              <div className="flex items-center gap-2 bg-parchment p-2.5 rounded-xl border border-sandstone">
                <span className="text-xs font-mono text-teal-800 font-bold truncate flex-grow">{bookingPageUrl}</span>
                <a
                  href={bookingPageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 shadow-sm cursor-pointer"
                  title="Open in new tab"
                >
                  <ExternalLink size={12} /> Test
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy(bookingPageUrl, 'booking')}
                  className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Copy size={12} /> {copiedLink === 'booking' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="pt-2 flex flex-col items-center">
              <div ref={qrRef} className="p-3 bg-white border border-sandstone rounded-2xl shadow-sm mb-2">
                <QRCodeCanvas
                  value={bookingPageUrl}
                  size={130}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-[11px] text-slate-500 font-medium text-center mb-2 px-2">
                Patients scan this QR to directly book an appointment at your clinic
              </p>
              <button
                type="button"
                onClick={handleDownloadQr}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download size={13} /> Download Booking QR Code (PNG)
              </button>
            </div>
          </div>

          {/* Card: Check Indexing Helpers */}
          <div className="bg-white border border-sandstone rounded-3xl p-6 shadow-sm space-y-3">
            <h4 className="font-heading text-lg text-teak">Indexation & Rich Results Verification</h4>
            <p className="text-xs text-khaki">Audit how Google crawls and interprets your clinic page</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <a
                href={`https://www.google.com/search?q=site:appointory.in/c/${encodeURIComponent(currentSlug)}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-parchment hover:bg-teal-50 border border-sandstone hover:border-teal-300 rounded-xl text-xs font-bold text-teak flex items-center justify-between transition-all"
              >
                <span>Google Index Check</span>
                <ExternalLink size={13} className="text-teal-600" />
              </a>

              <a
                href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(publicPageUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-parchment hover:bg-teal-50 border border-sandstone hover:border-teal-300 rounded-xl text-xs font-bold text-teak flex items-center justify-between transition-all"
              >
                <span>Rich Results Test</span>
                <ExternalLink size={13} className="text-teal-600" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Save Action Bar */}
      <div className="bg-white border border-sandstone rounded-3xl p-5 md:p-6 shadow-sm max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 mb-6">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-teak">
            {isDirty ? '⚠️ Unsaved Changes Detected' : '✓ All SEO Settings In Sync'}
          </p>
          <p className="text-[11px] text-khaki">
            {isDirty ? 'Click publish to update Google metadata, JSON-LD, and SSR cache.' : 'Your clinic is ready for search engine indexation.'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            disabled={!isDirty || saving || !publicConsent}
            onClick={handleSave}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
              isDirty && publicConsent && !saving
                ? 'bg-teal-700 hover:bg-teal-800 text-white cursor-pointer active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Save size={16} />
            {saving ? 'Publishing Changes...' : 'Publish SEO Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
