import React, { useRef } from 'react';
import { printIsolatedDocument } from '../utils/PrintManager';
import ClinicalDocumentWrapper from './ui/ClinicalDocumentWrapper';

/**
 * Internal content component for the actual Prescription body.
 */
export const PrescriptionDocumentContent = ({ 
    items = [], 
    patient = {}, 
    physician = null,
    vitals = null, 
    diagnosis = "", 
    complaints = "", 
    findings = "",
    date = new Date().toISOString(),
    isA5 = false,
    formatFrequency = (v) => v,
    formatDuration = (v) => v
}) => {
    const age = patient?.dob ? (new Date().getFullYear() - new Date(patient.dob).getFullYear()) : 'N/A';
    
    return (
        <div className={`w-full flex flex-col ${isA5 ? 'gap-3' : 'gap-8'} animate-in fade-in duration-500`}>
            
            <section className={`grid grid-cols-12 ${isA5 ? 'gap-2' : 'gap-4'} border-b-2 border-slate-900 pb-2`}>
                <div className="col-span-12 grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="flex border-b border-slate-100 pb-0.5 gap-2">
                        <span className={`${isA5 ? 'text-[7px]' : 'text-[9px]'} font-black text-slate-400 uppercase w-16 shrink-0`}>Patient:</span>
                        <span className={`${isA5 ? 'text-[10px]' : 'text-sm'} font-black text-slate-900 uppercase truncate`}>
                            {patient?.last_name && patient.last_name !== 'undefined' ? `${patient.last_name}, ${patient.first_name}` : ''}
                        </span>
                    </div>
                    <div className="flex border-b border-slate-100 pb-0.5 gap-1">
                        <span className={`${isA5 ? 'text-[7px]' : 'text-[9px]'} font-black text-slate-400 uppercase w-12 shrink-0`}>Date:</span>
                        <span className={`${isA5 ? 'text-[10px]' : 'text-sm'} font-bold text-slate-900 uppercase`}>
                            {date ? new Date(date).toLocaleDateString() : ''}
                        </span>
                    </div>
                    <div className="flex border-b border-slate-100 pb-0.5 gap-2">
                        <span className={`${isA5 ? 'text-[7px]' : 'text-[9px]'} font-black text-slate-400 uppercase w-16 shrink-0`}>Age/Sex:</span>
                        <span className={`${isA5 ? 'text-[10px]' : 'text-sm'} font-bold text-slate-900 uppercase`}>
                            {age && age > 0 ? `${age} / ` : ''}{patient?.gender && patient.gender !== 'undefined' ? (patient.gender === 'M' ? 'MALE' : 'FEMALE') : ''}
                        </span>
                    </div>
                    <div className="flex border-b border-slate-100 pb-0.5 gap-2">
                        <span className={`${isA5 ? 'text-[7px]' : 'text-[9px]'} font-black text-slate-400 uppercase w-12 shrink-0`}>Address:</span>
                        <span className={`${isA5 ? 'text-[10px]' : 'text-xs'} font-medium text-slate-500 truncate`}>
                            {patient?.address && patient.address !== 'N/A' && patient.address !== 'undefined' ? patient.address : ''}
                        </span>
                    </div>
                </div>
            </section>

            {/* 2. Side-by-side Clinical Findings (Optional) */}
            {(complaints || findings || diagnosis) && (
                <section className={`grid grid-cols-3 ${isA5 ? 'gap-4 mb-2' : 'gap-8 mb-4'}`}>
                    <div className="space-y-1">
                        <h4 className={`${isA5 ? 'text-[8px]' : 'text-[10px]'} font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-0.5`}>Complaints</h4>
                        <p className={`${isA5 ? 'text-[9px]' : 'text-[11px]'} font-medium text-slate-700 leading-tight italic`}>{complaints || ''}</p>
                    </div>
                    <div className="space-y-1">
                        <h4 className={`${isA5 ? 'text-[8px]' : 'text-[10px]'} font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-0.5`}>Findings</h4>
                        <p className={`${isA5 ? 'text-[9px]' : 'text-[11px]'} font-medium text-slate-700 leading-tight italic`}>{findings || ''}</p>
                    </div>
                    <div className="space-y-1">
                        <h4 className={`${isA5 ? 'text-[8px]' : 'text-[10px]'} font-black text-blue-900 uppercase tracking-widest border-b border-blue-100 pb-0.5`}>Diagnosis</h4>
                        <p className={`${isA5 ? 'text-[10px]' : 'text-[12px]'} font-black text-slate-900 leading-tight`}>{diagnosis || ''}</p>
                    </div>
                </section>
            )}

            {/* 3. Main RX Medication Table */}
            <section className="flex-1 flex gap-4">
                {/* Ultra-Large RX Graphic */}
                <div className={`${isA5 ? 'w-16 pr-2' : 'w-24'} flex flex-col items-center select-none opacity-100`}>
                    <div className={`${isA5 ? 'text-[12rem]' : 'text-[15rem]'} font-black text-blue-900 leading-none mt-[-10px]`}>℞</div>
                </div>

                {/* Medication Table */}
                <div className="flex-1">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-900">
                                <th className={`${isA5 ? 'text-[8px]' : 'text-[10px]'} font-black text-slate-400 uppercase text-left py-1 px-1 w-8`}>#</th>
                                <th className={`${isA5 ? 'text-[8px]' : 'text-[10px]'} font-black text-slate-400 uppercase text-left py-1 px-1`}>Medication & Sig.</th>
                                <th className={`${isA5 ? 'text-[8px]' : 'text-[10px]'} font-black text-slate-400 uppercase text-right py-1 px-1 w-24`}>Qty.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={idx} className="border-b border-slate-50 break-inside-avoid">
                                    <td className={`${isA5 ? 'text-[10px]' : 'text-sm'} font-black text-slate-300 py-3 px-1 align-top`}>{idx + 1}.</td>
                                    <td className="py-3 px-1 align-top space-y-1">
                                        <div className={`${isA5 ? 'text-[11px]' : 'text-[15px]'} font-black text-slate-900 uppercase leading-none`}>
                                            {item.medication_name}
                                        </div>
                                        <div className={`${isA5 ? 'text-[9px]' : 'text-[11px]'} font-bold text-blue-800 leading-tight tracking-tight`}>
                                            {item.dosage} — {formatFrequency(item.frequency)} FOR {formatDuration(item.duration)}
                                        </div>
                                        {item.instructions && (
                                            <p className={`${isA5 ? 'text-[8px]' : 'text-[9px]'} font-medium text-slate-400 italic leading-snug`}>
                                                Instr: {item.instructions}
                                            </p>
                                        )}
                                    </td>
                                    <td className="py-3 px-1 align-top text-right">
                                        <div className={`${isA5 ? 'text-[10px]' : 'text-sm'} font-black text-slate-900`}>#{item.quantity}</div>
                                        <div className={`${isA5 ? 'text-[7px]' : 'text-[8px]'} font-bold text-slate-400 uppercase`}>Total</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

const PrescriptionPrintView = ({ 
    prescriptions, 
    patient, 
    activeTenant = null,
    onClose,
    signatories = []
}) => {
    const printRef = useRef(null);

    const items = Array.isArray(prescriptions) ? prescriptions : [prescriptions];
    if (items.length === 0) return null;

    const firstPrescription = items[0];
    const physician = firstPrescription.physician || firstPrescription.author || {};
    
    const getFullName = (person) => {
        if (!person) return '';
        const f = person.first_name && person.first_name !== 'undefined' ? person.first_name : '';
        const l = person.last_name && person.last_name !== 'undefined' ? person.last_name : '';
        return `${f} ${l}`.trim();
    };

    const finalSignatories = signatories.length > 0 
        ? signatories 
        : (physician ? [{ ...physician, name: physician.name || getFullName(physician), credential: 'M.D.' }] : []);
    
    // Secure Verification Hash
    const verificationHash = `RX-${String(firstPrescription.id || 'VALID').substring(0, 8).toUpperCase()}`;

    // Formatting Helpers
    const formatFrequency = (val) => {
        if (!val) return 'AS DIRECTED';
        const num = parseFloat(val);
        if (!isNaN(num) && String(num) === String(val).trim()) {
            return `${num} X A DAY`;
        }
        return String(val).toUpperCase();
    };

    const formatDuration = (val) => {
        if (!val) return 'FOLLOW UP';
        const num = parseFloat(val);
        if (!isNaN(num) && String(num) === String(val).trim()) {
            return `${num} DAYS`;
        }
        return String(val).toUpperCase();
    };

    const handlePrint = async () => {
        if (printRef.current) {
            await printIsolatedDocument(printRef.current.innerHTML, `RX-${patient?.last_name}`, 'A5');
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl max-h-[95vh] shadow-2xl rounded-[3rem] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                
                {/* Action Header (Preview Mode Only) */}
                <div className="px-8 py-4 bg-white border-b border-slate-100 flex justify-between items-center shadow-sm shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">High-Fidelity RX Preview</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Enterprise Clinical Engine v4.0</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={handlePrint}
                            className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Print High-Fidelity A5
                        </button>
                    </div>
                </div>

                {/* Scaled Preview Surface */}
                <div className="flex-1 overflow-y-auto bg-slate-100 p-12 flex justify-center">
                    <div ref={printRef} className="shadow-2xl bg-white origin-top transform scale-[0.6] lg:scale-[0.8]">
                        <ClinicalDocumentWrapper
                            title="Prescription Form"
                            patient={patient}
                            activeTenant={activeTenant}
                            physician={physician}
                            verificationHash={verificationHash}
                            date={firstPrescription.created_at}
                            size="A5"
                        >
                            <PrescriptionDocumentContent 
                                items={items} 
                                patient={patient}
                                vitals={firstPrescription.vital_data || firstPrescription.vitals}
                                diagnosis={firstPrescription.diagnosis}
                                complaints={firstPrescription.complaints}
                                findings={firstPrescription.findings}
                                date={firstPrescription.created_at}
                                formatFrequency={formatFrequency} 
                                formatDuration={formatDuration} 
                                isA5={true}
                            />
                        </ClinicalDocumentWrapper>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrescriptionPrintView;
