import React, { useState, useEffect } from 'react';
import { searchExternalProviders, createExternalReferral } from '../services/api';

const ExternalReferralForm = ({ patientId, onClose, onSuccess }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [providers, setProviders] = useState([]);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    // Enrichment fields
    const [prcNo, setPrcNo] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (searchQuery.length > 2) {
            const delayDebounceFn = setTimeout(async () => {
                setLoading(true);
                try {
                    const data = await searchExternalProviders(searchQuery);
                    setProviders(data);
                } catch (err) {
                    console.error("Search failed", err);
                } finally {
                    setLoading(false);
                }
            }, 300);

            return () => clearTimeout(delayDebounceFn);
        } else {
            setProviders([]);
        }
    }, [searchQuery]);

    const handleSelectProvider = (provider) => {
        setSelectedProvider(provider);
        setPrcNo(provider.prc_no || '');
        setEmail(provider.email || '');
        setProviders([]);
        setSearchQuery('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!selectedProvider) {
            setError('Please select a specialist.');
            return;
        }

        const formData = new FormData(e.target);
        const consentProof = formData.get('consent_proof');
        
        if (!consentProof) {
            setError('Data Privacy Act consent proof is mandatory.');
            return;
        }

        setIsSubmitting(true);
        try {
            await createExternalReferral({
                patient_id: patientId,
                external_provider_id: selectedProvider.id,
                clinical_notes: formData.get('clinical_notes'),
                consent_proof: consentProof,
                prc_no: prcNo,
                email: email
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to initiate referral.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] p-6 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar relative">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors group">
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="mb-6">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">External Specialist Referral</h3>
                    <div className="h-1 w-12 bg-his-green-500 rounded-full mt-2" />
                </div>

                {error && (
                    <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Specialist Selection */}
                        <div className="space-y-4">
                            {!selectedProvider ? (
                                <div className="relative">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 block">1. Find Specialist</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            autoFocus
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by name or specialty..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-his-green-500 outline-none transition-all pl-11 shadow-sm"
                                        />
                                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                        
                                        {loading && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <div className="w-4 h-4 border-2 border-his-green-500 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Autocomplete Dropdown */}
                                    {searchQuery.length > 2 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                                            <div className="max-h-60 overflow-y-auto py-1">
                                                {providers.length > 0 ? (
                                                    providers.map(p => (
                                                        <button
                                                            key={p.id}
                                                            type="button"
                                                            onClick={() => handleSelectProvider(p)}
                                                            className="w-full text-left px-4 py-3 hover:bg-his-green-50 transition-colors border-b border-slate-50 last:border-0"
                                                        >
                                                            <div className="font-bold text-sm text-slate-900">{p.full_name}</div>
                                                            <div className="text-[9px] text-his-green-600 font-black uppercase tracking-wider mt-0.5">{p.specialty}</div>
                                                            <div className="text-[9px] text-slate-400 font-bold">{p.clinic_name}</div>
                                                        </button>
                                                    ))
                                                ) : !loading ? (
                                                    <div className="px-4 py-6 text-center text-slate-400 text-xs font-bold">No results found</div>
                                                ) : null}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 block">1. Selected Specialist</label>
                                    <div className="p-4 bg-his-green-50/50 rounded-2xl border border-his-green-100 relative group">
                                        <button 
                                            type="button" 
                                            onClick={() => setSelectedProvider(null)}
                                            className="absolute top-3 right-3 text-[9px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
                                        >
                                            Change
                                        </button>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-his-green-100 flex items-center justify-center text-his-green-600 shrink-0">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-base font-black text-slate-900 truncate">{selectedProvider.full_name}</div>
                                                <div className="text-[10px] font-black text-his-green-600 uppercase tracking-widest">{selectedProvider.specialty}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-his-green-100/50">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase text-slate-400">PRC License</label>
                                                <input
                                                    type="text"
                                                    value={prcNo}
                                                    onChange={(e) => setPrcNo(e.target.value)}
                                                    className="w-full bg-white border border-his-green-100 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:border-his-green-500 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase text-slate-400">Email</label>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full bg-white border border-his-green-100 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:border-his-green-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Clinical Details */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">2. Clinical Reason / Notes</label>
                                <textarea
                                    name="clinical_notes"
                                    rows="3"
                                    placeholder="Enter clinical summary and reason for referral..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-his-green-500 outline-none transition-all resize-none shadow-sm"
                                />
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    </div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-800">DPA RA 10173 Consent</label>
                                </div>
                                <select 
                                    name="consent_proof" 
                                    className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 text-[10px] font-black text-emerald-800 focus:ring-4 focus:ring-emerald-500/10 outline-none cursor-pointer"
                                >
                                    <option value="">Select Consent Method...</option>
                                    <option value="SIGNED_FORM">Signed Physical Form</option>
                                    <option value="VERBAL_CONSENT">Verbal (Witnessed)</option>
                                    <option value="ELECTRONIC_SIGNATURE">Electronic Signature</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-6 py-3 bg-slate-100 text-slate-500 text-[10px] font-black rounded-xl hover:bg-slate-200 transition-all uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting || !selectedProvider} 
                            className={`px-8 py-3 bg-his-green-500 text-white text-[10px] font-black rounded-xl transition-all uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-his-green-500/20 ${isSubmitting || !selectedProvider ? 'opacity-40 cursor-not-allowed' : 'hover:bg-his-green-600 hover:-translate-y-0.5'}`}
                        >
                            {isSubmitting ? 'Processing...' : 'Issue Referral'}
                            {!isSubmitting && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExternalReferralForm;
