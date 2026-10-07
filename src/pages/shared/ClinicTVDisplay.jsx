import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../../config/runtime';
import {
  Users, Stethoscope, ChevronRight, Siren,
  ArrowLeft, Clock, Activity, ShieldCheck, Wifi
} from 'lucide-react';
import SEO from '../../components/SEO';
import { API_URL } from '../../config/runtime';

const formatDoctorName = (name) => {
  if (!name) return 'Doctor';
  const trimmed = name.trim();
  if (trimmed.toLowerCase().startsWith('dr.') || trimmed.toLowerCase().startsWith('dr ')) {
    return trimmed;
  }
  return `Dr. ${trimmed}`;
};

const ClinicTVDisplay = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clinicName, setClinicName] = useState("Swasthya-Mitra Clinic");
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clinicId, setClinicId] = useState(null);

  const clinicCode = window.location.pathname.split('/').pop() || 'CITY01';

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDoctors = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/staff/public/doctors/${clinicCode}`);
      setDoctors(res.data.doctors || []);
      setClinicName(res.data.clinicName || "Clinic Waiting Lounge");

      if (res.data.clinicId) {
        let actualClinicId = res.data.clinicId;
        if (typeof actualClinicId === 'object' && actualClinicId._id) {
          actualClinicId = actualClinicId._id;
        }
        setClinicId(actualClinicId.toString());
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Syncing...");
      setLoading(false);
    }
  }, [clinicCode]);

  const fetchQueue = useCallback(async (docId) => {
    if (!docId) return;
    try {
      const res = await axios.get(`${API_URL}/api/queue/public/doctor-display/${docId}`);
      setQueue(res.data.data || []);
    } catch (err) { 
      console.error(err);
    }
  }, []);

  const socketRef = useRef(null);

  useEffect(() => {
    if (!SOCKET_URL) return;
    const newSocket = io(SOCKET_URL, { reconnection: true });
    socketRef.current = newSocket;
    return () => newSocket.disconnect();
  }, []);

  // Initial Fetch for Doctors List
  useEffect(() => {
    let ignore = false;
    const loadDoctors = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/staff/public/doctors/${clinicCode}`);
        if (ignore) return;
        setDoctors(res.data.doctors || []);
        setClinicName(res.data.clinicName || "Clinic Waiting Lounge");

        if (res.data.clinicId) {
          let actualClinicId = res.data.clinicId;
          if (typeof actualClinicId === 'object' && actualClinicId._id) {
            actualClinicId = actualClinicId._id;
          }
          setClinicId(actualClinicId.toString());
        }
        setLoading(false);
      } catch (err) {
        if (ignore) return;
        console.error(err);
        setError("Syncing...");
        setLoading(false);
      }
    };

    loadDoctors();
    return () => {
      ignore = true;
    };
  }, [clinicCode]);

  // WebSocket Live Updates
  useEffect(() => {
    if (!socketRef.current || !clinicId) return;

    socketRef.current.emit('joinClinic', clinicId);

    const handleReconnect = () => {
      console.log("🔄 Socket reconnected, re-joining clinic room:", clinicId);
      socketRef.current.emit('joinClinic', clinicId);
    };

    const handleUpdate = () => {
      console.log("⚡ Received live update from server!");
      fetchDoctors();
      if (selectedDoc) {
        fetchQueue(selectedDoc._id);
      }
    };

    socketRef.current.on('connect', handleReconnect);
    socketRef.current.on('queueUpdate', handleUpdate);
    socketRef.current.on('doctorStatusChanged', handleUpdate);

    return () => {
      socketRef.current.off('connect', handleReconnect);
      socketRef.current.off('queueUpdate', handleUpdate);
      socketRef.current.off('doctorStatusChanged', handleUpdate);
    };
  }, [clinicId, selectedDoc, fetchDoctors, fetchQueue]);

  // Fetch Queue When Selected Doctor Changes
  useEffect(() => {
    if (!selectedDoc?._id) return;
    let ignore = false;
    const loadQueue = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/queue/public/doctor-display/${selectedDoc._id}`);
        if (ignore) return;
        setQueue(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadQueue();
    return () => {
      ignore = true;
    };
  }, [selectedDoc]);

  // Loading Screen (Crisp White Theme)
  if (loading && !error) return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl shadow-teal-600/10 mb-6 border border-slate-100">
          <img src="/Appointory_logo.jpg" alt="Appointory Logo" className="w-full h-full object-cover" />
        </div>
        <div className="w-14 h-14 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin mb-6" />
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Appointory Clinic Display</h1>
        <p className="text-teal-600 font-black uppercase tracking-[0.25em] text-xs">Syncing Live Queue...</p>
      </div>
    </div>
  );

  // Doctor Selector Screen (Crisp White Theme + Appointory Branding)
  if (!selectedDoc) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-8 md:p-12 font-body text-slate-900 relative overflow-hidden flex flex-col">
        <SEO 
          title={`${clinicName} - Live Clinic TV Display | Appointory`} 
          description={`Live queue status, doctor availability, and patient tracking for ${clinicName}. Powered by Appointory.`} 
          url={`/display/${clinicCode}`} 
        />
        
        {/* Soft Background Accents */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-100/40 blur-[140px] rounded-full -mr-72 -mt-72" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/40 blur-[140px] rounded-full -ml-48 -mb-48" />
        </div>

        {/* Top Header */}
        <header className="relative z-10 mb-10 flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md shadow-teal-600/10 border border-slate-100 shrink-0">
              <img src="/Appointory_logo.jpg" alt="Appointory Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-black uppercase tracking-widest text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  Powered by Appointory
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live OPD Display</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">{clinicName}</h1>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <p className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight tabular-nums mb-1">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700">Live Sync Active</span>
            </div>
          </div>
        </header>

        {/* Doctor Grid */}
        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map(doc => (
            <button
              key={doc._id}
              onClick={() => setSelectedDoc(doc)}
              className="bg-white border-2 border-slate-200/80 hover:border-teal-500 p-8 rounded-3xl text-left hover:shadow-xl transition-all duration-300 group relative overflow-hidden flex flex-col shadow-sm cursor-pointer"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-sm">
                  <Stethoscope size={28} />
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <div className={`px-3 py-1 rounded-full flex items-center gap-2 text-[11px] font-black uppercase tracking-wider ${doc.isAvailable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${doc.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`} />
                    {doc.isAvailable ? 'Online' : 'Away'}
                  </div>
                  {doc.isAvailable && (
                    <div className="bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-teal-600">Waiting</span>
                      <span className="text-xs font-black text-teal-800">{doc.queueCount || 0}</span>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1 group-hover:text-teal-600 transition-colors">{formatDoctorName(doc.name)}</h3>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-8">{doc.specialization}</p>

              <div className="mt-auto flex justify-between items-center pt-5 border-t border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Status</span>
                  <span className="text-sm font-black text-slate-800">{doc.isAvailable ? 'Consulting Now' : 'Duty Concluded'}</span>
                </div>
                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-teal-500 group-hover:text-white transition-all">
                  <ChevronRight size={18} />
                </div>
              </div>
            </button>
          ))}
        </div>

        <footer className="mt-auto pt-8 flex items-center justify-center gap-3 text-slate-400 text-xs font-bold relative z-10">
          <img src="/Appointory_logo.jpg" alt="Appointory Logo" className="w-5 h-5 rounded object-cover opacity-80" />
          <span>Powered by <strong>Appointory</strong> • Intelligent Clinic Queue System</span>
        </footer>
      </div>
    );
  }

  const activePatient = queue.find(p => p.status === 'In-Consultation');
  const waitingPatients = queue.filter(p => p.status === 'Waiting');

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-body overflow-hidden relative">
      <SEO 
        title={`${selectedDoc ? formatDoctorName(selectedDoc.name) + ' | ' : ''}${clinicName} - Live Clinic TV Display | Appointory`} 
        description={`Live queue status, doctor availability, and patient tracking for ${clinicName}. Powered by Appointory.`} 
        url={`/display/${clinicCode}`} 
      />

      {/* Top TV Header with Doctor Info, Appointory Branding & Live Clock */}
      <header className="relative z-10 bg-white border-b border-slate-200/90 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedDoc(null)}
            className="w-11 h-11 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title="Switch Doctor"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3.5 pl-2">
            <div className="w-12 h-12 bg-gradient-to-tr from-teal-600 to-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-teal-600/20">
              <Stethoscope size={24} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">
                {formatDoctorName(selectedDoc.name)}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                  {selectedDoc.specialization}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-bold text-slate-500 truncate max-w-[200px] sm:max-w-none">{clinicName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right: Appointory Branding Badge & Digital Clock */}
        <div className="flex items-center gap-5">
          {/* Appointory Branding Badge */}
          <div className="flex items-center gap-3 px-3.5 py-1.5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/70 rounded-2xl shadow-sm">
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm border border-teal-200/60 shrink-0">
              <img src="/Appointory_logo.jpg" alt="Appointory Logo" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <span className="text-xs font-black text-slate-900 tracking-tight block leading-tight">Appointory</span>
              <span className="text-[10px] font-black text-teal-700 uppercase tracking-widest leading-none block">Smart OPD TV</span>
            </div>
          </div>

          {/* Time & Live Transmission */}
          <div className="text-right pl-4 border-l border-slate-200">
            <p className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight tabular-nums leading-none mb-1">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <div className="flex items-center justify-end gap-1.5 text-emerald-600 font-black uppercase text-[10px] tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live OPD
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area: Rebalanced with higher weightage for Right Lounge Queue (56%) */}
      <div className="relative z-10 flex-grow flex flex-col lg:flex-row overflow-hidden">

        {/* Left Side: Currently Consulting (Balanced 44% width) */}
        <div className="w-full lg:w-[44%] p-8 lg:p-12 flex flex-col justify-center items-center bg-[#F8FAFC]">
          <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border-2 border-teal-100 shadow-sm mb-8 animate-pulse">
            <Activity size={18} className="text-teal-600" />
            <p className="text-sm font-black uppercase tracking-[0.25em] text-teal-700">Currently Consulting</p>
          </div>

          {activePatient ? (
            <div className="text-center w-full max-w-xl animate-in zoom-in-95 duration-500 flex flex-col items-center">
              <div className={`mx-auto w-60 h-60 lg:w-72 lg:h-72 rounded-[3.5rem] flex flex-col items-center justify-center border-8 border-white shadow-2xl mb-6 relative group transition-all duration-700 ${
                activePatient.isEmergency 
                  ? 'bg-gradient-to-tr from-rose-600 to-red-600 text-white ring-8 ring-rose-200 shadow-rose-600/30 pulse-ring' 
                  : 'bg-gradient-to-tr from-teal-600 to-emerald-500 text-white ring-8 ring-teal-100 shadow-teal-600/30'
              }`}>
                <span className="text-xs lg:text-sm font-black uppercase tracking-[0.25em] text-white/80 mb-1">Token Number</span>
                <span className="text-7xl lg:text-8xl font-black leading-none tabular-nums tracking-tighter">{activePatient.tokenNumber}</span>
              </div>
              
              <h2 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight truncate max-w-full px-4 text-center leading-tight">
                {activePatient.patientName || `Patient #${activePatient.tokenNumber}`}
              </h2>

              {activePatient.isEmergency && (
                <div className="mt-4 inline-flex items-center gap-2.5 px-6 py-2.5 bg-rose-600 text-white rounded-xl font-black uppercase tracking-wider text-xs animate-pulse shadow-lg shadow-rose-600/30">
                  <Siren size={18} />
                  Emergency Priority
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-5">
              <div className="w-36 h-36 bg-white text-slate-400 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-slate-200 shadow-sm">
                <Clock size={60} strokeWidth={1.5} className="text-slate-400" />
              </div>
              <div>
                <p className="text-4xl font-black text-slate-800 tracking-tight uppercase mb-1">Cabin Idle</p>
                <p className="text-base font-bold text-teal-600">Waiting for next patient assignment</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Lounge Queue Dashboard (Expanded 56% width for high legibility) */}
        <div className="w-full lg:w-[56%] flex flex-col bg-white border-t lg:border-t-0 lg:border-l border-slate-200 shadow-lg overflow-hidden">
          
          {/* Queue Header */}
          <div className="p-5 lg:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-600 text-white rounded-xl shadow-md shadow-teal-600/20">
                <Users size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">Queue Dashboard</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Patients in Waiting Lounge</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-2xl font-black text-teal-600 tabular-nums leading-none">{waitingPatients.length}</span>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">In Line</span>
            </div>
          </div>

          {/* Queue Items (Spacious, high-contrast, clean cards) */}
          <div className="flex-grow overflow-y-auto p-6 space-y-3 custom-scrollbar">
            {[...Array(6)].map((_, idx) => {
              const p = waitingPatients[idx];
              if (p) {
                return (
                  <div 
                    key={p._id} 
                    className={`group px-5 py-4 rounded-2xl flex justify-between items-center border transition-all duration-300 animate-in slide-in-from-right-5 ${
                      p.isEmergency 
                        ? 'bg-rose-50 border-rose-200 shadow-sm' 
                        : 'bg-slate-50/80 hover:bg-slate-50 border-slate-200/90 hover:border-teal-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-md shrink-0 ${
                        p.isEmergency 
                          ? 'bg-gradient-to-br from-rose-600 to-red-600 text-white shadow-rose-600/20' 
                          : 'bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-teal-600/20'
                      }`}>
                        {p.tokenNumber}
                      </div>
                      <div className="min-w-0">
                        <p className="text-lg lg:text-xl font-black text-slate-900 tracking-tight truncate leading-tight group-hover:text-teal-700 transition-colors">
                          {p.patientName || `Patient #${p.tokenNumber}`}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          {p.visitType && (
                            <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                              {p.visitType}
                            </span>
                          )}
                          <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                            p.currentStage === 'Lab-Completed' ? 'bg-emerald-100 text-emerald-800' : 
                            (p.currentStage && p.currentStage.includes('Lab') ? 'bg-amber-100 text-amber-800' : 
                            (p.isEmergency ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'))
                          }`}>
                            {p.currentStage === 'Lab-Completed' ? 'Reports Ready' : 
                            (p.currentStage && p.currentStage.includes('Lab') ? 'At Lab' : 
                            (p.isEmergency ? 'High Priority' : 'Regular'))}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md uppercase">
                            Verified
                          </span>
                          {p.estimatedWait != null && (
                            <span className="text-[11px] font-black text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-md uppercase flex items-center gap-1">
                              <Clock size={11} /> Est: {p.estimatedWait}m
                            </span>
                          )}
                          {p.predictedTurnTime && (
                            <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md uppercase">
                              Turn: {p.predictedTurnTime}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={`empty-${idx}`} className="px-5 py-4 rounded-2xl flex items-center justify-between border-2 border-dashed border-slate-200 bg-slate-50/40">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-slate-300 border-2 border-dashed border-slate-200 text-lg">
                        -
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="h-4 w-36 bg-slate-200/80 rounded-md"></div>
                        <div className="h-3 w-24 bg-slate-100 rounded-md"></div>
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-3 py-1 bg-white border border-slate-200 rounded-lg">
                      Empty Slot
                    </span>
                  </div>
                );
              }
            })}
          </div>

          {/* Bottom Ticker Tape with Prominent Appointory Branding */}
          <div className="py-3 px-6 bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white overflow-hidden relative shadow-md">
            <div className="absolute top-0 left-0 bottom-0 w-24 bg-gradient-to-r from-teal-700 to-transparent z-10" />
            <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-emerald-600 to-transparent z-10" />
            <p className="text-xs font-black uppercase tracking-[0.25em] animate-marquee whitespace-nowrap inline-block pr-[100%]">
              ⚡ Powered by Appointory Smart Queue Network • Please verify your Token at Reception • Keep your Digital Locker QR code ready • Results synced automatically to your mobile profile • Maintain clinical silence
            </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes pulse-ring {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
          70% { transform: scale(1.02); box-shadow: 0 0 0 35px rgba(220, 38, 38, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
        .pulse-ring { animation: pulse-ring 3s infinite; }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
      `}} />
    </div>
  );
};

export default ClinicTVDisplay;