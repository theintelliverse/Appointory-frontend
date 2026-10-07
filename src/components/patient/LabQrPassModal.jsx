import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Microscope, ShieldCheck, Printer } from 'lucide-react';

const LabQrPassModal = ({ isOpen, onClose, appointment }) => {
  const printRef = useRef(null);

  if (!isOpen || !appointment) return null;

  const qrData = JSON.stringify({
    type: 'APPOINTORY_LAB_BOOKING',
    requestId: appointment._id || appointment.requestId,
    labId: appointment.labId?._id || appointment.labId,
    patientName: appointment.patientName,
    patientPhone: appointment.patientPhone,
    testName: appointment.testName
  });

  const handlePrint = () => {
    window.print();
  };

  const statusConfig = {
    Completed: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
    Processing: { bg: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500 animate-pulse' },
    Accepted: { bg: 'bg-blue-50 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
    Pending: { bg: 'bg-slate-100 text-slate-800 border-slate-200', dot: 'bg-slate-400' }
  };

  const currentStatus = appointment.status || 'Pending';
  const cfg = statusConfig[currentStatus] || statusConfig.Pending;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Microscope size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Lab Check-In QR Pass</h3>
              <p className="text-[11px] text-teal-200/80">Digital Appointment Gateway</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Ticket */}
        <div ref={printRef} className="p-6 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border mb-1">
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            <span className={cfg.bg.split(' ')[1]}>{currentStatus}</span>
          </div>

          <div>
            <h2 className="text-xl font-heading font-black text-slate-900 leading-tight">
              {appointment.testName || 'Diagnostic Investigation'}
            </h2>
            <p className="text-xs text-teal-800 font-bold mt-1">
              {appointment.labName || 'Diagnostic Laboratory'}
            </p>
          </div>

          {/* QR Code Container */}
          <div className="p-4 bg-teal-50/50 rounded-3xl border-2 border-teal-200/80 inline-block shadow-inner mx-auto">
            <QRCodeSVG
              value={qrData}
              size={170}
              bgColor={"#FFFFFF"}
              fgColor={"#0F766E"}
              level={"H"}
              includeMargin={true}
            />
          </div>

          {/* Details Pill Box */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 text-left text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Patient</span>
              <span className="font-bold text-slate-800">{appointment.patientName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Date &amp; Slot</span>
              <span className="font-bold text-slate-800">
                {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Flexible'}
                {appointment.appointmentTime ? ` · ${appointment.appointmentTime}` : ''}
              </span>
            </div>
            {appointment.labAddress && (
              <div className="flex justify-between items-start pt-1 border-t border-slate-200/60 text-[11px]">
                <span className="text-slate-400 font-bold uppercase text-[10px] shrink-0 pr-2">Location</span>
                <span className="text-slate-600 text-right">{appointment.labAddress}</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 flex items-start gap-2 text-left text-[11px] text-teal-800">
            <ShieldCheck size={16} className="shrink-0 text-teal-600 mt-0.5" />
            <span>
              Show this pass at the sample collection counter or reception desk. Staff will scan to verify your token immediately.
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer size={14} /> Print Pass
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabQrPassModal;
