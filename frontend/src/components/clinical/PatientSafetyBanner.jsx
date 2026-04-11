import React from 'react';

const PatientSafetyBanner = ({ status, onAcknowledge }) => {
    if (!status || (!status.has_unacknowledged_criticals)) return null;

    return (
        <div className="bg-rose-600 text-white p-6 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-top-10 duration-500 overflow-hidden relative border border-rose-500/50 mb-10">
            {/* Animated background pulse */}
            <div className="absolute inset-0 bg-white/5 animate-pulse" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                        <svg className="w-8 h-8 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-black italic tracking-tighter uppercase">Clinical Safety Critical</h3>
                        <div className="flex flex-wrap gap-3 mt-2">
                            {status.vitals_count > 0 && (
                                <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                                    {status.vitals_count} Unacknowledged Vitals
                                </span>
                            )}
                            {status.labs_count > 0 && (
                                <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                                    {status.labs_count} Unacknowledged Labs
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={onAcknowledge}
                        className="px-8 py-3 bg-white text-rose-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:scale-105 transition-all active:scale-95"
                    >
                        Review & Acknowledge All
                    </button>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 text-center">
                <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest leading-relaxed">
                    Hard-Stop Active: New Clinical Orders are restricted until Critical Findings are formally acknowledged.
                </p>
            </div>
        </div>
    );
};

export default PatientSafetyBanner;
