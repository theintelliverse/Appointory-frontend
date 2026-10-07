import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  User, Phone, Search, AlertCircle, RefreshCw, Activity,
  ArrowLeft, Stethoscope, Heart, ShieldCheck, HeartPulse, Sparkles,
  CalendarOff, Zap, Users, UserPlus, Check, CheckCircle2, X, Plus,
  ChevronDown, Calendar
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { API_URL } from '../../config/runtime';
import { trackEvent } from '../../utils/analytics';
import { normalizeIndianPhone } from '../../utils/phone';

const AddPatient = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 👨‍👩‍👧‍👦 Family Profiles State
  const [suggestedProfiles, setSuggestedProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [isSearchingProfiles, setIsSearchingProfiles] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [savingMember, setSavingMember] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    relationship: 'Child',
    age: '',
    gender: 'Male',
    bloodGroup: 'O+',
    isMinor: false,
    guardianConsent: false
  });

  // Form State
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    patientPhone: '',
    patientAge: '',
    patientGender: 'Male',
    patientBloodGroup: 'O+',
    doctorId: '',
    visitType: 'Walk-in',
    isEmergency: false,
    vitals: {
      bloodPressure: '',
      pulseRate: '',
      temperature: '',
      sugarLevel: '',
    }
  });

  const token = localStorage.getItem('token');

  // Fetch Doctors for Assignment
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const res = await axios.get(`${API_URL}/api/staff/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDoctors(res.data.staff.filter(s => s.role === 'doctor' && s.isActive !== false));
      } catch (err) {
        console.error("Failed to load doctor roster:", err);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, [token]);

  // 🔍 Auto-lookup all patient profiles under this phone number
  const fetchProfilesForPhone = useCallback(async (rawPhone, silent = false) => {
    const cleanPhone = (rawPhone || '').replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setSuggestedProfiles([]);
      setSelectedProfileId(null);
      return;
    }

    setIsSearchingProfiles(true);
    try {
      const res = await axios.get(`${API_URL}/api/staff/patient-family-lookup/${cleanPhone}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success && Array.isArray(res.data.profiles) && res.data.profiles.length > 0) {
        setSuggestedProfiles(res.data.profiles);

        // Auto-select primary or first profile if none currently selected
        const primary = res.data.profiles.find(p => p.isPrimary) || res.data.profiles[0];
        if (primary && !selectedProfileId) {
          handleSelectProfile(primary, false);
        }

        if (!silent) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `Found ${res.data.profiles.length} profile${res.data.profiles.length > 1 ? 's' : ''} for this number`,
            showConfirmButton: false,
            timer: 2500
          });
        }
      } else {
        setSuggestedProfiles([]);
      }
    } catch (err) {
      console.warn("Could not lookup profiles for phone:", err.message);
      setSuggestedProfiles([]);
    } finally {
      setIsSearchingProfiles(false);
    }
  }, [token, selectedProfileId]);

  // Handle phone change in form & trigger auto-lookup when 10 digits
  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, patientPhone: val }));
    setSearchPhone(val);

    const clean = val.replace(/\D/g, '').slice(-10);
    if (clean.length === 10) {
      fetchProfilesForPhone(clean, true);
    } else if (clean.length < 10) {
      setSuggestedProfiles([]);
      setSelectedProfileId(null);
      setFormData(prev => ({ ...prev, patientId: '' }));
    }
  };

  // Select a profile from suggestions
  const handleSelectProfile = (profile, showToast = true) => {
    setSelectedProfileId(profile._id || 'temp');
    setFormData(prev => ({
      ...prev,
      patientId: profile._id || '',
      patientName: profile.name || '',
      patientPhone: profile.phone || prev.patientPhone,
      patientAge: profile.age !== undefined && profile.age !== null ? String(profile.age) : prev.patientAge,
      patientGender: profile.gender || 'Male',
      patientBloodGroup: profile.bloodGroup || prev.patientBloodGroup || 'O+',
    }));

    if (showToast) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: `Selected: ${profile.name} (${profile.relationship || 'Patient'})`,
        showConfirmButton: false,
        timer: 1800
      });
    }
  };

  // Search Patient Locker from right-hand search card
  const handleSearchPatient = async () => {
    if (!searchPhone || searchPhone.length < 10) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Number',
        text: 'Please enter a valid 10-digit mobile number to search.',
        confirmButtonColor: '#0F766E',
        background: '#EEF6FA'
      });
      return;
    }

    setSearching(true);
    setFormData(prev => ({ ...prev, patientPhone: searchPhone }));
    await fetchProfilesForPhone(searchPhone, false);
    setSearching(false);
  };

  // Save new member / profile under this mobile number
  const handleSaveNewMember = async (e) => {
    if (e) e.preventDefault();
    if (!newMember.name.trim()) {
      Swal.fire('Name Required', 'Please enter the family member full name.', 'warning');
      return;
    }

    const cleanPhone = (formData.patientPhone || searchPhone).replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      Swal.fire('Mobile Required', 'Please enter a valid 10-digit mobile number first.', 'warning');
      return;
    }

    const isMinor = Boolean(newMember.age && parseInt(newMember.age) < 18);
    if (isMinor && !newMember.guardianConsent) {
      Swal.fire('Guardian Declaration', 'Lawful guardian declaration is required for individuals under 18 years of age (DPDP Act).', 'warning');
      return;
    }

    setSavingMember(true);
    try {
      const res = await axios.post(`${API_URL}/api/staff/patient-family-member`, {
        phone: cleanPhone,
        name: newMember.name.trim(),
        relationship: newMember.relationship,
        age: newMember.age ? parseInt(newMember.age) : undefined,
        gender: newMember.gender,
        bloodGroup: newMember.bloodGroup,
        isMinor,
        guardianConsent: newMember.guardianConsent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success && res.data.member) {
        const added = res.data.member;
        setSuggestedProfiles(prev => [...prev, added]);
        handleSelectProfile(added, false);
        setShowAddMemberModal(false);

        // Reset new member form
        setNewMember({
          name: '',
          relationship: 'Child',
          age: '',
          gender: 'Male',
          bloodGroup: 'O+',
          isMinor: false,
          guardianConsent: false
        });

        Swal.fire({
          icon: 'success',
          title: 'Family Member Added!',
          text: `${added.name} (${added.relationship}) has been saved and selected.`,
          timer: 2000,
          showConfirmButton: false,
          background: '#EEF6FA'
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Failed to Add', err.response?.data?.message || 'Error saving family member.', 'error');
    } finally {
      setSavingMember(false);
    }
  };

  // Submit Patient to Queue
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.doctorId) {
      Swal.fire('Required Field', 'Please assign a medical practitioner.', 'warning');
      return;
    }

    const { isValid, normalized, error } = normalizeIndianPhone(formData.patientPhone);
    if (!isValid) {
      Swal.fire('Invalid Mobile Number', error || 'Please enter a valid 10-digit Indian mobile number', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Add patient token to live queue
      const res = await axios.post(`${API_URL}/api/queue/add`, {
        patientId: formData.patientId || selectedProfileId || undefined,
        patientName: formData.patientName.trim(),
        patientPhone: normalized,
        doctorId: formData.doctorId,
        visitType: formData.visitType,
        isEmergency: formData.isEmergency
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        if (res.data.isFirstAppointment) {
          trackEvent('clinic_first_appointment', { clinic_id: localStorage.getItem('clinicId') || 'unknown' });
        }
        // 2. Try to sync vitals & profile details if entered
        const vitalsEntered = Object.values(formData.vitals).some(v => v.trim() !== '');
        if (vitalsEntered) {
          try {
            await axios.patch(`${API_URL}/api/staff/update-patient-vitals/${formData.patientPhone}`, {
              vitals: formData.vitals
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            // Update profile info (Age, Gender, Blood group)
            await axios.patch(`${API_URL}/api/staff/update-patient-profile/${formData.patientPhone}`, {
              age: Number(formData.patientAge),
              gender: formData.patientGender,
              bloodGroup: formData.patientBloodGroup
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (e) {
            console.error("Vitals/Profile auto-sync error:", e);
          }
        }

        Swal.fire({
          icon: formData.isEmergency ? 'warning' : 'success',
          title: formData.isEmergency ? '🚨 Emergency Token Issued' : 'Token Generated Successfully',
          html: `<p class="font-bold text-lg">Token Number: ${res.data.data?.tokenNumber || res.data.queueEntry?.tokenNumber || 'TK'}</p><p class="text-[14px] mt-2 text-slate-500">${formData.patientName} is now active in queue.</p>`,
          confirmButtonColor: '#0F766E',
          background: '#EEF6FA'
        });

        // Reset form
        setFormData({
          patientId: '',
          patientName: '',
          patientPhone: '',
          patientAge: '',
          patientGender: 'Male',
          patientBloodGroup: 'O+',
          doctorId: '',
          visitType: 'Walk-in',
          isEmergency: false,
          vitals: {
            bloodPressure: '',
            pulseRate: '',
            temperature: '',
            sugarLevel: '',
          }
        });
        setSuggestedProfiles([]);
        setSelectedProfileId(null);
        setSearchPhone('');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Action Failed', err.response?.data?.message || 'Error registering patient.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-parchment font-body text-teak flex-col md:flex-row">
      <Sidebar role="receptionist" />
      
      <div className="flex-grow flex flex-col min-h-screen overflow-y-auto pb-32 lg:pb-0">
        <main className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full flex-grow space-y-8">
          
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <button 
                onClick={() => navigate('/receptionist/dashboard')}
                className="flex items-center gap-2 text-[14px] font-bold text-khaki hover:text-marigold transition-colors mb-2 uppercase tracking-wider"
              >
                <ArrowLeft size={12} /> Back to Dashboard
              </button>
              <h1 className="text-2xl font-black tracking-tight text-teak leading-tight">Patient Entry Portal</h1>
              <p className="text-[14px] text-khaki font-medium mt-1">Register walk-in patients and generate live queue tokens instantly.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-marigold/10 text-marigold rounded-full text-[14px] font-black uppercase tracking-widest border border-marigold/10 flex items-center gap-2">
                <Sparkles size={10} className="animate-pulse" /> Live Synchronization
              </span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Section: Registration Form */}
            <div className="lg:col-span-2 space-y-4">
              <form onSubmit={handleSubmit} className="bg-white border border-sandstone rounded-[2rem] shadow-sm overflow-hidden p-5 md:p-8 space-y-6 relative">
                {formData.isEmergency && (
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500 animate-pulse"></div>
                )}

                <div className="flex justify-between items-center pb-3 border-b border-sandstone/40">
                  <h2 className="text-lg font-heading text-teak flex items-center gap-2">
                    <User size={18} className="text-marigold" /> Basic Profile Info
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] font-black text-khaki uppercase tracking-widest">Emergency Priority?</span>
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, isEmergency: !prev.isEmergency }))}
                      className={`w-12 h-6 rounded-full relative transition-all ${formData.isEmergency ? 'bg-red-500' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isEmergency ? 'left-7' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>

                {/* 1️⃣ PRIMARY ENTRY: Mobile Number (Lookup First) */}
                <div className="bg-sandstone/10 p-4 md:p-5 rounded-2xl border border-sandstone/60 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <label className="text-[13px] font-black uppercase tracking-wider text-teak flex items-center gap-1.5">
                        <Phone size={14} className="text-teal-600" /> Patient / Family Mobile Number *
                      </label>
                      <p className="text-[12px] text-khaki">Enter 10 digits to instantly retrieve all registered family members.</p>
                    </div>
                    {isSearchingProfiles && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                        <RefreshCw size={11} className="animate-spin" /> Looking up locker profiles...
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-khaki font-bold text-xs pointer-events-none">
                      <span className="text-teak">+91</span>
                      <span className="text-sandstone">|</span>
                    </div>
                    <input 
                      type="tel" 
                      required 
                      maxLength={14}
                      placeholder="e.g. 98765 43210"
                      className="w-full pl-16 pr-10 py-3 bg-white border-2 border-sandstone rounded-xl outline-none focus:border-teal-600 text-sm font-black text-teak tracking-wider transition-all"
                      value={formData.patientPhone}
                      onChange={handlePhoneChange}
                    />
                    {formData.patientPhone.replace(/\D/g, '').length >= 10 && (
                      <CheckCircle2 size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-teal-600" />
                    )}
                  </div>

                  {/* 👨‍👩‍👧‍👦 Stored Family Members / Profiles under this number */}
                  {formData.patientPhone.replace(/\D/g, '').length >= 10 && (
                    <div className="pt-2 border-t border-sandstone/40 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black uppercase tracking-widest text-teak flex items-center gap-1.5">
                          <Users size={13} className="text-teal-700" />
                          {suggestedProfiles.length > 0
                            ? `Profiles linked to this number (${suggestedProfiles.length}) — Click to Select:`
                            : 'No prior locker profiles found for this number.'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAddMemberModal(true)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-[11px] font-black uppercase tracking-wider shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                          <UserPlus size={12} /> + Add Family Member
                        </button>
                      </div>

                      {/* Profile Cards Grid */}
                      {suggestedProfiles.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                          {suggestedProfiles.map((p, idx) => {
                            const isSelected = (p._id && selectedProfileId === p._id) || (formData.patientName === p.name && !selectedProfileId);
                            return (
                              <div
                                key={p._id || idx}
                                onClick={() => handleSelectProfile(p)}
                                className={`p-3 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                                  isSelected
                                    ? 'border-teal-600 bg-teal-50/70 shadow-sm ring-2 ring-teal-600/20'
                                    : 'border-sandstone/80 bg-white hover:border-teal-400 hover:bg-teal-50/30'
                                }`}
                              >
                                <div className="flex justify-between items-start gap-1">
                                  <div className="min-w-0">
                                    <p className="font-black text-sm text-teak truncate">{p.name}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                        p.isPrimary || p.relationship === 'Self'
                                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                          : 'bg-teal-100 text-teal-800 border border-teal-200'
                                      }`}>
                                        {p.relationship || (p.isPrimary ? 'Self' : 'Member')}
                                      </span>
                                      {p.age && (
                                        <span className="text-[11px] text-khaki font-bold">
                                          {p.age} Y • {p.gender || 'M'}
                                        </span>
                                      )}
                                      {p.bloodGroup && (
                                        <span className="text-[10px] font-black text-red-700 bg-red-50 px-1 rounded border border-red-100">
                                          {p.bloodGroup}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="shrink-0 mt-0.5">
                                    {isSelected ? (
                                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs shadow-xs">
                                        <Check size={12} />
                                      </span>
                                    ) : (
                                      <span className="w-5 h-5 rounded-full border border-sandstone flex items-center justify-center text-[10px] text-khaki">
                                        ○
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {suggestedProfiles.length === 0 && !isSearchingProfiles && (
                        <p className="text-[12px] text-slate-500 italic bg-white/70 p-2.5 rounded-xl border border-sandstone/50">
                          ℹ️ No family profiles registered yet. Enter the patient name below, or click "+ Add Family Member" to save this person to the family locker.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* 2️⃣ PATIENT DETAILS (Auto-Filled from Profile Selection or Manually Entered) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-black uppercase tracking-wider text-khaki ml-2 flex items-center justify-between">
                      <span>Patient Full Name *</span>
                      {selectedProfileId && (
                        <span className="text-[10px] font-black text-teal-700 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded">
                          ✓ Linked Profile
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-khaki" />
                      <input 
                        type="text" required placeholder="e.g. Sameer Dixit"
                        className="w-full pl-10 pr-3 py-2.5 bg-parchment/30 border border-sandstone rounded-xl outline-none focus:border-marigold text-[14px] font-bold text-teak"
                        value={formData.patientName}
                        onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Visit Type */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-black uppercase tracking-wider text-khaki ml-2">Visit Type</label>
                    <select 
                      className="w-full px-3 py-2.5 bg-parchment/30 border border-sandstone rounded-xl outline-none focus:border-marigold text-[14px] font-bold text-teak"
                      value={formData.visitType}
                      onChange={(e) => setFormData(prev => ({ ...prev, visitType: e.target.value }))}
                    >
                      <option value="Walk-in">Walk-in consultation</option>
                      <option value="Appointment">Scheduled Appointment</option>
                      <option value="Follow-up">Clinical Follow-up</option>
                    </select>
                  </div>

                  {/* Age */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-black uppercase tracking-wider text-khaki ml-2">Patient Age</label>
                    <input 
                      type="number" placeholder="Age in years"
                      className="w-full px-3 py-2.5 bg-parchment/30 border border-sandstone rounded-xl outline-none focus:border-marigold text-[14px] font-bold text-teak"
                      value={formData.patientAge}
                      onChange={(e) => setFormData(prev => ({ ...prev, patientAge: e.target.value }))}
                    />
                  </div>

                  {/* Gender */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-black uppercase tracking-wider text-khaki ml-2">Biological Gender</label>
                    <select 
                      className="w-full px-3 py-2.5 bg-parchment/30 border border-sandstone rounded-xl outline-none focus:border-marigold text-[14px] font-bold text-teak"
                      value={formData.patientGender}
                      onChange={(e) => setFormData(prev => ({ ...prev, patientGender: e.target.value }))}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Blood Group */}
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[13px] font-black uppercase tracking-wider text-khaki ml-2">Blood Group</label>
                    <select 
                      className="w-full px-3 py-2.5 bg-parchment/30 border border-sandstone rounded-xl outline-none focus:border-marigold text-[14px] font-bold text-teak"
                      value={formData.patientBloodGroup}
                      onChange={(e) => setFormData(prev => ({ ...prev, patientBloodGroup: e.target.value }))}
                    >
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Vitals Input Grid */}
                <div className="space-y-3 pt-3 border-t border-sandstone/40">
                  <h2 className="text-lg font-heading text-teak flex items-center gap-2">
                    <HeartPulse size={18} className="text-teal-600" /> Walk-in Vitals (Optional)
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] font-black uppercase tracking-widest text-khaki ml-1">BP (eg. 120/80)</span>
                      <input 
                        type="text" placeholder="120/80"
                        className="px-3 py-2 bg-teal-50/10 border border-teal-100 rounded-lg outline-none focus:border-teal-600 text-[14px] font-bold text-teak placeholder:text-khaki/30"
                        value={formData.vitals.bloodPressure}
                        onChange={(e) => setFormData(prev => ({ ...prev, vitals: { ...prev.vitals, bloodPressure: e.target.value } }))}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] font-black uppercase tracking-widest text-khaki ml-1">Pulse (bpm)</span>
                      <input 
                        type="text" placeholder="72"
                        className="px-3 py-2 bg-teal-50/10 border border-teal-100 rounded-lg outline-none focus:border-teal-600 text-[14px] font-bold text-teak placeholder:text-khaki/30"
                        value={formData.vitals.pulseRate}
                        onChange={(e) => setFormData(prev => ({ ...prev, vitals: { ...prev.vitals, pulseRate: e.target.value } }))}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] font-black uppercase tracking-widest text-khaki ml-1">Temp (°F)</span>
                      <input 
                        type="text" placeholder="98.6"
                        className="px-3 py-2 bg-teal-50/10 border border-teal-100 rounded-lg outline-none focus:border-teal-600 text-[14px] font-bold text-teak placeholder:text-khaki/30"
                        value={formData.vitals.temperature}
                        onChange={(e) => setFormData(prev => ({ ...prev, vitals: { ...prev.vitals, temperature: e.target.value } }))}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] font-black uppercase tracking-widest text-khaki ml-1">Sugar (mg/dL)</span>
                      <input 
                        type="text" placeholder="100"
                        className="px-3 py-2 bg-teal-50/10 border border-teal-100 rounded-lg outline-none focus:border-teal-600 text-[14px] font-bold text-teak placeholder:text-khaki/30"
                        value={formData.vitals.sugarLevel}
                        onChange={(e) => setFormData(prev => ({ ...prev, vitals: { ...prev.vitals, sugarLevel: e.target.value } }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Practitioner Assignment */}
                <div className="space-y-3 pt-3 border-t border-sandstone/40">
                  <h2 className="text-lg font-heading text-teak flex items-center gap-2">
                    <Stethoscope size={18} className="text-sky-600" /> Assign Medical Practitioner *
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {loadingDoctors ? (
                      <div className="py-2 text-center text-[14px] animate-pulse font-medium text-slate-400">Loading Doctors...</div>
                    ) : (
                      doctors.map(doc => {
                        const onLeave = doc.isOnLeaveToday;
                        const isLive  = !onLeave && doc.isAvailable === false;
                        const liveUntilLabel = isLive && doc.liveUntilDate
                          ? new Date(doc.liveUntilDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                          : null;
                        const DAY_SHORT = { monday:'Mon', tuesday:'Tue', wednesday:'Wed', thursday:'Thu', friday:'Fri', saturday:'Sat', sunday:'Sun' };
                        const availDays = Array.isArray(doc.availableDays) && doc.availableDays.length > 0 && doc.availableDays.length < 7
                          ? doc.availableDays.map(d => DAY_SHORT[d.toLowerCase()] || d)
                          : null;
                        const isSelected = formData.doctorId === doc._id;
                        return (
                          <div
                            key={doc._id}
                            onClick={() => setFormData(prev => ({ ...prev, doctorId: doc._id }))}
                            className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-2 ${
                              isSelected
                                ? onLeave ? 'border-orange-400 bg-orange-50/30'
                                  : isLive ? 'border-red-400 bg-red-50/30'
                                  : 'border-teal-600 bg-teal-50/20'
                                : onLeave ? 'border-orange-200 bg-orange-50/10 hover:border-orange-300'
                                  : isLive ? 'border-red-200 bg-red-50/10 hover:border-red-300'
                                  : 'border-sandstone bg-parchment/10 hover:border-marigold'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-[14px] font-black text-teak leading-tight">Dr. {doc.name}</p>
                                <p className="text-[13px] font-bold text-khaki uppercase tracking-wider mt-0.5">{doc.specialization}</p>
                                {availDays && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {availDays.map(d => <span key={d} className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-bold text-slate-500">{d}</span>)}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${
                                  onLeave ? 'bg-orange-400'
                                  : isLive ? 'bg-red-500 animate-pulse'
                                  : 'bg-green-500'
                                }`} />
                                {onLeave && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-[9px] font-bold border border-orange-200">
                                    <CalendarOff size={8} /> Leave
                                  </span>
                                )}
                                {isLive && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[9px] font-bold border border-red-200">
                                    <Zap size={8} className="fill-current" /> Live
                                  </span>
                                )}
                              </div>
                            </div>
                            {(onLeave || isLive) && isSelected && (
                              <div className={`text-[11px] font-semibold rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 ${
                                onLeave ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {onLeave
                                  ? <><CalendarOff size={10} /> On leave today{doc.leaveTodayTitle ? ` — ${doc.leaveTodayTitle}` : ''}. Patient can be added but doctor may not be available.</>
                                  : <><Zap size={10} className="fill-current" /> Currently on live walk-in queue{liveUntilLabel ? ` until ${liveUntilLabel}` : ' today'}. Appointment booking may be blocked.</>
                                }
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Form Action */}
                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-3.5 rounded-xl font-black text-[14px] uppercase tracking-[0.2em] shadow-lg transition-all active:scale-[0.98] ${formData.isEmergency ? 'bg-red-600 text-white' : 'bg-marigold text-white hover:bg-teak'} disabled:opacity-50 flex items-center justify-center gap-2`}
                  >
                    {submitting ? (
                      <><RefreshCw size={12} className="animate-spin" /> Issuing Access Token...</>
                    ) : (
                      formData.isEmergency ? '🚨 Process Critical Emergency Token' : 'Generate Queue Access Token'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Section: Digital Locker Search & Lookup */}
            <div className="space-y-6">
              
              {/* Database Search Card */}
              <div className="bg-white border border-sandstone rounded-[2.5rem] p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 leading-none">Auto-Fill Sync</h3>
                  <p className="text-[14px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Lookup patient digital locker</p>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-khaki" />
                    <input 
                      type="tel" placeholder="Search 10-digit mobile..."
                      className="w-full pl-11 pr-4 py-4 bg-parchment/30 border border-sandstone rounded-2xl outline-none focus:border-marigold text-sm font-bold text-teak"
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                    />
                  </div>

                  <button 
                    onClick={handleSearchPatient}
                    disabled={searching}
                    className="w-full py-4 bg-teak hover:bg-marigold text-white rounded-2xl font-black text-[14px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                  >
                    {searching ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Search size={14} />
                    )}
                    Search Digital Locker
                  </button>
                </div>

                <div className="p-4 bg-teal-50/20 border border-teal-100 rounded-2xl flex items-start gap-3">
                  <ShieldCheck size={20} className="text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[14px] font-black text-teal-800 uppercase tracking-wider">Locker Sync Enabled</p>
                    <p className="text-[14px] text-teal-700 mt-1 leading-relaxed">If the patient has set up an Appointory health locker, searching their phone will instantly pull and auto-fill details, saving reception setup time.</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </main>
        <Footer />
      </div>
      {/* 👨‍👩‍👧‍👦 MODAL: ADD NEW FAMILY MEMBER */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-sandstone space-y-5 relative">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-heading text-lg md:text-xl text-teak flex items-center gap-2">
                  <UserPlus size={18} className="text-teal-600" /> Add Family Member
                </h3>
                <p className="text-[12px] text-khaki mt-0.5">
                  Register a family profile under mobile <span className="font-bold text-teak">+91 {(formData.patientPhone || searchPhone).replace(/\D/g, '').slice(-10)}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveNewMember} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[12px] font-black uppercase tracking-wider text-khaki">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Patel"
                  className="w-full px-3.5 py-2.5 bg-parchment/30 border border-sandstone rounded-xl outline-none focus:border-teal-600 text-sm font-bold text-teak"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                />
              </div>

              {/* Relationship & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-black uppercase tracking-wider text-khaki">Relationship *</label>
                  <select
                    className="w-full px-3 py-2.5 bg-parchment/30 border border-sandstone rounded-xl outline-none focus:border-teal-600 text-sm font-bold text-teak"
                    value={newMember.relationship}
                    onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                  >
                    <option value="Child">Child</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-black uppercase tracking-wider text-khaki">Gender</label>
                  <select
                    className="w-full px-3 py-2.5 bg-parchment/30 border border-sandstone rounded-xl outline-none focus:border-teal-600 text-sm font-bold text-teak"
                    value={newMember.gender}
                    onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Age & Blood Group */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-black uppercase tracking-wider text-khaki">Age (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="125"
                    placeholder="e.g. 12"
                    className="w-full px-3.5 py-2.5 bg-parchment/30 border border-sandstone rounded-xl outline-none focus:border-teal-600 text-sm font-bold text-teak"
                    value={newMember.age}
                    onChange={(e) => {
                      const val = e.target.value;
                      const isMin = Boolean(val && parseInt(val) < 18);
                      setNewMember({ ...newMember, age: val, isMinor: isMin });
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-black uppercase tracking-wider text-khaki">Blood Group</label>
                  <select
                    className="w-full px-3 py-2.5 bg-parchment/30 border border-sandstone rounded-xl outline-none focus:border-teal-600 text-sm font-bold text-teak"
                    value={newMember.bloodGroup}
                    onChange={(e) => setNewMember({ ...newMember, bloodGroup: e.target.value })}
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Under-18 Guardian Declaration */}
              {Boolean(newMember.age && parseInt(newMember.age) < 18) && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={newMember.guardianConsent}
                      onChange={(e) => setNewMember({ ...newMember, guardianConsent: e.target.checked })}
                      className="mt-1 accent-teal-600 rounded"
                    />
                    <span className="text-[12px] text-amber-900 font-semibold leading-snug">
                      Parent / Legal Guardian Consent Declaration (DPDP Act 2023) confirmed for minor.
                    </span>
                  </label>
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="flex-1 py-3 border border-sandstone rounded-xl text-sm font-black uppercase tracking-wider text-khaki hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMember}
                  className="flex-1 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-sm font-black uppercase tracking-wider shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {savingMember ? (
                    <><RefreshCw size={14} className="animate-spin" /> Saving...</>
                  ) : (
                    <><Check size={15} /> Save & Select</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPatient;
