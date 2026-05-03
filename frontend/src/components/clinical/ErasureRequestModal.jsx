import React, { useState } from 'react';
import { AlertTriangle, X, ShieldCheck, Eraser } from 'lucide-react';
import { useDialog } from '../../context/DialogContext';

const ErasureRequestModal = ({ patient, isOpen, onClose, onConfirm }) => {
    const { alert } = useDialog();
    const [reason, setReason] = useState('Formal request by data subject under RA 10173');
    const [confirmText, setConfirmText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (!reason.trim()) {
            await alert({
                title: 'Compliance Requirement',
                message: "A formal reason is required for statutory compliance."
            });
            return;
        }
        if (confirmText.toUpperCase() !== 'ERASE') {
            await alert({
                title: 'Confirmation Failed',
                message: "Please type 'ERASE' to confirm."
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await onConfirm(reason);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-500">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] -mr-12 -mt-12 pointer-events-none">
                    <Eraser className="w-48 h-48 text-rose-500" />
                </div>

                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100/50">
                                <AlertTriangle className="w-5 h-5 text-rose-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">Right to Erasure</h2>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">RA 10173 Compliance</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-5">
                        <div className="bg-rose-50/40 rounded-2xl p-4 border border-rose-100/40">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-800 leading-relaxed">
                                        Formal erasure request for <span className="text-rose-600 font-black underline decoration-rose-500/30 underline-offset-2">{patient.first_name} {patient.last_name}</span>.
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic opacity-80">
                                        Soft-delete only. Statutory audit trails will be preserved.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Request</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 focus:border-his-green-500/20 focus:bg-white rounded-xl p-3 text-xs font-bold text-slate-700 transition-all outline-none h-20 resize-none shadow-inner"
                                placeholder="Enter statutory reason..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmation</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 focus:border-rose-500/20 focus:bg-white rounded-xl px-4 py-3 text-xs font-black text-rose-500 placeholder:text-slate-300 transition-all outline-none text-center tracking-[0.4em] uppercase"
                                    placeholder="TYPE ERASE"
                                />
                                {confirmText.toUpperCase() === 'ERASE' && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in duration-300">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-2 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 bg-slate-50 text-slate-500 text-[10px] font-black rounded-xl hover:bg-slate-100 transition-all uppercase tracking-widest border border-slate-200/50"
                            >
                                Abandon
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isSubmitting || confirmText.toUpperCase() !== 'ERASE' || !reason.trim()}
                                className="flex-2 py-3 bg-rose-500 text-white text-[10px] font-black rounded-xl hover:bg-rose-600 active:scale-95 transition-all uppercase tracking-widest shadow-lg shadow-rose-500/20 disabled:opacity-30 disabled:grayscale disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Eraser className="w-3.5 h-3.5" />
                                        <span>Confirm Erasure</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ErasureRequestModal;
