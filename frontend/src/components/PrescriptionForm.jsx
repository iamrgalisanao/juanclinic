import React, { useState } from 'react';
import { createPrescription, updatePrescription } from '../services/api';
import MedicineAutocomplete from './MedicineAutocomplete';

const PrescriptionForm = ({ patientId, prescription = null, onSuccess, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showConfirmCancel, setShowConfirmCancel] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [medicationName, setMedicationName] = useState(prescription?.medication_name || '');

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.target);
        const payload = {
            patient_id: patientId,
            medication_name: medicationName,
            dosage: formData.get('dosage'),
            frequency: formData.get('frequency'),
            duration: formData.get('duration'),
            instructions: formData.get('instructions'),
        };

        if (prescription) {
            payload.amendment_reason = formData.get('amendment_reason');
            if (!payload.amendment_reason) {
                setError("Amendment reason is required for updates.");
                setLoading(false);
                return;
            }
        }

        try {
            if (prescription) {
                await updatePrescription(prescription.id, payload);
            } else {
                await createPrescription(payload);
            }
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save prescription.");
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

            <form onSubmit={handleSubmit} onChange={handleFormChange} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-2">Medication Name</label>
                    <MedicineAutocomplete
                        value={medicationName}
                        onChange={(val) => {
                            setMedicationName(val);
                            handleFormChange();
                        }}
                        placeholder="Search PNF or enter custom medication..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-2">Dosage</label>
                    <input
                        name="dosage"
                        defaultValue={prescription?.dosage}
                        required
                        placeholder="e.g. 500mg"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-2">Frequency</label>
                    <input
                        name="frequency"
                        defaultValue={prescription?.frequency}
                        required
                        placeholder="e.g. Twice Daily"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-2">Duration</label>
                    <input
                        name="duration"
                        defaultValue={prescription?.duration}
                        required
                        placeholder="e.g. 7 Days"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all"
                    />
                </div>

                <div className="md:col-span-2 space-y-2">
                    <label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-2">Instructions</label>
                    <textarea
                        name="instructions"
                        defaultValue={prescription?.instructions}
                        placeholder="Additional instructions for the patient..."
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all min-h-[100px]"
                    />
                </div>

                {prescription && (
                    <div className="md:col-span-2 space-y-2 bg-amber-50/30 p-6 rounded-[2rem] border border-amber-100/50">
                        <label className="text-[12px] font-black uppercase tracking-widest text-amber-700 ml-2">Clinical Amendment Reason</label>
                        <input
                            name="amendment_reason"
                            required
                            placeholder="Why is this clinical record being modified?"
                            className="w-full bg-white border border-amber-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all"
                        />
                        <p className="text-[10px] font-bold text-amber-500/60 mt-2 px-2 italic">Required for CDIM non-repudiation and audit compliance.</p>
                    </div>
                )}

                <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-3 md:gap-4 mt-6">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="w-full sm:w-auto px-8 py-4 bg-his-slate-100 text-slate-600 text-[11px] md:text-xs font-black rounded-2xl hover:bg-his-slate-200 transition-all uppercase tracking-widest min-h-[48px]"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full sm:w-auto px-8 py-4 bg-his-green-500 text-white text-[11px] md:text-xs font-black rounded-2xl shadow-xl shadow-his-green-500/20 hover:bg-his-green-600 transition-all uppercase tracking-widest flex items-center justify-center gap-2 min-h-[48px] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Processing...' : (prescription ? 'Update Prescription' : 'Finalize Prescription')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PrescriptionForm;
