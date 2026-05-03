import React, { useRef } from 'react';
import { printIsolatedDocument } from '../utils/PrintManager';
import ClinicalDocumentWrapper from './ui/ClinicalDocumentWrapper';

/**
 * Internal content component for Laboratory/Radiology Results.
 */
const LabResultDocumentContent = ({ order, resultData }) => (
    <div className="space-y-10">
        {/* Order Details Header */}
        <div className="grid grid-cols-2 gap-12 py-6 border-b border-slate-100">
            <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Diagnostic Procedure</p>
                <p className="text-xl font-black text-slate-900 leading-tight">
                    {order.request_details?.modality ? `${order.request_details.modality} — ` : ''}
                    {order.request_details?.test_name || 'GENERIC DIAGNOSTIC TEST'}
                </p>
                {order.request_details?.body_part && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-lg">
                        <span className="text-[9px] font-black uppercase tracking-widest">Focus: {order.request_details.body_part}</span>
                    </div>
                )}
            </div>
            <div className="text-right space-y-2">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Priority / Specimen</p>
                <p className={`text-lg font-black uppercase ${order.priority === 'STAT' ? 'text-rose-600' : 'text-slate-900'}`}>
                    {order.priority} / {order.request_details?.specimen_type || 'STANDARD'}
                </p>
            </div>
        </div>

        {/* Results Logic */}
        {order.order_type === 'RAD' ? (
            <div className="space-y-10 py-4">
                <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-1">Clinical Indication</h4>
                        <p className="text-sm text-slate-700 leading-relaxed italic">{order.request_details?.instructions || 'Routine clinical evaluation requested.'}</p>
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-1">Technique</h4>
                        <p className="text-sm text-slate-700 leading-relaxed font-bold">{resultData.technique || 'Standard imaging protocol applied.'}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] flex items-center gap-4">
                        Findings
                        <div className="h-[2px] bg-slate-100 flex-1" />
                    </h4>
                    <div className="text-lg leading-[1.8] text-slate-800 whitespace-pre-wrap font-serif pl-2 border-l-4 border-slate-50">
                        {resultData.findings || 'Report findings currently being finalized.'}
                    </div>
                </div>

                <div className="mt-8 p-10 bg-slate-50 rounded-[3rem] border-2 border-slate-100 relative">
                    <div className="absolute -top-4 left-10 px-6 py-1 bg-slate-900 text-white rounded-full shadow-lg">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Final Impression</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 leading-tight font-serif italic">
                        {resultData.impression || 'Final impression pending consultation.'}
                    </div>
                </div>
            </div>
        ) : (
            <div className="py-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-4 border-slate-900">
                            <th className="py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest px-4">Parameter</th>
                            <th className="py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest px-4 text-center">Result</th>
                            <th className="py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest px-4 text-center underline decoration-slate-200">Ref. Range</th>
                            <th className="py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest px-4">Unit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {Object.entries(resultData).map(([key, data]) => {
                            const val = data?.value || data || '';
                            const range = data?.ref_range || 'N/A';
                            const unit = data?.unit || '-';

                            let status = 'NORMAL';
                            let indicator = null;

                            if (range !== 'N/A' && range.includes('-')) {
                                const parts = range.split('-').map(p => parseFloat(p.trim()));
                                const numVal = parseFloat(val);
                                if (!isNaN(numVal) && parts.length === 2) {
                                    if (numVal < parts[0]) { status = 'LOW'; indicator = '↓'; }
                                    else if (numVal > parts[1]) { status = 'HIGH'; indicator = '↑'; }
                                }
                            }

                            return (
                                <tr key={key} className={status !== 'NORMAL' ? 'bg-rose-50/50' : ''}>
                                    <td className="py-6 text-base font-black text-slate-800 px-4 uppercase tracking-tight">{key}</td>
                                    <td className={`py-6 text-lg font-black px-4 text-center ${status !== 'NORMAL' ? 'text-rose-600' : 'text-slate-900'}`}>
                                        {val} <span className="text-xl ml-1 leading-none">{indicator}</span>
                                    </td>
                                    <td className="py-6 text-sm font-bold text-slate-400 px-4 text-center italic">{range}</td>
                                    <td className="py-6 text-sm font-black text-slate-500 px-4 uppercase tracking-tighter">{unit}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {order.interpretation && (
                    <div className="mt-12 p-8 bg-slate-50 border-l-8 border-slate-900 rounded-r-3xl">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Clinical Pathologist Interpretation:</h4>
                        <div className="text-sm font-bold leading-relaxed text-slate-800 italic whitespace-pre-wrap">
                            "{order.interpretation}"
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
);

const LabResultPrintView = ({ order, patient, activeTenant = null, onClose }) => {
    const printRef = useRef(null);
    
    // Parse result data safely
    const resultData = typeof order.result_data === 'string'
        ? JSON.parse(order.result_data || '{}')
        : (order.result_data || {});

    // Signatories based on order type
    const signatories = [
        {
            name: order.order_type === 'RAD' ? 'RADTECH STAFF' : 'MEDTECH STAFF',
            credential: 'RMT',
            title: order.order_type === 'RAD' ? 'Radiology Technologist' : 'Medical Technologist',
            license_number: 'LIC-0023456'
        },
        {
            name: order.approved_by_name || (order.order_type === 'RAD' ? 'PATH RADIOLOGIST' : 'CLINICAL PATHOLOGIST'),
            credential: 'M.D.',
            title: order.order_type === 'RAD' ? 'Chief Radiologist' : 'Head Pathologist',
            license_number: 'LIC-0088992',
            ptr_number: 'PTR-445566'
        }
    ];

    const verificationHash = `LAB-${String(order.id).padStart(6, '0').toUpperCase()}`;

    const handlePrint = async () => {
        if (printRef.current) {
            await printIsolatedDocument(printRef.current.innerHTML, `RES-${order.order_type}-${patient?.last_name}`);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl max-h-[95vh] shadow-2xl rounded-[3rem] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                
                {/* Unified Header */}
                <div className="px-8 py-5 bg-white border-b border-slate-100 flex justify-between items-center shadow-sm shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] leading-none">Diagnostic Result Preview</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Official {order.order_type} Record v3.2</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-6 py-2.5 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-colors">Close</button>
                        <button 
                            onClick={handlePrint} 
                            className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-xl flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Confirm & Finalize Print
                        </button>
                    </div>
                </div>

                {/* Scaled Preview Surface */}
                <div className="flex-1 overflow-y-auto bg-slate-50 p-12 flex justify-center">
                    <div ref={printRef} className="shadow-2xl bg-white origin-top transform scale-[0.80] md:scale-100">
                        <ClinicalDocumentWrapper
                            title={`${order.order_type === 'RAD' ? 'RADIOLOGY' : 'LABORATORY'} REPORT`}
                            patient={patient}
                            activeTenant={activeTenant}
                            signatories={signatories}
                            verificationHash={verificationHash}
                            date={order.approved_at || order.updated_at}
                        >
                            <LabResultDocumentContent order={order} resultData={resultData} />
                        </ClinicalDocumentWrapper>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LabResultPrintView;
