import React, { useState } from 'react';
import { useDialog } from '../context/DialogContext';
import { createPrescription, updatePrescription } from '../services/api';
import MedicineAutocomplete from './MedicineAutocomplete';

const PrescriptionForm = ({ patientId, prescription = null, onSuccess, onCancel, stagedData = null }) => {
    const { alert } = useDialog();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showConfirmCancel, setShowConfirmCancel] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    
    // Batch items state
    const [items, setItems] = useState(() => {
        if (stagedData) {
            return [{
                id: Date.now(),
                medicine_id: stagedData.medicine_id,
                medicine_form_id: stagedData.medicine_form_id,
                medication_name: stagedData.brand_name ? `${stagedData.brand_name} (${stagedData.generic_name})` : stagedData.generic_name,
                quantity: stagedData.quantity || 1,
                dosage: stagedData.strength || '',
                frequency: '',
                duration: '',
                instructions: '',
                discovery_context: stagedData.discovery_context
            }];
        }
        return [];
    });
    
    // Current entry state
    const [entry, setEntry] = useState({
        medication_name: '',
        medicine_id: null,
        medicine_form_id: null,
        quantity: 1,
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
    });

    const resetEntry = () => {
        setEntry({
            medication_name: '',
            medicine_id: null,
            medicine_form_id: null,
            quantity: 1,
            dosage: '',
            frequency: '',
            duration: '',
            instructions: ''
        });
    };

    const handleFormChange = () => {
        if (!isDirty) setIsDirty(true);
    };

    const handleCancel = () => {
        if (isDirty) {
            setShowConfirmCancel(true);
        } else {
            onCancel();
        }
    };

    const handleAddEntry = (e) => {
        e.preventDefault();
        if (!entry.medication_name || !entry.dosage || !entry.frequency || !entry.duration) {
            setError("Please fill in all required medication details.");
            return;
        }

        setItems([...items, { ...entry, id: Date.now() }]);
        resetEntry();
        setError(null);
        setIsDirty(true);
    };

    const handleRemoveEntry = (id) => {
        setItems(items.filter(item => item.id !== id));
        if (items.length <= 1) setIsDirty(false);
    };

    const handleSubmit = async (e, shouldPrint = false) => {
        e.preventDefault();
        
        if (items.length === 0) {
            setError("Please add at least one medication to the prescription.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = {
                patient_id: patientId,
                prescriptions: items.map(item => ({
                    patient_id: patientId,
                    medicine_id: item.medicine_id,
                    medicine_form_id: item.medicine_form_id,
                    medication_name: item.medication_name,
                    quantity: item.quantity,
                    dosage: item.dosage,
                    frequency: item.frequency,
                    duration: item.duration,
                    instructions: item.instructions,
                }))
            };


            const response = await createPrescription(payload);
            // Assuming the backend returns the created prescriptions in data
            onSuccess(shouldPrint ? response.data : null);
        } catch (err) {
            console.error('Error creating batch prescription:', err);
            setError("Validation failed for one or more medications in the batch.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sleek border border-his-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            {showConfirmCancel && (
                <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center p-6 md:p-10 text-center animate-in zoom-in-95 duration-200">
                    <div className="max-w-xs">
                        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-2">Discard Changes?</h4>
                        <p className="text-sm text-slate-500 font-bold mb-8">All unsaved clinical data will be permanently lost.</p>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={onCancel}
                                className="w-full py-4 bg-rose-500 text-white text-xs font-black rounded-2xl shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all uppercase tracking-widest min-h-[48px]"
                            >
                                Yes, Discard Data
                            </button>
                            <button 
                                onClick={() => setShowConfirmCancel(false)}
                                className="w-full py-4 bg-slate-100 text-slate-600 text-xs font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest min-h-[48px]"
                            >
                                Keep Editing
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
                <div className="w-full sm:w-auto">
                    <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-2">
                        <span className="px-3 py-1 bg-his-green-50 text-his-green-600 text-[9px] md:text-[10px] font-black rounded-full uppercase tracking-widest border border-his-green-100/30">
                            ID: {patientId}
                        </span>
                        <span className="px-3 py-1 bg-his-slate-50 text-slate-400 text-[9px] md:text-[10px] font-black rounded-full uppercase tracking-widest border border-slate-100">
                            {window.location.hostname.split('.')[0] || 'Default'} Tenant
                        </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight leading-tight">
                        {prescription ? 'Edit Clinical Prescription' : 'New Medication Prescription'}
                    </h3>
                    <p className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2">CDIM Compliant Order Entry</p>
                </div>
                <button 
                    onClick={handleCancel}
                    className="absolute top-6 right-6 sm:static w-10 h-10 rounded-xl bg-his-slate-50 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shrink-0"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                {/* Left side: Entry Form */}
                <div className="lg:col-span-3">
                    <div className="bg-his-slate-50/50 rounded-[2rem] p-6 border border-his-slate-100 mb-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Medication Details</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Medication Name</label>
                                <MedicineAutocomplete
                                    value={entry.medication_name}
                                    onChange={(val) => {
                                        setEntry({ ...entry, medication_name: val, medicine_id: null });
                                        handleFormChange();
                                    }}
                                    onSelect={(form) => {
                                        const medicine = form.medicine || {};
                                        setEntry({ 
                                            ...entry, 
                                            medication_name: medicine.generic_name, 
                                            medicine_id: medicine.id,
                                            medicine_form_id: form.id,
                                            dosage: entry.dosage || `${form.form_name || ''} ${form.strength || ''}`.trim(),
                                        });
                                        handleFormChange();
                                    }}

                                    placeholder="Search PNF or enter custom medication..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Quantity</label>
                                <input
                                    type="number"
                                    value={entry.quantity}
                                    onChange={(e) => setEntry({ ...entry, quantity: parseInt(e.target.value) || 1 })}
                                    min="1"
                                    className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Dosage</label>
                                <input
                                    value={entry.dosage}
                                    onChange={(e) => setEntry({ ...entry, dosage: e.target.value })}
                                    placeholder="e.g. 500mg"
                                    className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Frequency</label>
                                <input
                                    value={entry.frequency}
                                    onChange={(e) => setEntry({ ...entry, frequency: e.target.value })}
                                    placeholder="e.g. Twice Daily"
                                    list="common-frequencies"
                                    className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Duration</label>
                                <input
                                    value={entry.duration}
                                    onChange={(e) => setEntry({ ...entry, duration: e.target.value })}
                                    placeholder="e.g. 7 Days"
                                    list="common-durations"
                                    className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all"
                                />
                            </div>

                            <datalist id="common-frequencies">
                                <option value="Once Daily" />
                                <option value="Twice Daily (BID)" />
                                <option value="Three times a day (TID)" />
                                <option value="Four times a day (QID)" />
                                <option value="Every 4 Hours" />
                                <option value="Every 6 Hours" />
                                <option value="As Needed (PRN)" />
                                <option value="Before Meals (AC)" />
                                <option value="After Meals (PC)" />
                                <option value="At Bedtime (HS)" />
                            </datalist>

                            <datalist id="common-durations">
                                <option value="3 Days" />
                                <option value="5 Days" />
                                <option value="7 Days" />
                                <option value="10 Days" />
                                <option value="14 Days" />
                                <option value="30 Days" />
                                <option value="Until Finished" />
                                <option value="Indefinite" />
                            </datalist>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Instructions</label>
                                <textarea
                                    value={entry.instructions}
                                    onChange={(e) => setEntry({ ...entry, instructions: e.target.value })}
                                    placeholder="Additional instructions for the patient..."
                                    className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all min-h-[80px]"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <button
                                    type="button"
                                    onClick={handleAddEntry}
                                    className="w-full py-4 bg-his-slate-900 text-white text-[11px] font-black rounded-2xl hover:bg-black transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                    Add to Staging List
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side: Staging List */}
                <div className="lg:col-span-2">
                    <div className="bg-his-slate-50/30 rounded-[2rem] p-6 border border-his-slate-100 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prescription Staging ({items.length})</p>
                            {items.length > 0 && (
                                <button 
                                    onClick={() => setItems([])}
                                    className="text-[9px] font-black text-rose-500 uppercase hover:text-rose-600 transition-colors"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                            {items.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-white/50 rounded-[1.5rem] border border-dashed border-slate-200">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                    </div>
                                    <p className="text-xs font-bold text-slate-400">Your staging list is empty.</p>
                                    <p className="text-[10px] text-slate-300 mt-1 uppercase font-black tracking-widest">Add medications from the left form</p>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div 
                                        key={item.id}
                                        className="group bg-white p-5 rounded-2xl border border-his-slate-100 shadow-sm hover:shadow-md hover:border-his-green-200 transition-all animate-in fade-in slide-in-from-right-4 duration-300 relative"
                                    >
                                        <button 
                                            onClick={() => handleRemoveEntry(item.id)}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-rose-100 hover:bg-rose-500 hover:text-white"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-xs font-black text-slate-900">{item.medication_name}</p>
                                            <span className="px-2 py-0.5 bg-his-green-50 text-his-green-600 text-[9px] font-black rounded uppercase">x{item.quantity}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-slate-400">
                                            <span>{item.dosage}</span>
                                            <span className="text-slate-200">•</span>
                                            <span>{item.frequency}</span>
                                            <span className="text-slate-200">•</span>
                                            <span>{item.duration}</span>
                                        </div>
                                        {item.discovery_context && (
                                            <div className="mt-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                                                <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest block mb-1">Discovery Linked</span>
                                                <p className="text-[9px] font-bold text-slate-600 leading-tight whitespace-pre-wrap">Indication Match: <span className="text-slate-900">{item.discovery_context.term}</span></p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-his-slate-100 flex flex-col gap-3">
                            <button
                                onClick={(e) => handleSubmit(e, true)}
                                disabled={loading || items.length === 0}
                                className={`w-full py-5 bg-his-slate-900 text-white text-xs font-black rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-black transition-all uppercase tracking-widest flex items-center justify-center gap-3 ${loading || items.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Processing...' : 'Finalize & Print Rx Slip'}
                                {!loading && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>}
                            </button>
                            <button
                                onClick={(e) => handleSubmit(e, false)}
                                disabled={loading || items.length === 0}
                                className={`w-full py-4 bg-his-green-500 text-white text-xs font-black rounded-2xl shadow-xl shadow-his-green-500/20 hover:bg-his-green-600 transition-all uppercase tracking-widest flex items-center justify-center gap-3 ${loading || items.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Processing...' : 'Finalize Only'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="w-full py-4 bg-white text-slate-400 text-[10px] font-black rounded-2xl hover:text-slate-600 transition-all uppercase tracking-widest"
                            >
                                Cancel Session
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrescriptionForm;
