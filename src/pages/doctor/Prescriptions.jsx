import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FileText,
  Search,
  Plus,
  Calendar,
  Clock,
  Printer,
  RefreshCw,
  ExternalLink,
  Stethoscope,
  Edit3,
  Pill,
  X,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  User,
  ShieldCheck
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { API_URL } from '../../config/runtime';

const emptyMed = () => ({ name: '', time: '', amount: '', total: '' });

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = create new
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([emptyMed()]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingId(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showModal) closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, closeModal]);

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/staff/all-prescriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setPrescriptions(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) fetchPrescriptions();
    });
    return () => { active = false; };
  }, [fetchPrescriptions]);

  const openCreateModal = () => {
    setEditingId(null);
    setPatientName('');
    setPatientPhone('');
    setDiagnosis('');
    setNotes('');
    setMedicines([emptyMed()]);
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditingId(p._id);
    setPatientName(p.patientName || '');
    setPatientPhone(p.patientPhone || '');
    setDiagnosis(p.diagnosis || '');
    setNotes(p.notes || '');
    setMedicines(p.medicines && p.medicines.length > 0 ? p.medicines.map(m => ({ name: m.name || '', time: m.time || '', amount: m.amount || '', total: m.total || '' })) : [emptyMed()]);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim()) {
      Swal.fire('Error', 'Patient Name and Phone are required.', 'error');
      return;
    }
    if (!diagnosis.trim()) {
      Swal.fire('Error', 'Please enter the diagnosis / illness name (bimari nu naam).', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        patientName,
        patientPhone,
        diagnosis,
        notes,
        medicines: medicines.filter(m => m.name.trim() !== '')
      };

      let res;
      if (editingId) {
        // Update existing prescription
        res = await axios.put(`${API_URL}/api/staff/update-prescription/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new prescription
        res = await axios.post(`${API_URL}/api/staff/create-prescription`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (res.data.success) {
        Swal.fire({
          icon: 'success',
          title: editingId ? 'Prescription Updated!' : 'Prescription Created!',
          timer: 1500,
          showConfirmButton: false
        });
        closeModal();
        fetchPrescriptions();
      }
    } catch (err) {
      console.error(err);
      // If update endpoint doesn't exist yet, show a helpful message
      const msg = err.response?.status === 404 && editingId
        ? 'Update endpoint not found. Please ensure backend supports PUT /api/staff/update-prescription/:id'
        : err.response?.data?.message || 'Operation failed. Please try again.';
      Swal.fire('Error', msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePrescriptionPdf = (p) => {
    try {
      const doc = new jsPDF();
      const clinicName = localStorage.getItem('clinicName') || 'Appointory Healthcare';
      const doctorName = localStorage.getItem('userName') || 'Doctor';
      const formattedDoctor = doctorName.toLowerCase().startsWith('dr') ? doctorName : `Dr. ${doctorName}`;
      const specialization = localStorage.getItem('specialization') || 'Consultant Physician';
      const patientName = p.patientName || 'Valued Patient';
      const patientPhone = p.patientPhone || 'N/A';
      const dateStr = p.createdAt
        ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      const timeStr = p.createdAt
        ? new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Top Header Banner
      doc.setFillColor(13, 148, 136); // Teal #0d9488
      doc.rect(0, 0, 210, 36, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(clinicName.toUpperCase(), 14, 16);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`${formattedDoctor} · ${specialization}`, 14, 23);
      doc.setFontSize(8.5);
      doc.text('Smart Healthcare & Clinical Consultation Center', 14, 29);

      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('MEDICAL PRESCRIPTION', 196, 16, { align: 'right' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${dateStr}`, 196, 23, { align: 'right' });
      doc.text(`Time: ${timeStr}`, 196, 29, { align: 'right' });

      // Patient Information Block
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('PATIENT DETAILS', 14, 46);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Patient Name: ${patientName}`, 14, 53);
      doc.text(`Mobile Number: ${patientPhone}`, 14, 59);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(13, 148, 136);
      doc.text(`Diagnosis: ${p.diagnosis || 'General Consultation'}`, 110, 53);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Prescription ID: #${(p._id || '').slice(-6).toUpperCase() || 'RX-001'}`, 110, 59);

      // Divider Line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, 65, 196, 65);

      // Medicines Table
      const medsList = p.medicines || [];
      const tableRows = medsList.length > 0 ? medsList.map((m, idx) => [
        idx + 1,
        m.name || 'Medicine',
        m.amount || '-',
        m.time || 'As Directed',
        m.total || '-'
      ]) : [
        ['1', 'No specific medicines recorded', '-', '-', '-']
      ];

      autoTable(doc, {
        startY: 70,
        head: [['#', 'Medicine Name', 'Dosage / Amount', 'Timing / Frequency', 'Duration / Total']],
        body: tableRows,
        theme: 'grid',
        headStyles: {
          fillColor: [13, 148, 136],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9.5
        },
        bodyStyles: { fontSize: 9, textColor: [30, 41, 59] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 }
      });

      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : 130;

      // Doctor Notes / Clinical Advice
      if (p.notes) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text('DOCTOR ADVICE / CLINICAL INSTRUCTIONS:', 14, finalY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        const splitNotes = doc.splitTextToSize(`"${p.notes}"`, 180);
        doc.text(splitNotes, 14, finalY + 6);
      }

      // Signature Area
      const sigY = Math.max(finalY + (p.notes ? 30 : 20), 240);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`${formattedDoctor}`, 196, sigY, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Authorized Medical Practitioner', 196, sigY + 5, { align: 'right' });
      doc.line(140, sigY - 2, 196, sigY - 2);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Verified digital prescription powered by Appointory.', 14, 285);
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 196, 285, { align: 'right' });

      // Save PDF and open preview in new tab
      doc.save(`Prescription_${(p.patientName || 'Patient').replace(/\s+/g, '_')}_${dateStr.replace(/\s+/g, '_')}.pdf`);
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      window.open(blobUrl, '_blank');

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Prescription PDF Created & Downloaded',
        showConfirmButton: false,
        timer: 2500
      });
    } catch (err) {
      console.error('PDF Generation Error:', err);
      Swal.fire('Error', 'Failed to generate PDF. Please try again.', 'error');
    }
  };

  const sendPrescriptionWhatsApp = async (p) => {
    let cleanPhone = (p.patientPhone || '').replace(/\D/g, '').slice(-10);

    if (!cleanPhone || cleanPhone.length !== 10) {
      const { value: enteredPhone } = await Swal.fire({
        title: 'Enter Patient Phone',
        input: 'tel',
        inputLabel: 'Patient 10-digit mobile number for WhatsApp',
        inputValue: p.patientPhone || '',
        placeholder: 'e.g. 9876543210',
        showCancelButton: true,
        confirmButtonColor: '#16a34a',
        confirmButtonText: 'Open WhatsApp',
        inputValidator: (val) => {
          const c = (val || '').replace(/\D/g, '').slice(-10);
          if (!c || c.length !== 10) return 'Please enter a valid 10-digit mobile number';
        }
      });
      if (!enteredPhone) return;
      cleanPhone = enteredPhone.replace(/\D/g, '').slice(-10);
    }

    const clinicName = localStorage.getItem('clinicName') || 'Appointory Healthcare';
    const doctorName = localStorage.getItem('userName') || 'Doctor';
    const formattedDoctor = doctorName.toLowerCase().startsWith('dr') ? doctorName : `Dr. ${doctorName}`;
    const dateStr = p.createdAt
      ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    let medsText = '';
    if (p.medicines && p.medicines.length > 0) {
      p.medicines.forEach((m, idx) => {
        medsText += `\n${idx + 1}. *${m.name}*`;
        if (m.amount) medsText += ` - Dosage: ${m.amount}`;
        if (m.time) medsText += ` | Timing: ${m.time}`;
        if (m.total) medsText += ` | Duration: ${m.total}`;
      });
    } else {
      medsText = '\nNo specific medicines listed.';
    }

    const adviceText = p.notes ? `\n\n📝 *Doctor Advice / Instructions:*\n${p.notes}` : '';

    const message = `*🏥 ${clinicName.toUpperCase()} - PRESCRIPTION*\n━━━━━━━━━━━━━━━━━━━━\n👨‍⚕️ *Doctor:* ${formattedDoctor}\n📅 *Date:* ${dateStr}\n\n👤 *Patient:* ${p.patientName || 'Patient'}\n📱 *Phone:* ${cleanPhone}\n🩺 *Diagnosis / Condition:* ${p.diagnosis || 'Clinical Consultation'}\n\n💊 *PRESCRIBED MEDICINES:*${medsText}${adviceText}\n\n━━━━━━━━━━━━━━━━━━━━\n_Please follow the dosage as instructed. For queries or appointments, contact ${clinicName}._`;

    const targetUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(targetUrl, '_blank');
  };

  const handlePrescriptionAction = async (prescription) => {
    const cleanPhone = (prescription.patientPhone || '').replace(/\D/g, '').slice(-10);
    const phoneDisplay = cleanPhone ? `+91 ${cleanPhone}` : 'No phone recorded';

    const result = await Swal.fire({
      title: 'Prescription Action',
      html: `
        <div style="text-align: left; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 14px; margin-bottom: 14px;">
          <p style="margin: 0 0 6px 0; font-size: 14px; color: #1e293b;">
            <strong style="color: #0f766e;">Patient:</strong> ${prescription.patientName || 'Valued Patient'}
          </p>
          <p style="margin: 0 0 6px 0; font-size: 14px; color: #1e293b;">
            <strong style="color: #0f766e;">Mobile:</strong> ${phoneDisplay}
          </p>
          <p style="margin: 0; font-size: 14px; color: #1e293b;">
            <strong style="color: #0f766e;">Diagnosis:</strong> ${prescription.diagnosis || 'Clinical Consultation'}
          </p>
        </div>
        <p style="font-size: 13px; font-weight: 700; color: #64748b; margin: 0;">How would you like to proceed?</p>
      `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: '📄 Generate PDF',
      denyButtonText: '💬 Send on WhatsApp',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#0d9488',
      denyButtonColor: '#16a34a',
      cancelButtonColor: '#94a3b8',
      customClass: {
        popup: 'rounded-[2rem] p-6',
        confirmButton: 'rounded-xl px-4 py-2.5 font-bold text-sm shadow-md',
        denyButton: 'rounded-xl px-4 py-2.5 font-bold text-sm shadow-md',
        cancelButton: 'rounded-xl px-4 py-2.5 font-semibold text-sm'
      }
    });

    if (result.isConfirmed) {
      generatePrescriptionPdf(prescription);
    } else if (result.isDenied) {
      sendPrescriptionWhatsApp(prescription);
    }
  };

  // Filter by diagnosis OR phone
  const filteredPrescriptions = (prescriptions || []).filter(p => {
    if (!p) return false;
    const diag = p.diagnosis || '';
    const phone = p.patientPhone || '';
    const name = p.patientName || '';
    return (
      diag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm) ||
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-body text-slate-900 flex-col md:flex-row">
      <Sidebar role="doctor" />
      <div className="flex-grow flex flex-col min-h-screen">
        <main className="px-4 md:px-8 py-8 flex-grow max-w-7xl mx-auto w-full space-y-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">Prescription Records</h1>
              <p className="text-slate-500 flex items-center gap-2 font-medium">
                <Stethoscope size={16} className="text-teal-500" />
                Manage clinical prescriptions by illness / diagnosis
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-grow md:flex-grow-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by illness or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-teal-500 text-sm w-full md:w-64 shadow-sm transition-all"
                />
              </div>
              <button
                onClick={fetchPrescriptions}
                className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-2xl text-[14px] font-black uppercase tracking-widest hover:bg-teal-700 transition-all active:scale-95 shadow-lg shadow-teal-600/20 whitespace-nowrap"
              >
                <Plus size={16} /> Add New Record
              </button>
            </div>
          </div>

          {/* Prescriptions List */}
          <div className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-56 bg-white border border-slate-100 rounded-[2rem] animate-pulse"></div>
                ))}
              </div>
            ) : filteredPrescriptions.length === 0 ? (
              <div className="bg-white rounded-[2rem] border border-slate-200 p-20 text-center shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-200">
                  <FileText size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Prescriptions Yet</h3>
                <p className="text-slate-500 max-w-xs mx-auto">History of issued prescriptions will be listed here for quick access and reprinting.</p>
                <button
                  onClick={openCreateModal}
                  className="mt-8 px-8 py-3 bg-teal-600 text-white rounded-2xl text-[14px] font-black uppercase tracking-widest hover:bg-teal-700 transition-all active:scale-95 shadow-lg shadow-teal-600/20"
                >
                  Add New Prescription
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrescriptions.map((p) => (
                  <div key={p._id} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
                    <div>
                      {/* Top: Icon + Actions (WhatsApp & Print/PDF) */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
                          <Stethoscope size={22} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => sendPrescriptionWhatsApp(p)}
                            className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
                            title="Send on WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePrescriptionAction(p)}
                            className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:text-teal-600 hover:bg-teal-50 transition-all shadow-sm active:scale-95 cursor-pointer"
                            title="Print / Share Options"
                          >
                            <Printer size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Patient Banner (Stored in Patient Locker) */}
                      <div className="mb-4 pb-3 border-b border-slate-100/90 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-black uppercase tracking-wider mb-0.5">
                            <User size={12} className="text-teal-600 shrink-0" />
                            <span className="truncate">Patient Record</span>
                          </div>
                          <h3 className="text-base font-black text-slate-900 tracking-tight truncate">
                            {p.patientName || 'Valued Patient'}
                          </h3>
                          <p className="text-xs font-mono font-bold text-slate-500">
                            {p.patientPhone ? `+91 ${p.patientPhone.replace(/\D/g, '').slice(-10)}` : 'No phone recorded'}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0" title="This prescription is permanently archived in the patient's personal Health Locker">
                          <ShieldCheck size={11} /> Stored in Locker
                        </span>
                      </div>

                      {/* Diagnosis / Clinical Condition - Primary */}
                      <div className="mb-4">
                        <span className="text-[12px] font-black text-teal-600 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                          <AlertCircle size={12} /> Diagnosis / Condition
                        </span>
                        <h4 className="text-xl font-black text-slate-900 leading-tight tracking-tight">
                          {p.diagnosis || <span className="text-slate-300 font-bold italic">No diagnosis recorded</span>}
                        </h4>
                      </div>

                      {/* Notes if any */}
                      {p.notes && (
                        <p className="text-[14px] text-slate-400 font-medium mb-4 line-clamp-2 leading-relaxed border-l-2 border-slate-100 pl-3">
                          {p.notes}
                        </p>
                      )}

                      {/* Date / Time */}
                      <div className="flex items-center justify-between text-[14px] font-bold py-2.5 px-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Calendar size={12} className="text-teal-500" />
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Clock size={12} className="text-teal-500" />
                          {p.createdAt ? new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </div>
                      </div>

                      {/* Medicines preview */}
                      {p.medicines && p.medicines.length > 0 && (
                        <div className="mb-4 space-y-1.5">
                          <p className="text-[14px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Pill size={10} /> Medicines ({p.medicines.length})</p>
                          <div className="bg-slate-50/60 p-2.5 rounded-xl border border-slate-100/80 space-y-1">
                            {p.medicines.slice(0, 3).map((m, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[14px] font-bold text-slate-700">
                                <span className="truncate">{m.name}</span>
                                <span className="text-[14px] bg-white border border-slate-100 px-2 py-0.5 rounded-lg text-teal-600 whitespace-nowrap ml-2">{m.amount}{m.time ? ` | ${m.time}` : ''}</span>
                              </div>
                            ))}
                            {p.medicines.length > 3 && (
                              <p className="text-[14px] text-slate-400 font-bold text-center pt-1">+{p.medicines.length - 3} more medicines</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-2 pt-4 border-t border-slate-50">
                      {/* Update Button */}
                      <button
                        onClick={() => openEditModal(p)}
                        className="flex-1 py-3 bg-teal-50 border-2 border-teal-100 rounded-2xl text-[14px] font-black text-teal-700 uppercase tracking-widest hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Edit3 size={12} /> Update
                      </button>
                      {/* View Patient */}
                      <button
                        onClick={() => navigate(`/doctor/records?phone=${p.patientPhone}`)}
                        className="flex-1 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[14px] font-black text-slate-600 uppercase tracking-widest hover:border-slate-300 hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink size={12} /> Patient File
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Floating Add Button */}
          <button
            onClick={openCreateModal}
            className="fixed bottom-8 right-8 w-14 h-14 bg-teal-600 text-white rounded-2xl shadow-2xl shadow-teal-600/40 flex items-center justify-center hover:bg-teal-700 transition-all active:scale-90 z-50 border-4 border-white"
            title="Add New Prescription"
          >
            <Plus size={24} />
          </button>

        </main>
        <Footer />
      </div>

      {/* Create / Update Prescription Modal */}
      {showModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl sm:rounded-[2rem] border border-slate-100 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${editingId ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-teal-50 text-teal-600 border border-teal-100'}`}>
                  {editingId ? <Edit3 size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                    {editingId ? 'Update Prescription' : 'New Prescription Record'}
                  </h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    {editingId ? 'Edit clinical diagnosis, medicines and notes' : 'Issue new clinical medication order'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-all cursor-pointer"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">

                {/* ---- CLINICAL DIAGNOSIS / CONDITION FIELD ---- */}
                <div className="p-4 sm:p-5 bg-teal-50/70 border border-teal-200/80 rounded-2xl space-y-2">
                  <label className="block text-xs font-black text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope size={15} className="text-teal-600" /> Clinical Diagnosis / Condition *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Viral Fever, Hypertension, Type-2 Diabetes, Acute Bronchitis..."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full bg-white border border-teal-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition-all text-slate-800 placeholder:text-slate-400 shadow-xs"
                  />
                </div>

              {/* Patient Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-teal-600 focus:bg-white transition-all text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Patient Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-teal-600 focus:bg-white transition-all text-slate-800"
                  />
                </div>
                <div className="col-span-1 md:col-span-2 p-3 bg-teal-50/70 border border-teal-200/60 rounded-xl flex items-center justify-between text-xs text-teal-900">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-teal-600 shrink-0" />
                    <span>
                      <strong>Digital Health Locker Sync:</strong> Automatically links & stores this prescription for the patient's phone ({patientPhone ? `+91 ${patientPhone.replace(/\D/g, '').slice(-10)}` : 'entered above'}) in their permanent record.
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Observational Notes</label>
                <textarea
                  placeholder="Additional clinical notes about the patient's condition, allergies or advice..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm font-medium outline-none focus:border-teal-600 focus:bg-white transition-all text-slate-800 resize-none"
                />
              </div>

              {/* Prescribed Medicines */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Pill size={15} className="text-teal-600" /> Prescribed Medicines, Dosage & Course Duration
                  </label>
                  <button
                    type="button"
                    onClick={() => setMedicines([...medicines, emptyMed()])}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3.5 py-1.5 rounded-xl border border-teal-200/80 transition-all flex items-center gap-1.5 uppercase tracking-wider whitespace-nowrap self-start sm:self-auto shadow-xs cursor-pointer"
                  >
                    <Plus size={14} /> Add Medicine
                  </button>
                </div>

                {/* Column Headers for Large Screens */}
                <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-1 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  <span className="sm:col-span-4">Medicine Name & Strength</span>
                  <span className="sm:col-span-2">Dosage</span>
                  <span className="sm:col-span-3">Duration / Course</span>
                  <span className="sm:col-span-3">Timing & Clinical Instructions</span>
                </div>

                {/* Medicines Input Rows */}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {medicines.map((m, idx) => (
                    <div key={idx} className="flex flex-col sm:grid sm:grid-cols-12 gap-2.5 sm:gap-3 items-center bg-slate-50/80 p-3 sm:p-2.5 rounded-2xl border border-slate-200/80 group transition-all hover:bg-white hover:border-teal-300 hover:shadow-xs">
                      
                      {/* Medicine Name */}
                      <div className="w-full sm:col-span-4">
                        <label className="block text-[10px] font-bold text-slate-400 sm:hidden mb-1">Medicine Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Paracetamol 650mg"
                          value={m.name}
                          onChange={(e) => {
                            const updated = [...medicines];
                            updated[idx].name = e.target.value;
                            setMedicines(updated);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-teal-600 transition-all text-slate-800"
                        />
                      </div>

                      {/* Dosage */}
                      <div className="w-full sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 sm:hidden mb-1">Dosage</label>
                        <input
                          type="text"
                          placeholder="e.g. 1 Tab / 5ml"
                          value={m.amount}
                          onChange={(e) => {
                            const updated = [...medicines];
                            updated[idx].amount = e.target.value;
                            setMedicines(updated);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-teal-600 transition-all text-slate-800"
                        />
                      </div>

                      {/* Duration / Course */}
                      <div className="w-full sm:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-400 sm:hidden mb-1">Duration / Days</label>
                        <div className="space-y-1">
                          <select
                            value={['3 Days', '5 Days', '7 Days', '10 Days', '14 Days', '30 Days', 'SOS / As Needed'].includes(m.total) ? m.total : (m.total ? 'CUSTOM' : '')}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = [...medicines];
                              if (val === 'CUSTOM') {
                                updated[idx].total = '';
                              } else {
                                updated[idx].total = val;
                              }
                              setMedicines(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600 mb-1"
                          >
                            <option value="">-- Select Course --</option>
                            <option value="3 Days">3 Days</option>
                            <option value="5 Days">5 Days</option>
                            <option value="7 Days">7 Days (1 Wk)</option>
                            <option value="10 Days">10 Days</option>
                            <option value="14 Days">14 Days (2 Wks)</option>
                            <option value="30 Days">30 Days (1 Mo)</option>
                            <option value="SOS / As Needed">SOS / As Needed</option>
                            <option value="CUSTOM">✏️ Custom Course...</option>
                          </select>
                          <input
                            type="text"
                            placeholder="e.g. 5 Days"
                            value={m.total}
                            onChange={(e) => {
                              const updated = [...medicines];
                              updated[idx].total = e.target.value;
                              setMedicines(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-teal-600 transition-all text-slate-800"
                          />
                        </div>
                      </div>

                      {/* Timing / Instructions */}
                      <div className="w-full sm:col-span-3 flex items-center gap-2">
                        <div className="flex-grow space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 sm:hidden mb-1">Timing & Instructions</label>
                          <select
                            value={['After Food (1-0-1)', 'Before Meals (1-0-0)', 'Morning & Night (1-0-1)', 'Once Daily (Morning)', 'At Bedtime (0-0-1)', 'After Meals (Post-food)', 'Before Meals (Pre-food)', 'As Needed (SOS)'].includes(m.time) ? m.time : (m.time ? 'CUSTOM' : '')}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = [...medicines];
                              if (val === 'CUSTOM') {
                                updated[idx].time = '';
                              } else {
                                updated[idx].time = val;
                              }
                              setMedicines(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600 mb-1"
                          >
                            <option value="">-- Quick Timing --</option>
                            <option value="After Food (1-0-1)">After Food (1-0-1)</option>
                            <option value="Before Meals (1-0-0)">Before Meals (1-0-0)</option>
                            <option value="Morning & Night (1-0-1)">Morning & Night (1-0-1)</option>
                            <option value="Once Daily (Morning)">Once Daily (Morning)</option>
                            <option value="At Bedtime (0-0-1)">At Bedtime (0-0-1)</option>
                            <option value="After Meals (Post-food)">After Meals (Post-food)</option>
                            <option value="Before Meals (Pre-food)">Before Meals (Pre-food)</option>
                            <option value="As Needed (SOS)">As Needed (SOS)</option>
                            <option value="CUSTOM">✏️ Custom...</option>
                          </select>

                          <input
                            type="text"
                            placeholder="e.g. After Food"
                            value={m.time}
                            onChange={(e) => {
                              const updated = [...medicines];
                              updated[idx].time = e.target.value;
                              setMedicines(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-teal-600 transition-all text-slate-800"
                          />
                        </div>
                        {medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setMedicines(medicines.filter((_, i) => i !== idx))}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shrink-0 mt-4 sm:mt-0 cursor-pointer"
                            title="Remove Medicine"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Preset Timing Suggestions */}
                <div className="pt-1 space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Quick Timing Suggestions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'After Food (1-0-1)',
                      'Before Meals (1-0-0)',
                      'Once Daily (Morning)',
                      'At Bedtime (0-0-1)',
                      'As Needed (SOS)',
                      'Twice Daily After Meals'
                    ].map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => {
                          const updated = [...medicines];
                          const lastIdx = updated.length - 1;
                          if (lastIdx >= 0) {
                            updated[lastIdx].time = preset;
                            setMedicines(updated);
                          }
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-teal-600 hover:text-white text-slate-600 rounded-lg text-[11px] font-semibold border border-slate-200 transition-all"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              </div>

              {/* Fixed Action Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex gap-3 shrink-0">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-3.5 text-white rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer ${editingId ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'}`}
                >
                  {isSubmitting ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  {isSubmitting ? 'Saving...' : editingId ? 'Update Prescription' : 'Issue Prescription'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Prescriptions;
