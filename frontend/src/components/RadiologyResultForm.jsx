import React, { useState } from 'react';
import { CheckCircleIcon, InformationCircleIcon, DocumentTextIcon, BeakerIcon } from '@heroicons/react/24/outline';

const RadiologyResultForm = ({ order, onSubmit, onCancel }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [findings, setFindings] = useState('');
    const [impression, setImpression] = useState('');
    const [technique, setTechnique] = useState('');
    const [comparison, setComparison] = useState('None available');
    const [amendmentReason, setAmendmentReason] = useState('Initial RAD result entry');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Narrative structure for Radiology
        const resultData = {
            modality: order.request_details?.modality || 'N/A',
            body_part: order.request_details?.body_part || 'N/A',
            technique: technique.trim(),
            findings: findings.trim(),
            impression: impression.trim(),
            comparison: comparison.trim(),
            is_narrative: true // Flag to distinguish from tabular lab results
        };

        try {
            await onSubmit(order.id, resultData, amendmentReason);
        } catch (error) {
            console.error("Failed to submit RAD results", error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-w-4xl mx-auto mt-4 animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="bg-slate-900 px-8 py-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                        <DocumentTextIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h3 className="font-black text-lg tracking-tight uppercase">Radiology Interpretive Report</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">
                            Order #{order.id} • {order.request_details?.modality} {order.request_details?.test_name}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onCancel}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
                
                {/* Clinical Context Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Clinical Indication</span>
                        <p className="text-sm font-bold text-slate-700">{order.request_details?.instructions || 'Not provided'}</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Anatomical Focus</span>
                        <p className="text-sm font-black text-his-green-600">{order.request_details?.body_part || 'Unspecified'}</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Comparison Study</span>
                        <input 
                            type="text"
                            value={comparison}
                            onChange={(e) => setComparison(e.target.value)}
                            className="w-full bg-transparent text-sm font-bold text-slate-700 focus:outline-none placeholder:text-slate-300"
                            placeholder="e.g. Previous CXR from 2024-01-01"
                        />
                    </div>
                </div>

                {/* Technique Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                        <BeakerIcon className="w-4 h-4 text-slate-400" />
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Technique Description</label>
                    </div>
                    <textarea
                        required
                        value={technique}
                        onChange={(e) => setTechnique(e.target.value)}
                        placeholder="Detail the acquisition parameters (e.g., standard frontal and lateral views...)"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all min-h-[80px]"
                    />
                </div>

                {/* Findings Section */}
                <div className="space-y-3">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        Clinical Findings
                        <div className="h-px bg-slate-100 flex-1 ml-2" />
                    </label>
                    <textarea
                        required
                        value={findings}
                        onChange={(e) => setFindings(e.target.value)}
                        placeholder="Provide a detailed narrative of observations..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-[15px] leading-relaxed font-medium text-slate-800 focus:bg-white focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all min-h-[250px] shadow-inner"
                    />
                </div>

                {/* Impression Section */}
                <div className="space-y-3 p-6 bg-his-green-50/30 rounded-[2rem] border border-his-green-100/50">
                    <label className="text-xs font-black text-his-green-600 uppercase tracking-widest flex items-center gap-2">
                        Final Impression / Conclusion
                    </label>
                    <textarea
                        required
                        value={impression}
                        onChange={(e) => setImpression(e.target.value)}
                        placeholder="Summary diagnosis and core clinical takeaways..."
                        className="w-full bg-white border border-his-green-100 rounded-2xl px-6 py-4 text-[15px] font-black text-slate-900 focus:ring-4 focus:ring-his-green-500/20 focus:border-his-green-500 outline-none transition-all min-h-[120px]"
                    />
                </div>

                {/* Footer Controls */}
                <div className="pt-6 border-t border-slate-100">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex flex-col gap-1 max-w-sm">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Audit Log Reason</label>
                            <input
                                type="text"
                                value={amendmentReason}
                                onChange={(e) => setAmendmentReason(e.target.value)}
                                className="text-xs font-bold text-slate-500 italic bg-transparent border-b border-slate-100 focus:border-his-green-500 outline-none pb-1"
                            />
                        </div>
                        
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !findings || !impression || !technique}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-10 py-4 bg-slate-900 hover:bg-black disabled:bg-slate-200 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl transition-all active:scale-95 disabled:shadow-none"
                            >
                                {isSubmitting ? (
                                    <span className="animate-pulse">Locking Report...</span>
                                ) : (
                                    <>
                                        <CheckCircleIcon className="w-5 h-5 text-his-green-400" />
                                        Authorize & Submit
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default RadiologyResultForm;
