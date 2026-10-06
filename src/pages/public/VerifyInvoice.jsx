import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Building2, 
  Stethoscope, 
  Printer, 
  ArrowLeft, 
  Lock
} from 'lucide-react';
import { API_URL } from '../../config/runtime';

export default function VerifyInvoice() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVerification = async () => {
      if (!id) {
        setError('Missing invoice identification parameter.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const searchParams = new URLSearchParams(window.location.search);
        const token = searchParams.get('token') || searchParams.get('t');
        const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : '';
        const res = await axios.get(`${API_URL}/api/public/verify/invoice/${id}${tokenQuery}`);
        if (res.data.success && res.data.verified) {
          setVerified(true);
          setInvoice(res.data.invoice);
        } else {
          setVerified(false);
          setError(res.data.message || 'Invoice record could not be verified.');
        }
      } catch (err) {
        console.error('Invoice verification error:', err);
        setVerified(false);
        setError(err.response?.data?.message || 'Invoice not found in the official registry. Please check the QR code or link.');
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-100 selection:text-teal-900 pb-16">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-teal-800 font-black text-lg tracking-tight hover:opacity-90 transition-opacity">
            <span className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center text-sm font-black shadow-xs">
              A
            </span>
            <span>Appointory <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">Verify</span></span>
          </Link>
          <div className="flex items-center gap-3">
            {verified && (
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200 cursor-pointer"
              >
                <Printer size={14} /> Print Certificate
              </button>
            )}
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors"
            >
              <ArrowLeft size={14} /> Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        {loading ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-slate-800">Verifying Digital Medical Invoice...</h2>
            <p className="text-xs text-slate-500">Checking cryptographically logged invoice against official clinical registry.</p>
          </div>
        ) : !verified ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-rose-200 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200">
              <ShieldAlert size={36} />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                Verification Failed
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight pt-2">Unverified Medical Invoice</h1>
              <p className="text-sm text-slate-600 max-w-md mx-auto pt-1">
                {error || 'This invoice does not exist in our authentic clinical database. It may be altered, expired, or invalid.'}
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs">
              <Link
                to="/"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
              >
                Go to Appointory Homepage
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Authenticity Banner */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                        <CheckCircle2 size={12} /> Verified Authentic Invoice
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <Lock size={10} /> Tamper-Proof
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                      Official Medical Bill Record
                    </h1>
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Invoice Number</p>
                  <p className="text-sm sm:text-base font-black font-mono text-slate-900">{invoice.invoiceNumber}</p>
                </div>
              </div>
            </div>

            {/* Invoice Certificate Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              
              {/* Clinic & Doctor Header */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-200">
                {/* Clinic Info */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-teal-800">
                    <Building2 size={14} /> Clinical Establishment
                  </div>
                  <h2 className="text-lg font-black text-slate-900">{invoice.clinic.name}</h2>
                  {invoice.clinic.address && (
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{invoice.clinic.address}</p>
                  )}
                  {invoice.clinic.contactPhone && (
                    <p className="text-xs text-slate-500 font-medium">Contact: {invoice.clinic.contactPhone}</p>
                  )}
                  <div className="pt-1">
                    {invoice.clinic.gstin ? (
                      <span className="inline-block text-[11px] font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                        GSTIN: <strong>{invoice.clinic.gstin}</strong>
                      </span>
                    ) : (
                      <span className="inline-block text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        GST-Exempt Healthcare Service (Govt Notification No. 12/2017)
                      </span>
                    )}
                  </div>
                </div>

                {/* Doctor & Practitioner Info */}
                <div className="space-y-1.5 sm:border-l sm:border-slate-100 sm:pl-6">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-teal-800">
                    <Stethoscope size={14} /> Authorized Practitioner
                  </div>
                  <h3 className="text-base font-black text-slate-900">Dr. {invoice.doctor.name}</h3>
                  <p className="text-xs text-slate-600 font-medium">Specialization: {invoice.doctor.specialization}</p>
                  {invoice.doctor.medicalLicenseNumber ? (
                    <p className="text-xs font-mono font-bold text-slate-800 bg-slate-100 inline-block px-2.5 py-1 rounded-md border border-slate-200">
                      Medical Reg / License: {invoice.doctor.medicalLicenseNumber}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">State Medical Council Registered</p>
                  )}
                  <p className="text-[10px] text-slate-500 pt-1">
                    Billed On: {new Date(invoice.billingDate).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Patient & Privacy Notice (DPDP Act) */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Patient Summary (Masked)</span>
                  <p className="font-bold text-slate-900 mt-0.5 flex flex-wrap items-center gap-1.5">
                    <span>Name: {invoice.patient.name}</span>
                    <span>•</span>
                    <span>Mobile: {invoice.patient.phone}</span>
                    {invoice.patient.id && (
                      <span className="text-[10px] font-mono text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-md border border-teal-200">
                        Patient ID: {invoice.patient.id.slice(-8).toUpperCase()}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                  <Lock size={12} className="text-teal-600 shrink-0" />
                  <span>PII masked for Digital Personal Data Protection (DPDP) Act compliance.</span>
                </div>
              </div>

              {/* Billed Items Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Itemized Clinical Services</h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">#</th>
                        <th className="py-2.5 px-3">Service / Investigation</th>
                        <th className="py-2.5 px-3 w-28">Category</th>
                        <th className="py-2.5 px-3 text-right w-24">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoice.items.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                          <td className="py-2.5 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                          <td className="py-2.5 px-3 text-slate-900 font-semibold">{item.description}</td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px] font-medium">{item.category || 'Consultation'}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{item.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals & Tax Split */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
                <div className="text-xs text-slate-600 space-y-1.5">
                  <p className="font-bold text-slate-800">Payment Breakdown:</p>
                  <p>• Payment Mode: <strong className="text-slate-900">{invoice.paymentMode}</strong></p>
                  <p>• Payment Status: <span className={`font-black ${invoice.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}`}>{invoice.paymentStatus}</span></p>
                  <p className="text-[11px] text-slate-400 italic">Verified against clinical gateway database.</p>
                </div>

                <div className="w-full sm:w-72 bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Subtotal:</span>
                    <span className="font-bold text-slate-900">₹{invoice.subtotal}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount:</span>
                      <span className="font-bold">- ₹{invoice.discount}</span>
                    </div>
                  )}

                  {/* GST / Tax Split */}
                  {invoice.tax > 0 ? (
                    <div className="space-y-1 pt-1 border-t border-slate-200">
                      <div className="flex justify-between text-slate-600 text-[11px]">
                        <span>CGST ({invoice.taxRate ? (invoice.taxRate / 2).toFixed(1) : 0}%):</span>
                        <span className="font-bold text-slate-800">+ ₹{invoice.cgst}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 text-[11px]">
                        <span>SGST ({invoice.taxRate ? (invoice.taxRate / 2).toFixed(1) : 0}%):</span>
                        <span className="font-bold text-slate-800">+ ₹{invoice.sgst}</span>
                      </div>
                      <div className="flex justify-between text-slate-700 font-semibold text-xs">
                        <span>Total Tax / GST:</span>
                        <span className="font-bold text-slate-900">+ ₹{invoice.tax}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between text-emerald-700 text-[11px] font-medium pt-1 border-t border-slate-200">
                      <span>Tax / GST:</span>
                      <span>₹0 (GST Exempt)</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t-2 border-slate-900">
                    <span>Total Amount:</span>
                    <span>₹{invoice.totalAmount}</span>
                  </div>

                  <div className="flex justify-between text-xs font-bold text-emerald-700">
                    <span>Paid Amount:</span>
                    <span>₹{invoice.paidAmount}</span>
                  </div>

                  {invoice.remainingDue > 0 && (
                    <div className="flex justify-between text-xs font-bold text-rose-600 border-t border-rose-200 pt-1">
                      <span>Balance Outstanding:</span>
                      <span>₹{invoice.remainingDue}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* TPA & Insurance Stamp Notice */}
              <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200/80 text-[11px] text-teal-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-teal-700" />
                  Mediclaim & Health Insurance Verification Guarantee
                </p>
                <p className="text-teal-800/90 leading-relaxed">
                  This document serves as an official electronic confirmation of medical services rendered. Third-Party Administrators (TPAs) and health insurers can accept this page as proof of authentic billing issued by the registered healthcare establishment.
                </p>
                <p className="text-[10px] text-teal-700/80 font-mono pt-1">
                  Verification Timestamp: {new Date(invoice.verifiedAt).toUTCString()}
                </p>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
