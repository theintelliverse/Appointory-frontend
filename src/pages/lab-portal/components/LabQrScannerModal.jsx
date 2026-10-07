import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  QrCode, X, Search, CheckCircle2, Camera, Smartphone, AlertCircle,
  User, Phone, TestTube, Calendar, Clock, Loader2, ArrowRight,
  ShieldCheck, FileCheck, Plus
} from 'lucide-react';
import { API_URL } from '../../../config/runtime';

const LabQrScannerModal = ({
  isOpen,
  onClose,
  onOpenNewTest, // callback to open NewTestModal with prefilled data: ({ patientName, patientPhone }) => void
  onOpenUploadReport, // callback to open UploadReportModal for request
  onRequestUpdated // callback to refresh queue
}) => {
  const [inputVal, setInputVal] = useState('');
  const [cleanQuery, setCleanQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [error, setError] = useState(null);

  // Search Results
  const [foundRequests, setFoundRequests] = useState([]);
  const [foundPatient, setFoundPatient] = useState(null);

  // Camera State
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const inputRef = useRef(null);
  const animationFrameRef = useRef(null);

  const token = localStorage.getItem('labToken');

  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setInputVal('');
      setCleanQuery('');
      setFoundRequests([]);
      setFoundPatient(null);
      setError(null);
      setSearchDone(false);
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    } else {
      stopCamera();
    }
  }, [isOpen, stopCamera]);

  const handleModalClose = () => {
    stopCamera();
    onClose();
  };

  const parseInput = (rawText) => {
    if (!rawText) return '';
    let parsedString = rawText.trim();

    try {
      if (parsedString.startsWith('{')) {
        const obj = JSON.parse(parsedString);
        if (obj.requestId) return obj.requestId;
        if (obj.phone) return obj.phone.replace(/\D/g, '').slice(-10);
        if (obj.mobile) return obj.mobile.replace(/\D/g, '').slice(-10);
      }
    } catch {
      // not JSON, continue with raw text
    }

    // If it's a 24-char ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(parsedString)) {
      return parsedString;
    }

    // Otherwise clean phone number
    return parsedString.replace(/\D/g, '').slice(-10) || parsedString;
  };

  const executeLookup = useCallback(async (queryToSearch) => {
    const q = parseInput(queryToSearch);
    if (!q || q.length < 3) {
      setError('Please enter a 10-digit mobile number or scan a valid QR pass.');
      return;
    }

    setError(null);
    setIsSearching(true);
    setCleanQuery(q);

    try {
      const res = await axios.get(`${API_URL}/api/lab-connect/lookup-patient/${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setFoundRequests(res.data.data.requests || []);
        setFoundPatient(res.data.data.patient || null);
        setSearchDone(true);
      } else {
        setError(res.data.message || 'Lookup failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to lookup patient details.');
      setSearchDone(true);
    } finally {
      setIsSearching(false);
    }
  }, [token]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    executeLookup(inputVal);
  };

  // Browser Camera QR Detection Loop
  const scanQrLoop = useCallback(async () => {
    if (!videoRef.current || !cameraActive) return;

    if ('BarcodeDetector' in window) {
      try {
        const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const barcodes = await barcodeDetector.detect(videoRef.current);
        if (barcodes.length > 0) {
          const rawValue = barcodes[0].rawValue;
          if (rawValue) {
            stopCamera();
            setInputVal(rawValue);
            executeLookup(rawValue);
            return;
          }
        }
      } catch (err) {
        console.warn('BarcodeDetector error:', err);
      }
    }

    if (cameraActive) {
      animationFrameRef.current = requestAnimationFrame(scanQrLoop);
    }
  }, [cameraActive, stopCamera, executeLookup]);

  const startCamera = async () => {
    setCameraActive(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          animationFrameRef.current = requestAnimationFrame(scanQrLoop);
        };
      }
    } catch {
      setCameraActive(false);
      setError('Camera access denied or unavailable. Please enter the 10-digit mobile number or use a barcode scanner.');
    }
  };

  // Handle Request Status Change from Modal
  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      const res = await axios.patch(
        `${API_URL}/api/lab-connect/test-requests/${requestId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        Swal.fire({
          icon: 'success',
          title: `Status: ${newStatus}`,
          timer: 1400,
          showConfirmButton: false
        });
        setFoundRequests(prev => prev.map(r => r._id === requestId ? { ...r, status: newStatus } : r));
        onRequestUpdated?.();
      }
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleRegisterWalkIn = () => {
    const patientName = foundPatient?.name || (foundRequests.length > 0 ? foundRequests[0].patientName : '');
    const patientPhone = cleanQuery.length === 10 ? cleanQuery : (foundPatient?.phone || '');
    handleModalClose();
    onOpenNewTest?.({ patientName, patientPhone });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-xl max-h-[92vh] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle */}
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white flex justify-between items-center border-b border-teal-500/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <QrCode size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Lab Patient Search &amp; QR Check-in</h3>
              <p className="text-xs text-teal-200/80 font-normal">Appointory Diagnostic Reception Desk</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleModalClose}
            className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 md:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Camera View Box */}
          {cameraActive ? (
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video border-2 border-teal-500 flex items-center justify-center shadow-inner">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-teal-400/50 rounded-2xl m-6 pointer-events-none animate-pulse flex items-center justify-center">
                <span className="text-[11px] font-bold text-teal-300 uppercase bg-slate-900/90 px-3 py-1 rounded-lg border border-teal-500/40">
                  Align Patient QR in Frame
                </span>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="absolute top-3 right-3 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-bold rounded-xl border border-white/20 transition cursor-pointer"
              >
                Close Camera
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-teal-50/50 border border-teal-200/70 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Camera size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Camera QR Scanner</p>
                  <p className="text-[11px] text-slate-500">Scan patient digital pass or ID</p>
                </div>
              </div>
              <button
                type="button"
                onClick={startCamera}
                className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Camera size={14} />
                <span>Open Camera</span>
              </button>
            </div>
          )}

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase text-slate-600 tracking-wider">
              Search by Mobile Number, Request ID or Barcode Scanner
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Smartphone size={17} />
              </div>
              <input
                ref={inputRef}
                type="text"
                placeholder="Enter 10-digit mobile number or scan QR..."
                value={inputVal}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputVal(val);
                  setError(null);
                  const parsed = parseInput(val);
                  if (parsed.length === 10 && parsed !== cleanQuery) {
                    executeLookup(parsed);
                  }
                }}
                className="w-full pl-10 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              >
                {isSearching ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                <span>Find</span>
              </button>
            </div>
          </form>

          {/* Search Results */}
          {searchDone && (
            <div className="space-y-3.5 pt-2">
              {/* Existing Lab Requests */}
              {foundRequests.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <TestTube size={14} className="text-teal-600" />
                    Existing Test Requests at This Lab ({foundRequests.length})
                  </h4>

                  {foundRequests.map((req) => (
                    <div key={req._id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{req.testName}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              req.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              req.status === 'Processing' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              req.status === 'Accepted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                            <span className="flex items-center gap-1"><User size={12} className="text-teal-600" />{req.patientName}</span>
                            <span className="flex items-center gap-1"><Phone size={12} className="text-teal-600" />{req.patientPhone}</span>
                          </div>
                          {req.appointmentDate && (
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              📅 Scheduled: {new Date(req.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              {req.appointmentTime ? ` at ${req.appointmentTime}` : ''}
                            </p>
                          )}
                        </div>

                        <span className="text-[10px] text-slate-400 font-bold uppercase">
                          {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>

                      {/* Quick Action buttons */}
                      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200/60">
                        {req.status === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(req._id, 'Accepted')}
                            className="px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                          >
                            <CheckCircle2 size={12} /> Accept Request
                          </button>
                        )}
                        {(req.status === 'Pending' || req.status === 'Accepted') && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(req._id, 'Processing')}
                            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                          >
                            <TestTube size={12} /> Sample Collected &amp; Processing
                          </button>
                        )}
                        {(req.status === 'Accepted' || req.status === 'Processing') && (
                          <button
                            type="button"
                            onClick={() => {
                              handleModalClose();
                              onOpenUploadReport?.(req);
                            }}
                            className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                          >
                            <FileCheck size={12} /> Upload Report
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-center text-xs text-slate-500 space-y-1">
                  <p className="font-bold text-slate-700">No active test requests for this query in your lab.</p>
                  <p className="text-[11px] text-slate-400">You can register a new walk-in patient below.</p>
                </div>
              )}

              {/* Patient Appointory Profile Information */}
              {foundPatient ? (
                <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 flex items-center gap-1">
                      <ShieldCheck size={14} className="text-teal-600" /> Verified Appointory Patient
                    </span>
                    <span className="text-[11px] font-bold text-slate-600">Blood: {foundPatient.bloodGroup || 'N/A'}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{foundPatient.name}</h4>
                      <p className="text-xs text-slate-600">{foundPatient.phone} {foundPatient.gender ? `· ${foundPatient.gender}` : ''} {foundPatient.age ? `· ${foundPatient.age} yrs` : ''}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRegisterWalkIn}
                      className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Book Walk-In</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-slate-100 rounded-2xl border border-slate-200">
                  <div className="text-xs text-slate-600 font-medium">
                    <span>New walk-in patient ({cleanQuery})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRegisterWalkIn}
                    className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Register Walk-In</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabQrScannerModal;
