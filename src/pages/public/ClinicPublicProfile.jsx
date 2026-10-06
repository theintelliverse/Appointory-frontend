import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import SeoHead from '../../components/SeoHead';
import { API_URL } from '../../config/runtime';
import RatingModal from '../../components/patient/RatingModal';
import ReviewList from '../../components/patient/ReviewList';
import { trackEvent } from '../../utils/analytics';
import { 
  Building2, MapPin, Phone, Clock, Star, ShieldCheck, 
  Stethoscope, Microscope, Calendar, ChevronRight, Share2, AlertCircle,
  HelpCircle, CheckCircle2, ArrowRight
} from 'lucide-react';

const ClinicPublicProfile = () => {
  const { identifier } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const isBookRequested = searchParams.get('book') === '1' || searchParams.get('book') === 'true';
  const utmSource = searchParams.get('utm_source') || 'organic';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/public/seo/clinic/${identifier}`);
        if (res.data.success) {
          setData(res.data.data);
          const clinicObj = res.data.data.clinic;
          
          // 📊 Track Clinic Page View with UTM source
          trackEvent('clinic_page_view', {
            clinic_id: clinicObj._id,
            clinic_name: clinicObj.name,
            slug: clinicObj.slug || identifier,
            utm_source: utmSource
          });

          // ⚡ Immediate One-Click Booking Trigger (?book=1)
          if (isBookRequested) {
            trackEvent('book_click', {
              clinic_id: clinicObj._id,
              clinic_name: clinicObj.name,
              source: 'url_book_param',
              utm_source: utmSource
            });
            navigate(`/patient/book-appointment?clinicId=${clinicObj._id}&clinic=${clinicObj.slug || clinicObj.clinicCode}&utm_source=${utmSource}`, { replace: true });
          }
        } else {
          setError(res.data.message || 'Clinic profile not found.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load clinic public profile.');
      } finally {
        setLoading(false);
      }
    };

    if (identifier) fetchClinic();
  }, [identifier, isBookRequested, utmSource, navigate]);

  const handleBookClick = () => {
    if (!data?.clinic) return;
    trackEvent('book_click', {
      clinic_id: data.clinic._id,
      clinic_name: data.clinic.name,
      source: 'sticky_button',
      utm_source: utmSource
    });
    navigate(`/patient/book-appointment?clinicId=${data.clinic._id}&clinic=${data.clinic.slug || data.clinic.clinicCode}&utm_source=${utmSource}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: data?.clinic?.name || 'Clinic Profile',
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-teak">Loading Clinic Profile...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    const isConsentNotice = error?.toLowerCase().includes('consent') || error?.toLowerCase().includes('dpdp');
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
        <div className="max-w-md bg-white border border-stone-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
          {isConsentNotice ? (
            <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto border border-teal-200">
              <ShieldCheck size={36} />
            </div>
          ) : (
            <AlertCircle className="mx-auto text-amber-500" size={48} />
          )}
          <h2 className="text-xl font-bold text-slate-800">
            {isConsentNotice ? 'Clinic Not Publicly Listed' : 'Clinic Profile Not Found'}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {error || 'The requested clinic profile is inactive or unavailable.'}
          </p>
          {isConsentNotice && (
            <p className="text-[11px] text-teal-800 bg-teal-50/70 p-3 rounded-xl border border-teal-200/60 leading-normal">
              🔒 In compliance with India’s <strong>Digital Personal Data Protection (DPDP) Act 2023</strong>, healthcare clinical establishments require explicit written authorization before being indexed or browsed on the public directory.
            </p>
          )}
          <Link to="/" className="inline-block bg-teak text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-slate-800 transition">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const { clinic, effectiveSeo, doctors, connectedLabs, jsonLd, meta, faqs = [] } = data;
  const servicesList = effectiveSeo?.services?.length ? effectiveSeo.services : (clinic.specialties || []);
  const aboutText = effectiveSeo?.about || clinic.bio || '';

  return (
    <div className="min-h-screen bg-parchment text-teak font-body pb-28">
      {/* 🚀 Client-Side Secondary SEO Head via react-helmet-async */}
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href={meta.canonicalUrl} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content={meta.canonicalUrl} />
        <meta property="og:image" content={meta.ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={meta.ogImage} />
        {jsonLd && (
          <script type="application/ld+json">
            {JSON.stringify(jsonLd)}
          </script>
        )}
      </Helmet>

      {/* --- Top Header Navigation --- */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-stone-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-sm">
              AP
            </div>
            <span className="font-heading font-black text-lg tracking-tight text-slate-900">Appointory</span>
          </Link>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-2 rounded-xl transition cursor-pointer"
            >
              <Share2 size={14} />
              {copied ? 'Copied!' : 'Share'}
            </button>
            <Link 
              to="/patient/checkin" 
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition"
            >
              Check Queue
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-8">
        {/* --- Hero Section --- */}
        <section className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-teal-50 text-teal-800 text-xs font-bold px-3 py-1 rounded-full border border-teal-200">
                  Verified Healthcare Provider
                </span>
                {clinic.rating?.count > 0 ? (
                  <div className="flex items-center text-amber-500 text-xs font-bold gap-1">
                    <Star size={14} fill="currentColor" />
                    <span>{clinic.rating.score}</span>
                    <span className="text-stone-400">({clinic.rating.count} reviews)</span>
                  </div>
                ) : (
                  <span className="bg-slate-50 text-slate-600 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200">
                    Verified Facility
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-heading font-black text-slate-900 tracking-tight">
                {clinic.name}
              </h1>

              <div className="flex flex-wrap gap-4 text-xs font-medium text-stone-600">
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} className="text-teal-700" />
                  {clinic.address}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone size={15} className="text-teal-700" />
                  {clinic.contactPhone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={15} className="text-teal-700" />
                  {clinic.openingTime || '09:00'} - {clinic.closingTime || '17:00'}
                </span>
              </div>

              {aboutText && (
                <div className="bg-stone-50 border border-stone-200/70 p-4 rounded-2xl text-xs md:text-sm text-stone-700 leading-relaxed mt-2">
                  {aboutText}
                </div>
              )}
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                type="button"
                onClick={handleBookClick}
                className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm px-6 py-3.5 rounded-2xl text-center shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar size={18} />
                Book Consultation (₹{clinic.feeConsult || 500})
              </button>
              <button
                type="button"
                onClick={() => setShowRatingModal(true)}
                className="w-full sm:w-auto bg-white hover:bg-amber-50/70 text-slate-800 border border-slate-200 hover:border-amber-300 font-bold text-sm px-5 py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <Star size={16} className="text-amber-500 fill-amber-500" />
                Rate Clinic
              </button>
            </div>
          </div>
        </section>

        {/* --- Clinical Services Section --- */}
        {servicesList.length > 0 && (
          <section className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-heading font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-teal-700" />
              Clinical Services & Procedures
            </h2>
            <div className="flex flex-wrap gap-2 pt-1">
              {servicesList.map((srv, idx) => (
                <span 
                  key={idx}
                  className="bg-teal-50 border border-teal-200 text-teal-800 font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-2xs"
                >
                  {srv}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* --- Doctors Directory Section --- */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-heading font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="text-teal-700" size={24} />
              Specialist Doctors
            </h2>
            <span className="text-xs font-semibold text-stone-500">{doctors.length} Doctors Available</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map(doc => (
              <div key={doc._id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-3">
                <div className="flex items-center gap-4">
                  <img 
                    src={doc.profileImage || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'} 
                    alt={doc.name} 
                    className="w-14 h-14 rounded-full object-cover border-2 border-teal-100"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{doc.name}</h3>
                    <p className="text-xs font-medium text-teal-800">{doc.specialization || 'General Physician'}</p>
                    <p className="text-xs text-stone-500">{doc.experience || 5}+ years experience</p>
                  </div>
                </div>

                {doc.bio && (
                  <p className="text-xs text-stone-600 line-clamp-2">{doc.bio}</p>
                )}

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Fee: ₹{doc.consultationFee || clinic.feeConsult || 500}</span>
                  <Link 
                    to={`/d/${doc.slug || doc._id}`} 
                    className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                  >
                    View Doctor Profile <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- Connected Diagnostic Labs --- */}
        {connectedLabs.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-heading font-bold text-slate-900 flex items-center gap-2">
              <Microscope className="text-teal-700" size={24} />
              Connected Diagnostic Labs Network
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {connectedLabs.map(lab => (
                <div key={lab._id} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-2">
                  <div className="flex items-center gap-3">
                    <Building2 className="text-teal-700 shrink-0" size={20} />
                    <h4 className="font-bold text-sm text-slate-900 truncate">{lab.labName}</h4>
                  </div>
                  <p className="text-xs text-stone-500 truncate">{lab.address}</p>
                  <Link 
                    to={`/l/${lab.slug || lab._id}`}
                    className="inline-block text-xs font-bold text-teal-700 hover:underline pt-1"
                  >
                    View Test Catalog & Details &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- Frequently Asked Questions (Matching SSR markup) --- */}
        {faqs.length > 0 && (
          <section className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <HelpCircle size={22} className="text-teal-700" />
              <h2 className="text-xl font-heading font-bold text-slate-900">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <details 
                  key={idx} 
                  className="bg-parchment/60 border border-stone-200 rounded-2xl p-4 transition-all group"
                >
                  <summary className="font-bold text-sm text-slate-900 cursor-pointer list-none flex items-center justify-between">
                    <span>{faq.question || faq.q}</span>
                    <ChevronRight size={16} className="text-teal-700 transition-transform group-open:rotate-90 shrink-0 ml-2" />
                  </summary>
                  <p className="text-xs text-stone-700 leading-relaxed mt-3 pt-3 border-t border-stone-200/60">
                    {faq.answer || faq.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* --- Patient Ratings & Reviews Section --- */}
        <ReviewList
          targetType="clinic"
          targetId={clinic._id}
          targetName={clinic.name}
          onOpenRating={() => setShowRatingModal(true)}
        />
      </main>

      {/* --- Sticky Bottom CTA Bar (Instant One-Click Booking) --- */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-3 shadow-2xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="truncate">
            <h4 className="font-bold text-slate-900 text-sm truncate">{clinic.name}</h4>
            <p className="text-xs text-teal-800 font-semibold truncate">
              Consultation Fee: ₹{clinic.feeConsult || 500} &bull; Live Queue Active
            </p>
          </div>
          <button
            type="button"
            onClick={handleBookClick}
            className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-bold text-xs md:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Calendar size={16} />
            <span>Book Appointment</span>
            <ArrowRight size={14} className="hidden sm:inline" />
          </button>
        </div>
      </div>

      {/* Patient Rating Modal */}
      {showRatingModal && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          targetType="clinic"
          targetId={clinic._id}
          targetName={clinic.name}
          onSuccess={(updatedRating) => {
            if (updatedRating) {
              setData(prev => prev ? {
                ...prev,
                clinic: { ...prev.clinic, rating: updatedRating }
              } : prev);
            }
          }}
        />
      )}
    </div>
  );
};

export default ClinicPublicProfile;
