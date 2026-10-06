import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FileText, 
  Search, 
  Plus, 
  Trash2,
  Edit3,
  Layout,
  RefreshCw,
  ChevronRight,
  ClipboardList,
  CheckCircle,
  X
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';

import { API_URL } from '../../config/runtime';

const CATEGORIES = ['All', 'General', 'Cardio', 'Neuro', 'Endocrine', 'Pediatric', 'ENT'];
const POPULAR_CATEGORIES = ['General', 'Cardio', 'Neuro', 'Endocrine', 'Pediatric', 'ENT', 'Orthopedic', 'Dermatology'];

const normalizeCategory = (cat) => {
  if (!cat || !cat.trim()) return 'General';
  const trimmed = cat.trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'genral' || lower === 'genral medicine' || lower === 'general medicine') {
    return 'General';
  }
  return trimmed;
};

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('General');
  const [formDrugs, setFormDrugs] = useState('');
  const [formInstruction, setFormInstruction] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/staff/templates`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setTemplates(res.data.data);
        } else {
          loadLocalStorageFallback();
        }
      } catch (err) {
        console.error("Error fetching templates:", err);
        loadLocalStorageFallback();
      } finally {
        setLoading(false);
      }
    };

    const loadLocalStorageFallback = () => {
      const savedTemplates = localStorage.getItem('doctor_templates');
      if (savedTemplates) {
        setTemplates(JSON.parse(savedTemplates));
      } else {
        const defaults = [
          { id: 1, name: 'Viral Fever Protocol', drugs: 'Paracetamol 500mg, Vitamin C, Zinc', instruction: 'Post meals', category: 'General' },
          { id: 2, name: 'Acute Hypertension', drugs: 'Amlodipine 5mg, Telmisartan 40mg', instruction: 'Once daily (Morning)', category: 'Cardio' },
          { id: 3, name: 'General Cough/Cold', drugs: 'Levocetirizine 5mg, Montelukast, Cough Syrup', instruction: 'Before bed', category: 'General' },
          { id: 4, name: 'Type 2 Diabetes Control', drugs: 'Metformin 500mg, Glimepiride 1mg', instruction: 'Twice daily', category: 'Endocrine' }
        ];
        setTemplates(defaults);
        localStorage.setItem('doctor_templates', JSON.stringify(defaults));
      }
    };

    fetchTemplates();
  }, []);

  // Escape key listener for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showModal) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormName('');
    setFormCategory('General');
    setFormDrugs('');
    setFormInstruction('');
    setShowModal(true);
  };

  const handleOpenEdit = (template) => {
    setEditingTemplate(template);
    setFormName(template.name || '');
    setFormCategory(normalizeCategory(template.category) || 'General');
    setFormDrugs(template.drugs || '');
    setFormInstruction(template.instruction || '');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Delete Template?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`${API_URL}/api/staff/templates/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const updated = templates.filter(t => t._id !== id && t.id !== id);
          setTemplates(updated);
          localStorage.setItem('doctor_templates', JSON.stringify(updated));
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Template Removed',
            showConfirmButton: false,
            timer: 2000
          });
        } catch (err) {
          console.error("Error deleting template:", err);
          const updated = templates.filter(t => t._id !== id && t.id !== id);
          setTemplates(updated);
          localStorage.setItem('doctor_templates', JSON.stringify(updated));
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Template Removed',
            showConfirmButton: false,
            timer: 2000
          });
        }
      }
    });
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      Swal.fire({ icon: 'warning', title: 'Required', text: 'Protocol Name is required.' });
      return;
    }
    if (!formDrugs.trim()) {
      Swal.fire({ icon: 'warning', title: 'Required', text: 'Medicines & dosages are required.' });
      return;
    }

    const payload = {
      name: formName.trim(),
      category: formCategory.trim() ? normalizeCategory(formCategory) : 'General',
      drugs: formDrugs.trim(),
      instruction: formInstruction.trim()
    };

    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      if (editingTemplate) {
        const templateId = editingTemplate._id || editingTemplate.id;
        try {
          const res = await axios.put(`${API_URL}/api/staff/templates/${templateId}`, payload, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            const updatedT = res.data.data;
            const updated = templates.map(t => (t._id === templateId || t.id === templateId) ? updatedT : t);
            setTemplates(updated);
            localStorage.setItem('doctor_templates', JSON.stringify(updated));
          } else {
            throw new Error('Update failed');
          }
        } catch (err) {
          console.error("API update error, saving locally:", err);
          const updated = templates.map(t => (t._id === templateId || t.id === templateId) ? { ...t, ...payload } : t);
          setTemplates(updated);
          localStorage.setItem('doctor_templates', JSON.stringify(updated));
        }
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Template Updated Successfully',
          showConfirmButton: false,
          timer: 2000
        });
      } else {
        // Create new
        try {
          const res = await axios.post(`${API_URL}/api/staff/templates`, payload, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            const newT = res.data.data;
            const updated = [...templates, newT];
            setTemplates(updated);
            localStorage.setItem('doctor_templates', JSON.stringify(updated));
          } else {
            throw new Error('Create failed');
          }
        } catch (err) {
          console.error("API create error, saving locally:", err);
          const newT = { id: Date.now(), ...payload };
          const updated = [...templates, newT];
          setTemplates(updated);
          localStorage.setItem('doctor_templates', JSON.stringify(updated));
        }
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'New Template Added',
          showConfirmButton: false,
          timer: 2000
        });
      }
      handleCloseModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTemplates = templates.filter(t => {
    const tCategory = (t.category || '').toLowerCase();
    const tName = (t.name || '').toLowerCase();
    const tDrugs = (t.drugs || '').toLowerCase();
    const tInstruction = (t.instruction || '').toLowerCase();
    const normalized = normalizeCategory(t.category);

    const matchesCategory = (() => {
      if (!selectedCategory || selectedCategory === 'All') return true;
      const sel = selectedCategory.toLowerCase();
      if (sel === 'general') {
        return (
          normalized.toLowerCase() === 'general' ||
          tCategory.includes('general') ||
          tCategory.includes('genral') ||
          !t.category ||
          !t.category.trim()
        );
      }
      return tCategory.includes(sel) || normalized.toLowerCase().includes(sel);
    })();

    const matchesSearch = searchTerm
      ? tName.includes(searchTerm.toLowerCase()) || 
        tCategory.includes(searchTerm.toLowerCase()) ||
        normalized.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tDrugs.includes(searchTerm.toLowerCase()) ||
        tInstruction.includes(searchTerm.toLowerCase())
      : true;

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-body text-slate-900 flex-col md:flex-row">
      <Sidebar role="doctor" />
      <div className="flex-grow flex flex-col min-h-screen">
        <main className="px-4 md:px-8 py-8 flex-grow max-w-7xl mx-auto w-full space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Clinical Templates</h1>
              <p className="text-slate-500 flex items-center gap-2 font-medium text-sm">
                <ClipboardList size={16} className="text-indigo-500 shrink-0" />
                Manage and standardize your clinical protocols and medication sets
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-grow md:flex-grow-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Protocol name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-sm w-full md:w-60 shadow-sm transition-all"
                />
              </div>
              <button 
                onClick={handleOpenCreate}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <Plus size={16} />
                <span>New Protocol</span>
              </button>
            </div>
          </div>

          {/* Categories Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pb-1">
            {CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50/50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Templates List */}
          <div className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(i => (
                  <div key={i} className="h-48 bg-white border border-slate-100 rounded-3xl animate-pulse"></div>
                ))}
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-500">
                  <Layout size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No Templates Found</h3>
                <p className="text-slate-500 max-w-sm mx-auto text-sm mb-6">
                  {selectedCategory !== 'All' 
                    ? `No protocols found under "${selectedCategory}". Click New Protocol to add one.` 
                    : 'Create pre-defined medication sets for common conditions to speed up your workflow.'}
                </p>
                <button 
                  onClick={handleOpenCreate}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-md shadow-indigo-600/20 cursor-pointer inline-flex items-center gap-2"
                >
                  <Plus size={15} />
                  <span>Add First Template</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredTemplates.map((t) => {
                  const displayCat = normalizeCategory(t.category);
                  return (
                    <div 
                      key={t._id || t.id} 
                      className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between"
                    >
                      {/* Top Background Accent */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition-transform pointer-events-none"></div>
                      
                      <div>
                        {/* Card Top: Icon, Category Badge & Action Buttons */}
                        <div className="flex justify-between items-start mb-3 relative z-10">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100/60 shrink-0">
                              <FileText size={18} />
                            </div>
                            <span className="text-[11px] font-black text-indigo-700 uppercase tracking-wider bg-indigo-50/90 border border-indigo-100 px-2.5 py-1 rounded-lg">
                              {displayCat}
                            </span>
                          </div>

                          {/* Prominent Edit & Delete Buttons */}
                          <div className="flex items-center gap-1.5 z-10">
                            <button 
                              onClick={() => handleOpenEdit(t)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-lg text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
                              title="Edit Protocol"
                            >
                              <Edit3 size={13} />
                              <span>Edit</span>
                            </button>
                            <button 
                              onClick={() => handleDelete(t._id || t.id)}
                              className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                              title="Delete Protocol"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        
                        {/* Protocol Content */}
                        <div className="mb-4 relative z-10">
                          <h4 className="text-base font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                            {t.name}
                          </h4>
                          <p className="text-xs font-semibold text-slate-600 leading-relaxed line-clamp-2">
                            {t.drugs}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer: Instruction & Use Protocol */}
                      <div className="flex items-center justify-between gap-3 text-xs pt-3 border-t border-slate-100 mt-2 relative z-10">
                        <div className="flex items-center gap-1.5 text-slate-500 min-w-0 flex-1" title={t.instruction}>
                          <RefreshCw size={12} className="text-indigo-500 shrink-0" />
                          <span className="truncate text-slate-500 text-xs font-medium uppercase tracking-wider">
                            {t.instruction || 'As advised'}
                          </span>
                        </div>
                        <button 
                          onClick={() => navigate('/doctor/dashboard', { state: { applyTemplate: t } })}
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-black shrink-0 hover:translate-x-0.5 transition-all cursor-pointer whitespace-nowrap text-xs uppercase tracking-wider py-1 px-2.5 rounded-lg hover:bg-indigo-50"
                        >
                          <span>Use Protocol</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>

      {/* Modern React Modal for Create & Edit */}
      {showModal && createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-xl max-h-[88vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fixed Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                  {editingTemplate ? <Edit3 size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {editingTemplate ? 'Edit Clinical Template' : 'New Clinical Template'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Standardize clinical protocols and medication sets
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveTemplate} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1">
                {/* Protocol Name */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Protocol / Condition Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Viral Fever Protocol, Acute Hypertension..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Category */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                      Category
                    </label>
                    <span className="text-[11px] font-medium text-slate-400">
                      Defaults to <strong className="text-indigo-600">General</strong> if empty
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="General"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
                  />
                  {/* Quick Category Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {POPULAR_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                          formCategory.toLowerCase() === cat.toLowerCase()
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Medicines & Dosages */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                      Medicines & Dosages <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] font-medium text-slate-400">
                      Comma-separated
                    </span>
                  </div>
                  <textarea
                    required
                    rows={3}
                    value={formDrugs}
                    onChange={(e) => setFormDrugs(e.target.value)}
                    placeholder="e.g. Paracetamol 650mg, Cetirizine 10mg, ORS Sachet"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400 font-medium mt-1">
                    💡 Drugs separated by commas will auto-fill as distinct prescription lines when applied.
                  </p>
                </div>

                {/* General Instructions */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Dosage Instructions / Timing
                  </label>
                  <input
                    type="text"
                    value={formInstruction}
                    onChange={(e) => setFormInstruction(e.target.value)}
                    placeholder="e.g. Post meals, twice daily, drink plenty of water"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Fixed Action Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex gap-3 shrink-0">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  {isSubmitting ? 'Saving...' : editingTemplate ? 'Save Changes' : 'Create Template'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
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

export default Templates;
