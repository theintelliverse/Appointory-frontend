import React from 'react';
import { Plus, X, User, Phone, TestTube, Calendar, Clock, Building, Sparkles } from 'lucide-react';

const NewTestModal = ({
  showNewTestModal,
  setShowNewTestModal,
  newTestForm,
  setNewTestForm,
  connectedClinics = [],
  handleNewTestRequest
}) => {
  if (!showNewTestModal) return null;

  const isDirect = !newTestForm.clinicId;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col transform scale-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
              <Plus size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                New Patient Request
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Register a direct walk-in patient or clinic-referred request
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setShowNewTestModal(false)} 
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Patient Booking Source / Partner Clinic */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <Building size={13} className="text-teal-600" /> Patient Source / Clinic
              </label>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isDirect ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                {isDirect ? 'Direct Lab Walk-In' : 'Referred by Clinic'}
              </span>
            </div>
            <select
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-xs font-bold text-slate-800 transition-all cursor-pointer"
              value={newTestForm.clinicId || ''}
              onChange={(e) => setNewTestForm({ ...newTestForm, clinicId: e.target.value })}
            >
              <option value="">⭐ Direct Patient / Lab Walk-In (No Clinic)</option>
              {connectedClinics.map(clinic => (
                <option key={clinic._id} value={clinic._id}>
                  🏥 {clinic.name} ({clinic.clinicCode})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              {isDirect 
                ? 'Patient is visiting or booking directly with your diagnostic facility.'
                : 'Test sample and reports will sync with the selected partner clinic.'}
            </p>
          </div>

          {/* Patient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <User size={13} className="text-teal-600" /> Patient Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh Patel"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-xs font-bold text-slate-800 transition-all"
                value={newTestForm.patientName || ''}
                onChange={(e) => setNewTestForm({ ...newTestForm, patientName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Phone size={13} className="text-teal-600" /> Patient Phone Number *
              </label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-xs font-bold text-slate-800 transition-all"
                value={newTestForm.patientPhone || ''}
                onChange={(e) => setNewTestForm({ ...newTestForm, patientPhone: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Test Name */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <TestTube size={13} className="text-teal-600" /> Test Name / Diagnostic Parameters *
            </label>
            <input
              type="text"
              placeholder="e.g. Complete Blood Count (CBC), Lipid Profile, Vitamin D3"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-xs font-bold text-slate-800 transition-all"
              value={newTestForm.testType || ''}
              onChange={(e) => setNewTestForm({ ...newTestForm, testType: e.target.value })}
              required
            />
          </div>

          {/* Appointment Date & Time (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Calendar size={13} className="text-teal-600" /> Appointment / Sample Date
              </label>
              <input
                type="date"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-teal-500 text-xs font-bold text-slate-800 cursor-pointer"
                value={newTestForm.appointmentDate || ''}
                onChange={(e) => setNewTestForm({ ...newTestForm, appointmentDate: e.target.value })}
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Clock size={13} className="text-teal-600" /> Preferred Slot / Time
              </label>
              <input
                type="time"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-teal-500 text-xs font-bold text-slate-800 cursor-pointer"
                value={newTestForm.appointmentTime || ''}
                onChange={(e) => setNewTestForm({ ...newTestForm, appointmentTime: e.target.value })}
              />
            </div>
          </div>

          {/* Clinical Notes */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
              Clinical Observations / Fasting Instructions (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="e.g. 12-hour fasting sample required, patient walk-in for routine screening..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-xs font-medium text-slate-800 resize-none transition-all"
              value={newTestForm.notes || ''}
              onChange={(e) => setNewTestForm({ ...newTestForm, notes: e.target.value })}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            {isDirect ? 'Registers directly into your lab queue' : 'Will link with selected partner clinic'}
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button 
              type="button"
              onClick={() => setShowNewTestModal(false)} 
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleNewTestRequest} 
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              {isDirect ? 'Book Direct Patient' : 'Create Clinic Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTestModal;
