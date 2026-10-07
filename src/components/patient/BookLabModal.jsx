import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  X, Microscope, MapPin, Phone, Star, Calendar, Clock,
  CheckCircle2, Search, Camera, AlertCircle, Loader2,
  FileText, ShieldCheck, ChevronRight, Building
} from 'lucide-react';
import { API_URL } from '../../config/runtime';

const BookLabModal = ({
  isOpen,
  onClose,
  initialLabId = null,
  patientData = null,
  onSuccess,
  onShowQrPass
}) => {
  const [labs, setLabs] = useState([]);
  const [loadingLabs, setLoadingLabs] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLab, setSelectedLab] = useState(null);

  // Form State
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [testName, setTestName] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointmentTime, setAppointmentTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // QR Camera State
  const [isScanningQr, setIsScanningQr] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Initialize patient info
  useEffect(() => {
    if (patientData) {
      if (patientData.name) setPatientName(prev => prev || patientData.name);
      if (patientData.phone) setPatientPhone(prev => prev || patientData.phone);
    }
  }, [patientData]);

  // Fetch available independent labs
  useEffect(() => {
    if (isOpen) {
      const fetchLabs = async () => {
        try {
          setLoadingLabs(true);
          const res = await axios.get(`${API_URL}/api/lab-connect/public/labs`);
          if (res.data.success) {
            setLabs(res.data.data || []);
            if (initialLabId) {
              const matched = (res.data.data || []).find(l => l._id === initialLabId || l.slug === initialLabId || l.labCode === initialLabId);
              if (matched) setSelectedLab(matched);
            }
          }
        } catch (err) {
          console.error('Failed to load labs:', err);
        } finally {
          setLoadingLabs(false);
        }
      };
      fetchLabs();
    }
  }, [isOpen, initialLabId]);

  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanningQr(false);
  }, []);

  const handleModalClose = () => {
    stopCamera();
    onClose();
  };

  // QR Scanner loop
  const scanQrLoop = useCallback(async () => {
    if (!videoRef.current || !isScanningQr) return;

    if ('BarcodeDetector' in window) {
      try {
        const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const barcodes = await barcodeDetector.detect(videoRef.current);
        if (barcodes.length > 0) {
          const raw = barcodes[0].rawValue || '';
          if (raw) {
            // Check if URL contains /l/:slug
            const match = raw.match(/\/l\/([^/?#]+)/i);
            const slugOrCode = match ? match[1] : raw.trim();

            const found = labs.find(l => 
              l.slug?.toLowerCase() === slugOrCode.toLowerCase() ||
              l.labCode?.toLowerCase() === slugOrCode.toLowerCase() ||
              l._id === slugOrCode
            );

            if (found) {
              setSelectedLab(found);
              stopCamera();
              Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: `Selected ${found.labName}`,
                showConfirmButton: false,
                timer: 2000
              });
              return;
            }
          }
        }
      } catch (err) {
        console.warn('BarcodeDetector err:', err);
      }
    }

    if (isScanningQr) {
      animationFrameRef.current = requestAnimationFrame(scanQrLoop);
    }
  }, [isScanningQr, labs, stopCamera]);

  const startCamera = async () => {
    setIsScanningQr(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          animationFrameRef.current = requestAnimationFrame(scanQrLoop);
        };
      }
    } catch {
      setIsScanningQr(false);
      setCameraError('Camera access denied. Please select a diagnostic lab from the list.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLab) {
      return Swal.fire('Select Lab', 'Please select a diagnostic laboratory.', 'warning');
    }
    if (!patientName.trim() || !patientPhone.trim() || !testName.trim()) {
      return Swal.fire('Incomplete Form', 'Please enter your name, phone number, and test name.', 'warning');
    }

    try {
      setSubmitting(true);
      const res = await axios.post(`${API_URL}/api/lab-connect/public/book-appointment`, {
        labId: selectedLab._id,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        testName: testName.trim(),
        appointmentDate,
        appointmentTime,
        notes: notes.trim()
      });

      if (res.data.success) {
        const createdReq = res.data.data;
        handleModalClose();
        onSuccess?.();

        Swal.fire({
          icon: 'success',
          title: 'Lab Appointment Booked!',
          html: `
            <div style="font-size:13px; text-align:left; line-height:1.6; color:#334155;">
              <p>Your test request for <strong>${testName}</strong> at <strong>${selectedLab.labName}</strong> has been submitted.</p>
              <p style="margin-top:8px;">📅 Date: <strong>${new Date(appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</strong> at <strong>${appointmentTime}</strong></p>
              <p style="margin-top:8px; font-size:12px; color:#0f766e;">✅ A Digital QR Pass has been generated. You can show it at the lab reception desk for instant check-in.</p>
            </div>
          `,
          showCancelButton: true,
          confirmButtonColor: '#0f766e',
          cancelButtonColor: '#64748b',
          confirmButtonText: 'Show QR Pass',
          cancelButtonText: 'Done'
        }).then(result => {
          if (result.isConfirmed && onShowQrPass) {
            onShowQrPass({
              _id: createdReq._id,
              requestId: createdReq._id,
              labId: selectedLab._id,
              labName: selectedLab.labName,
              labAddress: selectedLab.address,
              labPhone: selectedLab.phone,
              testName,
              patientName: patientName.trim(),
              patientPhone: patientPhone.trim(),
              appointmentDate,
              appointmentTime,
              status: 'Pending'
            });
          }
        });
      }
    } catch (err) {
      Swal.fire('Booking Failed', err.response?.data?.message || 'Could not book lab appointment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLabs = labs.filter(l =>
    l.labName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.availableTests || []).some(t => t.testName?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white flex justify-between items-center border-b border-teal-500/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Microscope size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Book Direct Diagnostic Test</h3>
              <p className="text-xs text-teal-200/80 font-normal">Choose Diagnostic Laboratory &amp; Schedule Test</p>
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

        {/* Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-5 flex-1">
          {cameraError && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{cameraError}</span>
            </div>
          )}

          {/* QR Camera Barcode Reader */}
          {isScanningQr ? (
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video border-2 border-teal-500 flex items-center justify-center shadow-inner">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-teal-400/50 rounded-2xl m-6 pointer-events-none animate-pulse flex items-center justify-center">
                <span className="text-[11px] font-bold text-teal-300 uppercase bg-slate-900/90 px-3 py-1 rounded-lg border border-teal-500/40">
                  Scan Lab Counter QR Code
                </span>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="absolute top-3 right-3 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-bold rounded-xl border border-white/20 transition cursor-pointer"
              >
                Close Scanner
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-teal-50/50 border border-teal-200/60 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Camera size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">At the Lab Counter?</p>
                  <p className="text-[11px] text-slate-500">Scan the lab's desk QR to select it immediately</p>
                </div>
              </div>
              <button
                type="button"
                onClick={startCamera}
                className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Camera size={14} />
                <span>Scan Lab QR</span>
              </button>
            </div>
          )}

          {/* Step 1: Select Diagnostic Lab */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Building size={14} className="text-teal-600" /> 1. Select Diagnostic Lab *
              </label>
              {selectedLab && (
                <button
                  type="button"
                  onClick={() => setSelectedLab(null)}
                  className="text-[11px] font-bold text-teal-700 hover:underline cursor-pointer"
                >
                  Change Lab
                </button>
              )}
            </div>

            {selectedLab ? (
              <div className="p-3.5 bg-teal-50/80 rounded-2xl border-2 border-teal-500 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{selectedLab.labName}</span>
                    <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-black rounded-full">
                      SELECTED
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 flex items-center gap-1">
                    <MapPin size={12} className="text-teal-600 shrink-0" />
                    <span>{selectedLab.address || 'Local Diagnostic Facility'}</span>
                  </p>
                  <p className="text-xs text-slate-600 flex items-center gap-1">
                    <Phone size={12} className="text-teal-600 shrink-0" />
                    <span>{selectedLab.phone}</span>
                  </p>
                </div>
                {selectedLab.rating?.count > 0 && (
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-white px-2 py-1 rounded-lg border border-amber-200">
                    <Star size={13} fill="currentColor" />
                    <span>{selectedLab.rating.score}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by lab name, location, or test type..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-teal-500"
                  />
                </div>

                {loadingLabs ? (
                  <div className="p-6 text-center text-xs text-slate-400">Loading diagnostic labs...</div>
                ) : filteredLabs.length === 0 ? (
                  <div className="p-5 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                    No diagnostic labs found matching your search.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {filteredLabs.map(lab => (
                      <div
                        key={lab._id}
                        onClick={() => {
                          setSelectedLab(lab);
                          if (lab.availableTests && lab.availableTests.length > 0 && !testName) {
                            setTestName(lab.availableTests[0].testName);
                          }
                        }}
                        className="p-3 bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50/20 rounded-2xl cursor-pointer transition-all space-y-1 shadow-2xs group"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-slate-900 text-xs group-hover:text-teal-800 truncate pr-1">
                            {lab.labName}
                          </h4>
                          {lab.rating?.count > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
                              <Star size={11} fill="currentColor" /> {lab.rating.score}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                          <MapPin size={11} className="text-teal-600 shrink-0" />
                          <span>{lab.address}</span>
                        </p>
                        <p className="text-[10px] text-teal-700 font-semibold">
                          {(lab.availableTests || []).length} Tests listed
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Patient and Test Details Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mobile Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={patientPhone}
                  onChange={e => setPatientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-teal-500"
                />
              </div>
            </div>

            {/* Test Selection */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Diagnostic Test / Investigation *</label>
              {selectedLab?.availableTests && selectedLab.availableTests.length > 0 ? (
                <div className="space-y-2">
                  <select
                    value={testName}
                    onChange={e => setTestName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-teal-500 cursor-pointer"
                  >
                    <option value="">-- Choose Diagnostic Test --</option>
                    {selectedLab.availableTests.map((t, idx) => (
                      <option key={idx} value={t.testName}>
                        {t.testName} {t.price ? `(₹${t.price})` : ''} - {t.turnAroundHours ? `${t.turnAroundHours} hrs` : ''}
                      </option>
                    ))}
                    <option value="Other / Routine Health Screening">Other / Custom Prescription Test</option>
                  </select>

                  {testName === 'Other / Custom Prescription Test' && (
                    <input
                      type="text"
                      placeholder="Type specific test name from doctor's prescription..."
                      onChange={e => setTestName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-teal-400 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                    />
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Blood Count (CBC), Lipid Profile, Thyroid TSH"
                  value={testName}
                  onChange={e => setTestName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-teal-500"
                />
              )}
            </div>

            {/* Appointment Date & Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Preferred Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={appointmentDate}
                  onChange={e => setAppointmentDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-teal-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Preferred Time / Slot</label>
                <input
                  type="time"
                  value={appointmentTime}
                  onChange={e => setAppointmentTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-teal-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Notes / Clinical Instructions */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Clinical Notes / Fasting Status (Optional)</label>
              <textarea
                rows="2"
                placeholder="e.g. 10 hours overnight fasting, doctor suggested home collection, etc."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-teal-500 resize-none"
              />
            </div>

            <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 flex items-start gap-2 text-[11px] text-teal-800">
              <ShieldCheck size={16} className="shrink-0 text-teal-600 mt-0.5" />
              <span>
                Booking directly with independent diagnostic laboratory. Your appointment QR pass will be available in your patient dashboard immediately.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleModalClose}
                disabled={submitting}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedLab}
                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    Confirm Lab Booking
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookLabModal;
