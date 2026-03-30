import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, AlertTriangle, CheckCircle2, Plus, X, Syringe, Info, Search } from 'lucide-react';
import { storeImmunizationRecord, lookupVaccines } from '../../services/api';

const ImmunizationLedger = ({ roadmap = [], patientId, onRecordAdded }) => {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lookupData, setLookupData] = useState({ standard: [], medicines: [], history_presets: {} });
  const [searchTerm, setSearchTerm] = useState('');
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
      await storeImmunizationRecord(patientId, payload);
      setShowAdminModal(false);
      if (onRecordAdded) onRecordAdded();
    } catch (err) {
      console.error("Failed to record immunization", err);
      const msg = err.response?.data?.message || "Registration Failed: Please check requirements.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const openAdminModal = (vaccine = null) => {
    const isManual = !vaccine;
    setSelectedVaccine(isManual ? { isManual: true } : { ...vaccine, isManual: false });
    setFormData({
      vaccine_name: vaccine?.vaccine_name || '',
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
    });
    setPresetAvailable(null);
    setShowAdminModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Check for presets if vaccine name changes
    if (name === 'vaccine_name' || name === 'vaccine') {
       const vName = value || selectedVaccine?.name;
       if (vName && lookupData.history_presets[vName]) {
          setPresetAvailable(lookupData.history_presets[vName]);
       } else {
          setPresetAvailable(null);
       }
    }

    // NEW: Smart Lot Auto-populate
    if (name === 'lot_number' && value.length > 2) {
        // Search through all medicines and their lots
        for (const med of lookupData.medicines) {
            const foundLot = med.lots?.find(l => l.lot_number === value);
            if (foundLot) {
                setFormData(prev => ({
                    ...prev,
                    manufacturer: foundLot.manufacturer || prev.manufacturer,
                    vis_edition_date: foundLot.vis_edition_date || prev.vis_edition_date,
                    cvx_code: foundLot.cvx_code || prev.cvx_code,
                    // Note: We don't auto-set VIS Provided Date as it's a point-of-care action
                }));
                break;
            }
        }
    }
  };

  const applyPreset = () => {
    if (presetAvailable) {
        setFormData(prev => ({
            ...prev,
            manufacturer: presetAvailable.manufacturer || prev.manufacturer,
            site: presetAvailable.site || prev.site,
            route: presetAvailable.route || prev.route,
            vis_edition_date: presetAvailable.vis_edition_date || prev.vis_edition_date,
            cvx_code: presetAvailable.cvx_code || prev.cvx_code
        }));
        setPresetAvailable(null);
    }
  };

  if (roadmap.length === 0) {
    return (
      <div className="bg-slate-50/50 rounded-3xl p-10 text-center border border-slate-100 border-dashed">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Immunization roadmap not available.</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ADMINISTERED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'OVERDUE': return 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-his-green-500" />
          Mandatory Immunization Roadmap
        </h3>
        <div className="flex items-center gap-4">
            <button 
                onClick={() => openAdminModal(null)}
                className="text-[9px] font-black text-his-green-600 uppercase tracking-widest bg-his-green-50 px-3 py-1.5 rounded-full border border-his-green-100 hover:bg-his-green-500 hover:text-white transition-all flex items-center gap-2"
            >
                <Plus size={10} />
                Record Other
            </button>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 px-2 py-0.5 rounded-full">Source: PH DOH NIP</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roadmap.map((item, idx) => (
          <div 
            key={idx} 
            className={`p-5 rounded-3xl border transition-all duration-300 group hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 ${getStatusColor(item.status)}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                 <div className={`p-1.5 rounded-lg bg-white/50 border border-white/20`}>
                   {getStatusIcon(item.status)}
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest">{item.status}</span>
              </div>
              <span className="text-[9px] font-black uppercase opacity-60">Dose {item.dose_number}</span>
            </div>
            
            <h4 className="text-sm font-black text-slate-900 leading-tight mb-1">{item.vaccine_name}</h4>
            <p className="text-[10px] font-bold text-slate-500 mb-4 opacity-80">
                {item.recommended_age_weeks !== null ? `${item.recommended_age_weeks} Weeks` : `${item.recommended_age_months} Months`} Old
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
                    <span className="text-[8px] font-black uppercase tracking-tighter opacity-50">Due Date</span>
                    <span className="text-[11px] font-black text-slate-900">{new Date(item.due_date).toLocaleDateString()}</span>
                </div>
                {item.administered_at && (
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black uppercase tracking-tighter opacity-50 text-emerald-600">Administered On</span>
                        <span className="text-[11px] font-black text-emerald-700">{new Date(item.administered_at).toLocaleDateString()}</span>
                    </div>
                )}
            </div>
          </div>
        ))}
      </div>

      {/* Administration Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-his-green-500 text-white flex items-center justify-center shadow-lg shadow-his-green-500/20">
                  <Syringe size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Record Vaccination</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    {selectedVaccine?.isManual ? 'Manual Selection' : `${selectedVaccine?.vaccine_name} — Dose ${selectedVaccine?.dose_number}`}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAdminModal(false)}
                className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <form id="admin-modal-form" onSubmit={handleAdministerSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Clinical Guidance Alert */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-[1.5rem] p-4 flex gap-4 items-start">
                 <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                 <div className="flex-1">
                    <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">CDC Compliance Check</p>
                    <p className="text-[10px] font-bold text-blue-600 leading-relaxed">
                      Ensure the Vaccine Information Statement (VIS) has been provided to the guardian before administration. Double-check Lot Number for product recall traceability.
                    </p>
                 </div>
                 {presetAvailable && (
                    <button 
                        type="button"
                        onClick={applyPreset}
                        className="bg-his-green-500 text-white text-[9px] font-black uppercase px-3 py-2 rounded-xl shadow-lg shadow-his-green-500/20 hover:bg-his-green-600 transition-all ml-2"
                    >
                        Apply Presets
                    </button>
                 )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                {selectedVaccine?.isManual && (
                    <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Search size={10} />
                            Search Vaccine Catalog
                        </label>
                        <div className="relative group">
                            <input 
                                required
                                name="vaccine_name"
                                list="vaccine-lookup-list"
                                value={formData.vaccine_name}
                                onChange={handleInputChange}
                                placeholder="Start typing vaccine name..."
                                className="w-full bg-his-green-50/30 border-2 border-his-green-100 focus:border-his-green-500 focus:bg-white rounded-2xl p-4 text-sm font-black text-slate-900 outline-none transition-all placeholder:text-slate-300" 
                            />
                            <datalist id="vaccine-lookup-list">
                                {lookupData.standard.map((name, i) => <option key={i} value={name} />)}
                                {lookupData.medicines.map((m, i) => (
                                    <option key={`m-${i}`} value={m.brand_name || m.generic_name}>
                                        {m.brand_name || m.generic_name} ({m.stock} Units In Stock)
                                    </option>
                                ))}
                            </datalist>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Manufacturer</label>
                  <input 
                    name="manufacturer" 
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                    placeholder="e.g. GSK, Pfizer, Sanofi"
                    className="w-full bg-his-slate-50 border-2 border-transparent focus:border-his-green-500/10 focus:bg-white rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lot / Batch Number</label>
                  <input 
                    required 
                    name="lot_number" 
                    value={formData.lot_number}
                    onChange={handleInputChange}
                    placeholder="Mandatory Audit Code"
                    className="w-full bg-his-slate-50 border-2 border-transparent focus:border-his-green-500/10 focus:bg-white rounded-2xl p-4 text-sm font-black text-slate-900 outline-none transition-all placeholder:text-slate-300" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administration Date</label>
                  <input 
                    required 
                    type="date" 
                    name="administered_at" 
                    value={formData.administered_at}
                    onChange={handleInputChange}
                    className="w-full bg-his-slate-50 border-2 border-transparent focus:border-his-green-500/10 focus:bg-white rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administered By</label>
                  <input 
                    name="administered_by" 
                    value={formData.administered_by}
                    onChange={handleInputChange}
                    placeholder="Clinician Name"
                    className="w-full bg-his-slate-50 border-2 border-transparent focus:border-his-green-500/10 focus:bg-white rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Anatomical Site</label>
                  <select 
                    name="site" 
                    value={formData.site}
                    onChange={handleInputChange}
                    className="w-full bg-his-slate-50 border-2 border-transparent focus:border-his-green-500/10 focus:bg-white rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all appearance-none"
                  >
                    <option value="Left Deltoid">Left Deltoid (Arm)</option>
                    <option value="Right Deltoid">Right Deltoid (Arm)</option>
                    <option value="Left Thigh">Left Thigh (Anterolateral)</option>
                    <option value="Right Thigh">Right Thigh (Anterolateral)</option>
                    <option value="Oral">Oral (N/A)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Route</label>
                  <select 
                    name="route" 
                    value={formData.route}
                    onChange={handleInputChange}
                    className="w-full bg-his-slate-50 border-2 border-transparent focus:border-his-green-500/10 focus:bg-white rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all appearance-none"
                  >
                    <option value="IM">Intramuscular (IM)</option>
                    <option value="SC">Subcutaneous (SC)</option>
                    <option value="ID">Intradermal (ID)</option>
                    <option value="PO">Oral (PO)</option>
                    <option value="IN">Intranasal (IN)</option>
                  </select>
                </div>

                {/* NCVIA Mandated VIS Section */}
                <div className="col-span-2 grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="col-span-2 mb-2">
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">NCVIA Mandated Documentation</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">VIS Edition Date</label>
                        <input 
                            type="date"
                            name="vis_edition_date" 
                            value={formData.vis_edition_date}
                            onChange={handleInputChange}
                            className="w-full bg-white border-2 border-transparent focus:border-his-green-500/10 rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date VIS Provided</label>
                        <input 
                            type="date"
                            name="vis_provided_date" 
                            value={formData.vis_provided_date}
                            onChange={handleInputChange}
                            className="w-full bg-white border-2 border-transparent focus:border-his-green-500/10 rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CVX Code</label>
                        <input 
                            name="cvx_code" 
                            value={formData.cvx_code}
                            onChange={handleInputChange}
                            placeholder="e.g. 03, 110"
                            className="w-full bg-white border-2 border-transparent focus:border-his-green-500/10 rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NDC Code</label>
                        <input 
                            name="ndc_code" 
                            value={formData.ndc_code}
                            onChange={handleInputChange}
                            placeholder="Optional"
                            className="w-full bg-white border-2 border-transparent focus:border-his-green-500/10 rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all" 
                        />
                    </div>
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Remarks</label>
                  <textarea 
                    name="remarks" 
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Note any adverse reactions or provider guidance here..."
                    className="w-full bg-his-slate-50 border-2 border-transparent focus:border-his-green-500/10 focus:bg-white rounded-3xl p-4 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300 resize-none" 
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-6 border-t border-slate-50 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setShowAdminModal(false)}
                    className="flex-1 py-4 bg-his-slate-50 text-slate-400 text-[10px] font-black rounded-2xl hover:bg-his-slate-100 transition-all uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 py-4 bg-his-green-500 text-white text-[10px] font-black rounded-2xl shadow-xl shadow-his-green-500/20 hover:bg-his-green-600 transition-all uppercase tracking-widest disabled:opacity-50"
                  >
                    {loading ? 'Registering...' : 'Finalize Administration'}
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
