import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  ChevronRight, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Plus, 
  Syringe, 
  Info, 
  Search,
  Edit2,
  FilePlus,
  Stethoscope,
  Trash2
} from 'lucide-react';
import { storeImmunizationRecord, updateImmunizationRecord, enrollCustomVaccine, unenrollCustomVaccine, lookupVaccines } from '../../services/api';
import { useDialog } from '../../context/DialogContext';

const ImmunizationLedger = ({ roadmap = [], patientId, onRecordAdded }) => {
  const { alert, confirm } = useDialog();
  const [currentUser] = useState(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [lookupData, setLookupData] = useState({ standard: [], medicines: [], history_presets: {} });
  const [formData, setFormData] = useState({
    vaccine_name: '',
    manufacturer: '',
    lot_number: '',
    administered_at: new Date().toISOString().split('T')[0],
    administered_by: '',
    site: 'Left Deltoid',
    route: 'IM',
    vis_edition_date: '',
    vis_provided_date: '',
    cvx_code: '',
    remarks: '',
    amendment_reason: '',
  });

  const [enrollData, setEnrollData] = useState({
    vaccine_name: '',
    doses_required: 1,
    target_age_months: 6,
    scope: 'PATIENT',
    description: '',
  });

  const [presetAvailable, setPresetAvailable] = useState(null);

  useEffect(() => {
    const fetchLookup = async () => {
      try {
        const res = await lookupVaccines(1); 
        setLookupData(res);
      } catch (err) {
        console.error("Failed to fetch vaccine lookup", err);
      }
    };
    fetchLookup();
  }, []);

  const handleAdministerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      ...formData,
      vaccine_name: selectedVaccine?.isManual ? formData.vaccine_name : selectedVaccine?.vaccine_name,
      dose_number: selectedVaccine?.dose_number || 1,
    };

    try {
      if (isEditMode && selectedVaccine?.id) {
        await updateImmunizationRecord(patientId, selectedVaccine.id, payload);
      } else {
        await storeImmunizationRecord(patientId, payload);
      }
      setShowAdminModal(false);
      if (onRecordAdded) onRecordAdded();
    } catch (err) {
      console.error("Failed to record immunization", err);
      const msg = err.response?.data?.message || "Operation Failed: Please check clinical requirements.";
      await alert({
        title: 'Operation Failed',
        message: msg
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await enrollCustomVaccine(patientId, enrollData);
      setShowEnrollModal(false);
      if (onRecordAdded) onRecordAdded();
    } catch (err) {
      console.error("Failed to enroll vaccine", err);
      await alert({
        title: 'Enrollment Failed',
        message: err.response?.data?.message || "Could not add requirement to roadmap."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequirement = async (vaccineName) => {
    const ok = await confirm({
        title: 'Revoke Requirement?',
        message: `Are you sure you want to remove ${vaccineName} from the child's immunization roadmap? This will cancel all future scheduled doses for this vaccine.`,
        confirmText: 'Yes, Revoke',
        confirmStyle: 'danger'
    });

    if (ok) {
        try {
            await unenrollCustomVaccine(patientId, vaccineName);
            if (onRecordAdded) onRecordAdded();
        } catch (err) {
            console.error("Failed to delete requirement", err);
            await alert({
                title: 'Revocation Failed',
                message: "Could not remove card. This may be a standard DOH requirement which cannot be deleted."
            });
        }
    }
  };

  const openAdminModal = (vaccine = null, editItem = null) => {
    const isManual = !vaccine && !editItem;
    setIsEditMode(!!editItem);
    setSelectedVaccine(editItem ? { ...editItem, isManual: false } : (vaccine ? { ...vaccine, isManual: false } : { isManual: true }));
    
    const baseData = editItem || vaccine || {};
    
    setFormData({
      vaccine_name: baseData.vaccine_name || '',
      manufacturer: baseData.manufacturer || '',
      lot_number: baseData.lot_number || '',
      administered_at: baseData.administered_at ? new Date(baseData.administered_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      administered_by: baseData.administered_by || currentUser?.name || '',
      site: baseData.site || 'Left Deltoid',
      route: baseData.route || 'IM',
      vis_edition_date: baseData.vis_edition_date ? new Date(baseData.vis_edition_date).toISOString().split('T')[0] : '',
      vis_provided_date: baseData.vis_provided_date ? new Date(baseData.vis_provided_date).toISOString().split('T')[0] : '',
      cvx_code: baseData.cvx_code || '',
      remarks: baseData.remarks || '',
      amendment_reason: '',
    });
    setPresetAvailable(null);
    setShowAdminModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'vaccine_name' || name === 'vaccine') {
       const vName = value || selectedVaccine?.name;
       if (vName && lookupData.history_presets[vName]) {
          setPresetAvailable(lookupData.history_presets[vName]);
       } else {
          setPresetAvailable(null);
       }
    }

    if (name === 'lot_number' && value.length > 2) {
        for (const med of lookupData.medicines) {
            const foundLot = med.lots?.find(l => l.lot_number === value);
            if (foundLot) {
                setFormData(prev => ({
                    ...prev,
                    manufacturer: foundLot.manufacturer || prev.manufacturer,
                    vis_edition_date: foundLot.vis_edition_date || prev.vis_edition_date,
                    cvx_code: foundLot.cvx_code || prev.cvx_code,
                }));
                break;
            }
        }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ADMINISTERED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'OVERDUE': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ADMINISTERED': return <CheckCircle2 className="w-4 h-4" />;
      case 'OVERDUE': return <AlertTriangle className="w-4 h-4" />;
      case 'PENDING': return <Clock className="w-4 h-4" />;
      default: return null;
    }
  };

  const isDoctor = currentUser?.role === 'DOCTOR';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-his-green-500" />
          Clinical Immunization Roadmap
        </h3>
        <div className="flex items-center gap-4">
            {isDoctor && (
                <button 
                  onClick={() => setShowEnrollModal(true)}
                  className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2"
                >
                  <FilePlus size={10} />
                  Add Requirement
                </button>
            )}
            <button 
                onClick={() => openAdminModal(null)}
                className="text-[9px] font-black text-his-green-600 uppercase tracking-widest bg-his-green-50 px-3 py-1.5 rounded-full border border-his-green-100 hover:bg-his-green-500 hover:text-white transition-all flex items-center gap-2"
            >
                <Plus size={10} />
                Record Other
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roadmap.map((item, idx) => (
          <div 
            key={idx} 
            className={`p-5 rounded-3xl border transition-all duration-300 group ${getStatusColor(item.status)}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                 <div className={`p-1.5 rounded-lg bg-white/50 border border-white/20`}>
                   {getStatusIcon(item.status)}
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest">{item.status}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.status === 'ADMINISTERED' && isDoctor && (
                   <button 
                    onClick={() => openAdminModal(null, item.history?.[0])}
                    className="p-1.5 hover:bg-white/60 rounded-lg text-slate-400 hover:text-his-green-500 transition-all"
                    title="Edit Administration Record"
                   >
                     <Edit2 size={12} />
                   </button>
                )}
                {item.source && item.source.startsWith('CUSTOM_') && isDoctor && (
                    <button 
                        onClick={() => handleDeleteRequirement(item.vaccine_name)}
                        className="p-1.5 hover:bg-rose-100 rounded-lg text-rose-300 hover:text-rose-600 transition-all"
                        title="Delete Custom Requirement"
                    >
                        <Trash2 size={12} />
                    </button>
                )}
                <span className="text-[9px] font-black uppercase opacity-60">
                   {item.doses_administered} / {item.doses_required} Doses
                </span>
              </div>
            </div>
            
            <h4 className="text-sm font-black text-slate-900 leading-tight mb-1">{item.vaccine_name}</h4>
            <p className="text-[10px] font-bold text-slate-500 mb-4 opacity-80">
                Target: {item.target_month} Months Old
            </p>

            {item.status !== 'ADMINISTERED' && (
              <button 
                onClick={() => openAdminModal(item)}
                className="w-full mb-4 py-2.5 bg-white/40 hover:bg-white border border-white/60 hover:border-white rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-700 transition-all flex items-center justify-center gap-2 group/btn"
              >
                <Plus className="w-3 h-3 group-hover/btn:rotate-90 transition-transform" />
                Record Administration
              </button>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-black/5">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-tighter opacity-50 text-slate-400">Source Portfolio</span>
                    <span className="text-[10px] font-black text-slate-900">{item.source || 'PH DOH NIP'}</span>
                </div>
                {item.status === 'ADMINISTERED' && (
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black uppercase tracking-tighter opacity-50 text-emerald-600">Last Dose</span>
                        <span className="text-[10px] font-black text-emerald-700">
                          {item.history?.[0]?.administered_at ? new Date(item.history[0].administered_at).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                )}
            </div>
          </div>
        ))}
      </div>

      {/* Administration / Edit Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${isEditMode ? 'bg-amber-500 shadow-amber-500/20' : 'bg-his-green-500 shadow-his-green-500/20'} text-white`}>
                  {isEditMode ? <Edit2 size={24} /> : <Syringe size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {isEditMode ? 'Edit Administration' : 'Record Vaccination'}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    {selectedVaccine?.vaccine_name} — Clinical Modification
                  </p>
                </div>
              </div>
              <button onClick={() => setShowAdminModal(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdministerSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
              {isEditMode && (
                <div className="bg-amber-50 border border-amber-200 rounded-[1.5rem] p-6 space-y-3">
                   <div className="flex items-center gap-2">
                     <AlertTriangle className="w-4 h-4 text-amber-600" />
                     <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Amendment Log Required</p>
                   </div>
                   <textarea 
                     required
                     name="amendment_reason"
                     value={formData.amendment_reason}
                     onChange={handleInputChange}
                     placeholder="State exactly why this record is being modified (e.g., Typo in Lot Number)..."
                     className="w-full bg-white border border-amber-100 rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none focus:border-amber-500 transition-all resize-none"
                     rows="2"
                   />
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Manufacturer</label>
                  <input name="manufacturer" value={formData.manufacturer} onChange={handleInputChange} className="w-full bg-his-slate-50 border-2 border-transparent focus:border-his-green-500/10 focus:bg-white rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lot / Batch Number</label>
                  <input required name="lot_number" value={formData.lot_number} onChange={handleInputChange} className="w-full bg-his-slate-50 border-2 border-transparent focus:border-his-green-500/10 focus:bg-white rounded-2xl p-4 text-sm font-black text-slate-900 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administration Date</label>
                  <input required type="date" name="administered_at" value={formData.administered_at} onChange={handleInputChange} className="w-full bg-his-slate-50 border-2 border-transparent focus:border-his-green-500/10 focus:bg-white rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administered By</label>
                   <input required name="administered_by" value={formData.administered_by} onChange={handleInputChange} className="w-full bg-his-slate-50 border-2 border-transparent focus:border-his-green-500/10 focus:bg-white rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Remarks</label>
                  <textarea name="remarks" value={formData.remarks} onChange={handleInputChange} rows="2" className="w-full bg-his-slate-50 border-2 border-transparent focus:border-his-green-500/10 focus:bg-white rounded-3xl p-4 text-sm font-bold text-slate-700 outline-none transition-all resize-none" />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex gap-4">
                  <button type="button" onClick={() => setShowAdminModal(false)} className="flex-1 py-4 bg-his-slate-50 text-slate-400 text-[10px] font-black rounded-2xl hover:bg-his-slate-100 transition-all uppercase tracking-widest">Cancel</button>
                  <button type="submit" disabled={loading} className={`flex-1 py-4 ${isEditMode ? 'bg-amber-500 shadow-amber-500/20' : 'bg-his-green-500 shadow-his-green-500/20'} text-white text-[10px] font-black rounded-2xl shadow-xl transition-all uppercase tracking-widest disabled:opacity-50`}>
                    {loading ? 'Processing...' : (isEditMode ? 'Update Record' : 'Finalize Administration')}
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Custom Requirement Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <FilePlus size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Add Requirement</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Customize Patient Roadmap</p>
                  </div>
                </div>
                <button onClick={() => setShowEnrollModal(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEnrollSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vaccine Name</label>
                  <input required value={enrollData.vaccine_name} onChange={(e) => setEnrollData({...enrollData, vaccine_name: e.target.value})} placeholder="e.g. Varicella, Influenza" className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white rounded-2xl p-4 text-sm font-black text-slate-900 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Doses Required</label>
                    <input type="number" min="1" value={enrollData.doses_required} onChange={(e) => setEnrollData({...enrollData, doses_required: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 rounded-2xl p-4 text-sm font-bold text-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Age (Mos)</label>
                    <input type="number" step="0.5" value={enrollData.target_age_months} onChange={(e) => setEnrollData({...enrollData, target_age_months: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 rounded-2xl p-4 text-sm font-bold text-slate-700" />
                  </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enrollment Scope</label>
                   <select value={enrollData.scope} onChange={(e) => setEnrollData({...enrollData, scope: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 rounded-2xl p-4 text-sm font-black text-slate-700 outline-none transition-all appearance-none">
                     <option value="PATIENT">Personalized (This child only)</option>
                     <option value="CLINIC">Clinic Standard (All patients)</option>
                   </select>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowEnrollModal(false)} className="flex-1 py-4 bg-slate-50 text-slate-400 text-[10px] font-black rounded-2xl uppercase tracking-widest">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 py-4 bg-blue-500 text-white text-[10px] font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-600 transition-all uppercase tracking-widest disabled:opacity-50">
                    {loading ? 'Adding...' : 'Add Card to Roadmap'}
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ImmunizationLedger;
