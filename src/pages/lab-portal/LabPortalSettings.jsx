import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Save, ShieldCheck, Palette, TrendingUp, CalendarOff, Globe,
  Building, Phone, Mail, MapPin, Copy, ExternalLink, Loader2, QrCode,
  Star, Sparkles, Monitor, Smartphone, Download,
  Tag, Award, Video, CheckCircle2, MessageSquare, X
} from 'lucide-react';
import SEO from '../../components/SEO';
import Sidebar from '../../components/Sidebar';
import LabScheduleModal from './components/LabScheduleModal';
import LabQR from '../../components/LabQR';
import { API_URL } from '../../config/runtime';

const labApi = () => {
  const token = localStorage.getItem('labToken');
  return axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` }
  });
};

const COMMON_ACCREDITATIONS = [
  'NABL Accredited (ISO 15189)',
  'CAP (College of American Pathologists)',
  'ICMR Approved',
  'ISO 9001:2015 Certified',
  'NABH Accredited Diagnostic Centre',
  'Good Laboratory Practice (GLP)'
];

const LabPortalSettings = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const reviewQrRef = useRef(null);

  // Tab state: 'branding' | 'seo' | 'reviews' | 'counter-qr'
  const activeTab = searchParams.get('tab') || 'branding';
  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedReviewLink, setCopiedReviewLink] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop'); // 'desktop' | 'mobile'

  // Stored lab basic info
  const labName = localStorage.getItem('labName') || 'Independent Laboratory';
  const labCode = localStorage.getItem('labCode') || 'LAB';
  const labEmail = localStorage.getItem('labEmail') || 'lab@appointory.in';
  const labPhone = localStorage.getItem('labPhone') || 'Not specified';
  const labAddress = localStorage.getItem('labAddress') || 'Not specified';
  const [resolvedLabId, setResolvedLabId] = useState(localStorage.getItem('labId') || '');

  // Form State
  const [formData, setFormData] = useState({
    testFee: 450,
    primaryColor: '#0F766E',
    headerFontSize: 22,
    bodyFontSize: 11,
    defaultNotes: 'Results are clinically validated. Correlate with symptoms.',
    defaultDoctorName: 'Pathologist',
    slug: '',
    bio: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: [],
    socialLinks: { facebook: '', instagram: '', twitter: '', linkedin: '', youtube: '' },
    accreditation: [],
    videoUrl: '',
    publicListingConsent: false
  });

  const [keywordInput, setKeywordInput] = useState('');

  // Reviews State
  const [reviewsData, setReviewsData] = useState({
    rating: { score: 0, count: 0 },
    totalReviews: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    percentageBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    reviews: []
  });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewRatingFilter, setReviewRatingFilter] = useState('all');

  const fetchReviews = useCallback(async (targetId) => {
    if (!targetId) return;
    setLoadingReviews(true);
    try {
      const res = await axios.get(`${API_URL}/api/ratings/lab/${targetId}`);
      if (res.data?.success) {
        setReviewsData({
          rating: res.data.rating || { score: 0, count: 0 },
          totalReviews: res.data.totalReviews || 0,
          breakdown: res.data.breakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          percentageBreakdown: res.data.percentageBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          reviews: res.data.reviews || []
        });
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await labApi().get('/api/lab-connect/settings/lab');
      if (res.data.success && res.data.data) {
        const d = res.data.data;
        const currentLabId = d._id || d.labId || localStorage.getItem('labId') || '';
        if (currentLabId) {
          setResolvedLabId(currentLabId);
          localStorage.setItem('labId', currentLabId);
          fetchReviews(currentLabId);
        }

        setFormData({
          testFee: d.testFee || 450,
          primaryColor: d.primaryColor || '#0F766E',
          headerFontSize: d.headerFontSize || 22,
          bodyFontSize: d.bodyFontSize || 11,
          defaultNotes: d.defaultNotes || 'Results are clinically validated. Correlate with symptoms.',
          defaultDoctorName: d.defaultDoctorName || 'Pathologist',
          slug: d.slug || '',
          bio: d.bio || '',
          seoTitle: d.seoTitle || '',
          seoDescription: d.seoDescription || '',
          seoKeywords: Array.isArray(d.seoKeywords) ? d.seoKeywords : [],
          socialLinks: d.socialLinks || { facebook: '', instagram: '', twitter: '', linkedin: '', youtube: '' },
          accreditation: Array.isArray(d.accreditation) ? d.accreditation : [],
          videoUrl: d.videoUrl || '',
          publicListingConsent: Boolean(d.publicListingConsent)
        });
      }
    } catch (err) {
      console.error('Failed to load lab settings:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchReviews]);

  useEffect(() => {
    const token = localStorage.getItem('labToken');
    if (!token) {
      navigate('/lab/login');
      return;
    }
    fetchSettings();
  }, [fetchSettings, navigate]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(labCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const publicProfileUrl = useMemo(() => {
    const cleanSlug = formData.slug || resolvedLabId || labCode.toLowerCase();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://appointory.in';
    return `${origin}/l/${cleanSlug}`;
  }, [formData.slug, resolvedLabId, labCode]);

  const publicReviewUrl = useMemo(() => {
    return `${publicProfileUrl}?review=1`;
  }, [publicProfileUrl]);

  const handleCopyReviewLink = () => {
    navigator.clipboard.writeText(publicReviewUrl);
    setCopiedReviewLink(true);
    setTimeout(() => setCopiedReviewLink(false), 2000);
  };

  const handleDownloadReviewQr = () => {
    if (!reviewQrRef.current) return;
    const canvas = reviewQrRef.current.querySelector('canvas');
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = image;
    a.download = `Appointory_Review_QR_${labCode}.png`;
    a.click();
  };

  // SEO Derived Values for Live Preview
  const displayTitle = useMemo(() => {
    if (formData.seoTitle.trim()) return formData.seoTitle.trim();
    return `${labName} - Diagnostic & Pathology Lab Services`.slice(0, 70);
  }, [formData.seoTitle, labName]);

  const displayDescription = useMemo(() => {
    if (formData.seoDescription.trim()) return formData.seoDescription.trim();
    if (formData.bio.trim()) return formData.bio.trim();
    return `Book blood tests & health checkups at ${labName}. Certified diagnostic reports & instant booking on Appointory.`.slice(0, 160);
  }, [formData.seoDescription, formData.bio, labName]);

  // Keyword tags handling
  const handleAddKeyword = (e) => {
    if (e) e.preventDefault();
    const val = keywordInput.trim().replace(/^,+|,+$/g, '');
    if (!val) return;
    if (!formData.seoKeywords.includes(val)) {
      setFormData(prev => ({
        ...prev,
        seoKeywords: [...prev.seoKeywords, val]
      }));
    }
    setKeywordInput('');
  };

  const handleRemoveKeyword = (kwToRemove) => {
    setFormData(prev => ({
      ...prev,
      seoKeywords: prev.seoKeywords.filter(k => k !== kwToRemove)
    }));
  };

  const handleToggleAccreditation = (acc) => {
    setFormData(prev => {
      const exists = prev.accreditation.includes(acc);
      return {
        ...prev,
        accreditation: exists
          ? prev.accreditation.filter(a => a !== acc)
          : [...prev.accreditation, acc]
      };
    });
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        testFee: Number(formData.testFee) || 0,
        primaryColor: formData.primaryColor,
        headerFontSize: Number(formData.headerFontSize) || 22,
        bodyFontSize: Number(formData.bodyFontSize) || 11,
        defaultNotes: formData.defaultNotes,
        defaultDoctorName: formData.defaultDoctorName,
        slug: formData.slug ? formData.slug.toLowerCase().trim() : undefined,
        bio: formData.bio,
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        seoKeywords: formData.seoKeywords,
        socialLinks: formData.socialLinks,
        accreditation: formData.accreditation,
        videoUrl: formData.videoUrl,
        publicListingConsent: formData.publicListingConsent
      };

      const res = await labApi().patch('/api/lab-connect/settings/lab', payload);

      if (res.data.success) {
        localStorage.setItem('labPortal_defaultNotes', formData.defaultNotes || '');
        localStorage.setItem('labPortal_defaultDoctorName', formData.defaultDoctorName || '');
        localStorage.setItem('labPortal_primaryColor', formData.primaryColor || '#0F766E');
        localStorage.setItem('labPortal_headerFontSize', formData.headerFontSize?.toString() || '22');
        localStorage.setItem('labPortal_bodyFontSize', formData.bodyFontSize?.toString() || '11');
        localStorage.setItem('labPortal_testFee', formData.testFee?.toString() || '450');

        Swal.fire({
          icon: 'success',
          title: 'Settings Saved',
          text: 'Your laboratory configuration, SEO metadata, and branding have been updated successfully.',
          timer: 1800,
          showConfirmButton: false
        });
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
      Swal.fire('Update Failed', err.response?.data?.message || 'Failed to save settings. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredReviews = useMemo(() => {
    if (reviewRatingFilter === 'all') return reviewsData.reviews;
    const targetScore = Number(reviewRatingFilter);
    return reviewsData.reviews.filter(r => Math.round(r.score) === targetScore);
  }, [reviewsData.reviews, reviewRatingFilter]);

  return (
    <div className="flex min-h-screen bg-[#FAF8F5] font-body text-slate-900 flex-col lg:flex-row">
      <Sidebar role="lab" />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen overflow-x-hidden overflow-y-auto pb-24 lg:pb-8">
        <main className="px-4 sm:px-6 lg:px-8 py-6 w-full max-w-6xl mx-auto space-y-6">
          <SEO
            title="Lab Settings, SEO & Reviews - Appointory"
            description="Manage laboratory billing rates, report branding, public SEO profile, and patient reviews."
            url="/lab/portal/settings"
            noindex={true}
          />

          {/* Header Bar */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 rounded-full text-xs font-bold border border-teal-200">
                  Settings &amp; Online Reputation
                </span>
                <span className="text-slate-400 text-xs">·</span>
                <span className="text-xs font-semibold text-slate-500">ID: {labCode}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Laboratory Management &amp; SEO
              </h1>
              <p className="text-slate-500 font-medium text-xs sm:text-sm mt-0.5">
                Configure diagnostic fees, report branding, search engine rankings (SEO) &amp; patient reviews.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setShowScheduleModal(true)}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                <CalendarOff size={15} className="text-teal-400" />
                Schedule
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </header>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('branding')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'branding'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Palette size={15} />
              <span>Branding &amp; Rates</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('seo')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'seo'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Globe size={15} />
              <span>SEO &amp; Google Search</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Star size={15} className={activeTab === 'reviews' ? 'fill-white' : 'fill-amber-400 text-amber-500'} />
              <span>Reviews ({reviewsData.totalReviews})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('counter-qr')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'counter-qr'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <QrCode size={15} />
              <span>Desk QR Gateway</span>
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-teal-600 mb-3" size={32} />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading settings &amp; reputation...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">

              {/* ============================================================ */}
              {/* TAB 1: BRANDING & RATES */}
              {/* ============================================================ */}
              {activeTab === 'branding' && (
                <div className="space-y-6">
                  {/* Laboratory Profile Overview */}
                  <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                          <Building size={18} />
                        </div>
                        <div>
                          <h2 className="text-sm font-bold text-slate-900">Laboratory Profile</h2>
                          <p className="text-[11px] text-slate-400 font-medium">Registered account information</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-all cursor-pointer"
                        title="Copy unique Lab Code"
                      >
                        <Copy size={12} className="text-slate-400" />
                        <span>{copiedCode ? 'Copied!' : `Code: ${labCode}`}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                          <Building size={12} /> Facility Name
                        </p>
                        <p className="text-sm font-bold text-slate-800">{labName}</p>
                      </div>
                      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                          <Phone size={12} /> Registered Phone
                        </p>
                        <p className="text-sm font-bold text-slate-800">{labPhone}</p>
                      </div>
                      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                          <Mail size={12} /> Portal Email
                        </p>
                        <p className="text-sm font-bold text-slate-800 truncate">{labEmail}</p>
                      </div>
                    </div>

                    {labAddress && labAddress !== 'Not specified' && (
                      <div className="mt-3 bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex items-start gap-2">
                        <MapPin size={14} className="text-teal-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600 font-medium">{labAddress}</p>
                      </div>
                    )}
                  </div>

                  {/* Rates & Report Branding Settings */}
                  <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                        <TrendingUp size={18} />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900">Diagnostic Fee &amp; Report Branding</h2>
                        <p className="text-[11px] text-slate-400 font-medium">Define baseline test rates, header theme &amp; report formatting</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Baseline Diagnostic Test Fee (₹)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="10"
                            value={formData.testFee}
                            onChange={(e) => setFormData({ ...formData, testFee: e.target.value })}
                            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
                            placeholder="e.g. 450"
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Used to compute diagnostic revenue metrics and default billing estimates.</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Report Branding Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={formData.primaryColor}
                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                            className="w-11 h-10 p-0.5 rounded-xl border border-slate-200 cursor-pointer bg-white"
                          />
                          <input
                            type="text"
                            value={formData.primaryColor}
                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                            className="flex-grow px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-teal-500 uppercase"
                            placeholder="#0F766E"
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Applied to report headers, table accents, and verified stamps on PDFs.</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Authorized Signatory / Pathologist Name
                        </label>
                        <input
                          type="text"
                          value={formData.defaultDoctorName}
                          onChange={(e) => setFormData({ ...formData, defaultDoctorName: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
                          placeholder="e.g. Dr. Ramesh Patel, MD (Pathology)"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">Printed on digital validation signatures and report sign-offs.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Header Font Size (pt)
                          </label>
                          <input
                            type="number"
                            min="16"
                            max="32"
                            value={formData.headerFontSize}
                            onChange={(e) => setFormData({ ...formData, headerFontSize: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Body Font Size (pt)
                          </label>
                          <input
                            type="number"
                            min="9"
                            max="16"
                            value={formData.bodyFontSize}
                            onChange={(e) => setFormData({ ...formData, bodyFontSize: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-teal-500"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Default Report Footnotes / Observations
                        </label>
                        <textarea
                          rows="3"
                          value={formData.defaultNotes}
                          onChange={(e) => setFormData({ ...formData, defaultNotes: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all resize-none leading-relaxed"
                          placeholder="Enter legal disclaimer, correlation guidelines, or sample integrity notes..."
                        />
                        <p className="text-[11px] text-slate-400 mt-1">Appears at the bottom of every generated digital and PDF lab report.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* TAB 2: SEO & GOOGLE SEARCH MANAGEMENT */}
              {/* ============================================================ */}
              {activeTab === 'seo' && (
                <div className="space-y-6">

                  {/* Public Link & Quick Actions Bar */}
                  <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/10 border border-teal-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Sparkles size={18} className="text-teal-700" />
                        <h2 className="text-sm font-bold text-teal-900">Live Diagnostic Lab Public Profile</h2>
                      </div>
                      <p className="text-xs text-teal-800/80 font-medium">
                        Your certified profile is indexed on search engines with Schema.org <code className="bg-white/80 px-1 py-0.5 rounded text-[11px]">DiagnosticLab</code> structured data.
                      </p>
                      <a
                        href={publicProfileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 underline pt-0.5"
                      >
                        {publicProfileUrl}
                        <ExternalLink size={12} />
                      </a>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={publicProfileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-teal-200 text-teal-800 rounded-xl text-xs font-bold shadow-2xs transition"
                      >
                        <ExternalLink size={14} />
                        <span>Preview Profile</span>
                      </a>
                    </div>
                  </div>

                  {/* DPDP Act 2023 Explicit Consent Banner */}
                  <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={18} className={formData.publicListingConsent ? 'text-teal-600' : 'text-slate-400'} />
                          <h3 className="text-sm font-bold text-slate-900">
                            Public Search Directory &amp; DPDP Act 2023 Consent
                          </h3>
                          {formData.publicListingConsent && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Consent Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                          Under India's Digital Personal Data Protection (DPDP) Act 2023, explicit digital consent is required to list your diagnostic laboratory profile, test rates, and operational timings on search engines and the public Appointory directory.
                        </p>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                        <input
                          type="checkbox"
                          checked={formData.publicListingConsent}
                          onChange={(e) => setFormData({ ...formData, publicListingConsent: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-700"></div>
                      </label>
                    </div>
                  </div>

                  {/* Google Search Engine Result Preview (SERP) */}
                  <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Globe size={18} className="text-teal-600" />
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Google Search Snippet Preview</h3>
                          <p className="text-[11px] text-slate-400">How your pathology lab appears when patients search on Google</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setPreviewMode('desktop')}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            previewMode === 'desktop' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                          }`}
                        >
                          <Monitor size={12} />
                          <span>Desktop</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewMode('mobile')}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            previewMode === 'mobile' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                          }`}
                        >
                          <Smartphone size={12} />
                          <span>Mobile</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-2xl">
                      <div className={`${previewMode === 'mobile' ? 'max-w-sm' : 'max-w-2xl'} space-y-1.5 font-sans`}>
                        <div className="flex items-center gap-2 text-[12px] text-slate-600 truncate">
                          <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px] font-bold">🔬</span>
                          <span className="truncate">appointory.in &gt; l &gt; {formData.slug || 'lab'}</span>
                        </div>
                        <h4 className="text-[#1a0dab] hover:underline text-base font-semibold line-clamp-1 cursor-pointer">
                          {displayTitle}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-amber-600 font-bold">
                          <span>★ {reviewsData.rating.score || '5.0'}</span>
                          <span className="text-slate-400">({reviewsData.totalReviews || 12} reviews)</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-500 font-normal">Diagnostic Laboratory</span>
                        </div>
                        <p className="text-[13px] text-[#4d5156] leading-relaxed line-clamp-2">
                          {displayDescription}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SEO Meta Information Form */}
                  <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-5">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-bold text-slate-900">Search Meta Tags &amp; URL</h3>
                      <p className="text-[11px] text-slate-400">Optimize meta titles, descriptions and focus keywords for organic patient discovery</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* URL Slug */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Public Profile Slug URL *
                        </label>
                        <div className="flex items-center">
                          <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-xs font-bold text-slate-500">
                            appointory.in/l/
                          </span>
                          <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                            className="flex-grow px-3 py-2 bg-slate-50 border border-slate-200 rounded-r-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-teal-500"
                            placeholder="city-lab-pathology"
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Direct link for online booking, WhatsApp sharing and Google rankings.</p>
                      </div>

                      {/* Video Walkthrough URL */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                          <Video size={13} className="text-teal-600" />
                          Lab Walkthrough / Video URL (VEO / VideoObject)
                        </label>
                        <input
                          type="url"
                          value={formData.videoUrl}
                          onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-teal-500"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                        <p className="text-[11px] text-slate-400 mt-1">Boosts ranking on AI Search Engines (Perplexity, Google Video Carousels).</p>
                      </div>

                      {/* Meta Title */}
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            SEO Meta Title (Recommended: 50–60 characters)
                          </label>
                          <span className={`text-[11px] font-bold ${formData.seoTitle.length > 70 ? 'text-rose-500' : 'text-slate-400'}`}>
                            {formData.seoTitle.length} / 70
                          </span>
                        </div>
                        <input
                          type="text"
                          value={formData.seoTitle}
                          onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-teal-500"
                          placeholder={`e.g. ${labName} – Blood Tests, Pathology & Diagnostics | Book Online`}
                        />
                      </div>

                      {/* Meta Description */}
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            SEO Meta Description (Recommended: 120–160 characters)
                          </label>
                          <span className={`text-[11px] font-bold ${formData.seoDescription.length > 170 ? 'text-rose-500' : 'text-slate-400'}`}>
                            {formData.seoDescription.length} / 170
                          </span>
                        </div>
                        <textarea
                          rows="2"
                          value={formData.seoDescription}
                          onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-teal-500 resize-none leading-relaxed"
                          placeholder={`e.g. Certified diagnostic pathology lab offering complete blood counts, biochemistry, thyroid & health packages with instant digital reports.`}
                        />
                      </div>

                      {/* Lab Bio */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Public Lab Overview / Bio
                        </label>
                        <textarea
                          rows="2"
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-teal-500 resize-none leading-relaxed"
                          placeholder="State-of-the-art diagnostic facility with automated analyzers and certified pathologists..."
                        />
                      </div>

                      {/* SEO Keywords */}
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-xs font-bold text-slate-700">
                          Search Keywords &amp; Test Specialties
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddKeyword(e); }}
                            className="flex-grow px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-teal-500"
                            placeholder="Type keyword (e.g. blood test near me, lipid profile, CBC) and press Enter"
                          />
                          <button
                            type="button"
                            onClick={handleAddKeyword}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            Add Tag
                          </button>
                        </div>

                        {formData.seoKeywords.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {formData.seoKeywords.map((kw, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200/80 rounded-lg text-xs font-semibold"
                              >
                                <Tag size={11} />
                                <span>{kw}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveKeyword(kw)}
                                  className="text-teal-600 hover:text-rose-600 ml-0.5"
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Accreditations & Quality Certifications */}
                  <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Award size={18} className="text-amber-600" />
                        <h3 className="text-sm font-bold text-slate-900">Laboratory Quality Accreditations</h3>
                      </div>
                      <p className="text-[11px] text-slate-400">Certifications appear as trust badges on your public profile and Schema.org markup</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {COMMON_ACCREDITATIONS.map((acc, i) => {
                        const checked = formData.accreditation.includes(acc);
                        return (
                          <div
                            key={i}
                            onClick={() => handleToggleAccreditation(acc)}
                            className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs font-bold ${
                              checked
                                ? 'bg-amber-50/70 border-amber-300 text-amber-900 shadow-2xs'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <span className="truncate pr-2">{acc}</span>
                            <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                              checked ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {checked && <CheckCircle2 size={12} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Social Media Links */}
                  <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-bold text-slate-900">Social Media &amp; Web Links</h3>
                      <p className="text-[11px] text-slate-400">Powers Schema.org <code className="bg-slate-100 px-1 py-0.5 rounded">sameAs</code> structured citations</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {['facebook', 'instagram', 'twitter', 'linkedin', 'youtube'].map((platform) => (
                        <div key={platform}>
                          <label className="block text-xs font-bold text-slate-700 mb-1 capitalize">
                            {platform === 'twitter' ? 'X / Twitter' : platform} URL
                          </label>
                          <input
                            type="url"
                            value={formData.socialLinks?.[platform] || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              socialLinks: { ...formData.socialLinks, [platform]: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-teal-500"
                            placeholder={`https://${platform}.com/...`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* TAB 3: PATIENT REVIEWS & REPUTATION MANAGEMENT */}
              {/* ============================================================ */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">

                  {/* Reviews Summary KPI Card */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                      
                      {/* Overall Score */}
                      <div className="text-center lg:border-r border-slate-100 lg:pr-6 space-y-1">
                        <span className="text-5xl font-black text-slate-900 tracking-tight">
                          {reviewsData.rating.score || '5.0'}
                        </span>
                        <div className="flex items-center justify-center gap-1 text-amber-500 pt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={20}
                              className={star <= Math.round(reviewsData.rating.score || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                            />
                          ))}
                        </div>
                        <p className="text-xs font-bold text-slate-500 pt-1">
                          Based on {reviewsData.totalReviews} verified patient reviews
                        </p>
                        <div className="pt-2">
                          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-full text-[11px] font-bold">
                            100% Medical Privacy Protected
                          </span>
                        </div>
                      </div>

                      {/* 5-Star Breakdown Progress Bars */}
                      <div className="space-y-2 lg:border-r border-slate-100 lg:pr-6">
                        {[5, 4, 3, 2, 1].map((stars) => {
                          const count = reviewsData.breakdown[stars] || 0;
                          const pct = reviewsData.percentageBreakdown[stars] || 0;
                          return (
                            <div key={stars} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                              <span className="w-12 text-right flex items-center justify-end gap-0.5">
                                <span>{stars}</span>
                                <Star size={11} className="fill-amber-400 text-amber-400" />
                              </span>
                              <div className="flex-grow h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="w-10 text-right text-[11px] text-slate-400 font-bold">{count}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Review Collection Standee / QR Generator */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-900">
                          <MessageSquare size={14} className="text-teal-600" />
                          <span>Collect Patient Reviews at Counter</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          Display this QR code at your sample collection desk to invite patients to share feedback.
                        </p>

                        <div ref={reviewQrRef} className="bg-white p-2.5 rounded-xl border border-slate-200 inline-block shadow-2xs">
                          <QRCodeCanvas
                            value={publicReviewUrl}
                            size={100}
                            level="M"
                            marginSize={1}
                          />
                        </div>

                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={handleCopyReviewLink}
                            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg transition flex items-center gap-1"
                          >
                            <Copy size={12} />
                            <span>{copiedReviewLink ? 'Copied!' : 'Copy Link'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleDownloadReviewQr}
                            className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 shadow-2xs"
                          >
                            <Download size={12} />
                            <span>Download QR</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Reviews List & Filters */}
                  <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Verified Patient Feedback</h3>
                        <p className="text-[11px] text-slate-400">Read authenticated reviews submitted by patients who booked tests at your lab</p>
                      </div>

                      {/* Filter by star rating */}
                      <div className="flex items-center gap-1.5 overflow-x-auto">
                        <button
                          type="button"
                          onClick={() => setReviewRatingFilter('all')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                            reviewRatingFilter === 'all'
                              ? 'bg-slate-900 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          All ({reviewsData.totalReviews})
                        </button>
                        {[5, 4, 3, 2, 1].map((stars) => (
                          <button
                            key={stars}
                            type="button"
                            onClick={() => setReviewRatingFilter(stars.toString())}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-0.5 ${
                              reviewRatingFilter === stars.toString()
                                ? 'bg-amber-600 text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <span>{stars}</span>
                            <Star size={11} className={reviewRatingFilter === stars.toString() ? 'fill-white' : 'fill-amber-400 text-amber-500'} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {loadingReviews ? (
                      <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
                        <Loader2 size={18} className="animate-spin text-teal-600" />
                        <span>Loading patient reviews...</span>
                      </div>
                    ) : filteredReviews.length === 0 ? (
                      <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 space-y-2">
                        <Star size={32} className="text-slate-300 mx-auto" />
                        <h4 className="text-xs font-bold text-slate-700">No reviews found</h4>
                        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                          {reviewRatingFilter === 'all'
                            ? 'Your diagnostic lab has no patient reviews yet. Print the counter QR code above to start collecting reviews.'
                            : `No reviews matching ${reviewRatingFilter} stars.`}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredReviews.map((r) => (
                          <div
                            key={r._id}
                            className="p-4 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl transition space-y-2"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                                  VP
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-900">{r.patientName || 'Verified Patient'}</span>
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded-full font-bold">
                                      Verified
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(r.createdAt).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-xs font-bold text-amber-800">
                                <Star size={12} className="fill-amber-400 text-amber-400" />
                                <span>{r.score}.0</span>
                              </div>
                            </div>

                            {r.review ? (
                              <p className="text-xs text-slate-700 leading-relaxed italic pl-1">
                                "{r.review}"
                              </p>
                            ) : (
                              <p className="text-[11px] text-slate-400 italic pl-1">Rating submitted without text comment.</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* TAB 4: COUNTER DESK QR GATEWAY */}
              {/* ============================================================ */}
              {activeTab === 'counter-qr' && (
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                      <QrCode size={18} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Lab Counter QR Gateway</h2>
                      <p className="text-[11px] text-slate-400 font-medium">Download or display your reception desk QR code for direct patient appointments</p>
                    </div>
                  </div>

                  <div className="max-w-md mx-auto">
                    <LabQR
                      labCode={labCode}
                      labName={labName}
                      labSlug={formData.slug}
                      showTitle={false}
                    />
                  </div>
                </div>
              )}

              {/* Bottom Action Button Bar */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <a
                  href={publicProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1.5"
                >
                  <ExternalLink size={14} />
                  <span>Preview Live Page: /l/{formData.slug || 'lab'}</span>
                </a>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/lab/portal/dashboard')}
                    className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>

            </form>
          )}

          {/* Schedule Modal */}
          <LabScheduleModal
            isOpen={showScheduleModal}
            onClose={() => setShowScheduleModal(false)}
          />

        </main>
      </div>
    </div>
  );
};

export default LabPortalSettings;
