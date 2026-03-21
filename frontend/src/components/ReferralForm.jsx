import React, { useState, useEffect } from 'react';
import { getTenants, createReferral } from '../services/api';

const ReferralForm = ({ patientId, onClose, onSuccess }) => {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const data = await getTenants();
                // Filter out the current active tenant (we can't determine it directly here unless passed,
                // but usually the user selects from a list. Let's rely on the API returning all tenants)
                setTenants(data);
            } catch (err) {
                console.error("Failed to load clinics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTenants();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        const formData = new FormData(e.target);

        const payload = {
            patient_id: patientId,
            target_tenant_id: formData.get('target_tenant_id'),
            clinical_notes: formData.get('clinical_notes'),
            consent_proof: formData.get('consent_proof')
        };

        if (!payload.target_tenant_id) {
            setError('Please select a target clinic.');
            setIsSubmitting(false);
            return;
        }

        if (!payload.consent_proof) {
            setError('Data Privacy Act consent proof is mandatory.');
            setIsSubmitting(false);
            return;
        }

        try {
            await createReferral(payload);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to initiate referral.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] p-10 max-w-xl w-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)]">
                <div className="flex justify-between items-start mb-8 border-b border-slate-50 pb-6">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Initiate Secure Referral</h3>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Cross-Tenant Interconnectivity (Tier 2)</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Target Clinic</label>
                        {loading ? (
                            <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 animate-pulse">Loading Clinics...</div>
                        ) : (
                            <select name="target_tenant_id" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all">
                                <option value="">Select Receiving Clinic...</option>
                                {tenants.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Clinical Notes (Optional)</label>
                        <textarea
                            name="clinical_notes"
                            rows="3"
                            placeholder="Reason for referral, specific requests, etc."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="p-5 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-100 space-y-4">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800">DPA RA 10173 Consent Proof</label>
                        </div>
                        <select name="consent_proof" className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 text-xs font-bold text-emerald-800 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all">
                            <option value="">Select Consent Medium...</option>
                            <option value="SIGNED_FORM">Signed Physical Form on File</option>
                            <option value="VERBAL_CONSENT">Verbal Consent (Witnessed)</option>
                            <option value="ELECTRONIC_SIGNATURE">Electronic Signature</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
                        <button type="button" onClick={onClose} className="px-6 py-4 bg-slate-100 text-slate-600 text-[10px] font-black rounded-2xl hover:bg-slate-200 transition-colors uppercase tracking-widest">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting || loading} className={`px-8 py-4 bg-his-green-500 text-white text-[10px] font-black rounded-2xl transition-all uppercase tracking-widest flex items-center gap-2 ${isSubmitting || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-his-green-600 shadow-xl shadow-his-green-500/20'}`}>
                            {isSubmitting ? 'Processing...' : 'Send Referral'}
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReferralForm;
