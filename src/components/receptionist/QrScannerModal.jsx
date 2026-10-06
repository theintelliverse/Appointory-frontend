import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  QrCode, X, Search, CheckCircle, Camera, Smartphone, AlertCircle,
  ArrowRight, Stethoscope, Receipt, User, Heart, UserPlus, Sparkles,
  RefreshCw, Droplet, ShieldCheck, Siren, Phone
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_URL } from '../../config/runtime';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'];

const QrScannerModal = ({
  isOpen,
  onClose,
  onScanSuccess,
  onSelectPatient,
  onTokenIssued,
  doctors = [],
  navigate
}) => {
  const [inputVal, setInputVal] = useState('');
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDone, setSearchDone] = useState(false);

  // Search Results
  const [cleanPhone, setCleanPhone] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);

  // New Patient Form (when not registered)
  const [newName, setNewName] = useState('');
  const [newBloodGroup, setNewBloodGroup] = useState('O+');
  const [newAge, setNewAge] = useState('');
  const [newGender, setNewGender] = useState('Male');

  // Token Issuing Options
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [isIssuingToken, setIsIssuingToken] = useState(false);

  // Camera State
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const inputRef = useRef(null);

  const token = localStorage.getItem('token');
  const clinicId = localStorage.getItem('clinicId');

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSearchDone(false);
      setProfiles([]);
      setSelectedProfile(null);
      setNewName('');
      setNewAge('');
      setNewGender('Male');
      setNewBloodGroup('O+');
      setIsEmergency(false);

      // Pre-select first available doctor if exists
      if (doctors && doctors.length > 0) {
        const availableDoc = doctors.find(d => d.isAvailable) || doctors[0];
        setSelectedDoctorId(availableDoc._id || '');
      }

      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, doctors]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const handleModalClose = () => {
    stopCamera();
    onClose();
  };

  const parseInput = (rawText) => {
    if (!rawText) return { phone: '', name: '' };
    let phone = '';
    let name = '';

    try {
      if (rawText.trim().startsWith('{')) {
        const parsed = JSON.parse(rawText);
        phone = parsed.phone || parsed.mobile || '';
        name = parsed.name || parsed.patientName || '';
      } else {
        phone = rawText.replace(/\D/g, '').slice(-10);
      }
    } catch {
      phone = rawText.replace(/\D/g, '').slice(-10);
    }

    phone = phone.replace(/\D/g, '').slice(-10);
    return { phone, name };
  };

  // 🔍 Lookup patient in Appointory database
  const executePatientLookup = async (targetPhone, prefilledName = '') => {
    const clean = (targetPhone || '').replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setError(null);
    setIsSearching(true);
    setCleanPhone(clean);

    try {
      const res = await axios.get(`${API_URL}/api/staff/patient-family-lookup/${clean}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSearchDone(true);

      if (res.data.success && Array.isArray(res.data.profiles) && res.data.profiles.length > 0) {
        setProfiles(res.data.profiles);
        // Pre-select primary or first profile
        const primary = res.data.primary || res.data.profiles[0];
        setSelectedProfile(primary);
      } else {
        // Not registered in Appointory
        setProfiles([]);
        setSelectedProfile(null);
        if (prefilledName) {
          setNewName(prefilledName);
        }
      }
    } catch (err) {
      console.error('Patient lookup failed:', err);
      setSearchDone(true);
      setProfiles([]);
      setSelectedProfile(null);
      if (prefilledName) {
        setNewName(prefilledName);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    const { phone, name } = parseInput(inputVal);
    if (!phone || phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    executePatientLookup(phone, name);
  };

  const startCamera = async () => {
    setCameraActive(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraActive(false);
      setError('Camera access denied or unavailable. Please type the 10-digit mobile number or use a barcode scanner.');
    }
  };

  // ⚡ DIRECT TOKEN ISSUANCE HANDLER
  const handleIssueToken = async () => {
    if (!selectedDoctorId) {
      Swal.fire('Assign Doctor', 'Please select a doctor to issue the queue token.', 'warning');
      return;
    }

    let patientNameToUse = '';
    let patientIdToUse = '';

    setIsIssuingToken(true);

    try {
      if (profiles.length > 0 && selectedProfile) {
        // Case A: Registered patient
        patientNameToUse = selectedProfile.name;
        patientIdToUse = selectedProfile._id || '';
      } else {
        // Case B: New Patient — Register first if name provided
        if (!newName || !newName.trim()) {
          Swal.fire('Patient Name Required', 'Please enter the patient full name to generate a token.', 'warning');
          setIsIssuingToken(false);
          return;
        }

        patientNameToUse = newName.trim();

        // Register patient in database via staff API
        try {
          const regRes = await axios.post(
            `${API_URL}/api/staff/add-patient-family`,
            {
              phone: cleanPhone,
              name: patientNameToUse,
              relationship: 'Self',
              bloodGroup: newBloodGroup === 'Unknown' ? undefined : newBloodGroup,
              age: newAge ? parseInt(newAge) : undefined,
              gender: newGender,
              isMinor: newAge ? parseInt(newAge) < 18 : false
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (regRes.data.success && regRes.data.member?._id) {
            patientIdToUse = regRes.data.member._id;
          }
        } catch (regErr) {
          console.warn('Auto-registration note:', regErr.message);
          // Non-fatal: continue with queue creation
        }
      }

      // Generate Queue Entry
      const queueRes = await axios.post(
        `${API_URL}/api/queue/add`,
        {
          clinicId,
          patientName: patientNameToUse,
          patientPhone: cleanPhone,
          doctorId: selectedDoctorId,
          visitType: 'Walk-in',
          isEmergency,
          patientId: patientIdToUse || undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (queueRes.data.success) {
        const tokenNumber = queueRes.data.data?.tokenNumber || 'Token Issued';

        Swal.fire({
          icon: isEmergency ? 'warning' : 'success',
          title: isEmergency ? '🚨 Emergency Token Issued' : '🎉 Token Generated Successfully',
          html: `
            <div style="font-size: 14px; text-align: center;">
              <p style="font-size: 28px; font-weight: 800; color: #0F766E; margin: 8px 0;">${tokenNumber}</p>
              <p style="margin: 0; color: #334155;"><strong>${patientNameToUse}</strong> is now live in the queue.</p>
              <p style="font-size: 12px; color: #64748b; margin-top: 4px;">SMS alert sent to ${cleanPhone}</p>
            </div>
          `,
          timer: 3000,
          showConfirmButton: true,
          confirmButtonColor: '#0F766E',
          confirmButtonText: 'Done',
          background: '#EEF6FA',
          customClass: { popup: 'rounded-3xl' }
        });

        if (onTokenIssued) {
          onTokenIssued();
        }
        handleModalClose();
      }
    } catch (err) {
      console.error('Queue generation error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: err.response?.data?.message || 'Could not issue token. Please try again.',
        confirmButtonColor: '#0F766E',
        background: '#EEF6FA'
      });
    } finally {
      setIsIssuingToken(false);
    }
  };

  // 📝 Fill Walk-in Form in Reception Dashboard
  const handleFillReceptionForm = () => {
    let nameToUse = '';
    let idToUse = '';

    if (profiles.length > 0 && selectedProfile) {
      nameToUse = selectedProfile.name;
      idToUse = selectedProfile._id || '';
    } else {
      nameToUse = newName.trim();
    }

    if (onSelectPatient) {
      onSelectPatient({
        phone: cleanPhone,
        name: nameToUse,
        _id: idToUse,
        bloodGroup: newBloodGroup
      });
    } else if (onScanSuccess) {
      onScanSuccess({
        phone: cleanPhone,
        name: nameToUse
      });
    }

    handleModalClose();
  };

  // 💳 Navigate to Billing / Select for Billing
  const handleProceedToBilling = () => {
    handleModalClose();
    if (onScanSuccess) {
      onScanSuccess({
        phone: cleanPhone,
        name: selectedProfile?.name || newName
      });
    } else if (navigate) {
      navigate(`/receptionist/billing?phone=${cleanPhone}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-xl md:max-w-2xl max-h-[92vh] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Handle Bar for Mobile */}
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex justify-between items-center border-b border-teal-500/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <QrCode size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg tracking-tight">Patient Search &amp; QR Check-in</h3>
              <p className="text-xs text-teal-200/80 font-normal">Appointory Instant Token &amp; Billing Desk</p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 md:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2.5 animate-in slide-in-from-top duration-200">
              <AlertCircle size={18} className="shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Camera View Box (Collapsible / Toggleable) */}
          {cameraActive ? (
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video border-2 border-teal-500 flex items-center justify-center shadow-inner">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-teal-400/50 rounded-2xl m-6 pointer-events-none animate-pulse flex items-center justify-center">
                <span className="text-xs font-bold text-teal-300 uppercase bg-slate-900/90 px-3 py-1 rounded-lg border border-teal-500/40">
                  Align Patient QR in Frame
                </span>
              </div>
              <button
                onClick={stopCamera}
                className="absolute top-3 right-3 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-bold rounded-xl border border-white/20 transition cursor-pointer"
              >
                Close Camera
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                  <Camera size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Camera QR Scanner</p>
                  <p className="text-[11px] text-slate-400">Scan QR pass using device camera</p>
                </div>
              </div>
              <button
                type="button"
                onClick={startCamera}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Camera size={14} />
                <span>Open Camera</span>
              </button>
            </div>
          )}

          {/* Primary Search Bar */}
          <form onSubmit={handleSearchSubmit} className="space-y-1.5">
            <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider">
              Search by Mobile Number or Barcode
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Smartphone size={18} />
              </div>
              <input
                ref={inputRef}
                type="tel"
                placeholder="Enter 10-digit mobile number (e.g. 9876543210)..."
                value={inputVal}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputVal(val);
                  setError(null);
                  const parsed = val.replace(/\D/g, '').slice(-10);
                  if (parsed.length === 10 && parsed !== cleanPhone) {
                    executePatientLookup(parsed);
                  }
                }}
                className="w-full pl-10 pr-24 py-3 md:py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm md:text-base font-bold text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-2 top-2 bottom-2 px-3.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isSearching ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Search size={14} />
                )}
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* SEARCH RESULT CONTENT */}
          {isSearching && (
            <div className="p-8 text-center space-y-3 bg-slate-50/70 rounded-2xl border border-slate-100">
              <RefreshCw size={24} className="animate-spin text-teal-600 mx-auto" />
              <p className="text-xs font-bold text-slate-600">Searching Appointory patient database...</p>
            </div>
          )}

          {/* CASE A: REGISTERED PATIENT FOUND */}
          {!isSearching && searchDone && profiles.length > 0 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-emerald-600" />
                  <span className="text-xs md:text-sm font-bold">
                    Registered Patient Found ({profiles.length} {profiles.length === 1 ? 'Profile' : 'Profiles'})
                  </span>
                </div>
                <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified in Appointory
                </span>
              </div>

              {/* Profiles Selection Grid */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Select Patient Visiting Today:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1">
                  {profiles.map((p, idx) => {
                    const isSelected = selectedProfile && (
                      (selectedProfile._id && selectedProfile._id === p._id) ||
                      selectedProfile.name === p.name
                    );

                    return (
                      <div
                        key={p._id || idx}
                        onClick={() => setSelectedProfile(p)}
                        className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'bg-teal-50/70 border-teal-500 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-teal-200'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {p.name?.charAt(0)?.toUpperCase() || 'P'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-sm font-bold text-slate-900 truncate">{p.name}</p>
                            <span className="text-[10px] font-semibold text-teal-700 bg-teal-100/60 px-1.5 py-0.5 rounded-md shrink-0">
                              {p.relationship || 'Self'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                            {p.age && <span>{p.age} yrs</span>}
                            {p.gender && <span>• {p.gender}</span>}
                            {p.bloodGroup && (
                              <span className="text-rose-600 font-bold flex items-center gap-0.5">
                                <Droplet size={10} /> {p.bloodGroup}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Doctor Assignment & Options */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Assign Doctor <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs md:text-sm font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                    >
                      <option value="">-- Choose Doctor --</option>
                      {doctors.map(d => (
                        <option key={d._id} value={d._id}>
                          Dr. {d.name} {!d.isAvailable ? '(On Break)' : '(Available)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl self-end">
                    <div className="flex items-center gap-2">
                      <Siren size={16} className={isEmergency ? 'text-red-600 animate-bounce' : 'text-slate-400'} />
                      <span className="text-xs font-bold text-slate-800">Priority Emergency?</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEmergency(!isEmergency)}
                      className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${
                        isEmergency ? 'bg-red-600' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        isEmergency ? 'left-6' : 'left-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isIssuingToken}
                  onClick={handleIssueToken}
                  className="sm:col-span-2 py-3 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isIssuingToken ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Generating Token...</span>
                    </>
                  ) : (
                    <>
                      <Stethoscope size={15} />
                      <span>⚡ Issue Token for {selectedProfile?.name?.split(' ')[0] || 'Patient'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleProceedToBilling}
                  className="py-3 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Receipt size={14} className="text-teal-600" />
                  <span>Billing</span>
                </button>
              </div>
            </div>
          )}

          {/* CASE B: NEW PATIENT (NOT REGISTERED IN APPOINTORY) */}
          {!isSearching && searchDone && profiles.length === 0 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-amber-900">
                <div className="flex items-center gap-2.5">
                  <UserPlus size={18} className="text-amber-600 shrink-0" />
                  <div>
                    <p className="text-xs md:text-sm font-bold">New Patient (Not registered in Appointory)</p>
                    <p className="text-[11px] text-amber-700">Mobile: {cleanPhone} · Enter details below to issue token</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                  New Walk-in
                </span>
              </div>

              {/* Form fields for Name, Blood Group, Age, Gender */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Patient Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patel"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs md:text-sm font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Blood Group
                    </label>
                    <div className="relative">
                      <select
                        value={newBloodGroup}
                        onChange={(e) => setNewBloodGroup(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs md:text-sm font-bold text-slate-800 focus:outline-none focus:border-teal-500 appearance-none"
                      >
                        {BLOOD_GROUPS.map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                      <Droplet size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Age</label>
                    <input
                      type="number"
                      placeholder="e.g. 32"
                      value={newAge}
                      onChange={(e) => setNewAge(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Gender</label>
                    <select
                      value={newGender}
                      onChange={(e) => setNewGender(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      Assign Doctor <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    >
                      <option value="">-- Choose Doctor --</option>
                      {doctors.map(d => (
                        <option key={d._id} value={d._id}>
                          Dr. {d.name} {!d.isAvailable ? '(On Break)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isIssuingToken}
                  onClick={handleIssueToken}
                  className="sm:col-span-2 py-3 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isIssuingToken ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Saving &amp; Issuing...</span>
                    </>
                  ) : (
                    <>
                      <Stethoscope size={15} />
                      <span>⚡ Register &amp; Issue Token</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleFillReceptionForm}
                  className="py-3 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Fill in Form</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-bold px-5">
          <span className="flex items-center gap-1">
            <ShieldCheck size={13} className="text-teal-600" />
            Instant Appointory Health Pass
          </span>
          <span className="hidden sm:inline">Compatible with USB Barcode Readers</span>
        </div>
      </div>
    </div>
  );
};

export default QrScannerModal;
