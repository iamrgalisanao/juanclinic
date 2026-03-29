import React, { useState } from 'react';
import { ShieldCheckIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { BeakerIcon } from '@heroicons/react/24/outline';

const ResultApprovalView = ({ order, onDecision, onCancel }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Parse the JSON result data if it's a string, or use directly if it's already an object
    const resultData = typeof order.result_data === 'string'
        ? JSON.parse(order.result_data || '{}')
        : (order.result_data || {});

    // Get an array of key-value pairs for rendering
    const resultsList = Object.entries(resultData);

    const handleDecision = async (status) => {
        setIsSubmitting(true);
        try {
            await onDecision(order.id, status);
        } catch (error) {
            console.error("Failed to submit decision", error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-emerald-200 overflow-hidden mt-4">
            <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                        <ShieldCheckIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-emerald-900 text-sm">Clinical Verification Required</h3>
                        <p className="text-xs text-emerald-700/80 mt-1">
                            Reviewing preliminary data for {order.order_type} Order #{order.id}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onCancel}
                    className="text-emerald-600/60 hover:text-emerald-800 text-sm font-medium transition-colors"
                >
                    Close
                </button>
            </div>

            <div className="p-6">
                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col">
                    {/* Fixed Table Header */}
                    <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center gap-2">
                        <BeakerIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Submitted Findings</span>
                    </div>
                    
                    {/* Column Headers */}
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        <div className="w-[35%]">Parameter</div>
                        <div className="w-[20%]">Result</div>
                        <div className="w-[45%]">Reference Info</div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar bg-white">
                        {resultsList.length === 0 ? (
                            <div className="p-8 text-center text-sm text-slate-500">
                                No structured data found in this order payload.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {resultsList.map(([key, value], index) => {
                                    const isObject = typeof value === 'object' && value !== null;
                                    const displayValue = isObject ? value.value : value;
                                    const refRange = isObject ? value.ref_range : null;
                                    const unit = isObject ? value.unit : null;

                                    return (
                                        <div key={index} className="flex px-4 py-3 hover:bg-slate-50/50 transition-colors items-center">
                                            {/* Column 1: Parameter */}
                                            <div className="w-[35%] text-sm font-semibold text-slate-600 truncate pr-4" title={key}>
                                                {key}
                                            </div>

                                            {/* Column 2: Result & Unit */}
                                            <div className="w-[20%] flex items-center gap-2">
                                                <div className="text-sm text-his-green-600 font-black">
                                                    {displayValue || '--'}
                                                </div>
                                                {isObject && unit && (
                                                    <span className="text-[10px] bg-slate-100 text-slate-400 px-1 py-0.5 rounded font-bold">
                                                        {unit}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Column 3: Reference Info */}
                                            <div className="w-[45%] text-[11px] text-slate-500 font-medium italic">
                                                {isObject && refRange ? (
                                                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md border border-blue-100/50">
                                                        Ref: {refRange}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300">N/A</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{ __html: `
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: #f1f5f9;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #cbd5e1;
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #94a3b8;
                    }
                `}} />

                <div className="mt-8 flex items-center gap-4">
                    <button
						onClick={() => handleDecision('COMPLETED')}
                        disabled={isSubmitting || resultsList.length === 0}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-sm font-bold rounded-xl shadow-sm transition-all shadow-emerald-600/20"
                    >
                        {isSubmitting ? 'Authenticating...' : (
                            <>
                                <ShieldCheckIcon className="w-5 h-5" />
                                Approve & Finalize
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => handleDecision('PENDING')}
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-600 text-sm font-bold rounded-xl transition-all"
                    >
                        <XCircleIcon className="w-5 h-5 opacity-70" />
                        Reject Data
                    </button>
                </div>

                <p className="text-[10px] text-center text-slate-400 font-medium mt-4 uppercase tracking-widest">
                    Electronic signature will be recorded in the audit log
                </p>
            </div>
        </div>
    );
};

export default ResultApprovalView;
