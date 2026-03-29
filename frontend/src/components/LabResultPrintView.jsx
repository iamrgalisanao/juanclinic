import React from 'react';

const LabResultPrintView = ({ order, patient, onClose }) => {
    // Parse result data if it's a string
    const resultData = typeof order.result_data === 'string'
        ? JSON.parse(order.result_data || '{}')
        : (order.result_data || {});

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 overflow-y-auto no-print">
            <div className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl rounded-none md:rounded-lg overflow-hidden flex flex-col print:shadow-none print:rounded-none print:m-0 print:w-full print-container">
                {/* Print Control Header - Hidden during print */}
                <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center no-print">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-his-green-500 flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        </div>
                        <h2 className="font-black text-slate-900 uppercase tracking-widest text-xs">Print Preview: {order.order_type === 'RAD' ? 'Radiology' : 'Laboratory'} Report</h2>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-all">Close</button>
                        <button 
                            onClick={handlePrint} 
                            className="px-6 py-2 bg-his-green-500 text-white text-xs font-black rounded-lg shadow-lg shadow-his-green-500/20 hover:bg-his-green-600 transition-all uppercase tracking-widest flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Confirm & Print (A4)
                        </button>
                    </div>
                </div>

                {/* Actual Report Content */}
                <div className="flex-1 p-[15mm] md:p-[20mm] font-serif print:p-0 overflow-visible">
                    {/* Laboratory Header */}
                    <div className="flex justify-between items-start mb-10 pb-10 border-b-2 border-slate-900">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">JUANCLINIC</h1>
                            <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-his-green-500">Diagnostic & Clinical Laboratory</p>
                            <div className="mt-4 text-[10px] text-slate-500 font-medium leading-relaxed">
                                <p>123 Medical Center Way, Metro Manila</p>
                                <p>Tel: +63 (2) 8888-0000 | Email: lab@juanclinic.com</p>
                                <p>License No: DOH-7-001-2026</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="bg-slate-900 text-white px-4 py-2 mb-4">
                                 <h2 className="text-sm font-black uppercase tracking-widest">Official {order.order_type} Report</h2>
                             </div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Report ID: {order.id.toString().padStart(6, '0')}</p>
                        </div>
                    </div>

                    {/* Patient Info Table */}
                    <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-10 p-6 bg-slate-50 border border-slate-100">
                        <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span className="text-[10px] font-black uppercase text-slate-500">Patient Name</span>
                            <span className="text-[10px] font-bold text-slate-900">{patient.first_name} {patient.last_name}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span className="text-[10px] font-black uppercase text-slate-500">Patient ID</span>
                            <span className="text-[10px] font-bold text-slate-900">{patient.patient_external_id}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span className="text-[10px] font-black uppercase text-slate-500">Age / Gender</span>
                            <span className="text-[10px] font-bold text-slate-900">{patient.gender === 'M' ? 'Male' : 'Female'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span className="text-[10px] font-black uppercase text-slate-500">Request Date</span>
                            <span className="text-[10px] font-bold text-slate-900">{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span className="text-[10px] font-black uppercase text-slate-500">Referred By</span>
                            <span className="text-[10px] font-bold text-slate-900">Dr. Hospital Physician</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span className="text-[10px] font-black uppercase text-slate-500">Report Date</span>
                            <span className="text-[10px] font-bold text-slate-900">{new Date(order.approved_at || order.updated_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* Order Details Header */}
                    <div className="grid grid-cols-2 gap-8 mb-10 pb-8 border-b border-slate-200">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diagnostic Procedure</p>
                            <p className="text-sm font-black text-slate-900">{order.request_details?.modality ? `${order.request_details.modality} ` : ''}{order.request_details?.test_name || 'Generic Lab Test'}</p>
                            {order.request_details?.body_part && (
                                <p className="text-xs font-bold text-his-green-600 uppercase tracking-tight">Focus: {order.request_details.body_part}</p>
                            )}
                        </div>
                        <div className="text-right space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority / Status</p>
                            <p className={`text-sm font-black ${order.priority === 'STAT' ? 'text-rose-600' : 'text-slate-900'}`}>{order.priority} / {order.status}</p>
                        </div>
                    </div>

                    {/* Results Content */}
                    {order.order_type === 'RAD' ? (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-1">Clinical Indication</h4>
                                    <p className="text-sm text-slate-800 leading-relaxed italic">{order.request_details?.instructions || 'Routine screening/diagnostic eval.'}</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-1">Technique</h4>
                                    <p className="text-sm text-slate-800 leading-relaxed font-medium">{resultData.technique || 'Standard protocol.'}</p>
                                </div>
                            </div>

                            {resultData.comparison && (
                                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Comparison</h4>
                                    <p className="text-sm text-slate-700 font-bold">{resultData.comparison}</p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-4">
                                    Findings
                                    <div className="h-0.5 bg-slate-900 flex-1 opacity-5" />
                                </h4>
                                <div className="text-[15px] leading-[1.8] text-slate-800 whitespace-pre-wrap font-serif pl-1">
                                    {resultData.findings || 'No findings recorded.'}
                                </div>
                            </div>

                            <div className="mt-12 p-8 bg-his-green-50/20 rounded-[2.5rem] border border-his-green-100/30 relative">
                                <div className="absolute -top-3 left-8 px-4 bg-white border border-his-green-100 rounded-full">
                                    <span className="text-[9px] font-black text-his-green-600 uppercase tracking-[0.3em]">Final Impression</span>
                                </div>
                                <div className="text-lg font-black text-slate-900 leading-relaxed font-serif">
                                    {resultData.impression || 'Report pending clinical summary.'}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-slate-900">
                                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Parameter</th>
                                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 text-center">Result</th>
                                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 text-center underline decoration-his-green-500/30">Ref. Range</th>
                                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Unit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {Object.entries(resultData).map(([key, data]) => {
                                        // Handle potential non-object data gracefully
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
                                            <tr key={key} className={status !== 'NORMAL' ? 'bg-rose-50/30' : ''}>
                                                <td className="py-5 text-sm font-bold text-slate-800 px-2">{key}</td>
                                                <td className={`py-5 text-sm font-black px-2 text-center ${status !== 'NORMAL' ? 'text-rose-600' : 'text-slate-900'}`}>
                                                    {val} {indicator}
                                                </td>
                                                <td className="py-5 text-xs font-bold text-slate-400 px-2 text-center italic">{range}</td>
                                                <td className="py-5 text-xs font-bold text-slate-500 px-2 uppercase tracking-tighter">{unit}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Interpretation Section for non-RAD (only if narrative interpretation exists) */}
                    {order.order_type !== 'RAD' && order.interpretation && (
                        <div className="mt-12 mb-12">
                            <h4 className="text-[10px] font-black uppercase text-slate-900 mb-4 tracking-widest">Clinical path interpretation:</h4>
                            <div className="p-6 border border-slate-200 bg-slate-50/30 min-h-[100px] text-xs leading-relaxed text-slate-600 italic whitespace-pre-wrap">
                                {order.interpretation}
                            </div>
                        </div>
                    )}

                    {/* Signatures */}
                    <div className="mt-20 flex justify-between items-end px-10">
                        <div className="text-center w-64 border-t-2 border-slate-900 pt-2">
                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">
                                {order.order_type === 'RAD' ? 'Radiology Technologist' : 'Medical Technologist'}
                            </p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Reg No: 0023456</p>
                        </div>
                         <div className="text-center w-64 border-t-2 border-slate-900 pt-2">
                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">
                                {order.order_type === 'RAD' ? 'Radiologist' : 'Pathologist'}
                            </p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Reg No: 0098765</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center text-[8px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                        <span>Generated by JuanClinic HIS | Audit Trail Verified</span>
                        <span>Page 1 of 1</span>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @page { size: A4; margin: 20mm; }
                @media print {
                    header, footer, nav, .no-print { display: none !important; }
                    body { 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                    }
                    .print-container {
                        width: 100% !important;
                        max-width: none !important;
                        min-height: 0 !important;
                        height: auto !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                        display: block !important;
                    }
                    table { page-break-inside: auto; }
                    tr { page-break-inside: avoid; page-break-after: auto; }
                    thead { display: table-header-group; }
                    tfoot { display: table-footer-group; }
                    * { 
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important; 
                    }
                }
            `}} />
        </div>
    );
};

export default LabResultPrintView;
