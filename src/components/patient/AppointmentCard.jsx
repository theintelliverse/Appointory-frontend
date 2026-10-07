import React from 'react';
import { Calendar, Clock, MapPin, ChevronRight, Stethoscope, Microscope, QrCode, FileText, Star } from 'lucide-react';

const AppointmentCard = ({ appointment, onClick, onShowQrPass, onRate }) => {
  const isLab = Boolean(appointment.isLabAppointment);
  const status = appointment.status || 'Confirmed';
  
  const statusStyles = {
    Scheduled: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Waiting: 'bg-teal-50 text-teal-700 border-teal-200',
    'Pending-Approval': 'bg-amber-50 text-amber-700 border-amber-200',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Accepted: 'bg-blue-50 text-blue-700 border-blue-200',
    Processing: 'bg-amber-50 text-amber-700 border-amber-200',
    Completed: 'bg-slate-100 text-slate-600 border-slate-200',
    Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  const apptDate = appointment.appointmentDate || appointment.createdAt;
  const dateFormatted = apptDate 
    ? new Date(apptDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Today';

  return (
    <div 
      onClick={() => onClick && onClick(appointment)}
      className="bg-white border border-slate-200 hover:border-teal-500/50 rounded-2xl p-4 transition-all duration-200 cursor-pointer active:scale-[0.99] flex flex-col gap-3 group shadow-2xs"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm border border-teal-100 shrink-0">
            {isLab ? <Microscope size={19} /> : <Stethoscope size={18} />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-slate-900 text-sm sm:text-base group-hover:text-teal-700 transition-colors leading-snug truncate">
                {isLab ? appointment.testName : (appointment.clinicName || appointment.clinicId?.name || 'Clinic Consultation')}
              </h4>
              {isLab && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 shrink-0">
                  🔬 Lab Test
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
              {isLab 
                ? (appointment.labName || 'Diagnostic Laboratory')
                : `Dr. ${appointment.doctorName || appointment.doctorId?.name || 'Consulting Specialist'}`}
            </p>
          </div>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shrink-0 ${statusStyles[status] || statusStyles.Confirmed}`}>
          {status}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600 font-medium flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} className="text-teal-600" />
            {dateFormatted}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-teal-600" />
            {isLab 
              ? (appointment.appointmentTime || 'Flexible Slot')
              : (appointment.tokenNumber ? `Token ${appointment.tokenNumber}` : 'Scheduled')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isLab && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShowQrPass?.(appointment);
              }}
              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <QrCode size={13} />
              <span>QR Pass</span>
            </button>
          )}
          {status === 'Completed' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRate?.(appointment);
              }}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title={isLab ? "Rate Diagnostic Lab" : "Rate Doctor / Clinic"}
            >
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span>{isLab ? 'Rate Lab' : 'Rate'}</span>
            </button>
          )}
          {isLab && appointment.reportUrl && (
            <a
              href={appointment.reportUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
            >
              <FileText size={13} />
              <span>Report</span>
            </a>
          )}
          <div className="flex items-center text-teal-700 font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>Details</span>
            <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
