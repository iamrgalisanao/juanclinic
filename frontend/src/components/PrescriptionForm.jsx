import React, { useState } from 'react';
import { createPrescription, updatePrescription } from '../services/api';

const PrescriptionForm = ({ patientId, prescription = null, onSuccess, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.target);
        const payload = {
            patient_id: patientId,
            medication_name: formData.get('medication_name'),
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
        <div className="bg-white rounded-[2.5rem] p-10 shadow-sleek border border-his-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        {prescription ? 'Edit Prescription' : 'New Medication Prescription'}
                    </h3>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2">CDIM Compliant Order Entry</p>
                </div>
                <button 
                    onClick={onCancel}
                    className="w-10 h-10 rounded-xl bg-his-slate-50 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
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

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Medication Name</label>
                    <input
                        name="medication_name"
                        defaultValue={prescription?.medication_name}
                        required
                        placeholder="e.g. Amoxicillin"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Dosage</label>
                    <input
                        name="dosage"
                        defaultValue={prescription?.dosage}
                        required
                        placeholder="e.g. 500mg"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Frequency</label>
                    <input
                        name="frequency"
                        defaultValue={prescription?.frequency}
                        required
                        placeholder="e.g. Twice Daily"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Duration</label>
                    <input
                        name="duration"
                        defaultValue={prescription?.duration}
                        required
                        placeholder="e.g. 7 Days"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all"
                    />
                </div>

                <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Instructions</label>
                    <textarea
                        name="instructions"
                        defaultValue={prescription?.instructions}
                        placeholder="Additional instructions for the patient..."
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all min-h-[100px]"
                    />
                </div>

                {prescription && (
                    <div className="md:col-span-2 space-y-2 bg-amber-50/30 p-6 rounded-[2rem] border border-amber-100/50">
                        <label className="text-[10px] font-black uppercase tracking-widest text-amber-600 ml-2">Clinical Amendment Reason</label>
                        <input
                            name="amendment_reason"
                            required
                            placeholder="Why is this clinical record being modified?"
                            className="w-full bg-white border border-amber-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all"
                        />
                        <p className="text-[10px] font-bold text-amber-500/60 mt-2 px-2 italic">Required for CDIM non-repudiation and audit compliance.</p>
                    </div>
                )}

                <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-8 py-4 bg-his-slate-100 text-slate-600 text-xs font-black rounded-2xl hover:bg-his-slate-200 transition-all uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-8 py-4 bg-his-green-500 text-white text-xs font-black rounded-2xl shadow-xl shadow-his-green-500/20 hover:bg-his-green-600 transition-all uppercase tracking-widest flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Processing...' : (prescription ? 'Update Prescription' : 'Finalize Prescription')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PrescriptionForm;
